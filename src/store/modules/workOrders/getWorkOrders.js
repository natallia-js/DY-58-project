import { store } from '@/store';
import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';
import {
  OrderPatternElementType,
  OrderPatternElementType_Future,
  SPECIAL_ORDER_DSP_TAKE_DUTY_SIGN,
  SPECIAL_ORDER_SUBPATTERN_TYPES,
} from '@/constants/orderPatterns';
import { getLocaleDateTimeString, getTimeSpanString } from '@/additional/dateTimeConvertions';
import { formOrderText } from '@/additional/formOrderText';
import { upperCaseFirst } from '@/additional/stringFunctions';
import {
  SET_START_DATE_TO_GET_DATA,
  SET_START_DATE_TO_GET_DATA_NO_CHECK,
  CLEAR_LOADING_WORK_ORDERS_RESULT,
  SET_LOADING_WORK_ORDERS_RESULT,
  SET_LOADING_WORK_ORDERS_STATUS,
  SET_NEW_WORK_ORDERS_ARRAY,
  UPDATE_NUMBER_OF_INCOMING_ORDERS_PER_SHIFT,
  DEL_WORK_ORDERS,
} from '@/store/mutation-types';
import { getWorkOrdersFromServer } from '@/serverRequests/orders.requests';
import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';


function getWorkOrderObject(order) {
  return {
    _id: order._id,
    createDateTime: order.createDateTime ? new Date(order.createDateTime) : null,
    creator: order.creator,
    createdOnBehalfOf: order.createdOnBehalfOf,
    deliverDateTime: order.deliverDateTime ? new Date(order.deliverDateTime) : null,
    confirmDateTime: order.confirmDateTime ? new Date(order.confirmDateTime) : null,
    dncToSend: order.dncToSend.map((item) => {
      return {
        confirmDateTime: item.confirmDateTime ? new Date(item.confirmDateTime) : null,
        deliverDateTime: item.deliverDateTime ? new Date(item.deliverDateTime) : null,
        post: item.post,
        fio: item.fio,
        id: +item.id,
        placeTitle: item.placeTitle,
        sendOriginal: Boolean(item.sendOriginal),
        type: item.type,
        _id: item._id,
      };
    }),
    dspToSend: order.dspToSend.map((item) => {
      return {
        confirmDateTime: item.confirmDateTime ? new Date(item.confirmDateTime) : null,
        deliverDateTime: item.deliverDateTime ? new Date(item.deliverDateTime) : null,
        post: item.post,
        fio: item.fio,
        id: +item.id,
        placeTitle: item.placeTitle,
        sendOriginal: Boolean(item.sendOriginal),
        type: item.type,
        _id: item._id,
      };
    }),
    ecdToSend: order.ecdToSend.map((item) => {
      return {
        confirmDateTime: item.confirmDateTime ? new Date(item.confirmDateTime) : null,
        deliverDateTime: item.deliverDateTime ? new Date(item.deliverDateTime) : null,
        post: item.post,
        fio: item.fio,
        id: +item.id,
        placeTitle: item.placeTitle,
        sendOriginal: Boolean(item.sendOriginal),
        type: item.type,
        _id: item._id,
      };
    }),
    otherToSend: order.otherToSend.map((item) => {
      return {
        _id: item._id,
        post: item.post,
        fio: item.fio,
        placeTitle: item.placeTitle,
        sendOriginal: Boolean(item.sendOriginal),
      };
    }),
    // Если текущий рабочий полигон - не станция, то это поле останется пустым.
    // В противном случае заполняем данное поле информацией, отсеивая информацию не по текущей станции.
    stationWorkPlacesToSend: order.stationWorkPlacesToSend
      .filter((item) =>
        store.getters.getUserWorkPoligon &&
        store.getters.getUserWorkPoligon.type === WORK_POLIGON_TYPES.STATION &&
        String(item.id) === String(store.getters.getUserWorkPoligon.code)
      )
      .map((item) => {
        return {
          confirmDateTime: item.confirmDateTime ? new Date(item.confirmDateTime) : null,
          deliverDateTime: item.deliverDateTime ? new Date(item.deliverDateTime) : null,
          post: item.post,
          fio: item.fio,
          id: +item.id,
          workPlaceId: item.workPlaceId ? +item.workPlaceId : null,
          placeTitle: item.placeTitle,
          sendOriginal: Boolean(item.sendOriginal),
          type: item.type,
          _id: item._id,
        };
      }),
    number: order.number,
    orderText: !order.orderText ? null : {
      ...order.orderText,
      orderText: !order.orderText.orderText ? null :
        order.orderText.orderText.map((el) => {
          return {
            ...el,
            value: getOrderTextElementTypedValue(el),
          };
        })
    },
    place: order.place ? { place: order.place.place, value: +order.place.value } : null,
    senderWorkPoligon: order.senderWorkPoligon ? {
      id: order.senderWorkPoligon.id,
      workPlaceId: order.senderWorkPoligon.workPlaceId,
      type: order.senderWorkPoligon.type,
      title: order.senderWorkPoligon.title,
    } : null,
    timeSpan: order.timeSpan ? {
      start: order.timeSpan.start ? new Date(order.timeSpan.start) : null,
      end: order.timeSpan.end ? new Date(order.timeSpan.end) : null,
      tillCancellation: Boolean(order.timeSpan.tillCancellation),
    } : null,
    type: order.type,
    workPoligon: order.workPoligon ? {
      id: order.workPoligon.id,
      workPlaceId: order.workPoligon.workPlaceId,
      type: order.workPoligon.type,
    } : null,
    sendOriginal: order.sendOriginal,
    orderChainId: order.orderChain.chainId,
    specialTrainCategories: order.specialTrainCategories,
  };
}


