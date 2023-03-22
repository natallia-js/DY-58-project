import { store } from '@/store';
import {
  SET_CAN_EDIT_EXISTING_TAKE_DUTY_ORDER,
  SET_SHOW_CREATE_DSP_TAKE_DUTY_ORDER_DLG,
  CLEAR_EDIT_DISPATCHED_ORDER_RESULT,
  SET_EDIT_DISPATCHED_ORDER_RESULT,
  SET_DEL_STATION_WORK_PLACE_RECEIVER_RESULT,
  CLEAR_DEL_STATION_WORK_PLACE_RECEIVER_RESULT,
  CLEAR_ALL_DEL_STATION_WORK_PLACE_RECEIVER_RESULTS_SEEN_BY_USER,
  SET_ORDER_BEING_DELETED_STATION_WORK_PLACE_RECEIVER,
  DEL_ORDER_STATION_RECEIVER,
  SET_ORDER_FINISHED_BEING_DELETED_STATION_WORK_PLACE_RECEIVER,
  SET_DEL_STATION_WORK_PLACE_RECEIVER_RESULTS_SEEN_BY_USER,
  EDIT_ORDER_TEXT,
  SET_SYSTEM_MESSAGE,
} from '@/store/mutation-types';
import {
  EDIT_DISPATCHED_ORDER_ACTION,
  DEL_STATION_WORK_PLACE_RECEIVER_ACTION,
} from '@/store/action-types';
import {
  editDispatchedOrderOnServer,
  delStationWorkPlaceReceiverOnServer,
} from '@/serverRequests/orders.requests';
import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';
import getOrderTextForSendingToServer from '@/additional/getOrderTextForSendingToServer';
import { getWorkOrderGeneralInfoObject } from './getWorkOrderObject';


/**
 * Данный модуль предназначен для редактирования распоряжений.
 */
 export const editOrder = {
  getters: {
    canEditExistingTakeDutyOrder(state) {
      return state.editExistingTakeDutyOrder;
    },

    showCreateDSPTakeDutyOrderDlg(state) {
      return state.showCreateDSPTakeDutyOrderDlg;
    },

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
    [SET_CAN_EDIT_EXISTING_TAKE_DUTY_ORDER] (state, canEdit) {
      state.editExistingTakeDutyOrder = canEdit;
    },

    [SET_SHOW_CREATE_DSP_TAKE_DUTY_ORDER_DLG] (state, show) {
      state.showCreateDSPTakeDutyOrderDlg = show;
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

    [EDIT_ORDER_TEXT] (state, order) {
      const objectToEditIndex = state.data.findIndex((el) => String(el._id) === String(order._id));
      if (!objectToEditIndex < 0) {
        return;
      }
      const dataToApply = getWorkOrderGeneralInfoObject(order);
      const newObject = { ...state.data[objectToEditIndex] };
      for (let field in dataToApply) {
        newObject[field] = dataToApply[field];
      }
      // нужно для оперативного реагирования на изменение чего-либо в state.data
      state.data = [
        ...state.data.slice(0, objectToEditIndex),
        newObject,
        ...state.data.slice(objectToEditIndex + 1),
      ];
    },
  },

  actions: {
    /**
     * Делает запрос на сервер с целью редактирования существующего распоряжения.
     * В настоящее время отредактировать можно только:
     *   - запись о принятии дежурства на станции,
     *   - информацию о лицах, дополнительно ознакомленных с изданным документом,
     *   - приказ ЭЦД о приеме-сдаче дежурства.
     */
     async [EDIT_DISPATCHED_ORDER_ACTION] (context, params) {
      const { type, id, timeSpan, orderText, additionallyInformedPeople,
      dncToSend, dspToSend, ecdToSend, otherToSend } = params;

      if (!context.getters.canUserDispatchOrders) {
        const errMessage = 'У вас нет права на редактирование документов';
        context.commit(SET_EDIT_DISPATCHED_ORDER_RESULT, { error: true, orderType: type, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }

      context.commit(CLEAR_EDIT_DISPATCHED_ORDER_RESULT);

      const requestParams = { id };
      if (Object.prototype.hasOwnProperty.call(params, 'timeSpan')) requestParams.timeSpan = timeSpan;
      if (Object.prototype.hasOwnProperty.call(params, 'orderText')) requestParams.orderText = getOrderTextForSendingToServer(orderText);
      if (Object.prototype.hasOwnProperty.call(params, 'additionallyInformedPeople')) requestParams.additionallyInformedPeople = additionallyInformedPeople;
      if (Object.prototype.hasOwnProperty.call(params, 'dncToSend')) requestParams.dncToSend = dncToSend;
      if (Object.prototype.hasOwnProperty.call(params, 'dspToSend')) requestParams.dspToSend = dspToSend;
      if (Object.prototype.hasOwnProperty.call(params, 'ecdToSend')) requestParams.ecdToSend = ecdToSend;
      if (Object.prototype.hasOwnProperty.call(params, 'otherToSend')) requestParams.otherToSend = otherToSend;

      try {
        const responseData = await editDispatchedOrderOnServer(requestParams);
        context.commit(SET_EDIT_DISPATCHED_ORDER_RESULT, { error: false, orderType: type, message: responseData.message });
        context.commit(SET_SYSTEM_MESSAGE, { error: false, datetime: new Date(), message: responseData.message });
        context.commit(EDIT_ORDER_TEXT, responseData.order);

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка редактирования распоряжения на сервере');
        context.commit(SET_EDIT_DISPATCHED_ORDER_RESULT, { error: true, orderType: type, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
      }
    },

    /**
     * Делает запрос на сервер с целью удаления адресата на станции у существующего распоряжения.
     */
    async [DEL_STATION_WORK_PLACE_RECEIVER_ACTION] (context, { orderId, workPlaceId }) {
      if (!context.getters.canUserDeleteOrderStationReceivers) {
        const errMessage = 'У вас нет права на удаление адресата распоряжения на станции';
        context.commit(SET_DEL_STATION_WORK_PLACE_RECEIVER_RESULT, { error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }
      context.commit(CLEAR_DEL_STATION_WORK_PLACE_RECEIVER_RESULT, orderId);
      context.commit(SET_ORDER_BEING_DELETED_STATION_WORK_PLACE_RECEIVER, orderId);
      try {
        const responseData = await delStationWorkPlaceReceiverOnServer({ orderId, workPlaceId });
        context.commit(SET_DEL_STATION_WORK_PLACE_RECEIVER_RESULT, { orderId, error: false, message: responseData.message });
        context.commit(SET_SYSTEM_MESSAGE, { error: false, datetime: new Date(), message: responseData.message });
        context.commit(DEL_ORDER_STATION_RECEIVER, { orderId, workPlaceId });

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка удаления адресата на станции');
        context.commit(SET_DEL_STATION_WORK_PLACE_RECEIVER_RESULT, { orderId, error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });

      } finally {
        context.commit(SET_ORDER_FINISHED_BEING_DELETED_STATION_WORK_PLACE_RECEIVER, orderId);
      }
    },
  },
};
