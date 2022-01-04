import {
  CLEAR_REPORT_ON_ORDERS_DELIVERY_RESULT,
  SET_REPORT_ON_ORDERS_DELIVERY_RESULT,
  SET_REPORTING_ON_ORDER_DELIVERY_STATUS,
} from '@/store/mutation-types';
import { reportServerOnOrdersDelivery } from '@/serverRequests/orders.requests';


/**
 * Данный модуль предназначен для сообщения серверу о доставке распоряжений на рабочий полигон.
 */
export const reportOnOrdersDelivery = {
  getters: {
    /**
     * Возвращает результат сообщения серверу о доставке новых распоряжений
     * на данный полигон управления.
     */
    getReportOnOrdersDeliveryResult(state) {
      return state.reportOnOrdersDeliveryResult;
    },
  },

  mutations: {
    /**
     * "Чистит" текущий результат сообщения серверу о доставке новых распоряжений
     * на данный полигон управления.
     */
    [CLEAR_REPORT_ON_ORDERS_DELIVERY_RESULT] (state) {
      if (state.reportOnOrdersDeliveryResult) {
        state.reportOnOrdersDeliveryResult = null;
      }
    },

    /**
     * Устанавливает результат сообщения серверу о доставке новых распоряжений
     * на данный полигон управления.
     */
    [SET_REPORT_ON_ORDERS_DELIVERY_RESULT] (state, { error, message }) {
      state.reportOnOrdersDeliveryResult = {
        error,
        message,
      };
    },

    /**
     * Устанавливает статус процесса (идет процесс / не идет процесс) сообщения серверу
     * о доставке новых распоряжений на данный полигон управления.
     */
    [SET_REPORTING_ON_ORDER_DELIVERY_STATUS] (state, status) {
      if (state.reportingOnOrdersDelivery !== status) {
        state.reportingOnOrdersDelivery = status;
      }
    },
  },

  actions: {
    /**
     * Для распоряжений, для которых ранее не сообщалось серверу об их доставке на данный
     * полигон управления, сообщает о том, что они доставлены.
     */
     async reportOnOrdersDelivery(context, orders) {
      // Сюда поместим идентификаторы тех распоряжений, о доставке которых необходимо сообщить серверу.
      const newDeliveredOrderIds = !orders ? [] :
        orders.filter((order) => !order.deliverDateTime).map((order) => order._id);
      if (!newDeliveredOrderIds.length) {
        return;
      }

      context.commit(SET_REPORTING_ON_ORDER_DELIVERY_STATUS, true);
      context.commit(CLEAR_REPORT_ON_ORDERS_DELIVERY_RESULT);

      try {
        const responseData = await reportServerOnOrdersDelivery({
          workPoligonType: context.getters.getUserWorkPoligon.type,
          workPoligonId: context.getters.getUserWorkPoligon.code,
          workSubPoligonId: context.getters.getUserWorkPoligon.subCode,
          orderIds: newDeliveredOrderIds,
          deliverDateTime: new Date(),
        });
        context.commit(SET_REPORT_ON_ORDERS_DELIVERY_RESULT, { error: false, message: responseData.message });

      } catch (error) {
        let errMessage;
        if (error.response) {
          // The request was made and server responded
          errMessage = 'Ошибка при сообщении серверу о доставке входящих распоряжений: ' + error.response.data ? error.response.data.message : JSON.stringify(error);
        } else if (error.request) {
          // The request was made but no response was received
          errMessage = 'Ошибка при сообщении серверу о доставке входящих распоряжений: сервер не отвечает';
        } else {
          // Something happened in setting up the request that triggered an Error
          errMessage = 'Произошла неизвестная ошибка при сообщении серверу о доставке входящих распоряжений: ' + error.message || JSON.stringify(error);
        }
        context.commit(SET_REPORT_ON_ORDERS_DELIVERY_RESULT, { error: true, message: errMessage });
      }
      context.commit(SET_REPORTING_ON_ORDER_DELIVERY_STATUS, false);
    },
  },
};
