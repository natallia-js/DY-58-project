import { CurrShiftGetOrderStatus } from '@/constants/orders';
import {
  CLEAR_DISPATCH_ORDER_RESULT,
  ADD_ORDERS_BEING_DISPATCHED_NUMBER,
  SUB_ORDERS_BEING_DISPATCHED_NUMBER,
  SET_DISPATCH_ORDER_RESULT,
  ADD_ORDER,
  SET_LAST_ORDERS_NUMBER,
  DEL_ORDER_DRAFT,
  SET_SYSTEM_MESSAGE,
} from '@/store/mutation-types';
import { DISPATCH_ORDER_ACTION } from '@/store/action-types';
import { dispatchOrderToServer } from '@/serverRequests/orders.requests';
import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';
import getOrderTextForSendingToServer from '@/additional/getOrderTextForSendingToServer';
import { getWorkOrderObject } from './getWorkOrderObject';
import { ALL_ORDERS_TYPE_ECD, SPECIAL_CIRCULAR_ORDER_SIGN } from '@/constants/orderPatterns';
import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';


/**
 * Данный модуль предназначен для издания распоряжений (сохранения их на сервере).
 */
 export const dispatchOrder = {
  getters: {
    getDispatchOrderResult(state) {
      return state.dispatchOrderResult;
    },

    getDispatchOrdersBeingProcessed(state) {
      return (orderType) => {
        const existingType = state.dispatchOrdersBeingProcessed.find((el) => el.type === orderType);
        if (existingType) {
          return existingType.number;
        }
        return 0;
      };
    },
  },

  mutations: {
    [CLEAR_DISPATCH_ORDER_RESULT] (state) {
      if (state.dispatchOrderResult) {
        state.dispatchOrderResult = null;
      }
    },

    [ADD_ORDERS_BEING_DISPATCHED_NUMBER] (state, type) {
      const existingType = state.dispatchOrdersBeingProcessed.find((el) => el.type === type);
      if (!existingType) {
        state.dispatchOrdersBeingProcessed.push({ type, number: 1 });
      } else {
        state.dispatchOrdersBeingProcessed = state.dispatchOrdersBeingProcessed.map((el) => {
          if (el.type === type) {
            return { ...el, number: el.number + 1 };
          }
          return el;
        });
      }
    },

    [SUB_ORDERS_BEING_DISPATCHED_NUMBER] (state, type) {
      const existingType = state.dispatchOrdersBeingProcessed.find((el) => el.type === type);
      if (existingType) {
        if (existingType.number === 1) {
          state.dispatchOrdersBeingProcessed = state.dispatchOrdersBeingProcessed.filter((el) => el.type !== type);
        } else {
          state.dispatchOrdersBeingProcessed = state.dispatchOrdersBeingProcessed.map((el) => {
            if (el.type === type) {
              return { ...el, number: el.number - 1 };
            }
            return el;
          });
        }
      }
    },

    [SET_DISPATCH_ORDER_RESULT] (state, { error, orderId, orderType, message }) {
      state.dispatchOrderResult = {
        error,
        orderId,
        orderType,
        message,
      };
    },

    [ADD_ORDER] (state, newOrder) {
      // Прежде чем добавить новое распоряжение в общий список, проверяем, не содержится ли оно уже там.
      // Такое может произойти, когда распоряжение было издано, отправлено на сервер, им сохранено в БД,
      // после чего сработал запрос со стороны ДУ-58 на сервер об обновлении рабочих распоряжений.
      // Новое распоряжение (изданное) после выполнения запроса появилось в списке рабочих распоряжений,
      // и только после этого ДУ-58 получила ответ от сервера об успешном сохранении нового
      // распоряжения и добавила это распоряжение в уже обновленный с сервера набор данных.
      // Т.о., в этом наборе данных (рабочих распоряжениях) появятся 2 одинаковые записи.
      if (!state.data.find((order) => order._id === newOrder._id)) {
        // преобразуем полученный объект к тому виду, с которым работает программа
        const newWorkOrderObject = getWorkOrderObject(newOrder);
        state.data = [
          // параллельно с добавлением распоряжения в общий список производим обновление тех данных для связанных с ним распоряжений
          // (находящихся в одной цепочке), которые пока не известны ДУ-58, но уже известны серверу, а именно:
          // дата-время окончания действия цепочки распоряжений
          ...state.data.map((order) => {
            if (order.orderChainId === newWorkOrderObject.orderChainId)
              order.orderChainEndDateTime = newWorkOrderObject.orderChainEndDateTime;
            return order;
          }),
          newWorkOrderObject,
        ];
      }
    },
  },

  actions: {
    /**
     * Делает запрос на сервер с целью сохранения издаваемого распоряжения и передачи его причастным.
     */
    async [DISPATCH_ORDER_ACTION] (context, params) {
      const {
        type,
        number,
        createDateTime,
        place,
        timeSpan,
        orderText,
        dncToSend,
        dspToSend,
        ecdToSend,
        otherToSend,
        orderChainId,
        dispatchedOnOrder,
        createdOnBehalfOf,
        showOnGID,
        specialTrainCategories,
        idOfTheOrderToCancel = null,
        draftId = null,
        additionalWorkers = null,
      } = params;

      if (!context.getters.canUserDispatchOrders && !context.getters.canUserCreateCheckOrders) {
        const errMessage = 'У вас нет права на издание документов / создание контрольных записей';
        context.commit(SET_DISPATCH_ORDER_RESULT, { error: true, orderType: type, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }

      context.commit(CLEAR_DISPATCH_ORDER_RESULT);
      context.commit(ADD_ORDERS_BEING_DISPATCHED_NUMBER, type);

      try {
        const responseData = await dispatchOrderToServer(
          {
            type,
            // тип распоряжения, под которым хранить информацию о номере последнего изданного документа
            orderNumSaveType: !context.getters.isECD ? type : ALL_ORDERS_TYPE_ECD,
            number,
            createDateTime: createDateTime.toISOString(),
            place,
            timeSpan,
            orderText: getOrderTextForSendingToServer(orderText),
            dncToSend: dncToSend.map((item) => {
              return {
                ...item,
                sendOriginal: item.sendOriginal === CurrShiftGetOrderStatus.sendOriginal ? true : false,
                placeTitle: item.sector,
              };
            }),
            dspToSend: dspToSend.map((item) => {
              return {
                ...item,
                sendOriginal: item.sendOriginal === CurrShiftGetOrderStatus.sendOriginal ? true : false,
                placeTitle: item.station,
              };
            }),
            // Если издается циркулярное распоряжение ДНЦ, то его необходимо также направить ЭЦД всех смехных участков.
            // Они не должны об этом знать и видеть это распоряжение. Оно лишь необходимо для быстрого заполнения таблицы
            // "Кому" по ДСП (ведь только ДНЦ знает, кто с ним заступает на дежурство на станциях)
            ecdToSend: context.getters.isDNC && specialTrainCategories?.includes(SPECIAL_CIRCULAR_ORDER_SIGN)
              ? context.getters.getNearestECDSectors?.map((item) => {
                return {
                  id: item.ECDS_ID,
                  type: WORK_POLIGON_TYPES.ECD_SECTOR,
                  sendOriginal: false,
                  placeTitle: item.ECDS_Title,
                };
              })
              : ecdToSend.map((item) => {
                return {
                  ...item,
                  sendOriginal: item.sendOriginal === CurrShiftGetOrderStatus.sendOriginal ? true : false,
                  placeTitle: item.sector,
                };
              }),
            otherToSend: otherToSend.map((item) => {
              return {
                ...item,
                sendOriginal: item.sendOriginal === CurrShiftGetOrderStatus.sendOriginal ? true : false,
              };
            }),
            workPoligonTitle: context.getters.getUserWorkPoligonName(false),
            createdOnBehalfOf,
            orderChainId,
            dispatchedOnOrder,
            showOnGID,
            specialTrainCategories,
            idOfTheOrderToCancel,
            draftId,
            additionalWorkers,
          }
        );
        context.commit(ADD_ORDER, responseData.order);
        context.commit(SET_DISPATCH_ORDER_RESULT, {
          error: false,
          orderId: responseData.order._id,
          orderType: responseData.order.type,
          message: responseData.message,
        });
        context.commit(SET_SYSTEM_MESSAGE, { error: false, datetime: new Date(), message: responseData.message });
        context.commit(SET_LAST_ORDERS_NUMBER, {
          ordersType: !context.getters.isECD ? responseData.order.type : ALL_ORDERS_TYPE_ECD,
          number: +responseData.order.number,
          createDateTime: new Date(responseData.order.createDateTime),
        });
        if (responseData.draftId) {
          context.commit(DEL_ORDER_DRAFT, responseData.draftId);
        }

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка сохранения распоряжения на сервере');
        context.commit(SET_DISPATCH_ORDER_RESULT, { error: true, orderId: null, orderType: type, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });

      } finally {
        context.commit(SUB_ORDERS_BEING_DISPATCHED_NUMBER, type);
      }
    },
  },
};
