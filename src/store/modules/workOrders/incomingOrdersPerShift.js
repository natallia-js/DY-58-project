import axios from 'axios';
import { DY58_SERVER_ACTIONS_PATHS } from '../../../constants/servers';
import { getRequestAuthorizationHeader } from '../../../serverRequests/common';


/**
 * Данный модуль предназначен для получения информации о входящих распоряжениях за смену.
 */
export const incomingOrdersPerShift = {
  getters: {
    /**
     * Возвращает количество входящих распоряжений за смену либо null, если эта информация неизвестна.
     */
    getNumberOfIncomingOrdersPerShift(state) {
      if (!state.incomingOrdersPerShift) {
        return null;
      }
      return state.incomingOrdersPerShift.length;
    },

    /**
     * Возвращает сообщение об ошибке, возникшее при получении входящих распоряжений за смену.
     * Если ошибки не было, то возвращает null.
     */
    getErrorGettingIncomingOrdersPerShift(state) {
      if (state.gettingIncomingOrdersPerShiftResult && state.gettingIncomingOrdersPerShiftResult.error) {
        return state.gettingIncomingOrdersPerShiftResult.message;
      }
      return null;
    },

    /**
     * Возвращает true, если идет процесс получения входящих распоряжений за смену,
     * false - если данный процесс не идет.
     */
    getGettingIncomingOrdersPerShiftStatus(state) {
      return state.gettingIncomingOrdersPerShift;
    },
  },

  mutations: {
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
       const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.getOrdersCreatedFromGivenDate,
          {
            datetime: context.getters.getLastTakeDutyTime,
            workPoligonType: context.getters.getUserWorkPoligon.type,
            workPoligonId: context.getters.getUserWorkPoligon.code,
          },
          {
            headers: getRequestAuthorizationHeader(),
          }
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
