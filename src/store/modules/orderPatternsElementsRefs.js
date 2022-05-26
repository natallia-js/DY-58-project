import {
  SET_LOADING_ORDER_PATTERNS_ELEMENTS_REFS_STATUS,
  SET_LOADING_REFS_RESULT,
  CLEAR_LOADING_REFS_RESULT,
  SET_ORDER_PATTERNS_ELEMENTS_REFS,
  DEL_ORDER_PATTERNS_ELEMENTS_REFS,
  SET_SYSTEM_MESSAGE,
} from '@/store/mutation-types';
import { LOAD_ORDER_PATTERNS_ELEMENTS_REFS_ACTION } from '@/store/action-types';
import { getOrderPatternsElementsRefs } from '@/serverRequests/orderPatterns.requests';
import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';


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
        return ['', ...refs.possibleRefs];
      }
      return [];
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
    async [LOAD_ORDER_PATTERNS_ELEMENTS_REFS_ACTION] (context) {
      if (!context.getters.canUserGetOrderPatterns) {
        const errMessage = 'У вас нат права получать информацию о смысловых значениях элементов шаблонов документов';
        context.commit(SET_LOADING_REFS_RESULT, { error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }
      context.commit(SET_LOADING_ORDER_PATTERNS_ELEMENTS_REFS_STATUS, true);
      context.commit(CLEAR_LOADING_REFS_RESULT);
      try {
        const responseData = await getOrderPatternsElementsRefs();
        context.commit(SET_LOADING_REFS_RESULT, { error: false, message: null });
        context.commit(SET_SYSTEM_MESSAGE, { error: false, datetime: new Date(), message: 'Загружена информация о смысловых значениях элементов шаблонов документов' });
        context.commit(SET_ORDER_PATTERNS_ELEMENTS_REFS, responseData);

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка подгрузки информации о смысловых значениях элементов шаблонов документов');
        context.commit(SET_LOADING_REFS_RESULT, { error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });

      } finally {
        context.commit(SET_LOADING_ORDER_PATTERNS_ELEMENTS_REFS_STATUS, false);
      }
    },
  },
}
