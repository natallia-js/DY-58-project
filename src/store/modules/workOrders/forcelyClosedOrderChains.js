import { store } from '@/store';
import { FORCE_CLOSE_OR_OPEN_ORDERS_CHAIN } from '@/store/action-types';
import {
  SET_FORCE_CLOSE_OR_OPEN_ORDERS_CHAIN_RESULT,
  SET_ORDER_CHAIN_BEING_FORCELY_CLOSED_OR_OPENED,
  SET_ORDERS_BEING_TOUCHED_BY_FORCE_CLOSE_OR_OPEN_ORDERS_CHAIN,
  SET_ORDER_CHAIN_FINISHED_BEING_FORCELY_CLOSED_OR_OPENED,
  SET_ORDERS_FINISHED_BEING_TOUCHED_BY_FORCE_CLOSE_OR_OPEN_ORDERS_CHAIN,
  CLEAR_FORCE_CLOSE_OR_OPEN_ORDERS_CHAIN_RESULT,
  SET_ORDER_CHAIN_END_DATE_TINE,
  SET_FORCE_CLOSE_OR_OPEN_ORDERS_CHAIN_RESULTS_SEEN_BY_USER,
  CLEAR_ALL_FORCE_CLOSE_OR_OPEN_ORDERS_CHAIN_RESULTS_SEEN_BY_USER,
  SET_SYSTEM_MESSAGE,
} from '@/store/mutation-types';
import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';
import { forceCloseOrOpenOrdersChain } from '@/serverRequests/orders.requests';


