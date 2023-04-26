import { getLocaleDateTimeString, getTimeSpanString } from '@/additional/dateTimeConvertions';
import { formOrderText, getExtendedOrderTitle } from '@/additional/formOrderText';
import {
  SET_START_DATE_TO_GET_DATA,
  SET_START_DATE_TO_GET_DATA_NO_CHECK,
  CLEAR_LOADING_WORK_ORDERS_RESULT,
  SET_LOADING_WORK_ORDERS_RESULT,
  SET_LOADING_WORK_ORDERS_STATUS,
  SET_NEW_WORK_ORDERS_ARRAY,
  UPDATE_NUMBER_OF_INCOMING_ORDERS_PER_SHIFT,
  DEL_WORK_ORDERS,
  SET_SYSTEM_MESSAGE,
} from '@/store/mutation-types';
import { LOAD_WORK_ORDERS_ACTION, REPORT_ON_ORDERS_DELIVERY_ACTION } from '@/store/action-types';
import { getWorkOrdersFromServer } from '@/serverRequests/orders.requests';
import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';
import { getWorkOrderObject } from './getWorkOrderObject';
import { formShortOrderInfo } from '@/additional/formShortOrderInfo';


/**
 * Данный модуль предназначен для получения информации о рабочих распоряжениях.
 */
