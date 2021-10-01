import axios from 'axios';
import { DY58_SERVER_ACTIONS_PATHS } from '../../constants/servers';


/**
 * Для работы с параметрами последних изданных распоряжений (в частности,
 * с номерами распоряжений)
 */
export const lastOrdersParams = {
  state: {
    params: [],
    loadingParams: false,
    errorLoadingParams: null,
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
    delCurrLastOrdersParams(state) {
      if (state.params.length > 0) {
        state.params = [];
      }
    },

    setLastOrdersNumber(state, { ordersType, number, createDateTime }) {
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

    resetOrderNumbersData(state) {
      state.params.forEach((param) => {
        param.lastOrderNumber = 0;
        param.lastOrderDateTime = null;
      });
    },
  },

  actions: {
    /**
     * Подгружает информацию о параметрах последних изданных распоряжений
     */
    async loadLastOrdersParams(context) {
      const currPoligonData = context.getters.getUserWorkPoligonData;
      if (!currPoligonData) {
        return;
      }
      context.state.errorLoadingParams = null;
      context.state.loadingParams = true;
      try {
        const headers = {
          'Authorization': `Bearer ${context.getters.getCurrentUserToken}`,
        };
        // Извлекаем информацию о последних номерах изданных распоряжений разных типов
        // на текущем полигоне управления
        const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.getLastOrdersParams,
          {
            workPoligonType: context.getters.getUserWorkPoligon.type,
            workPoligonId: context.getters.getUserWorkPoligon.code,
          },
          { headers }
        );
        context.state.params = response.data.map((param) => {
          return {
            ordersType: param.ordersType,
            lastOrderNumber: +param.lastOrderNumber,
            lastOrderDateTime: param.lastOrderDateTime ? new Date(param.lastOrderDateTime) : null,
          };
        });
      } catch (err) {
        context.state.errorLoadingParams = err;
      }
      context.state.loadingParams = false;
    },
  },
}