export const forcelyClosedOrderChains = {
  getters: {
    /**
     * Возвращает true, если цепочка, которой принадлежит распоряжение с заданным id, в данный момент времени проходит
     * процедуру [отмены] принудительного завершения ее в БД, false - в противном случае.
     */
    isOrderBelongsToChainBeingForcelyClosedOrOpened(state) {
      return (orderId) => state.ordersBeingChangedTheirChainEndDateTime.includes(orderId);
    },

    /**
     * Возвращает true, если цепочка документов с заданным id в данный момент времени проходит
     * процедуру [отмены] принудительного завершения ее в БД, false - в противном случае.
     */
    isOrderChainBeingForcelyClosedOrOpened(state) {
      return (orderChainId) => state.orderChainsBeingChangedTheirChainEndDateTime.includes(orderChainId);
    },

    /**
     * Возвращает те результаты процедуры [отмены] принудительного завершения цепочки документов в БД,
     * которые не были отображены пользователю.
     */
    getForcelyCloseOrOpenOrderChainResultsUnseenByUser(state) {
      return state.changeChainEndDateTimeResults.filter((res) => !res.wasShownToUser);
    },

    /**
     * Возвращает количество тех результатов процедуры [отмены] принудительного завершения цепочки документов в БД,
     * которые не были отображены пользователю.
     */
    getForcelyCloseOrOpenOrderChainResultsUnseenByUserNumber(_state, getters) {
      return getters.getForcelyCloseOrOpenOrderChainResultsUnseenByUser.length;
    },
  },

  mutations: {
    /**
     * Позволяет сохранить результат процедуры [отмены] принудительного завершения цепочки документов в БД.
     */
    [SET_FORCE_CLOSE_OR_OPEN_ORDERS_CHAIN_RESULT] (state, { orderChainId, error, message }) {
      const chainInfo = state.changeChainEndDateTimeResults.find((item) => item.orderChainId === orderChainId);
      if (!chainInfo) {
        state.changeChainEndDateTimeResults.push({ orderChainId, error, message, wasShownToUser: false });
      } else {
        state.changeChainEndDateTimeResults = state.changeChainEndDateTimeResults.map((item) => {
          if (item.orderChainId === orderChainId) {
            return { ...item, error, message, wasShownToUser: false };
          }
          return item;
        });
      }
    },

    /**
     * Сохраняет id цепочек, для которых запущена процедура [отмены] принудительного завершения в БД.
     */
    [SET_ORDER_CHAIN_BEING_FORCELY_CLOSED_OR_OPENED] (state, orderChainId) {
      if (!state.orderChainsBeingChangedTheirChainEndDateTime.includes(orderChainId))
        state.orderChainsBeingChangedTheirChainEndDateTime.push(orderChainId);
    },

    /**
     * Сохраняет id документов, которых затрагивает текущая процедура [отмены] принудительного завершения цепочки документов в БД.
     */
    [SET_ORDERS_BEING_TOUCHED_BY_FORCE_CLOSE_OR_OPEN_ORDERS_CHAIN] (state, orderChainId) {
      const ordersInChain = store.getters.getOrdersInChain(orderChainId);
      if (ordersInChain?.length) {
        ordersInChain.forEach((order) => {
          if (!state.ordersBeingChangedTheirChainEndDateTime.includes(order._id))
            state.ordersBeingChangedTheirChainEndDateTime.push(order._id);
        });
      }
    },

    /**
     * Удаляет сохраненные id документов, для которых операция [отмены] принудительного завершения их цепочки документов в БД
     * была завершена.
     */
    [SET_ORDERS_FINISHED_BEING_TOUCHED_BY_FORCE_CLOSE_OR_OPEN_ORDERS_CHAIN] (state, orderChainId) {
      const ordersInChain = store.getters.getOrdersInChain(orderChainId);
      if (ordersInChain?.length) {
        state.ordersBeingChangedTheirChainEndDateTime =
          state.ordersBeingChangedTheirChainEndDateTime.filter((item) => !ordersInChain.find((order) => order._id === item));
      }
    },

    /**
     * Удаляет сохраненный id цепочки документов, для которого операция [отмены] принудительного завершения в БД была завершена.
     */
    [SET_ORDER_CHAIN_FINISHED_BEING_FORCELY_CLOSED_OR_OPENED] (state, orderChainId) {
      state.orderChainsBeingChangedTheirChainEndDateTime = state.orderChainsBeingChangedTheirChainEndDateTime.filter((item) => item !== orderChainId);
    },

    /**
     * Удаляет результат процедуры [отмены] принудительного завершения цепочки документов в БД.
     */
    [CLEAR_FORCE_CLOSE_OR_OPEN_ORDERS_CHAIN_RESULT] (state, orderChainId) {
      state.changeChainEndDateTimeResults = state.changeChainEndDateTimeResults.filter((item) => item.orderChainId !== orderChainId);
    },

    /**
     * Для документов заданной цепочки меняет дату и время окончания действия цепочки.
     */
    [SET_ORDER_CHAIN_END_DATE_TINE] (_state, { orderChainId, orderChainEndDateTime }) {
      const ordersInChain = store.getters.getOrdersInChain(orderChainId);
      if (ordersInChain?.length) {
        ordersInChain.forEach((order) => {
          order.orderChainEndDateTime = orderChainEndDateTime ? new Date(orderChainEndDateTime) : null;
        });
      }
    },

    /**
     * Для данных id цепочек распоряжений устанавливает флаг просмотра пользователем информации о
     * результатах процедуры [отмены] принудительного завершения цепочки документов в БД.
     */
    [SET_FORCE_CLOSE_OR_OPEN_ORDERS_CHAIN_RESULTS_SEEN_BY_USER] (state, orderChainIds) {
      if (!orderChainIds)
        return;
      orderChainIds.forEach((chainId) => {
        const chainInfo = state.changeChainEndDateTimeResults.find((item) => item.orderChainId === chainId);
        if (chainInfo) {
          chainInfo.wasShownToUser = true;
        }
      });
    },

    /**
     * Удаляет все результаты процедур [отмены] принудительного завершения цепочек документов в БД, просмотренные пользователем.
     */
    [CLEAR_ALL_FORCE_CLOSE_OR_OPEN_ORDERS_CHAIN_RESULTS_SEEN_BY_USER] (state) {
      state.changeChainEndDateTimeResults = state.changeChainEndDateTimeResults.filter((item) => !item.wasShownToUser);
    },
  },

  actions: {
    /**
     * Для документов c заданным id цепочки позволяет запустить процесс [отмены] принудительного завершения этой цепочки в БД.
     */
    async [FORCE_CLOSE_OR_OPEN_ORDERS_CHAIN] (context, { orderChainId, forceClose }) {
      if (!context.getters.canUserForcelyCloseOrOpenOrdersChain) {
        const errMessage = 'У вас нет прав запустить процесс [отмены] принудительного завершения цепочки документов';
        context.commit(SET_FORCE_CLOSE_OR_OPEN_ORDERS_CHAIN_RESULT, { orderChainId, error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }
      if (context.getters.isOrderChainBeingForcelyClosedOrOpened(orderChainId)) {
        const errMessage = 'Цепочка документов уже проходит процедуру [отмены] принудительного ее завершения';
        context.commit(SET_FORCE_CLOSE_OR_OPEN_ORDERS_CHAIN_RESULT, { orderChainId, error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }
      context.commit(CLEAR_FORCE_CLOSE_OR_OPEN_ORDERS_CHAIN_RESULT, orderChainId);
      context.commit(SET_ORDER_CHAIN_BEING_FORCELY_CLOSED_OR_OPENED, orderChainId);
      context.commit(SET_ORDERS_BEING_TOUCHED_BY_FORCE_CLOSE_OR_OPEN_ORDERS_CHAIN, orderChainId);

      try {
        const responseData = await forceCloseOrOpenOrdersChain({ orderChainId, forceClose });
        context.commit(SET_FORCE_CLOSE_OR_OPEN_ORDERS_CHAIN_RESULT, { orderChainId, error: false, message: responseData.message });
        context.commit(SET_SYSTEM_MESSAGE, { error: false, datetime: new Date(), message: responseData.message });
        context.commit(SET_ORDER_CHAIN_END_DATE_TINE, {
          orderChainId: responseData.orderChainId,
          orderChainEndDateTime: responseData.orderChainEndDateTime,
        });

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка процесса [отмены] принудительного завершения цепочки документов');
        context.commit(SET_FORCE_CLOSE_OR_OPEN_ORDERS_CHAIN_RESULT, { orderChainId, error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });

      } finally {
        context.commit(SET_ORDER_CHAIN_FINISHED_BEING_FORCELY_CLOSED_OR_OPENED, orderChainId);
        context.commit(SET_ORDERS_FINISHED_BEING_TOUCHED_BY_FORCE_CLOSE_OR_OPEN_ORDERS_CHAIN, orderChainId);
      }
    },
  },
};
