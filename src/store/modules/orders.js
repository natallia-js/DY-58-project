import { CurrShiftGetOrderStatus } from '@/constants/orders';
import {
  CLEAR_DISPATCH_ORDER_RESULT,
  ADD_ORDERS_BEING_DISPATCHED_NUMBER,
  SUB_ORDERS_BEING_DISPATCHED_NUMBER,
  SET_DISPATCH_ORDER_RESULT,
  ADD_ORDER,
  SET_LAST_ORDERS_NUMBER,
} from '@/store/mutation-types';
import { dispatchOrderToServer } from '@/serverRequests/orders.requests';
import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';


export const orders = {
  state: {
    data: [],
    dispatchOrderResult: null,
    dispatchOrdersBeingProcessed: 0,
  },

  getters: {
    getDispatchOrderResult(state) {
      return state.dispatchOrderResult;
    },
    getDispatchOrdersBeingProcessed(state) {
      return state.dispatchOrdersBeingProcessed;
    },
  },

  mutations: {
    [CLEAR_DISPATCH_ORDER_RESULT] (state) {
      if (state.dispatchOrderResult) {
        state.dispatchOrderResult = null;
      }
    },

    [ADD_ORDERS_BEING_DISPATCHED_NUMBER] (state) {
      state.dispatchOrdersBeingProcessed += 1;
    },

    [SUB_ORDERS_BEING_DISPATCHED_NUMBER] (state) {
      state.dispatchOrdersBeingProcessed -= 1;
    },

    [SET_DISPATCH_ORDER_RESULT] (state, { error, orderType, message }) {
      state.dispatchOrderResult = {
        error,
        orderType,
        message,
      };
    },

    [ADD_ORDER] (state, newOrder) {
      state.data.push(newOrder);
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
      } = params;

      if (!context.getters.canUserDispatchOrders) {
        context.commit(SET_DISPATCH_ORDER_RESULT, {
          error: true,
          orderType: type,
          message: 'У вас нет права на издание распоряжений',
        });
        return;
      }

      context.commit(CLEAR_DISPATCH_ORDER_RESULT);
      context.commit(ADD_ORDERS_BEING_DISPATCHED_NUMBER);

      try {
        const responseData = await dispatchOrderToServer(
          {
            type,
            number,
            createDateTime: createDateTime.toISOString(),
            place,
            timeSpan,
            orderText: {
              ...orderText,
              orderText: !orderText.orderText
                ? null
                : orderText.orderText.map((el) => {
                  return {
                    ...el,
                    value: !el.value
                      ? null
                      : (el.value instanceof Array) // случай таблицы с данными о поезде, идущем ДР
                        ? JSON.stringify(el.value)
                        : el.value
                  }
                }),
            },
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
            creator: {
              id: context.getters.getUserId,
              post: context.getters.getUserPost,
              fio: context.getters.getUserFIO,
            },
            createdOnBehalfOf,
            orderChainId,
            showOnGID,
            specialTrainCategories,
          }
        );
        context.commit(SET_DISPATCH_ORDER_RESULT, { error: false, orderType: type, message: responseData.message });
        context.commit(ADD_ORDER, responseData.order);
        context.commit(SET_LAST_ORDERS_NUMBER, { ordersType: type, number, createDateTime });

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка отправки распоряжения на сервер');
        context.commit(SET_DISPATCH_ORDER_RESULT, { error: true, orderType: type, message: errMessage });
      }

      context.commit(SUB_ORDERS_BEING_DISPATCHED_NUMBER);
    },
  },
};
