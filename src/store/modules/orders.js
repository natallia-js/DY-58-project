import { CurrShiftGetOrderStatus } from '@/constants/orders';
import {
  CLEAR_DISPATCH_ORDER_RESULT,
  CLEAR_EDIT_DISPATCHED_ORDER_RESULT,
  ADD_ORDERS_BEING_DISPATCHED_NUMBER,
  ADD_DISPATCHED_ORDERS_BEING_EDITED_NUMBER,
  SUB_ORDERS_BEING_DISPATCHED_NUMBER,
  SUB_DISPATCHED_ORDERS_BEING_EDITED_NUMBER,
  SET_DISPATCH_ORDER_RESULT,
  SET_EDIT_DISPATCHED_ORDER_RESULT,
  //ADD_ORDER,
  SET_LAST_ORDERS_NUMBER,
} from '@/store/mutation-types';
import { dispatchOrderToServer, editDispatchedOrderOnServer } from '@/serverRequests/orders.requests';
import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';


function getOrderTextForSendingToServer(orderText) {
  if (!orderText) {
    return null;
  }
  return {
    ...orderText,
    orderText: !orderText.orderText
      ? null
      : orderText.orderText.map((el) => {
        return {
          ...el,
          value: !el.value
            ? null
            : ((el.value instanceof Object) && !(el.value instanceof Date))
              ? JSON.stringify(el.value)
              : el.value
        }
      }),
  }
}


export const orders = {
  state: {
    data: [],
    dispatchOrderResult: null,
    dispatchOrdersBeingProcessed: 0,
    editDispatchedOrderResult: null,
    editDispatchedOrdersBeingProcessed: 0,
  },

  getters: {
    getDispatchOrderResult(state) {
      return state.dispatchOrderResult;
    },
    getDispatchOrdersBeingProcessed(state) {
      return state.dispatchOrdersBeingProcessed;
    },
    getEditDispatchedOrderResult(state) {
      return state.editDispatchedOrderResult;
    },
    getEditDispatchedOrdersBeingProcessed(state) {
      return state.editDispatchedOrdersBeingProcessed;
    },
  },

  mutations: {
    [CLEAR_DISPATCH_ORDER_RESULT] (state) {
      if (state.dispatchOrderResult) {
        state.dispatchOrderResult = null;
      }
    },
    [CLEAR_EDIT_DISPATCHED_ORDER_RESULT] (state) {
      if (state.editDispatchedOrderResult) {
        state.editDispatchedOrderResult = null;
      }
    },

    [ADD_ORDERS_BEING_DISPATCHED_NUMBER] (state) {
      state.dispatchOrdersBeingProcessed += 1;
    },
    [ADD_DISPATCHED_ORDERS_BEING_EDITED_NUMBER] (state) {
      state.editDispatchedOrdersBeingProcessed += 1;
    },

    [SUB_ORDERS_BEING_DISPATCHED_NUMBER] (state) {
      state.dispatchOrdersBeingProcessed -= 1;
    },
    [SUB_DISPATCHED_ORDERS_BEING_EDITED_NUMBER] (state) {
      state.editDispatchedOrdersBeingProcessed -= 1;
    },

    [SET_DISPATCH_ORDER_RESULT] (state, { error, orderType, message }) {
      state.dispatchOrderResult = {
        error,
        orderType,
        message,
      };
    },
    [SET_EDIT_DISPATCHED_ORDER_RESULT] (state, { error, orderType, message }) {
      state.editDispatchedOrderResult = {
        error,
        orderType,
        message,
      };
    },

    /*[ADD_ORDER] (state, newOrder) {
      state.data.push(newOrder);
    },*/
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
            creator: {
              id: context.getters.getUserId,
              post: context.getters.getUserPost,
              fio: context.getters.getUserFIO,
            },
            createdOnBehalfOf,
            orderChainId,
            showOnGID,
            specialTrainCategories,
            idOfTheOrderToCancel,
          }
        );
        context.commit(SET_DISPATCH_ORDER_RESULT, { error: false, orderType: type, message: responseData.message });
        //context.commit(ADD_ORDER, responseData.order);
        context.commit(SET_LAST_ORDERS_NUMBER, { ordersType: type, number, createDateTime });

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка отправки распоряжения на сервер');
        context.commit(SET_DISPATCH_ORDER_RESULT, { error: true, orderType: type, message: errMessage });
      }

      context.commit(SUB_ORDERS_BEING_DISPATCHED_NUMBER);
    },

    /**
     * Делает запрос на сервер с целью редактирования существующего распоряжения.
     */
     async editDispatchedOrder(context, params) {
      const {
        type,
        id,
        timeSpan,
        orderText,
      } = params;

      if (!context.getters.canUserDispatchOrders) {
        context.commit(SET_EDIT_DISPATCHED_ORDER_RESULT, {
          error: true,
          orderType: type,
          message: 'У вас нет права на редактирование распоряжений',
        });
        return;
      }

      context.commit(CLEAR_EDIT_DISPATCHED_ORDER_RESULT);
      context.commit(ADD_DISPATCHED_ORDERS_BEING_EDITED_NUMBER);

      try {
        const responseData = await editDispatchedOrderOnServer(
          {
            id,
            timeSpan,
            orderText: getOrderTextForSendingToServer(orderText),
          }
        );
        context.commit(SET_EDIT_DISPATCHED_ORDER_RESULT, { error: false, orderType: type, message: responseData.message });
        //context.commit(EDIT_ORDER, responseData.order);

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка редактирования распоряжения на сервере');
        context.commit(SET_EDIT_DISPATCHED_ORDER_RESULT, { error: true, orderType: type, message: errMessage });
      }

      context.commit(SUB_DISPATCHED_ORDERS_BEING_EDITED_NUMBER);
    },
  },
};
