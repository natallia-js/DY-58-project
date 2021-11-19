import axios from 'axios';
import { DY58_SERVER_ACTIONS_PATHS } from '../../../constants/servers';


export const numberOfIncomingOrdersPerShift = {
  getters: {
    /**
     * Возвращает количество входящих распоряжений за смену либо null, если эта информацич неизвестна.
     */
    getNumberOfIncomingOrdersPerShift(state) {
      return state.numberOfIncomingOrdersPerShift;
    },

    /**
     *
     */
    getErrorGettingNumberOfIncomingOrdersPerShift(state) {
      if (state.gettingNumberOfIncomingOrdersPerShiftResult && state.gettingNumberOfIncomingOrdersPerShiftResult.error) {
        return state.gettingNumberOfIncomingOrdersPerShiftResult.message;
      }
      return null;
    },

    /**
     *
     */
    getGettingNumberOfIncomingOrdersPerShiftStatus(state) {
      return state.gettingNumberOfIncomingOrdersPerShift;
    },
  },

  mutations: {
    /**
     *
     */
    setNumberOfIncomingOrdersPerShift(state, ordersNumber) {
      state.numberOfIncomingOrdersPerShift = ordersNumber;
    },

    clearGettingNumberOfIncomingOrdersPerShiftResult(state) {
      state.numberOfIncomingOrdersPerShift = null;
    },

    setGettingNumberOfIncomingOrdersPerShiftResult(state, { error, message }) {
      state.numberOfIncomingOrdersPerShift = {
        error,
        message,
      };
    },

    seGettingNumberOfIncomingOrdersPerShiftStatus(state, status) {
      state.gettingNumberOfIncomingOrdersPerShift = status;
    },
  },

  actions: {
    /**
     * Позволяет получить количество входящих распоряжений за смену.
     */
    async loadNumberOfIncomingOrdersPerShift(context) {
      if (!context.getters.isUserOnDuty) {
        return;
      }
      context.commit('clearGettingNumberOfIncomingOrdersPerShiftResult');
      context.commit('seGettingNumberOfIncomingOrdersPerShiftStatus', true);
      try {
        const headers = {
          'Authorization': `Bearer ${context.getters.getCurrentUserToken}`,
        };
        const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.getOrdersCountFromGivenDate,
          {
            datetime: context.getters.getLastTakeDutyTime,
          },
          { headers }
        );
        context.commit('setGettingNumberOfIncomingOrdersPerShiftResult', { error: false, message: null });
        context.commit('setNumberOfIncomingOrdersPerShift', response.data);
      } catch (error) {
        let errMessage;
        if (error.response) {
          // The request was made and server responded
          errMessage = 'Ошибка получения информации о количестве входящих распоряжений за смену: ' + error.response.data ? error.response.data.message : '?';
        } else if (error.request) {
          // The request was made but no response was received
          errMessage = 'Ошибка получения информации о количестве входящих распоряжений за смену: сервер не отвечает';
        } else {
          // Something happened in setting up the request that triggered an Error
          errMessage = 'Произошла неизвестная ошибка при получении информации о количестве входящих распоряжений за смену: ' + error.message || '?';
        }
        context.commit('setGettingNumberOfIncomingOrdersPerShiftResult', { error: true, message: errMessage });
      }
      context.commit('seGettingNumberOfIncomingOrdersPerShiftStatus', false);
    },
  },
};
