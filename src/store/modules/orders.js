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
    getDispatchOrderResult(state) {
      return state.dispatchOrderResult;
    },
    getDispatchOrdersBeingProcessed(state) {
      return state.dispatchOrdersBeingProcessed;
    },
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

    setDispatchOrderResult(state, { error, orderType, message }) {
      state.dispatchOrderResult = {
        error,
        orderType,
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
        ecdToSend,
        prevOrderId,
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
            createDateTime: createDateTime.toISOString(),
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
            ecdToSend: ecdToSend.map((item) => {
              return {
                ...item,
                sendOriginal: item.sendOriginalToECD === CurrShiftGetOrderStatus.sendOriginal ? true : false,
                placeTitle: item.sector,
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
            prevOrderId,
          },
          { headers }
        );
        context.commit('setDispatchOrderResult', { error: false, orderType: type, message: response.data.message });
        context.commit('addOrder', response.data.order);
        context.commit('setLastOrdersNumber', { ordersType: type, number, createDateTime });

      } catch ({ response }) {
        context.commit('setDispatchOrderResult', { error: true, orderType: type, message: response.data.message });
      }

      context.commit('subOrdersBeingDispatchedNumber');
    },
  },
};
