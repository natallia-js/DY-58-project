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
     * Для документа с заданным id позволяет проверить, действителен он либо нет.
     */
    isOrderValid(state) {
      return (orderId) => {
        const order = state.data.find((el) => el._id == orderId);
        return order?.invalid === false;
      };
    },

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
     * Для заданного документа позволяет установить отметку о его недействительности, а также изменить id и дату окончания
     * действия его цепочки.
     * Для документов, которые принадлежат (предыдущей) цепочке документа, отмеченного как недействительный (если таковые
     * документы есть), меняется дата окончания действия цепочки.
     * orderId - id документа, который отмечен как недействительный
     * newOrderChainId - новый id цепочки недействительного документа
     * newOrderChainEndDateTime - дата окончания действия цепочки с id=newOrderChainId
     * theOnlyDocInChain - true (документ с id=orderId был единственным документом в цепочке до того как стал недействительным) либо false
     * prevOrderChainNewEndDateTime - если theOnlyDocInChain=false, то это новая дата окончания действия той цепочки, которой отмеченный
     *   недействительным документ принадлежал с самого начала
     */
    [SET_ORDER_INVALID_MARK] (state, { orderId, newOrderChainId, newOrderChainEndDateTime, theOnlyDocInChain, prevOrderChainNewEndDateTime }) {
      // Ищем документ, который необходимо отметить как недействительный
      const orderIndex = state.data.findIndex((el) => el._id === orderId);
      if (orderIndex < 0)
        return;
      // Если помеченный недействительным документ - не единственный документ в цепочке, то необходимо для всех документов
      // этой цепочки (кроме подлежащего к отметке как недействительный) изменить дату окончания действия цепочки
      if (!theOnlyDocInChain) {
        state.data.forEach((order) => {
          if (order._id !== orderId && order.orderChainId === state.data[orderIndex].orderChainId) {
            order.orderChainEndDateTime = prevOrderChainNewEndDateTime ? new Date(prevOrderChainNewEndDateTime) : null;
          }
        });
      }
      // Определяем документ как недействительный
      state.data[orderIndex].invalid = true;
      state.data[orderIndex].orderChainId = newOrderChainId;
      state.data[orderIndex].orderChainEndDateTime = newOrderChainEndDateTime ? new Date(newOrderChainEndDateTime) : null;
    },

    /**
     * Для данных id распоряжений устанавливает флаг просмотра пользователем информации о
     * проставлении для соответствующих документов отметки об их действительности.
     */
    [SET_CHANGE_ORDER_INVALID_MARK_RESULTS_SEEN_BY_USER] (state, orderIds) {
      if (!orderIds)
        return;
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
     * Для документа с documentId позволяет установить отметку о его недействительности в БД.
     */
    async [SET_DOCUMENT_INVALID_MARK] (context, { orderId }) {
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
        const responseData = await setOrderInvalidMark({ orderId });
        context.commit(SET_CHANGE_ORDER_INVALID_MARK_RESULT, { orderId, error: false, message: responseData.message });
        context.commit(SET_SYSTEM_MESSAGE, { error: false, datetime: new Date(), message: responseData.message });
        context.commit(SET_ORDER_INVALID_MARK, {
          orderId: responseData.orderId,
          newOrderChainId: responseData.orderChainId,
          newOrderChainEndDateTime: responseData.orderChainEndDateTime,
          theOnlyDocInChain: responseData.theOnlyDocInChain,
          prevOrderChainNewEndDateTime: responseData.prevOrderChainNewEndDateTime,
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
