import {
  SET_INCOMING_ORDERS_PER_SHIFT,
  CLEAR_GETTING_INCOMING_ORDERS_PER_SHIFT_RESULT,
  SET_GETTING_INCOMING_ORDERS_PER_SHIFT_RESULT,
  SET_GETTING_INCOMING_ORDERS_PER_SHIFT_STATUS,
} from '@/store/mutation-types';
import { getOrdersCreatedFromGivenDate } from '@/serverRequests/orders.requests';


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
    [SET_INCOMING_ORDERS_PER_SHIFT] (state, ordersIds) {
      state.incomingOrdersPerShift = ordersIds;
    },

    [CLEAR_GETTING_INCOMING_ORDERS_PER_SHIFT_RESULT] (state) {
      if (state.gettingIncomingOrdersPerShiftResult) {
        state.gettingIncomingOrdersPerShiftResult = null;
      }
    },

    [SET_GETTING_INCOMING_ORDERS_PER_SHIFT_RESULT] (state, { error, message }) {
      state.gettingIncomingOrdersPerShiftResult = {
        error,
        message,
      };
    },

    [SET_GETTING_INCOMING_ORDERS_PER_SHIFT_STATUS] (state, status) {
      if (state.gettingIncomingOrdersPerShift !== status) {
        state.gettingIncomingOrdersPerShift = status;
      }
    },
  },

  actions: {
    /**
     * Позволяет получить список id входящих распоряжений за смену.
     * Для оператора при ДСП извлекаются данные за заданный промежуток времени, которые приходили
     * соответствующему ДСП (по-другому никак: информация извлекается из общей таблицы распоряжений,
     * в которой фиксируются лишь получатели-станции и ДСП этих станций).
     */
    async loadIncomingOrdersPerShift(context) {
      if (!context.getters.isUserOnDuty) {
        return;
      }
      context.commit(CLEAR_GETTING_INCOMING_ORDERS_PER_SHIFT_RESULT);
      context.commit(SET_GETTING_INCOMING_ORDERS_PER_SHIFT_STATUS, true);
      try {
        const responseData = await getOrdersCreatedFromGivenDate({
          datetime: context.getters.getLastTakeDutyTime,
          workPoligonType: context.getters.getUserWorkPoligon.type,
          workPoligonId: context.getters.getUserWorkPoligon.code,
        });
        context.commit(SET_GETTING_INCOMING_ORDERS_PER_SHIFT_RESULT, { error: false, message: null });
        context.commit(SET_INCOMING_ORDERS_PER_SHIFT, responseData);

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
        context.commit(SET_GETTING_INCOMING_ORDERS_PER_SHIFT_RESULT, { error: true, message: errMessage });
      }
      context.commit(SET_GETTING_INCOMING_ORDERS_PER_SHIFT_STATUS, false);
    },
  },
};