function getOrderTextElementTypedValue(element) {
  if (!element) {
    return;
  }
  switch (element.type) {
    case OrderPatternElementType.DATE:
    case OrderPatternElementType.TIME:
    case OrderPatternElementType.DATETIME:
      return new Date(element.value);
    case OrderPatternElementType.DR_TRAIN_TABLE:
    case OrderPatternElementType_Future.OBJECT:
    case OrderPatternElementType_Future.OBJECTS_LIST:
      return JSON.parse(element.value);
    default:
      return element.value;
  }
}


/**
 * Данный модуль предназначен для получения информации о рабочих распоряжениях.
 */
export const getWorkOrders = {
  getters: {
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
     */
    getRawWorkingOrders(state) {
      return state.data.filter((item) => item.confirmDateTime);
    },

    /**
     * Позволяет получить количество распоряжений, находящихся в работе.
     */
    getWorkingOrdersNumber(_state, getters) {
      return getters.getRawWorkingOrders.length;
    },

    /**
     * Возвращает количество рабочих распоряжений, имеющих указанные отметки об особой категории поезда.
     */
    getWorkingOrdersNumberReferringSpecialTrainCategories(_state, getters) {
      return (specialTrainCategories) => {
        if (!specialTrainCategories || !specialTrainCategories.length) {
          return 0;
        }
        return getters.getRawWorkingOrders.filter((order) => {
          if (!order.specialTrainCategories || !order.specialTrainCategories.length) {
            return false;
          }
          return specialTrainCategories.filter((el) => order.specialTrainCategories.includes(el)).length ? true : false;
        }).length;
      };
    },

    /**
     * Позволяет получить массив рабочих распоряжений, у элементов которого могут быть дочерние
     * элементы - распоряжения, изданные в рамках этой же цепочки распоряжений, но позднее.
     * Возвращаемый массив может использоваться для отображения рабочих распоряжений в виде
     * дерева распоряжений.
     */
    getWorkingOrdersToDisplayAsTree(_state, getters) {
      // Распоряжения в массиве рабочих распоряжений идут в хронологическом порядке (по возрастанию
      // времени их издания). Это обязательно!!!
      const workingOrders = getters.getRawWorkingOrders.sort((a, b) => {
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
          post: order.creator.post,
          fio: order.creator.fio + (order.createdOnBehalfOf ? ` (от имени ${order.createdOnBehalfOf})` : ''),
          orderNum: order.number,
          time: getLocaleDateTimeString(order.createDateTime, false),
          timeSpan: getTimeSpanString(order.timeSpan, getters.isECD),
          orderTitle: order.orderText.orderTitle,
          orderText: formOrderText({
            orderTextArray: order.orderText.orderText,
            dncToSend: order.dncToSend,
            dspToSend: order.dspToSend,
            ecdToSend: order.ecdToSend,
            otherToSend: order.otherToSend,
          }),
          orderChainId: order.orderChainId,
          specialTrainCategories: order.specialTrainCategories,
          children: [],
        };

        if (!parentNode) {
          orderNodeData.topLevelNode = true;
          groupedWorkingOrders.push(orderNodeData);
        } else {
          parentNode.children.push(orderNodeData);
        }
      });
      return groupedWorkingOrders;
    },

    /**
     * Возвращает список всех рабочих распоряжений со сформированным единым списком получателей распоряжения.
     * Распоряжения сортируются следующим образом.
     * Вначале идут распоряжения, у которых присутствует статус "не доставлено" и/или "не подтверждено",
     * отсортированные по времени их создания, за ними следуют все остальные распоряжения, также
     * отсортированные по времени их создания.
     * Данная функция может использоваться для отображения списка рабочих распоряжений в табличном виде.
     */
    getWorkingOrders(_state, getters) {
      const isOrderNotDeliveredOrNotConfirmed = (order) => {
        return getters.getOrderNotDeliveredInstancesNumber(order) > 0 ||
               getters.getOrderNotConfirmedInstancesNumber(order) > 0;
      };

      return getters.getRawWorkingOrders
        .sort((a, b) => {
          if (a.createDateTime < b.createDateTime) {
            return -1;
          }
          if (a.createDateTime > b.createDateTime) {
            return 1;
          }
          return 0;
        })
        .sort((a, b) => {
          const status_a = isOrderNotDeliveredOrNotConfirmed(a);
          const status_b = isOrderNotDeliveredOrNotConfirmed(b);
          if (status_a && !status_b) {
            return -1;
          }
          if (!status_a && status_b) {
            return 1;
          }
          return 0;
        })
        .map((item, index) => {
          return {
            id: item._id,
            type: item.type,
            //createDateTime: item.createDateTime,
            sendOriginal: item.sendOriginal,
            state: '',
            seqNum: index + 1,
            time: getLocaleDateTimeString(item.createDateTime, false),
            timeSpan: getTimeSpanString(item.timeSpan, getters.isECD),
            orderNum: item.number,
            extendedOrderTitle:
              item.specialTrainCategories && item.specialTrainCategories.includes(SPECIAL_ORDER_DSP_TAKE_DUTY_SIGN) ?
                `${upperCaseFirst(SPECIAL_ORDER_SUBPATTERN_TYPES.RECORD)}. ${item.orderText.orderTitle}` :
                `${upperCaseFirst(item.type)}. ${item.orderText.orderTitle}`,
            orderTitle: item.orderText.orderTitle,
            orderPatternId: item.orderText.patternId,
            orderText: formOrderText({
              orderTextArray: item.orderText.orderText,
              dncToSend: item.dncToSend,
              dspToSend: item.dspToSend,
              ecdToSend: item.ecdToSend,
              otherToSend: item.otherToSend,
            }),
            place: item.senderWorkPoligon.title,
            senderWorkPoligon: {
              id: item.senderWorkPoligon.id,
              type: item.senderWorkPoligon.type,
              workPlaceId: item.senderWorkPoligon.workPlaceId,
            },
            post: item.creator.post,
            fio: item.creator.fio + (item.createdOnBehalfOf ? ` (от имени ${item.createdOnBehalfOf})` : ''),
            orderReceiveStatus: {
              notDelivered:
                (item.dspToSend ? item.dspToSend.filter((dsp) => !dsp.deliverDateTime).length : 0) +
                (item.dncToSend ? item.dncToSend.filter((dnc) => !dnc.deliverDateTime).length : 0) +
                (item.ecdToSend ? item.ecdToSend.filter((ecd) => !ecd.deliverDateTime).length : 0),
              notConfirmed:
                (item.dspToSend ? item.dspToSend.filter((dsp) => dsp.deliverDateTime && !dsp.confirmDateTime).length : 0) +
                (item.dncToSend ? item.dncToSend.filter((dnc) => dnc.deliverDateTime && !dnc.confirmDateTime).length : 0) +
                (item.ecdToSend ? item.ecdToSend.filter((ecd) => ecd.deliverDateTime && !ecd.confirmDateTime).length : 0),
            },
            orderChainId: item.orderChainId,
            chainMembersNumber: getters.getRawWorkingOrders.filter((el) => el.orderChainId === item.orderChainId).length,
            receivers: [
              ...(!item.dspToSend ? [] : item.dspToSend.map((dsp) => {
                return {
                  id: dsp.id,
                  type: dsp.type,
                  place: dsp.placeTitle,
                  post: dsp.post,
                  fio: dsp.fio,
                  deliverDateTime: dsp.deliverDateTime,
                  confirmDateTime: dsp.confirmDateTime,
                };
              })),
              ...(!item.dncToSend ? [] : item.dncToSend.map((dnc) => {
                return {
                  id: dnc.id,
                  type: dnc.type,
                  place: dnc.placeTitle,
                  post: dnc.post,
                  fio: dnc.fio,
                  deliverDateTime: dnc.deliverDateTime,
                  confirmDateTime: dnc.confirmDateTime,
                };
              })),
              ...(!item.ecdToSend ? [] : item.ecdToSend.map((ecd) => {
                return {
                  id: ecd.id,
                  type: ecd.type,
                  place: ecd.placeTitle,
                  post: ecd.post,
                  fio: ecd.fio,
                  deliverDateTime: ecd.deliverDateTime,
                  confirmDateTime: ecd.confirmDateTime,
                };
              })),
            ],
            stationReceivers: item.stationWorkPlacesToSend.map((item) => {
              // Должность и ФИО лица, находящегося на смене на рабочем месте станции, которому адресована копия
              // распоряжения, берем из последнего распоряжения о приеме/сдаче дежурства.
              // Но только в том случае, если на данном рабочем месте распоряжение еще не подтверждено.
              let { post, fio } = !item.confirmDateTime
                ? getters.getWorkPlacePostFIOFromExistingDSPTakeDutyOrder(item.workPlaceId)
                : { post: item.post, fio: item.fio };
              return {
                id: item.id,
                type: item.type,
                workPlaceId: item.workPlaceId,
                place: item.placeTitle,
                post,
                fio,
                deliverDateTime: item.deliverDateTime,
                confirmDateTime: item.confirmDateTime,
              };
            }),
          };
        });
    },

    /**
     * Для данного распоряжения позволяет получить количество не доставленных до
     * получателей его экземпляров.
     */
    getOrderNotDeliveredInstancesNumber() {
      return (order) => {
        if (!order) {
          return 0;
        }
        let notDeliveredInstances = 0;
        if (order.dspToSend) {
          notDeliveredInstances += order.dspToSend.filter((item) => !item.deliverDateTime).length;
        }
        if (order.dncToSend) {
          notDeliveredInstances += order.dncToSend.filter((item) => !item.deliverDateTime).length;
        }
        if (order.ecdToSend) {
          notDeliveredInstances += order.ecdToSend.filter((item) => !item.deliverDateTime).length;
        }
        return notDeliveredInstances;
      };
    },

    /**
     * Для данного распоряжения позволяет получить количество не подтвержденных
     * получателями его экземпляров.
     */
    getOrderNotConfirmedInstancesNumber() {
      return (order) => {
        if (!order) {
          return 0;
        }
        let notConfirmedInstances = 0;
        if (order.dspToSend) {
          notConfirmedInstances += order.dspToSend.filter((item) => item.deliverDateTime && !item.confirmDateTime).length;
        }
        if (order.dncToSend) {
          notConfirmedInstances += order.dncToSend.filter((item) => item.deliverDateTime && !item.confirmDateTime).length;
        }
        if (order.ecdToSend) {
          notConfirmedInstances += order.ecdToSend.filter((item) => item.deliverDateTime && !item.confirmDateTime).length;
        }
        return notConfirmedInstances;
      };
    },

    /**
     * Позволяет получить количество экземпляров не доставленных и находящихся в работе распоряжений.
     */
    getNotDeliveredOrdersNumber(state, getters) {
      const workingOrders = state.data.filter((item) => item.confirmDateTime);
      let notDeliveredInstances = 0;
      workingOrders.forEach((order) => {
        notDeliveredInstances += getters.getOrderNotDeliveredInstancesNumber(order);
      });
      return notDeliveredInstances;
    },

    /**
     * Позволяет получить количество экземпляров не подтвержденных и находящихся в работе распоряжений.
     */
    getNotConfirmedOrdersNumber(state, getters) {
      const workingOrders = state.data.filter((item) => item.confirmDateTime);
      let notConfirmedInstances = 0;
      workingOrders.forEach((order) => {
        notConfirmedInstances += getters.getOrderNotConfirmedInstancesNumber(order);
      });
      return notConfirmedInstances;
    },

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
     * распоряжениях у сервера.
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
      }
    },

    /**
     * Позволяет изменить дату-время начала временного интервала запроса информации о рабочих
     * распоряжениях у сервера.
     */
    [SET_START_DATE_TO_GET_DATA_NO_CHECK] (state, date) {
      if (!(date instanceof Date)) {
        return;
      }
      state.startDateToGetData = date;
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
        if (state.data.length) {
          state.data = [];
        }
        return;
      }
      if (!state.data || !state.data.length) {
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
          state.data.push(getWorkOrderObject(order));
        } else {
          const modifiedObject = getWorkOrderObject(order);
          if (JSON.stringify(state.data[existingOrderIndex]) !== JSON.stringify(modifiedObject)) {
            state.data[existingOrderIndex] = modifiedObject;
          }
        }
      });
    },

    /**
     * Обновляет, при необходимости, счетчик входящих распоряжений (за смену).
     */
    [UPDATE_NUMBER_OF_INCOMING_ORDERS_PER_SHIFT] (state, { isUserOnDuty, lastTakeDutyTime, userId }) {
      if (!isUserOnDuty) {
        return;
      }
      if (!state.data || !state.data.length) {
        return;
      }
      if (!state.incomingOrdersPerShift) {
        state.incomingOrdersPerShift = [];
      }
      state.data.forEach((order) => {
        if ((order.creator.id !== userId) && (order.createDateTime >= lastTakeDutyTime) &&
          !state.incomingOrdersPerShift.includes(order._id)) {
          state.incomingOrdersPerShift.push(order._id);
        }
      });
    },

    [DEL_WORK_ORDERS] (state) {
      state.data = [];
    },
  },

  actions: {
    /**
     * Запрашивает у сервера входящие и рабочие распоряжения для текущего полигона управления.
     */
    async loadWorkOrders(context) {
      if (!context.getters.canUserWorkWithSystem) {
        context.commit(SET_LOADING_WORK_ORDERS_RESULT, { error: true, message: 'Не могу загрузить рабочие распоряжения: у вас нет прав на работу с системой' });
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
          userId: context.getters.getUserId,
        });
        context.dispatch('reportOnOrdersDelivery', responseData);

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка получения информации о рабочих распоряжениях');
        context.commit(SET_LOADING_WORK_ORDERS_RESULT, { error: true, message: errMessage });

      } finally {
        context.commit(SET_LOADING_WORK_ORDERS_STATUS, false);
      }
    },
  },
}
