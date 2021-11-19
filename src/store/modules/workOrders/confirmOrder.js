import axios from 'axios';
import { DY58_SERVER_ACTIONS_PATHS } from '../../../constants/servers';


export const confirmOrder = {
  mutations: {
    setConfirmOrderResult(state, { error, message }) {
      state.orderConfirmResult = {
        error,
        message,
      };
    },

    clearConfirmOrderResult(state) {
      if (state.orderConfirmResult) {
        state.orderConfirmResult = null;
      }
    },

    setConfirmingOrderStatus(state, status) {
      state.confirmingOrder = status;
    },

    /**
     *
     */
     setOrderConfirmed(state, { orderId, confirmDateTime }) {
      state.data = state.data.map((el) => {
        if (el._id === orderId) {
          return {
            ...el,
            confirmDateTime,
          };
        }
        return el;
      });
    },
  },

  actions: {
    /**
     * Позволяет для данного входящего уведомления выставить статус "подтверждено" на сервере.
     */
     async confirmOrder(context, { orderId }) {
      context.commit('setConfirmingOrderStatus', true);
      context.commit('clearConfirmOrderResult');
      try {
        const headers = {
          'Authorization': `Bearer ${context.getters.getCurrentUserToken}`,
        };
        const confirmDateTime = new Date();
        const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.confirmOrder,
          {
            workPoligonType: context.getters.getUserWorkPoligon.type,
            workPoligonId: context.getters.getUserWorkPoligon.code,
            id: orderId,
            confirmDateTime,
          },
          { headers }
        );
        context.commit('setConfirmOrderResult', { error: false, message: response.data.message });
        context.commit('setOrderConfirmed', { orderId: response.data.id, confirmDateTime });
      } catch ({ response }) {
        const defaultErrMessage = 'Произошла неизвестная ошибка при попытке подтвердить распоряжение на сервере';
        const errMessage = !response ? defaultErrMessage : (!response.data ? defaultErrMessage : response.data.message);
        context.commit('setConfirmOrderResult', { error: true, message: errMessage });
      }
      context.commit('setConfirmingOrderStatus', false);
    },
  },
};