export const getWorkOrders = {
  getters: {
    /**
     * Возвращает массив абсолютно всех распоряжений, периодически получаемых от сервера (входящих + находящихся в работе).
     */
    getAllCurrentOrders(state) {
      return state.data;
    },

    getStartDateToGetData(state) {
      return state.startDateToGetData;
    },

    getLoadingWorkOrdersStatus(state) {
      return state.loadingWorkOrders;
    },

    getErrorLoadingWorkOrders(state) {
      if (state.loadingWorkOrdersResult && state.loadingWorkOrdersResult.error) {
        return state.loadingWorkOrdersResult.message;
      }
      return null;
    },

    /**
     * Возвращает массив рабочих распоряжений (распоряжений, находящихся в работе) как есть
     * (без сортировок, вложений и т.д.).
     * Рабочее распоряжение - такое полученное в рамках соответствующего запроса с сервера
     * распоряжение, у которого присутствует дата подтверждения его получения.
     * В список рабочих распоряжений не входят так называемые "скрытые" распоряжения (которые
     * не должен видеть пользователь).
     */
    getRawWorkingOrders(state) {
      return state.data.filter((item) => item.confirmDateTime && !item.hidden);
    },

    /**
     * Возвращает массив "скрытых" рабочих распоряжений.
     */
    getHiddenRawWorkingOrders(state) {
      return state.data.filter((item) => item.confirmDateTime && item.hidden);
    },

    /**
     * Позволяет получить количество документов, находящихся в работе.
     * Для ЭЦД в подсчете не участвуют недействующие цепочки документов.
     */
    getWorkingOrdersNumber(_state, getters) {
      return getters.getWorkingOrdersToDisplay.length;
    },

    /**
     * Возвращает количество рабочих распоряжений, имеющих указанные отметки об особой категории поезда.
     */
    getWorkingOrdersNumberReferringSpecialTrainCategories(_state, getters) {
      return (specialTrainCategories) => {
        if (!specialTrainCategories?.length) {
          return 0;
        }
        return getters.getWorkingOrdersToDisplay.filter((order) => {
          if (!order.specialTrainCategories?.length) {
            return false;
          }
          return specialTrainCategories.filter((el) => order.specialTrainCategories.includes(el)).length ? true : false;
        }).length;
      };
    },

    /**
     * Анализирует переданную дату окончания действия цепочки распоряжений (orderChainEndDateTime).
     * Если она установлена и меньше текущей даты, то цепочка распоряжений считается недействующей.
     * Если дополнительно передан флаг considerAllOrdersConfirmation = true, то цепочка распоряжений
     * полагается недействующей только в том случае, если все распоряжения, входящие в ее состав,
     * являются утвержденными.
     * Возвращает true, если цепочка распоряжений недействующая, false - в противном случае.
     */
    workOrderChainIsInactive(state) {
      return ({ orderChainId, orderChainEndDateTime, considerAllOrdersConfirmation }) => {
        const now = new Date();
        return Boolean(
          orderChainEndDateTime && orderChainEndDateTime.getTime() < now.getTime() &&
          (
            !considerAllOrdersConfirmation ||
            !state.data.find((order) => order.orderChainId === orderChainId && !order.assertDateTime)
          )
        );
      };
    },

    /**
     * Позволяет получить массив рабочих распоряжений для отображения пользователю, а именно:
     * отображению подлежат все распоряжения, возвращаемые getters.getRawWorkingOrders, кроме:
     * недействующих цепочек для ЭЦД.
     */
    getWorkingOrdersToDisplay(_state, getters) {
      if (!getters.isECD)
        return getters.getRawWorkingOrders;
      // Теперь для ЭЦД:
      return getters.getRawWorkingOrders.filter((order) => {
        // смотрим на дату окончания действия цепочки, которой принадлежит распоряжение:
        // если она установлена и меньше текущей даты, то распоряжение, принадлежащее этой цепочке,
        // не отображаем для ЭЦД
        if (getters.workOrderChainIsInactive({
          orderChainId: order.orderChainId,
          orderChainEndDateTime: order.orderChainEndDateTime,
          considerAllOrdersConfirmation: true,
        })) {
          return false;
        }
        return true;
      });
    },

    /**
     * Позволяет получить массив рабочих распоряжений, у элементов которого могут быть дочерние
     * элементы - распоряжения, изданные в рамках этой же цепочки распоряжений, но позднее.
     * Возвращаемый массив может использоваться для отображения рабочих распоряжений в виде
     * дерева распоряжений.
     */
    getWorkingOrdersToDisplayAsTree(_state, getters) {
      // Распоряжения в массиве рабочих распоряжений идут в хронологическом порядке (по возрастанию
      // времени их издания). Это обязательно в момент формирования дерева!!!
      const workingOrders = getters.getWorkingOrdersToDisplay.sort((a, b) => {
        if (a.createDateTime < b.createDateTime) {
          return -1;
        }
        if (a.createDateTime > b.createDateTime) {
          return 1;
        }
        return 0;
      });
      const groupedWorkingOrders = [];

      const findParentNode = (chainId) => {
        for (let group of groupedWorkingOrders) {
          if (group.orderChainId === chainId) {
            let foundGroup = group;
            while (foundGroup.children && foundGroup.children.length) {
              foundGroup = foundGroup.children[0];
            }
            return foundGroup;
          }
        }
        return null;
      };
      workingOrders.forEach((order) => {
        const parentNode = findParentNode(order.orderChainId);
        const orderNodeData = {
          key: order._id,
          type: order.type,
          sendOriginal: order.sendOriginal,
          place: order.senderWorkPoligon.title,
          senderWorkPoligon: order.senderWorkPoligon,
          post: order.creator.post,
          fio: order.creator.fio + (order.createdOnBehalfOf ? ` (от имени ${order.createdOnBehalfOf})` : ''),
          orderNum: order.number,
          time: getLocaleDateTimeString(order.createDateTime, false),
          timeSpan: getTimeSpanString(order.type, order.timeSpan, getters.isECD, order.specialTrainCategories),
          startTime: order.timeSpan.start,
          orderTitle: order.orderText.orderTitle,
          orderText: formOrderText({
            orderTextArray: order.orderText.orderText,
            dncToSend: order.dncToSend,
            dspToSend: order.dspToSend,
            ecdToSend: order.ecdToSend,
            otherToSend: order.otherToSend,
            insertEmptyLineBeforeText: true,
          }),
          assertDateTime: order.assertDateTime ? getLocaleDateTimeString(order.assertDateTime, false) : null,
          orderChainId: order.orderChainId,
          orderChainEndDateTime: order.orderChainEndDateTime,
          specialTrainCategories: order.specialTrainCategories,
          invalid: order.invalid,
          children: [],
        };

        if (!parentNode) {
          orderNodeData.topLevelNode = true;
          groupedWorkingOrders.push(orderNodeData);
        } else {
          parentNode.children.push(orderNodeData);
        }
      });
      // Верхний уровень сортирую в обратном хронологическом порядке времени начала их действия
      groupedWorkingOrders.sort((a, b) => {
        if (a.startTime > b.startTime) {
          return -1;
        }
        if (a.startTime < b.startTime) {
          return 1;
        }
        return 0;
      });
      return groupedWorkingOrders;
    },

    /**
     * Возвращает список всех рабочих распоряжений со сформированным единым списком получателей распоряжения.
     * Распоряжения сортируются в порядке убывания времени их начала действия.
     * Данная функция может использоваться для отображения списка рабочих распоряжений в табличном виде.
     */
    getWorkingOrders(_state, getters) {
      return getters.getWorkingOrdersToDisplay
        .sort((a, b) => {
          if (a.timeSpan.start > b.timeSpan.start) {
            return -1;
          }
          if (a.timeSpan.start < b.timeSpan.start) {
            return 1;
          }
          return 0;
        })
        .map((item) => {

          const getItemStationReceivers = () => {
            let stationReceivers = item.stationWorkPlacesToSend;
            // Руководителю работ отображаем только главного по станции (ДСП)
            if (getters.isStationWorksManager)
              stationReceivers = stationReceivers.filter((el) => !el.workPlaceId);
            return stationReceivers.map((el) => {
              // Должность и ФИО лица, находящегося на смене на рабочем месте станции, которому адресована копия
              // распоряжения, берем из последнего распоряжения о приеме/сдаче дежурства.
              // Но только в том случае, если на данном рабочем месте распоряжение еще не подтверждено.
              let { post, fio } = !el.confirmDateTime
                ? getters.getWorkPlacePostFIOFromExistingDSPTakeDutyOrder(el.workPlaceId)
                : { post: el.post, fio: el.fio };
              return {
                id: el.id,
                type: el.type,
                workPlaceId: el.workPlaceId,
                place: el.placeTitle,
                post,
                fio,
                deliverDateTime: el.deliverDateTime,
                confirmDateTime: el.confirmDateTime,
              };
            });
          };

          return {
            id: item._id,
            type: item.type,
            sendOriginal: item.sendOriginal,
            creator: item.creator,
            state: '',
            time: getLocaleDateTimeString(item.createDateTime, false),
            timeSpan: getTimeSpanString(item.type, item.timeSpan, getters.isECD, item.specialTrainCategories),
            orderNum: item.number,
            extendedOrderTitle: getExtendedOrderTitle(item),
            orderTitle: item.orderText.orderTitle,
            shortOrderInfo:
              (getters.isDNC || getters.isECD || getters.isDSP_or_DSPoperator)
              ?  formShortOrderInfo(item.orderText.orderText, getters.isDNC, getters.isECD, getters.isDSP_or_DSPoperator, item.otherToSend)
              : '',
            orderPatternId: item.orderText.patternId,
            orderText: formOrderText({
              orderTextArray: item.orderText.orderText,
              dncToSend: item.dncToSend,
              dspToSend: item.dspToSend,
              ecdToSend: item.ecdToSend,
              otherToSend: item.otherToSend,
              insertEmptyLineBeforeText: true,
            }),
            place: item.senderWorkPoligon.title,
            senderWorkPoligon: item.senderWorkPoligon,
            post: item.creator.post,
            fio: item.creator.fio + (item.createdOnBehalfOf ? ` (от имени ${item.createdOnBehalfOf})` : ''),
            orderReceiveStatus: {
              notDeliveredNotConfirmed:
                (item.dspToSend ? item.dspToSend.filter((dsp) => !dsp.deliverDateTime && !dsp.confirmDateTime).length : 0) +
                (item.dncToSend ? item.dncToSend.filter((dnc) => !dnc.deliverDateTime && !dnc.confirmDateTime).length : 0) +
                (item.ecdToSend ? item.ecdToSend.filter((ecd) => !ecd.deliverDateTime && !ecd.confirmDateTime).length : 0),
              deliveredButNotConfirmed:
                (item.dspToSend ? item.dspToSend.filter((dsp) => dsp.deliverDateTime && !dsp.confirmDateTime).length : 0) +
                (item.dncToSend ? item.dncToSend.filter((dnc) => dnc.deliverDateTime && !dnc.confirmDateTime).length : 0) +
                (item.ecdToSend ? item.ecdToSend.filter((ecd) => ecd.deliverDateTime && !ecd.confirmDateTime).length : 0) +
                (item.otherToSend ? item.otherToSend.filter((other) => !other.confirmDateTime).length : 0),
              notDeliveredNotConfirmedOnStation:
                item.stationWorkPlacesToSend ? item.stationWorkPlacesToSend.filter((el) => !el.deliverDateTime && !el.confirmDateTime).length : 0,
              deliveredButNotConfirmedOnStation:
                item.stationWorkPlacesToSend ? item.stationWorkPlacesToSend.filter((el) => el.deliverDateTime && !el.confirmDateTime).length : 0,
            },
            orderChainId: item.orderChainId,
            orderChainEndDateTime: item.orderChainEndDateTime,
            chainMembersNumber: getters.getRawWorkingOrders.filter((el) => el.orderChainId === item.orderChainId).length,
            receivers: [
              ...(!item.dspToSend ? [] : item.dspToSend.map((dsp) => {
                return {
                  ...dsp,
                  place: dsp.placeTitle,
                };
              })),
              ...(!item.dncToSend ? [] : item.dncToSend.map((dnc) => {
                return {
                  ...dnc,
                  place: dnc.placeTitle,
                };
              })),
              ...(!item.ecdToSend ? [] : item.ecdToSend.map((ecd) => {
                return {
                  ...ecd,
                  place: ecd.placeTitle,
                };
              })),
            ],
            stationReceivers: getItemStationReceivers(),
            otherReceivers: item.otherToSend || [],
            assertDateTime: item.assertDateTime ? getLocaleDateTimeString(item.assertDateTime, false) : null,
            invalid: item.invalid,
            additionallyInformedPeople: item.additionallyInformedPeople,
          };
        });
    },

    /**
     * Для данного распоряжения позволяет получить количество не доставленных до получателей
     * его экземпляров и не подтвержденных никем (из секции "Кому"), а также (в случае ДСП
     * или оператора при ДСП) количество не доставленных до получателей его экземпляров и не
     * подтвержденных никем на рабочих местах станции.
     */
     getNotDeliveredNotConfirmedOrderInstancesNumber() {
      return (order) => {
        if (!order) {
          return [0, 0];
        }
        let instancesNumber = 0;
        if (order.dspToSend) {
          instancesNumber += order.dspToSend.filter((item) => !item.deliverDateTime && !item.confirmDateTime).length;
        }
        if (order.dncToSend) {
          instancesNumber += order.dncToSend.filter((item) => !item.deliverDateTime && !item.confirmDateTime).length;
        }
        if (order.ecdToSend) {
          instancesNumber += order.ecdToSend.filter((item) => !item.deliverDateTime && !item.confirmDateTime).length;
        }
        const instancesNumberOnStation = order.stationWorkPlacesToSend.filter((item) => !item.deliverDateTime && !item.confirmDateTime).length;
        return [instancesNumber, instancesNumberOnStation];
      };
    },

    /**
     * Для данного распоряжения позволяет получить количество доставленных, но не подтвержденных
     * никем его экземпляров (из секции "Кому"), а также количество таких же экземпляров в
     * рамках рабочих мест станции (в случае ДСП или Оператора при ДСП).
     */
    getDeliveredButNotConfirmedOrderInstancesNumber() {
      return (order) => {
        if (!order) {
          return [0, 0];
        }
        let instancesNumber = 0;
        if (order.dspToSend) {
          instancesNumber += order.dspToSend.filter((item) => item.deliverDateTime && !item.confirmDateTime).length;
        }
        if (order.dncToSend) {
          instancesNumber += order.dncToSend.filter((item) => item.deliverDateTime && !item.confirmDateTime).length;
        }
        if (order.ecdToSend) {
          instancesNumber += order.ecdToSend.filter((item) => item.deliverDateTime && !item.confirmDateTime).length;
        }
        if (order.otherToSend) {
          instancesNumber += order.otherToSend.filter((item) => !item.confirmDateTime).length;
        }
        const instancesNumberOnStation = order.stationWorkPlacesToSend.filter((item) => item.deliverDateTime && !item.confirmDateTime).length;
        return [instancesNumber, instancesNumberOnStation];
      };
    },

    /**
     * Позволяет получить количество экземпляров не доставленных и не подтвержденных распоряжений,
     * находящихся в работе (в том числе на станции).
     */
    getNotDeliveredNotConfirmedOrdersNumber(state, getters) {
      const workingOrders = state.data.filter((item) => item.confirmDateTime);
      let notDeliveredInstances = 0;
      let notDeliveredInstancesOnStation = 0;
      workingOrders.forEach((order) => {
        const data = getters.getNotDeliveredNotConfirmedOrderInstancesNumber(order);
        notDeliveredInstances += data[0];
        notDeliveredInstancesOnStation += data[1];
      });
      return [notDeliveredInstances, notDeliveredInstancesOnStation];
    },

    /**
     * Позволяет получить количество экземпляров доставленных, но не подтвержденных и находящихся
     * в работе распоряжений (в том числе на станции).
     */
    getDeliveredButNotConfirmedOrdersNumber(state, getters) {
      const workingOrders = state.data.filter((item) => item.confirmDateTime);
      let notConfirmedInstances = 0;
      let notConfirmedInstancesOnStation = 0;
      workingOrders.forEach((order) => {
        const data = getters.getDeliveredButNotConfirmedOrderInstancesNumber(order);
        notConfirmedInstances += data[0];
        notConfirmedInstancesOnStation += data[1];
      });
      return [notConfirmedInstances, notConfirmedInstancesOnStation];
    },

    /**
     *
     */
    getOrdersInChain(state) {
      return (chainId) => {
        return state.data.filter((item) => item.orderChainId === chainId).sort((a, b) => {
          if (a.createDateTime < b.createDateTime) {
            return -1;
          }
          if (a.createDateTime > b.createDateTime) {
            return 1;
          }
          return 0;
        });
      };
    },
  },

  mutations: {
    /**
     * Позволяет определить дату-время начала временного интервала запроса информации о рабочих
     * распоряжениях у сервера:
     * 1) если пользователь вошел в систему с 7:30 до 19:30, то время начала запроса информации полагается
     *    равным 7:00 этого же дня;
     * 2) если пользователь вошел в систему ранее 7:30, то время начала запроса информации устанавливается
     *    равным 19:00 предыдущего дня;
     * 3) если пользователь вошел в систему после 19:30, то время начала запроса информации устанавливается
     *    равным 19:00 текущего дня.
     */
    [SET_START_DATE_TO_GET_DATA] (state, userLoginDateTime) {
      if (!userLoginDateTime) {
        state.startDateToGetData = new Date();
        return;
      }
      const today = new Date();
      // если функция Date вызывается в качестве конструктора с более чем одним аргументом,
      // то указанные аргументы интерпретируются как локальное время
      const checkDate1 = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 30, 0, 0);
      const checkDate2 = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 19, 30, 0, 0);
      if (checkDate1 <= userLoginDateTime && userLoginDateTime <= checkDate2) {
        state.startDateToGetData = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 0, 0, 0);
      } else {
        state.startDateToGetData = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 19, 0, 0, 0);
        if (userLoginDateTime < checkDate1) {
          state.startDateToGetData.setDate(state.startDateToGetData.getDate() - 1);
        }
      }
    },

    /**
     * Позволяет изменить дату-время начала временного интервала запроса информации о рабочих
     * распоряжениях у сервера.
     */
    [SET_START_DATE_TO_GET_DATA_NO_CHECK] (state, date) {
      if (date instanceof Date) {
        state.startDateToGetData = date;
      }
    },

    [CLEAR_LOADING_WORK_ORDERS_RESULT] (state) {
      state.loadingWorkOrdersResult = null;
    },

    [SET_LOADING_WORK_ORDERS_RESULT] (state, { error, message }) {
      state.loadingWorkOrdersResult = {
        error,
        message,
      };
    },

    [SET_LOADING_WORK_ORDERS_STATUS] (state, status) {
      state.loadingWorkOrders = status;
    },

    /**
     * Позволяет запомнить массив "рабочих" распоряжений, полученный от сервера.
     */
    [SET_NEW_WORK_ORDERS_ARRAY] (state, newData) {
      if (!newData || !newData.length) {
        state.data = [];
        return;
      }
      if (!state.data?.length) {
        state.data = newData.map((order) => getWorkOrderObject(order));
        if (state.data.find((order) => !order.confirmDateTime)) {
          state.newIncomingOrders = true;
        }
        return;
      }
      // Вначале удалим те элементы существующего массива, которых нет в новом массиве
      const delIndexes = [];
      state.data.forEach((order, index) => {
        if (!newData.find((item) => item._id === order._id)) {
          delIndexes.push(index);
        }
      });
      if (delIndexes.length) {
        state.data = state.data.filter((_item, index) => !delIndexes.includes(index));
      }
      // Затем добавим в существующий массив элементы, которых в нем нет, и отредактируем,
      // при необходимости, существующие элементы
      newData.forEach((order) => {
        const existingOrderIndex = state.data.findIndex((item) => item._id === order._id);
        if (existingOrderIndex < 0) {
          if (!order.deliverDateTime) {
            state.newIncomingOrders = true;
          }
          state.data = [
            ...state.data,
            getWorkOrderObject(order),
          ];
        } else {
          const modifiedObject = getWorkOrderObject(order);
          if (JSON.stringify(state.data[existingOrderIndex]) !== JSON.stringify(modifiedObject)) {
            state.data = [
              ...state.data.slice(0, existingOrderIndex),
              modifiedObject,
              ...state.data.slice(existingOrderIndex + 1),
            ];
          }
        }
      });
    },

    /**
     * Обновляет, при необходимости, счетчик входящих распоряжений (за смену).
     */
    [UPDATE_NUMBER_OF_INCOMING_ORDERS_PER_SHIFT] (state, { isUserOnDuty, lastTakeDutyTime, currentWorkPoligon }) {
      if (!isUserOnDuty || !currentWorkPoligon) {
        return;
      }
      if (!state.data || !state.data.length) {
        return;
      }
      // В общем списке всех распоряжений, полученных с сервера, считаем количество тех распоряжений,
      // которые были адресованы данному рабочему полигону (это те распоряжения, которые были изданы
      // не на данном рабочем полигоне)
      const newOrdersIds = state.data.filter((order) =>
        !state.incomingOrdersPerShift.includes(order._id) &&
        (
          order.workPoligon.type !== currentWorkPoligon.type ||
          (String(order.workPoligon.id) !== String(currentWorkPoligon.code))
        ) &&
        (order.createDateTime >= lastTakeDutyTime)
      ).map((el) => el._id);
      if (newOrdersIds.length) {
        state.incomingOrdersPerShift.push(...newOrdersIds);
      }
    },

    [DEL_WORK_ORDERS] (state) {
      state.data = [];
    },
  },

  actions: {
    /**
     * Запрашивает у сервера входящие и рабочие распоряжения для текущего полигона управления.
     */
    async [LOAD_WORK_ORDERS_ACTION] (context) {
      if (context.getters.ifUserWorksOffline) {
        context.commit(SET_LOADING_WORK_ORDERS_RESULT, { error: true, message: 'При автономной работе с системой нет возможности обновлять список документов' });
        return;
      }
      if (!context.getters.canUserWorkWithSystem) {
        const errMessage = 'Не могу загрузить рабочие распоряжения: у вас нет прав на работу с системой';
        context.commit(SET_LOADING_WORK_ORDERS_RESULT, { error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }
      context.commit(CLEAR_LOADING_WORK_ORDERS_RESULT);
      context.commit(SET_LOADING_WORK_ORDERS_STATUS, true);
      try {
        const responseData = await getWorkOrdersFromServer({
          startDate: context.getters.getStartDateToGetData,
        });
        context.commit(SET_LOADING_WORK_ORDERS_RESULT, { error: false, message: null });
        context.commit(SET_NEW_WORK_ORDERS_ARRAY, responseData);
        context.commit(UPDATE_NUMBER_OF_INCOMING_ORDERS_PER_SHIFT, {
          isUserOnDuty: context.getters.isUserOnDuty,
          lastTakeDutyTime: context.getters.getLastTakeDutyTime,
          currentWorkPoligon: context.getters.getUserWorkPoligon,
        });
        context.dispatch(REPORT_ON_ORDERS_DELIVERY_ACTION, responseData);

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка получения информации о рабочих распоряжениях');
        context.commit(SET_LOADING_WORK_ORDERS_RESULT, { error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });

      } finally {
        context.commit(SET_LOADING_WORK_ORDERS_STATUS, false);
      }
    },
  },
}
