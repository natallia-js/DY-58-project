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
  },

  mutations: {
    delCurrLastOrdersParams(state) {
      if (state.params.length > 0) {
        state.params = [];
      }
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
        context.state.params = response.data;
      } catch (err) {
        context.state.errorLoadingParams = err;
      }
      context.state.loadingParams = false;
    },
  },
}
