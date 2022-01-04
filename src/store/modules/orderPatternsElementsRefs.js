import {
  SET_LOADING_ORDER_PATTERNS_ELEMENTS_REFS_STATUS,
  SET_LOADING_REFS_RESULT,
  CLEAR_LOADING_REFS_RESULT,
  SET_ORDER_PATTERNS_ELEMENTS_REFS,
  DEL_ORDER_PATTERNS_ELEMENTS_REFS,
} from '@/store/mutation-types';
import { getOrderPatternsElementsRefs } from '@/serverRequests/orderPatterns.requests';


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
    [SET_LOADING_ORDER_PATTERNS_ELEMENTS_REFS_STATUS] (state, status) {
      if (state.loadingRefs !== status) {
        state.loadingRefs = status;
      }
    },

    [SET_LOADING_REFS_RESULT] (state, { error, message }) {
      state.loadingRefsResult = {
        error,
        message,
      };
    },

    [CLEAR_LOADING_REFS_RESULT] (state) {
      if (state.loadingRefsResult) {
        state.loadingRefsResult = null;
      }
    },

    [SET_ORDER_PATTERNS_ELEMENTS_REFS] (state, refs) {
      if (!refs || !refs.length) {
        if (state.refs.length) {
          state.refs = [];
        }
        return;
      }
      state.refs = refs;
    },

    [DEL_ORDER_PATTERNS_ELEMENTS_REFS] (state) {
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
      context.commit(SET_LOADING_ORDER_PATTERNS_ELEMENTS_REFS_STATUS, true);
      context.commit(CLEAR_LOADING_REFS_RESULT);

      try {
        const responseData = await getOrderPatternsElementsRefs();
        context.commit(SET_LOADING_REFS_RESULT, { error: false, message: null });
        context.commit(SET_ORDER_PATTERNS_ELEMENTS_REFS, responseData);

      } catch (error) {
        let errMessage;
        if (error.response) {
          // The request was made and server responded
          errMessage = 'Ошибка подгрузки информации о смысловых значениях элементов шаблонов распоряжений: ' + error.response.data ? error.response.data.message : JSON.stringify(error);
        } else if (error.request) {
          // The request was made but no response was received
          errMessage = 'Ошибка подгрузки информации о смысловых значениях элементов шаблонов распоряжений: сервер не отвечает';
        } else {
          // Something happened in setting up the request that triggered an Error
          errMessage = 'Произошла неизвестная ошибка при подгрузке информации о смысловых значениях элементов шаблонов распоряжений: ' + error.message || JSON.stringify(error);
        }
        context.commit(SET_LOADING_REFS_RESULT, { error: true, message: errMessage });
      }
      context.commit(SET_LOADING_ORDER_PATTERNS_ELEMENTS_REFS_STATUS, false);
    },
  },
}
