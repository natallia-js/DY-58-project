import axios from 'axios';
import { DY58_SERVER_ACTIONS_PATHS } from '../../../constants/servers';


export const reportOnOrdersDelivery = {
  mutations: {
    clearReportOnOrdersDeliveryResult(state) {
      state.reportOnOrdersDeliveryResult = null;
    },

    setReportOnOrdersDeliveryResult(state, { error, message }) {
      state.reportOnOrdersDeliveryResult = {
        error,
        message,
      };
    },

    setReportingOnOrderDeliveryStatus(state, status) {
      state.reportingOnOrdersDelivery = status;
    },
  },

  actions: {
    /**
     * Для распоряжений, для которых ранее не сообщалось серверу об их доставке на клиентское
     * рабочее место, сообщает о том, что они доставлены.
     */
     async reportOnOrdersDelivery(context, orders) {
      // Сюда поместим идентификаторы тех распоряжений, о доставке которых необходимо сообщить серверу.
      const newDeliveredOrderIds = !orders ? [] :
        orders.filter((order) => !order.deliverDateTime).map((order) => order._id);
      if (!newDeliveredOrderIds.length) {
        return;
      }
      context.commit('setReportingOnOrderDeliveryStatus', true);
      context.commit('clearReportOnOrdersDeliveryResult');
      try {
        const headers = {
          'Authorization': `Bearer ${context.getters.getCurrentUserToken}`,
        };
        const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.reportOnOrdersDelivery,
          {
            workPoligonType: context.getters.getUserWorkPoligon.type,
            workPoligonId: context.getters.getUserWorkPoligon.code,
            orderIds: newDeliveredOrderIds,
            deliverDateTime: new Date(),
          },
          { headers }
        );
        context.commit('setReportOnOrdersDeliveryResult', { error: false, message: response.data.message });
      } catch ({ response }) {
        const defaultErrMessage = 'Произошла неизвестная ошибка при сообщении серверу о доставке распоряжений';
        const errMessage = !response ? defaultErrMessage : (!response.data ? defaultErrMessage : response.data.message);
        context.commit('setReportOnOrdersDeliveryResult', { error: true, message: errMessage });
      }
      context.commit('setReportingOnOrderDeliveryStatus', false);
    },
  },
};
