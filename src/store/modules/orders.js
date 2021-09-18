import axios from 'axios';
import { DY58_SERVER_ACTIONS_PATHS } from '../../constants/servers';
import { CurrShiftGetOrderStatus } from '../../constants/orders';


export const orders = {
  state: {
    data: [],
    dispatchOrderResult: null,
    dispatchOrdersBeingProcessed: 0,
  },

  getters: {
  },

  mutations: {
    clearDispatchOrderResult(state) {
      state.dispatchOrderResult = null;
    },

    addOrdersBeingDispatchedNumber(state) {
      state.dispatchOrdersBeingProcessed += 1;
    },

    subOrdersBeingDispatchedNumber(state) {
      state.dispatchOrdersBeingProcessed -= 1;
    },

    setDispatchOrderResult(state, { error, message }) {
      state.dispatchOrderResult = {
        error,
        message,
      };
    },

    addOrder(state, newOrder) {
      state.data = [
        ...state.data,
        newOrder,
      ];
    },
  },

  actions: {
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

      context.commit('clearDispatchOrderResult');
      context.commit('addOrdersBeingDispatchedNumber');

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
            dncToSend: dncToSend.map((item) => {
              return {
                ...item,
                sendOriginal: item.sendOriginalToDNC === CurrShiftGetOrderStatus.sendOriginal ? true : false,
                placeTitle: item.sector,
              };
            }),
            dspToSend : dspToSend.map((item) => {
              return {
                ...item,
                sendOriginal: item.sendOriginalToDSP === CurrShiftGetOrderStatus.sendOriginal ? true : false,
                placeTitle: item.station,
              };
            }),
            workPoligon: {
              id: context.getters.getUserWorkPoligon.code,
              type: context.getters.getUserWorkPoligon.type,
              title: context.getters.getUserWorkPoligonName,
            },
            creator: {
              id: context.getters.getUserId,
              post: context.getters.getUserPost,
              fio: context.getters.getUserFIO,
            },
          },
          { headers }
        );
        context.commit('setDispatchOrderResult', { error: false, message: response.data.message });
        context.commit('addOrder', response.data.order);
        context.commit('setLastOrdersNumber', { ordersType: type, number });

      } catch ({ response }) {
        context.commit('setDispatchOrderResult', { error: true, message: response.data.message });
      }

      context.commit('subOrdersBeingDispatchedNumber');
    },
  },
};
