import { SET_DOCUMENT_INVALID_MARK } from '@/store/action-types';
import {
  SET_CHANGE_ORDER_INVALID_MARK_RESULT,
  SET_ORDER_BEING_CHANGED_ITS_INVALID_MARK,
  SET_ORDER_FINISHED_BEING_CHANGED_ITS_INVALID_MARK,
  CLEAR_CHANGE_ORDER_INVALID_MARK_RESULT,
  SET_ORDER_INVALID_MARK,
  SET_SYSTEM_MESSAGE,
  SET_CHANGE_ORDER_INVALID_MARK_RESULTS_SEEN_BY_USER,
  CLEAR_ALL_CHANGE_ORDER_INVALID_MARK_RESULTS_SEEN_BY_USER,
} from '@/store/mutation-types';
import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';
import { setOrderInvalidMark } from '@/serverRequests/orders.requests';


export const invalidOrders = {
  getters: {
    /**
     * Возвращает true, если распоряжение с заданным id в данный момент времени проходит
     * процедуру установки его статуса действительности / недействительности, false - в противном случае.
     */
    isOrderBeingChangedItsInvalidMark(state) {
      return (orderId) => state.ordersBeingChangedTheirInvalidMark.includes(orderId);
    },

    /**
     * Возвращает те результаты установки статуса действительности / недействительности документа,
     * которые не были отображены пользователю.
     */
    getChangeOrderInvalidMarkResultsUnseenByUser(state) {
      return state.changeOrdersInvalidMarksResults.filter((res) => !res.wasShownToUser);
    },

    /**
     * Возвращает количество тех результатов установки статуса действительности / недействительности документа,
     * которые не были отображены пользователю.
     */
    getChangeOrderInvalidMarkResultsUnseenByUserNumber(_state, getters) {
      return getters.getChangeOrderInvalidMarkResultsUnseenByUser.length;
    },
  },

  mutations: {
    /**
     * Позволяет сохранить результат процедуры установки статуса действительности / недействительности документа.
     */
    [SET_CHANGE_ORDER_INVALID_MARK_RESULT] (state, { orderId, error, message }) {
      const orderInfo = state.changeOrdersInvalidMarksResults.find((item) => item.orderId === orderId);
      if (!orderInfo) {
        state.changeOrdersInvalidMarksResults.push({ orderId, error, message, wasShownToUser: false });
      } else {
        state.changeOrdersInvalidMarksResults = state.changeOrdersInvalidMarksResults.map((item) => {
          if (item.orderId === orderId) {
            return { ...item, error, message, wasShownToUser: false };
          }
          return item;
        });
      }
    },

    /**
     * Сохраняет id распоряжения, которое в данный момент времени проходит процедуру установки
     * его статуса действительности / недействительности.
     */
    [SET_ORDER_BEING_CHANGED_ITS_INVALID_MARK] (state, orderId) {
      if (!state.ordersBeingChangedTheirInvalidMark.includes(orderId)) {
        state.ordersBeingChangedTheirInvalidMark.push(orderId);
      }
    },

    /**
     * Удаляет сохраненный id распоряжения, операция установки статуса действительности / недействительности
     * которого была завершена.
     */
    [SET_ORDER_FINISHED_BEING_CHANGED_ITS_INVALID_MARK] (state, orderId) {
      state.ordersBeingChangedTheirInvalidMark = state.ordersBeingChangedTheirInvalidMark.filter((item) => item !== orderId);
    },

    /**
     * Удаляет результат установки статуса действительности / недействительности документа с заданным id.
     */
    [CLEAR_CHANGE_ORDER_INVALID_MARK_RESULT] (state, orderId) {
      state.changeOrdersInvalidMarksResults = state.changeOrdersInvalidMarksResults.filter((item) => item.orderId !== orderId);
    },

    /**
     * Для заданного документа позволяет установить отметку о его действительности.
     */
    [SET_ORDER_INVALID_MARK] (state, { orderId, invalid }) {
      const orderIndex = state.data.findIndex((el) => el._id === orderId);
      if (orderIndex >= 0) {
        state.data[orderIndex].invalid = invalid;
      }
    },

    /**
     * Для данных id распоряжений устанавливает флаг просмотра пользователем информации о
     * проставлении для соответствующих документов отметки об их действительности.
     */
    [SET_CHANGE_ORDER_INVALID_MARK_RESULTS_SEEN_BY_USER] (state, orderIds) {
      if (!orderIds) {
        return;
      }
      orderIds.forEach((orderId) => {
        const orderInfo = state.changeOrdersInvalidMarksResults.find((item) => item.orderId === orderId);
        if (orderInfo) {
          orderInfo.wasShownToUser = true;
        }
      });
    },

    /**
     * Удаляет все результаты проставления отметок о действительности документов, просмотренные пользователем.
     */
    [CLEAR_ALL_CHANGE_ORDER_INVALID_MARK_RESULTS_SEEN_BY_USER] (state) {
      state.changeOrdersInvalidMarksResults = state.changeOrdersInvalidMarksResults.filter((item) => !item.wasShownToUser);
    },
  },

  actions: {
    /**
     * Для документа с documentId позволяет установить отметку о его действительности / недействительности в БД
     * (invalid = true - документ должен быть отмечен как недействительный, invalid = false - как действительный).
     */
    async [SET_DOCUMENT_INVALID_MARK] (context, { orderId, invalid }) {
      if (!context.getters.canUserToggleOrderInvalidMark) {
        const errMessage = 'У вас нет прав поменять отметку о действительности документа';
        context.commit(SET_CHANGE_ORDER_INVALID_MARK_RESULT, { orderId, error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }
      if (context.getters.isOrderBeingChangedItsInvalidMark(orderId)) {
        const errMessage = 'Распоряжение уже проходит процедуру смены отметки о его действительности';
        context.commit(SET_CHANGE_ORDER_INVALID_MARK_RESULT, { orderId, error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }
      context.commit(CLEAR_CHANGE_ORDER_INVALID_MARK_RESULT, orderId);
      context.commit(SET_ORDER_BEING_CHANGED_ITS_INVALID_MARK, orderId);
      try {
        const responseData = await setOrderInvalidMark({ orderId, invalid });
        context.commit(SET_CHANGE_ORDER_INVALID_MARK_RESULT, { orderId, error: false, message: responseData.message });
        context.commit(SET_SYSTEM_MESSAGE, { error: false, datetime: new Date(), message: responseData.message });
        context.commit(SET_ORDER_INVALID_MARK, {
          orderId: responseData.orderId,
          invalid: responseData.invalid,
        });

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка смены отметки о действительности документа');
        context.commit(SET_CHANGE_ORDER_INVALID_MARK_RESULT, { orderId, error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });

      } finally {
        context.commit(SET_ORDER_FINISHED_BEING_CHANGED_ITS_INVALID_MARK, orderId);
      }
    },
  },
};
