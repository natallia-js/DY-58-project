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
import checkWorkPoligonsEquality from '@/additional/checkWorkPoligonsEquality';


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
    getLoadingOrderPatternsElementsRefsStatus: (state) => {
      return state.loadingRefs;
    },

    getLoadingRefsResult: (state) => {
      return state.loadingRefsResult;
    },

    /**
     * Для данного типа элемента шаблона возвращает список всех его возможных смысловых значений.
     */
    getOrderPatternsElementsRefsForGivenElementType: (state, getters) =>
      ({ elementType, onlyRefStrings = false, includeEmptyString = false, considerCurrentWorkPoligon = false }) => {
        const refs = state.refs.find((item) => item.elementType === elementType);
        if (!refs)
          return [];
        if (onlyRefStrings) {
          // Для случая, когда возвращаются только строки с наименованиями смысловых значений,
          // не допускаем дублирования строк
          const refNames = [...new Set((refs.possibleRefs || []).map((ref) => ref.refName))];
          if (includeEmptyString)
            return ['', ...refNames];
          else
            return refNames;
        }
        if (considerCurrentWorkPoligon) {
          // Если необходимо учесть текущий рабочий полигон, то принцип выбора такой:
          // - в первую очередь, выбираются смысловые значения, которые явно принадлежат только этому рабочему полигону,
          // - далее, к ним добавляются те смысловые значения, которые являются общими для всех рабочих полигонов,
          //   но при этом их наименованиям не должны пересекаться с наименованиями смысловых значений, которые
          //   принадлежат исключительно текущему рабочему полигону
          const currentWorkPoligon = getters.getUserWorkPoligon || {};
          const possibleRefs = (refs.possibleRefs || []).filter((ref) =>
            checkWorkPoligonsEquality(ref.workPoligon, { type: currentWorkPoligon.type, id: currentWorkPoligon.code }));
          (refs.possibleRefs || []).forEach((ref) => {
            if (possibleRefs.find((el) => el.refName !== ref.refName)) {
              possibleRefs.push(ref);
            }
          });
          return possibleRefs;
        } else
          return refs.possibleRefs;
      },

    /**
     * Для данного типа элемента шаблона и его смыслового значения возвращает все возможные значения,
     * которые может принимать данный элемент с данным смысловым значением на текущем полигоне управления.
     */
    getOrderPatternElementRefMeanings: (_state, getters) =>
      ({ elementType, elementRef }) => {
        const ref = getters
          .getOrderPatternsElementsRefsForGivenElementType({ elementType, considerCurrentWorkPoligon: true })
          .find((el) => el.refName === elementRef);
        if (!ref || !ref.possibleMeanings) {
          return [];
        }
        return ref.possibleMeanings;
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
