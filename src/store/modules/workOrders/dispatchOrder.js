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
import { dispatchOrderToServer } from '@/serverRequests/orders.requests';
import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';
import getOrderTextForSendingToServer from '@/additional/getOrderTextForSendingToServer';
import { getWorkOrderObject } from './getWorkOrderObject';


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
      state.data.push(getWorkOrderObject(newOrder));
    },
  },

  actions: {
    /**
     * Делает запрос на сервер с целью сохранения издаваемого распоряжения и передачи его причастным.
     */
    async dispatchOrder(context, params) {
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
        createdOnBehalfOf,
        showOnGID,
        specialTrainCategories,
        idOfTheOrderToCancel = null,
        draftId = null,
      } = params;

      if (!context.getters.canUserDispatchOrders && !context.getters.canUserDispatchControlRecords) {
        const errMessage = 'У вас нет права на издание распоряжений / создание контрольных записей';
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
            dspToSend : dspToSend.map((item) => {
              return {
                ...item,
                sendOriginal: item.sendOriginal === CurrShiftGetOrderStatus.sendOriginal ? true : false,
                placeTitle: item.station,
              };
            }),
            ecdToSend: ecdToSend.map((item) => {
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
            workPoligonTitle: context.getters.getUserWorkPoligonName,
            createdOnBehalfOf,
            orderChainId,
            showOnGID,
            specialTrainCategories,
            idOfTheOrderToCancel,
            draftId,
          }
        );
        context.commit(SET_DISPATCH_ORDER_RESULT, {
          error: false,
          orderId: responseData.order._id,
          orderType: responseData.order.type,
          message: responseData.message,
        });
        context.commit(SET_SYSTEM_MESSAGE, { error: false, datetime: new Date(), message: responseData.message });
        context.commit(ADD_ORDER, responseData.order);
        context.commit(SET_LAST_ORDERS_NUMBER, {
          ordersType: responseData.order.type,
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
