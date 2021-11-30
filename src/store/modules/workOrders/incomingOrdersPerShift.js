import axios from 'axios';
import { DY58_SERVER_ACTIONS_PATHS } from '../../../constants/servers';


export const incomingOrdersPerShift = {
  getters: {
    /**
     * Возвращает количество входящих распоряжений за смену либо null, если эта информацич неизвестна.
     */
    getNumberOfIncomingOrdersPerShift(state) {
      if (!state.incomingOrdersPerShift) {
        return null;
      }
      return state.incomingOrdersPerShift.length;
    },

    /**
     *
     */
    getErrorGettingIncomingOrdersPerShift(state) {
      if (state.gettingIncomingOrdersPerShiftResult && state.gettingIncomingOrdersPerShiftResult.error) {
        return state.gettingIncomingOrdersPerShiftResult.message;
      }
      return null;
    },

    /**
     *
     */
    getGettingIncomingOrdersPerShiftStatus(state) {
      return state.gettingIncomingOrdersPerShift;
    },
  },

  mutations: {
    /**
     *
     */
    setIncomingOrdersPerShift(state, ordersIds) {
      state.incomingOrdersPerShift = ordersIds;
    },

    clearGettingIncomingOrdersPerShiftResult(state) {
      state.gettingIncomingOrdersPerShiftResult = null;
    },

    setGettingIncomingOrdersPerShiftResult(state, { error, message }) {
      state.gettingIncomingOrdersPerShiftResult = {
        error,
        message,
      };
    },

    setGettingIncomingOrdersPerShiftStatus(state, status) {
      state.gettingIncomingOrdersPerShift = status;
    },
  },

  actions: {
    /**
     * Позволяет получить список id входящих распоряжений за смену.
     */
    async loadIncomingOrdersPerShift(context) {
      if (!context.getters.isUserOnDuty) {
        return;
      }
      context.commit('clearGettingIncomingOrdersPerShiftResult');
      context.commit('setGettingIncomingOrdersPerShiftStatus', true);
      try {
        const headers = {
          'Authorization': `Bearer ${context.getters.getCurrentUserToken}`,
        };
       const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.getOrdersCreatedFromGivenDate,
          {
            datetime: context.getters.getLastTakeDutyTime,
            workPoligonType: context.getters.getUserWorkPoligon.type,
            workPoligonId: context.getters.getUserWorkPoligon.code,
          },
          { headers }
        );
        context.commit('setGettingIncomingOrdersPerShiftResult', { error: false, message: null });
        context.commit('setIncomingOrdersPerShift', response.data);

      } catch (error) {
        let errMessage;
        if (error.response) {
          // The request was made and server responded
          errMessage = 'Ошибка получения информации о входящих распоряжениях за смену: ' + error.response.data ? error.response.data.message : JSON.stringify(error);
        } else if (error.request) {
          // The request was made but no response was received
          errMessage = 'Ошибка получения информации о входящих распоряжениях за смену: сервер не отвечает';
        } else {
          // Something happened in setting up the request that triggered an Error
          errMessage = 'Произошла неизвестная ошибка при получении информации о входящих распоряжениях за смену: ' + error.message || JSON.stringify(error);
        }
        context.commit('setGettingIncomingOrdersPerShiftResult', { error: true, message: errMessage });
      }
      context.commit('setGettingIncomingOrdersPerShiftStatus', false);
    },
  },
};
