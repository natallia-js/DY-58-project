import {
  SET_LOADING_ORDER_DRAFTS_RESULT,
  CLEAR_LOADING_ORDER_DRAFTS_RESULT,
  SET_LOADING_ORDER_DRAFTS_STATUS,
  SET_ORDER_DRAFTS_ARRAY,
  SET_SAVE_ORDER_DRAFT_RESULT,
  CLEAR_SAVE_ORDER_DRAFT_RESULT,
  ADD_ORDER_DRAFT,
  DEL_ORDERS_DRAFTS,
  EDIT_ORDER_DRAFT,
} from '@/store/mutation-types';
import {
  getOrderDraftsFromServer,
  saveOrderDraftOnServer,
  editOrderDraftOnServer,
} from '@/serverRequests/orderDrafts.requests';
import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';
import { getOrderTextElementTypedValue } from '@/store/modules/workOrders/getWorkOrderObject';


function getOrderDraftObject(draft) {
  if (!draft) {
    return null;
  }
  return {
    ...draft,
    createDateTime: new Date(draft.createDateTime),
    orderText: !draft.orderText ? null : {
      ...draft.orderText,
      orderText: !draft.orderText.orderText ? null :
        draft.orderText.orderText.map((el) => {
          return {
            ...el,
            value: getOrderTextElementTypedValue(el),
          };
        })
    },
    timeSpan: draft.timeSpan ? {
      start: draft.timeSpan.start ? new Date(draft.timeSpan.start) : null,
      end: draft.timeSpan.end ? new Date(draft.timeSpan.end) : null,
      tillCancellation: Boolean(draft.timeSpan.tillCancellation),
    } : {
      start: null,
      end: null,
      tillCancellation: false,
    },
  };
}


