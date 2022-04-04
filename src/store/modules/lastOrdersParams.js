import { getLastOrdersParams } from '@/serverRequests/orders.requests';
import {
  DEL_CURR_LAST_ORDERS_PARAMS,
  SET_LAST_ORDERS_NUMBER,
  RESET_ORDER_NUMBERS_DATA,
  SET_LAST_ORDERS_PARAMS,
  CLEAR_LOADING_LAST_ORDERS_RESULT,
  SET_LOADING_LAST_ORDERS_RESULT,
  SET_LOADING_LAST_ORDERS_PARAMS_STATUS,
  SET_SYSTEM_MESSAGE,
} from '@/store/mutation-types';
import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';


/**
 * Для работы с параметрами последних изданных распоряжений (в частности,
 * с номерами распоряжений)
 */
export const lastOrdersParams = {
  state: {
    params: [],
    loadingParams: false,
    loadingParamsResult: null,
  },

  getters: {
    getLastOrdersParams: (state) => {
      return state.params;
    },

    getLoadingLastOrdersParamsStatus: (state) => {
      return state.loadingParams;
    },

    getErrorLoadingLastOrdersParams: (state) => {
      return state.errorLoadingParams;
    },

    getLastOrderDateTime: (state) => (orderType) => {
      const ordersParams = state.params.find((params) => params.ordersType === orderType);
      if (ordersParams) {
        return ordersParams.lastOrderDateTime;
      }
      return null;
    },

    getNextOrdersNumber: (state) => (orderType) => {
      const ordersParams = state.params.find((params) => params.ordersType === orderType);
      if (ordersParams) {
        return ordersParams.lastOrderNumber + 1;
      }
      return 1;
    },
  },

  mutations: {
    [DEL_CURR_LAST_ORDERS_PARAMS] (state) {
      if (state.params.length > 0) {
        state.params = [];
      }
    },

    [SET_LAST_ORDERS_NUMBER] (state, { ordersType, number, createDateTime }) {
      const ordersParams = state.params.find((params) => params.ordersType === ordersType);
      if (ordersParams) {
        ordersParams.lastOrderNumber = number;
        ordersParams.lastOrderDateTime = createDateTime;
      } else {
        state.params.push({
          ordersType,
          lastOrderNumber: number,
          lastOrderDateTime: createDateTime,
        });
      }
    },

    [RESET_ORDER_NUMBERS_DATA] (state, ordersType) {
      const arrayIndex = state.params.findIndex((item) => item.ordersType === ordersType);
      if (arrayIndex >= 0) {
        state.params[arrayIndex] = {
          ...state.params[arrayIndex],
          lastOrderNumber: 0,
          lastOrderDateTime: null,
        };
      }
    },

    [SET_LAST_ORDERS_PARAMS] (state, params) {
      if (!params || !params.length) {
        state.params = [];
        return;
      }
      state.params = params.map((param) => {
        return {
          ordersType: param.ordersType,
          lastOrderNumber: +param.lastOrderNumber,
          lastOrderDateTime: param.lastOrderDateTime ? new Date(param.lastOrderDateTime) : null,
        };
      });
    },

    [CLEAR_LOADING_LAST_ORDERS_RESULT] (state) {
      state.loadingParamsResult = null;
    },

    [SET_LOADING_LAST_ORDERS_RESULT] (state, { error, message }) {
      state.loadingParamsResult = {
        error,
        message,
      };
    },

    [SET_LOADING_LAST_ORDERS_PARAMS_STATUS] (state, status) {
      state.loadingParams = status;
    },
  },

  actions: {
    /**
     * Подгружает информацию о параметрах последних изданных распоряжений в рамках глобального
     * полигона управления.
     */
    async loadLastOrdersParams(context) {
      if (!context.getters.canUserGetLastOrdersParams) {
        const errMessage = 'У вас не права получать параметры последних изданных документов';
        context.commit(SET_LOADING_LAST_ORDERS_RESULT, { error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }
      const currPoligonData = context.getters.getUserWorkPoligonData;
      if (!currPoligonData) {
        const errMessage = 'Ошибка загрузки информации о параметрах последних изданных документов: неизвестна структура рабочего полигона';
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }
      context.commit(CLEAR_LOADING_LAST_ORDERS_RESULT);
      context.commit(SET_LOADING_LAST_ORDERS_PARAMS_STATUS, true);
      try {
        // Извлекаем информацию о последних номерах изданных распоряжений разных типов
        // на текущем полигоне управления
        const responseData = await getLastOrdersParams();
        context.commit(SET_LOADING_LAST_ORDERS_RESULT, { error: false, message: null });
        context.commit(SET_SYSTEM_MESSAGE, { error: false, datetime: new Date(), message: 'Загружена информация о параметрах последних изданных документов' });
        context.commit(SET_LAST_ORDERS_PARAMS, responseData);

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка получения информации о последних изданных распоряжениях');
        context.commit(SET_LOADING_LAST_ORDERS_RESULT, { error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });

      } finally {
        context.commit(SET_LOADING_LAST_ORDERS_PARAMS_STATUS, false);
      }
    },
  },
}
