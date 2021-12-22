import axios from 'axios';
import { AUTH_SERVER_ACTIONS_PATHS } from '../../constants/servers';
import { getRequestAuthorizationHeader } from '../../serverRequests/common';


/**
 * Для работы со списками смысловых значений элементов шаблонов распоряжений.
 */
export const orderPatternsElementsRefs = {
  state: {
    refs: [],
    loadingRefs: false,
    loadingRefsResult: null,
  },

  getters: {
    getOrderPatternsElementsRefs: (state) => {
      return state.refs;
    },

    getLoadingOrderPatternsElementsRefsStatus: (state) => {
      return state.loadingRefs;
    },

    getLoadingRefsResult: (state) => {
      return state.loadingRefsResult;
    },

    getOrderPatternsElementsRefsForGivenElementType: (state) => (elementType) => {
      const refs = state.refs.find((item) => item.elementType === elementType);
      if (refs) {
        return refs.possibleRefs;
      }
      return null;
    },
  },

  mutations: {
    setLoadingOrderPatternsElementsRefsStatus: (state, status) => {
      state.loadingRefs = status;
    },

    setLoadingRefsResult: (state, { error, message }) => {
      state.loadingRefsResult = {
        error,
        message,
      };
    },

    clearLoadingRefsResult(state) {
      if (state.loadingRefsResult) {
        state.loadingRefsResult = null;
      }
    },

    setOrderPatternsElementsRefs(state, refs) {
      if (!refs || !refs.length) {
        if (state.refs.length) {
          state.refs = [];
        }
        return;
      }
      state.refs = refs;
    },

    delOrderPatternsElementsRefs(state) {
      state.refs = [];
      state.loadingRefs = false;
      state.loadingRefsResult = null;
    },
  },

  actions: {
    /**
     * Подгружает информацию о возможных смысловых значениях элементов шаблонов распоряжений.
     */
    async loadOrderPatternsElementsRefs(context) {
      context.commit('setLoadingOrderPatternsElementsRefsStatus', true);
      context.commit('clearLoadingRefsResult');
      try {
        const response = await axios.get(AUTH_SERVER_ACTIONS_PATHS.getOrderPatternsElementsRefs,
          { headers: getRequestAuthorizationHeader() }
        );
        context.commit('setLoadingRefsResult', { error: false, message: null });
        context.commit('setOrderPatternsElementsRefs', response.data);
      } catch ({ response }) {
        const defaultErrMessage = 'Произошла неизвестная ошибка при получении информации о смысловых значениях элементов шаблонов распоряжений';
        const errMessage = !response ? defaultErrMessage : (!response.data ? defaultErrMessage : response.data.message);
        context.commit('setLoadingRefsResult', { error: true, message: errMessage });
      }
      context.commit('setLoadingOrderPatternsElementsRefsStatus', false);
    },
  },
}