export const orderDrafts = {
  state: {
    data: [],
    loadingOrderDrafts: false,
    loadingOrderDraftsResult: null,
    saveOrderDraftResult: null,
  },

  getters: {
    getAllOrderDrafts(state) {
      return state.data;
    },

    getOrderDraftById(state) {
      return (id) => state.data.find((el) => el._id === id);
    },

    getSaveOrderDraftResult(state) {
      return state.saveOrderDraftResult;
    },
  },

  mutations: {
    [CLEAR_LOADING_ORDER_DRAFTS_RESULT] (state) {
      state.loadingOrderDraftsResult = null;
    },

    [SET_LOADING_ORDER_DRAFTS_RESULT] (state, { error, message }) {
      state.loadingOrderDraftsResult = {
        error,
        message,
      };
    },

    [SET_LOADING_ORDER_DRAFTS_STATUS] (state, status) {
      state.loadingOrderDrafts = status;
    },

    /**
     * Позволяет запомнить массив шаблонов распоряжений, полученный от сервера.
     */
    [SET_ORDER_DRAFTS_ARRAY] (state, newData) {
      if (!newData || !newData.length) {
        state.data = [];
      } else {
        state.data = newData.map((draft) => getOrderDraftObject(draft));
      }
    },

    [SET_SAVE_ORDER_DRAFT_RESULT] (state, { error, orderType, message }) {
      state.saveOrderDraftResult = {
        error,
        orderType,
        message,
      };
    },

    [CLEAR_SAVE_ORDER_DRAFT_RESULT] (state) {
      if (state.saveOrderDraftResult) {
        state.saveOrderDraftResult = null;
      }
    },

    [ADD_ORDER_DRAFT] (state, newOrderDraft) {
      if (newOrderDraft) {
        state.data.push(getOrderDraftObject(newOrderDraft));
      }
    },

    [DEL_ORDERS_DRAFTS] (state) {
      state.data = [];
    },

    [EDIT_ORDER_DRAFT] (state, draft) {
      if (draft) {
        let foundDraft = state.data.find((el) => el._id === draft._id);
        if (foundDraft) {
          foundDraft = getOrderDraftObject(draft);
        }
      }
    },
  },

  actions: {
    /**
     * Запрашивает у сервера черновики распоряжений текущего полигона управления
     * (полигон управления - не глобальный, т.е. пользователи на рабочих местах на станции не получат
     * черновики с других рабочих мест этой же станции).
     */
    async loadOrderDrafts(context) {
      if (!context.getters.canUserWorkWithSystem) {
        context.commit(SET_LOADING_ORDER_DRAFTS_RESULT, { error: true, message: 'Не могу загрузить черновики распоряжений: у вас нет прав на работу с системой' });
        return;
      }
      context.commit(CLEAR_LOADING_ORDER_DRAFTS_RESULT);
      context.commit(SET_LOADING_ORDER_DRAFTS_STATUS, true);
      try {
        const responseData = await getOrderDraftsFromServer();
        console.log('loadOrderDrafts',responseData)
        context.commit(SET_LOADING_ORDER_DRAFTS_RESULT, { error: false, message: null });
        context.commit(SET_ORDER_DRAFTS_ARRAY, responseData);

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка получения информации о черновиках распоряжений');
        context.commit(SET_LOADING_ORDER_DRAFTS_RESULT, { error: true, message: errMessage });

      } finally {
        context.commit(SET_LOADING_ORDER_DRAFTS_STATUS, false);
      }
    },

    /**
     * Делает запрос на сервер с целью сохранения созданного черновика распоряжения.
     */
    async saveOrderDraft(context, params) {
      const {
        type,
        createDateTime,
        place,
        timeSpan,
        defineOrderTimeSpan,
        orderText,
        dncToSend,
        dspToSend,
        ecdToSend,
        otherToSend,
        createdOnBehalfOf,
        showOnGID,
      } = params;

      if (!context.getters.canUserDispatchOrders) {
        context.commit(SET_SAVE_ORDER_DRAFT_RESULT, {
          error: true,
          orderType: type,
          message: 'У вас нет права на создание черновиков распоряжений',
        });
        return;
      }

      context.commit(CLEAR_SAVE_ORDER_DRAFT_RESULT);

      try {
        const responseData = await saveOrderDraftOnServer(
          {
            type,
            createDateTime: createDateTime.toISOString(),
            place,
            timeSpan,
            defineOrderTimeSpan,
            orderText,
            dncToSend,
            dspToSend,
            ecdToSend,
            otherToSend,
            createdOnBehalfOf,
            showOnGID,
          }
        );
        context.commit(SET_SAVE_ORDER_DRAFT_RESULT, { error: false, orderType: type, message: responseData.message });
        context.commit(ADD_ORDER_DRAFT, responseData.draft);

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка сохранения черновика распоряжения на сервере');
        context.commit(SET_SAVE_ORDER_DRAFT_RESULT, { error: true, orderType: type, message: errMessage });
      }
    },

    /**
     * Делает запрос на сервер с целью редактирования существующего черновика распоряжения.
     */
     async editOrderDraft(context, params) {
      const {
        id,
        type,
        place,
        timeSpan,
        defineOrderTimeSpan,
        orderText,
        dncToSend,
        dspToSend,
        ecdToSend,
        otherToSend,
        createdOnBehalfOf,
        showOnGID,
      } = params;

      if (!context.getters.canUserDispatchOrders) {
        context.commit(SET_SAVE_ORDER_DRAFT_RESULT, {
          error: true,
          orderType: type,
          message: 'У вас нет права на редактирование черновиков распоряжений',
        });
        return;
      }

      context.commit(CLEAR_SAVE_ORDER_DRAFT_RESULT);

      try {
        const responseData = await editOrderDraftOnServer(
          {
            id,
            place,
            timeSpan,
            defineOrderTimeSpan,
            orderText,
            dncToSend,
            dspToSend,
            ecdToSend,
            otherToSend,
            createdOnBehalfOf,
            showOnGID,
          }
        );
        context.commit(SET_SAVE_ORDER_DRAFT_RESULT, { error: false, orderType: type, message: responseData.message });
        context.commit(EDIT_ORDER_DRAFT, responseData.draft);

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка сохранения черновика распоряжения на сервере');
        context.commit(SET_SAVE_ORDER_DRAFT_RESULT, { error: true, orderType: type, message: errMessage });
      }
    },
  },
};
