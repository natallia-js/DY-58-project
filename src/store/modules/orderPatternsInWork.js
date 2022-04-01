import {
  ORDER_TEXT_SOURCE,
} from '@/constants/orders';

/**
 * Для работы с шаблонными распоряжениями.
 */
export const orderPatternsInWork = {
  state: {
    prevRelatedOrder: null,
    selectedOrderDraft: null,
    newOrderText: {
      orderTextSource: null,
      patternId: null,
      orderTitle: null,
      orderText: null,
    },
  },

  getters: {
    getNewOrderTextObject(state) {
      return state.newOrderText;
    },
  },

  mutations: {
    setNewOrderPattern(state, orderPattern) {
      if (!orderPattern) {
        state.newOrderText = {
          orderTextSource: null,
          patternId: null,
          orderTitle: null,
          orderText: null,
        };
      } else {
        state.newOrderText =  {
          orderTextSource: ORDER_TEXT_SOURCE.pattern,
          patternId: orderPattern._id,
          orderTitle: orderPattern.title,
          orderText: orderPattern.elements,
        };
      }
    },
  },
};
