import {
  SET_INCOMING_ORDERS_PER_SHIFT,
  RESET_INCOMING_ORDERS_PER_SHIFT,
  CLEAR_GETTING_INCOMING_ORDERS_PER_SHIFT_RESULT,
  SET_GETTING_INCOMING_ORDERS_PER_SHIFT_RESULT,
  SET_GETTING_INCOMING_ORDERS_PER_SHIFT_STATUS,
  SET_SYSTEM_MESSAGE,
} from '@/store/mutation-types';
import { getOrdersAddressedToThisPoligonFromGivenDate } from '@/serverRequests/orders.requests';
import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';


/**
 * Данный модуль предназначен для получения информации о входящих распоряжениях за смену.
 */
export const incomingOrdersPerShift = {
  getters: {
    /**
     * Возвращает количество входящих распоряжений за смену.
     */
    getNumberOfIncomingOrdersPerShift(state) {
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
    [SET_INCOMING_ORDERS_PER_SHIFT] (state, orderIds) {
      state.incomingOrdersPerShift = orderIds;
    },

    [RESET_INCOMING_ORDERS_PER_SHIFT] (state) {
      state.incomingOrdersPerShift = [];
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
     * Позволяет получить id входящих распоряжений за смену.
     * Для оператора при ДСП извлекаются данные за заданный промежуток времени, которые приходили
     * соответствующему ДСП (по-другому никак: информация извлекается из общей таблицы распоряжений,
     * в которой фиксируются лишь получатели-станции и ДСП этих станций).
     */
    async loadIncomingOrdersPerShift(context) {
      if (!context.getters.canUserGetIncomingOrdersPerShift) {
        const errMessage = 'У вас нет права получать количество входящий распоряжений за смену либо вы не на дежурстве';
        context.commit(SET_GETTING_INCOMING_ORDERS_PER_SHIFT_RESULT, { error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }
      context.commit(CLEAR_GETTING_INCOMING_ORDERS_PER_SHIFT_RESULT);
      context.commit(SET_GETTING_INCOMING_ORDERS_PER_SHIFT_STATUS, true);
      try {
        const responseData = await getOrdersAddressedToThisPoligonFromGivenDate({
          datetime: context.getters.getLastTakeDutyTime,
        });
        context.commit(SET_GETTING_INCOMING_ORDERS_PER_SHIFT_RESULT, { error: false, message: null });
        context.commit(SET_SYSTEM_MESSAGE, { error: false, datetime: new Date(), message: 'Получена информация о количестве входящих распоряжений за смену' });
        context.commit(SET_INCOMING_ORDERS_PER_SHIFT, responseData);

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка получения информации о входящих распоряжениях за смену');
        context.commit(SET_GETTING_INCOMING_ORDERS_PER_SHIFT_RESULT, { error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });

      } finally {
        context.commit(SET_GETTING_INCOMING_ORDERS_PER_SHIFT_STATUS, false);
      }
    },
  },
};
