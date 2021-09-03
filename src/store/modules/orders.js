import axios from 'axios';
import { DY58_SERVER_ACTIONS_PATHS } from '../../constants/servers';


export const orders = {
  state: {
    data: [],
    loadingOrders: false,
    errorLoadingOrders: null,
    dispatchOrderResult: null,
    dispatchOrdersBeingProcessed: 0,
  },

  getters: {
  },

  mutations: {
  },

  actions: {
    /**
     *
     */
    /*async loadOrderPatterns(context) {
      context.state.errorLoadingPatterns = null;
      context.state.loadingOrderPatterns = true;
      try {
        const headers = {
          'Authorization': `Bearer ${context.getters.getCurrentUserToken}`,
        };
        const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getOrderPatterns,
          {
            workPoligonType: context.getters.getUserWorkPoligon.type,
            workPoligonId: context.getters.getUserWorkPoligon.code,
          },
          { headers }
        );
        context.state.patterns = response.data || [];
      } catch (err) {
        context.state.errorLoadingPatterns = err;
      }
      context.state.loadingOrderPatterns = false;
    },*/

    /**
     *
     */
    async dispatchOrder(context, params) {
      const {
        type,
        number,
        createDateTime,
        place,
        timeSpan,
        orderText,
        dncToSend,
        dspToSend,
      } = params;
      try {
        const headers = {
          'Authorization': `Bearer ${context.getters.getCurrentUserToken}`,
        };
        const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.dispatchOrder,
          {
            type,
            number,
            createDateTime,
            place,
            timeSpan,
            orderText,
            dncToSend,
            dspToSend,
            workPoligon: {
              id: context.getters.getUserWorkPoligon.code,
              type: context.getters.getUserWorkPoligon.type,
            },
          },
          { headers }
        );
        context.state.createOrderPatternResult = {
          error: false,
          message: response.data.message,
          order: response.data.order,
        };
        console.log('ОТВЕТ', response.data)
        context.state.data = [
          ...context.state.data,
          response.data.order,
        ];
      } catch ({ response }) {
        context.state.createOrderPatternResult = {
          error: true,
          message: response.data.message,
        };
      }
    },
  },
};
