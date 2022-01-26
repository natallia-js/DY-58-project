import { store } from '@/store';
import {
  CLEAR_EDIT_DISPATCHED_ORDER_RESULT,
  ADD_DISPATCHED_ORDERS_BEING_EDITED_NUMBER,
  SUB_DISPATCHED_ORDERS_BEING_EDITED_NUMBER,
  SET_EDIT_DISPATCHED_ORDER_RESULT,
  SET_DEL_STATION_WORK_PLACE_RECEIVER_RESULT,
  CLEAR_DEL_STATION_WORK_PLACE_RECEIVER_RESULT,
  DEL_ORDER_STATION_RECEIVER,
} from '@/store/mutation-types';
import {
  editDispatchedOrderOnServer,
  delStationWorkPlaceReceiverOnServer,
} from '@/serverRequests/orders.requests';
import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';
import getOrderTextForSendingToServer from '@/additional/getOrderTextForSendingToServer';


/**
 * Данный модуль предназначен для издания распоряжений.
 */
 export const editOrder = {
  getters: {
    getEditDispatchedOrderResult(state) {
      return state.editDispatchedOrderResult;
    },
    getEditDispatchedOrdersBeingProcessed(state) {
      return state.editDispatchedOrdersBeingProcessed;
    },
  },

  mutations: {
    [CLEAR_EDIT_DISPATCHED_ORDER_RESULT] (state) {
      if (state.editDispatchedOrderResult) {
        state.editDispatchedOrderResult = null;
      }
    },
    [CLEAR_DEL_STATION_WORK_PLACE_RECEIVER_RESULT] (state) {
      if (state.delStationWorkPlaceReceiverResult) {
        state.delStationWorkPlaceReceiverResult = null;
      }
    },

    [ADD_DISPATCHED_ORDERS_BEING_EDITED_NUMBER] (state) {
      state.editDispatchedOrdersBeingProcessed += 1;
    },
    [SUB_DISPATCHED_ORDERS_BEING_EDITED_NUMBER] (state) {
      state.editDispatchedOrdersBeingProcessed -= 1;
    },

    [SET_EDIT_DISPATCHED_ORDER_RESULT] (state, { error, orderType, message }) {
      state.editDispatchedOrderResult = {
        error,
        orderType,
        message,
      };
    },
    [SET_DEL_STATION_WORK_PLACE_RECEIVER_RESULT] (state, { error, message }) {
      state.delStationWorkPlaceReceiverResult = {
        error,
        message,
      };
    },

    /**
     * ! workPlaceId может быть null
     */
    [DEL_ORDER_STATION_RECEIVER] (_state, { orderId, workPlaceId }) {
      const workingOrders = store.getters.getRawWorkingOrders;
      const workPoligon = store.getters.getUserWorkPoligon;
      if (!orderId || !workPoligon || !workingOrders || !workingOrders.length) {
        return;
      }
      const order = workingOrders.find((order) => String(order._id) === String(orderId));
      if (!order || !order.stationWorkPlacesToSend || !order.stationWorkPlacesToSend.length) {
        return;
      }
      order.stationWorkPlacesToSend = order.stationWorkPlacesToSend.filter((item) =>
        !(item.type === workPoligon.type && String(item.id) === String(workPoligon.code) &&
        (
          (!item.workPlaceId && !workPlaceId) ||
          (item.workPlaceId && workPlaceId && String(item.workPlaceId) === String(workPlaceId))
        ))
      );
    },
  },

  actions: {
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

    /**
     * Делает запрос на сервер с целью удаления адресата на станции у существующего распоряжения.
     */
    async delStationWorkPlaceReceiver(context, { orderId, workPlaceId }) {
      if (!context.getters.canUserDeleteOrderStationReceivers) {
        context.commit(SET_DEL_STATION_WORK_PLACE_RECEIVER_RESULT, {
          error: true,
          message: 'У вас нет права на удаление адресата распоряжения на станции',
        });
        return;
      }
      context.commit(CLEAR_DEL_STATION_WORK_PLACE_RECEIVER_RESULT);
      try {
        const responseData = await delStationWorkPlaceReceiverOnServer({ orderId, workPlaceId });
        context.commit(SET_DEL_STATION_WORK_PLACE_RECEIVER_RESULT, { error: false, message: responseData.message });
        context.commit(DEL_ORDER_STATION_RECEIVER, { orderId, workPlaceId });

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка удаления адресата на станции');
        context.commit(SET_DEL_STATION_WORK_PLACE_RECEIVER_RESULT, { error: true, message: errMessage });
      }
    },
  },
};
