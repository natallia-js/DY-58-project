import { store } from '@/store';
import {
  CLEAR_EDIT_DISPATCHED_ORDER_RESULT,
  ADD_DISPATCHED_ORDERS_BEING_EDITED_NUMBER,
  SUB_DISPATCHED_ORDERS_BEING_EDITED_NUMBER,
  SET_EDIT_DISPATCHED_ORDER_RESULT,
  SET_DEL_STATION_WORK_PLACE_RECEIVER_RESULT,
  CLEAR_DEL_STATION_WORK_PLACE_RECEIVER_RESULT,
  CLEAR_ALL_DEL_STATION_WORK_PLACE_RECEIVER_RESULTS_SEEN_BY_USER,
  SET_ORDER_BEING_DELETED_STATION_WORK_PLACE_RECEIVER,
  DEL_ORDER_STATION_RECEIVER,
  SET_ORDER_FINISHED_BEING_DELETED_STATION_WORK_PLACE_RECEIVER,
  SET_DEL_STATION_WORK_PLACE_RECEIVER_RESULTS_SEEN_BY_USER,
} from '@/store/mutation-types';
import {
  editDispatchedOrderOnServer,
  delStationWorkPlaceReceiverOnServer,
} from '@/serverRequests/orders.requests';
import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';
import getOrderTextForSendingToServer from '@/additional/getOrderTextForSendingToServer';


/**
 * Данный модуль предназначен для редактирования распоряжений.
 */
 export const editOrder = {
  getters: {
    /**
     * Возвращает true, если распоряжение с заданным id в данный момент времени проходит
     * процедуру удаления у него получателя по рабочему месту на станции, false - в противном случае.
     */
    isOrderBeingDeletedStationWorkPlaceReceiver(state) {
      return (orderId) => state.ordersBeingDeletedStationWorkPlaceReceivers.includes(orderId);
    },

    /**
     * Возвращает последний полученный от сервера результат операции редактирования распоряжения.
     */
    getEditDispatchedOrderResult(state) {
      return state.editDispatchedOrderResult;
    },

    /**
     * Возвращает количество распоряжений, по которым запущен процесс редактирования на сервере.
     */
    getEditDispatchedOrdersBeingProcessed(state) {
      return state.editDispatchedOrdersBeingProcessed;
    },

    /**
     * Возвращает те результаты удаления получателей распоряжений на рабочих местах станций,
     * которые не были отображены пользователю.
     */
    getDelStationWorkPlaceReceiverResultsUnseenByUser(state) {
      return state.delStationWorkPlaceReceiverResults.filter((res) => !res.wasShownToUser);
    },

    /**
     * Возвращает количество тех результатов удаления получателей распоряжений на рабочих местах станций,
     * которые не были отображены пользователю.
     */
     getDelStationWorkPlaceReceiverResultsUnseenByUserNumber(_state, getters) {
      return getters.getDelStationWorkPlaceReceiverResultsUnseenByUser.length;
    },
  },

  mutations: {
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

    [CLEAR_EDIT_DISPATCHED_ORDER_RESULT] (state) {
      if (state.editDispatchedOrderResult) {
        state.editDispatchedOrderResult = null;
      }
    },

    /**
     * Позволяет сохранить результат удаления получателя распоряжения на рабочем месте станции.
     */
    [SET_DEL_STATION_WORK_PLACE_RECEIVER_RESULT] (state, { orderId, error, message }) {
      const orderInfo = state.delStationWorkPlaceReceiverResults.find((item) => item.orderId === orderId);
      if (!orderInfo) {
        state.delStationWorkPlaceReceiverResults.push({ orderId, error, message, wasShownToUser: false });
      } else {
        orderInfo.error = error;
        orderInfo.message = message;
        orderInfo.wasShownToUser = false;
      }
    },

    /**
     * Удаляет результат удаления получателя распоряжения на рабочем месте станции.
     * Удаляет по заданному id распоряжения.
     */
    [CLEAR_DEL_STATION_WORK_PLACE_RECEIVER_RESULT] (state, orderId) {
      state.delStationWorkPlaceReceiverResults = state.delStationWorkPlaceReceiverResults.filter((item) => item.orderId !== orderId);
    },

    /**
     * Сохраняет id распоряжения, по которому идет процесс удаления получателя данного распоряжения
     * на рабочем месте станции.
     */
    [SET_ORDER_BEING_DELETED_STATION_WORK_PLACE_RECEIVER] (state, orderId) {
      if (!state.ordersBeingDeletedStationWorkPlaceReceivers.includes(orderId)) {
        state.ordersBeingDeletedStationWorkPlaceReceivers.push(orderId);
      }
    },

    /**
     * Удаляет сохраненный id распоряжения, операция удаления получателя распоряжения на рабочем месте
     * станции у которого была завершена.
     */
    [SET_ORDER_FINISHED_BEING_DELETED_STATION_WORK_PLACE_RECEIVER] (state, orderId) {
      state.ordersBeingDeletedStationWorkPlaceReceivers =
        state.ordersBeingDeletedStationWorkPlaceReceivers.filter((item) => item !== orderId);
    },

    /**
     * Для данных id распоряжений устанавливает флаг просмотра пользователем информации об удалении в них
     * получателей на рабочих местах станции.
     */
    [SET_DEL_STATION_WORK_PLACE_RECEIVER_RESULTS_SEEN_BY_USER] (state, orderIds) {
      if (!orderIds) {
        return;
      }
      orderIds.forEach((orderId) => {
        const orderInfo = state.delStationWorkPlaceReceiverResults.find((item) => item.orderId === orderId);
        if (orderInfo) {
          orderInfo.wasShownToUser = true;
        }
      });
    },

    /**
     * Удаляет все результаты удаления получателя распоряжения на рабочем месте станции, просмотренные пользователем.
     */
    [CLEAR_ALL_DEL_STATION_WORK_PLACE_RECEIVER_RESULTS_SEEN_BY_USER] (state) {
      state.delStationWorkPlaceReceiverResults = state.delStationWorkPlaceReceiverResults.filter((item) => !item.wasShownToUser);
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
     * В настоящее время отредактировать можно только запись о принятии дежурства на станции.
     */
     async editDispatchedOrder(context, params) {
      const { type, id, timeSpan, orderText } = params;

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

      } finally {
        context.commit(SUB_DISPATCHED_ORDERS_BEING_EDITED_NUMBER);
      }
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
      context.commit(CLEAR_DEL_STATION_WORK_PLACE_RECEIVER_RESULT, orderId);
      context.commit(SET_ORDER_BEING_DELETED_STATION_WORK_PLACE_RECEIVER, orderId);
      try {
        const responseData = await delStationWorkPlaceReceiverOnServer({ orderId, workPlaceId });
        context.commit(SET_DEL_STATION_WORK_PLACE_RECEIVER_RESULT, { orderId, error: false, message: responseData.message });
        context.commit(DEL_ORDER_STATION_RECEIVER, { orderId, workPlaceId });

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка удаления адресата на станции');
        context.commit(SET_DEL_STATION_WORK_PLACE_RECEIVER_RESULT, { orderId, error: true, message: errMessage });

      } finally {
        context.commit(SET_ORDER_FINISHED_BEING_DELETED_STATION_WORK_PLACE_RECEIVER, orderId);
      }
    },
  },
};
