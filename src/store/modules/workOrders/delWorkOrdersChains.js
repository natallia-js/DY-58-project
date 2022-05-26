import {
  SET_DELETE_ORDERS_CHAIN_RESULT,
  SET_DELETE_ORDERS_CHAIN_RESULT_SEEN_BY_USER,
  CLEAR_DELETE_ORDERS_CHAIN_RESULT,
  CLEAR_ALL_DELETE_ORDERS_CHAIN_RESULTS_SEEN_BY_USER,
  SET_ORDERS_CHAIN_BEING_DELETED,
  SET_ORDERS_CHAIN_FINISHED_BEING_DELETED,
  DELETE_CONFIRMED_ORDERS_CHAIN,
  SET_SYSTEM_MESSAGE,
} from '@/store/mutation-types';
import { DEL_CONFIRMED_ORDERS_FROM_CHAIN_ACTION } from '@/store/action-types';
import { delConfirmedOrdersFromChain } from '@/serverRequests/orders.requests';
import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';


/**
 * Данный модуль предназначен для удаления цепочек рабочих распоряжений.
 */
export const delWorkOrdersChains = {
  getters: {
    /**
     * Возвращает id удаляемых цепочек распоряжений.
     */
    getOrdersChainsBeingDeleted(state) {
      return state.ordersChainsBeingDeleted;
    },

    /**
     * Возвращает те результаты удаления цепочек распоряжений, которые не были отображены пользователю.
     */
    getDeleteOrdersChainsResultsUnseenByUser(state) {
      return state.deleteOrdersChainsResults.filter((res) => !res.wasShownToUser);
    },

    /**
     * Возвращает количество тех результатов удаления цепочек распоряжений, которые не были отображены пользователю.
     */
     getDeleteOrdersChainsResultsUnseenByUserNumber(_state, getters) {
      return getters.getDeleteOrdersChainsResultsUnseenByUser.length;
    },
  },

  mutations: {
    /**
     * Позволяет сохранить результат удаления цепочки распоряжений.
     */
    [SET_DELETE_ORDERS_CHAIN_RESULT] (state, { chainId, error, message }) {
      const chainInfo = state.deleteOrdersChainsResults.find((item) => item.chainId === chainId);
      if (!chainInfo) {
        state.deleteOrdersChainsResults.push({ chainId, error, message, wasShownToUser: false });
      } else {
        state.deleteOrdersChainsResults = state.deleteOrdersChainsResults.map((item) => {
          if (item.chainId === chainId) {
            return { ...item, error, message, wasShownToUser: false };
          }
          return item;
        });
      }
    },

    /**
     * Для данных id цепочек распоряжений устанавливает флаг просмотра пользователем информации
     * об их удалении из списка распоряжений, находящихся в работе.
     */
    [SET_DELETE_ORDERS_CHAIN_RESULT_SEEN_BY_USER] (state, chainIds) {
      if (!chainIds || !chainIds.length) {
        return;
      }
      state.deleteOrdersChainsResults = state.deleteOrdersChainsResults.map((item) => {
        if (chainIds.includes(item.chainId)) {
          return { ...item, wasShownToUser: true };
        }
        return item;
      });
    },

    /**
     * Удаляет результат удаления цепочки распоряжений с заданным id.
     */
    [CLEAR_DELETE_ORDERS_CHAIN_RESULT] (state, chainId) {
      state.deleteOrdersChainsResults = state.deleteOrdersChainsResults.filter((item) => item.chainId !== chainId);
    },

    /**
     * Удаляет все результаты удаления цепочек распоряжений, просмотренные пользователем.
     */
    [CLEAR_ALL_DELETE_ORDERS_CHAIN_RESULTS_SEEN_BY_USER] (state) {
      state.deleteOrdersChainsResults = state.deleteOrdersChainsResults.filter((item) => !item.wasShownToUser);
    },

    /**
     * Сохраняет id удаляемой цепочки распоряжений.
     */
    [SET_ORDERS_CHAIN_BEING_DELETED] (state, chainId) {
      if (!state.ordersChainsBeingDeleted.includes(chainId)) {
        state.ordersChainsBeingDeleted.push(chainId);
      }
    },

    /**
     * Удаляет сохраненный id цепочки распоряжений, операция удаления которой была завершена.
     */
    [SET_ORDERS_CHAIN_FINISHED_BEING_DELETED] (state, chainId) {
      state.ordersChainsBeingDeleted = state.ordersChainsBeingDeleted.filter((item) => item !== chainId);
    },

    /**
     * Удаляется (из списка рабочих распоряжений) не вся цепочка рабочих распоряжений,
     * а лишь те принадлежащие ей распоряжения, которые были подтверждены пользователем.
     */
    [DELETE_CONFIRMED_ORDERS_CHAIN] (state, chainId) {
      state.data = state.data.filter((order) => !(order.orderChainId === chainId && order.confirmDateTime));
    },
  },

  actions: {
    /**
     * Позволяет удалить из цепочки рапоряжений с заданным id подтвержденные распоряжения.
     * Данные удаляются лишь из таблицы рабочих распоряжений у заданного полигона управления.
     */
    async [DEL_CONFIRMED_ORDERS_FROM_CHAIN_ACTION] (context, chainId) {
      if (!context.getters.canUserDelConfirmedOrdersChains) {
        const errMessage = 'У вас нет права удалять документы / цепочки документов';
        context.commit(SET_DELETE_ORDERS_CHAIN_RESULT, { chainId, error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }
      context.commit(CLEAR_DELETE_ORDERS_CHAIN_RESULT, chainId);
      context.commit(SET_ORDERS_CHAIN_BEING_DELETED, chainId);
      try {
        const responseData = await delConfirmedOrdersFromChain({ chainId });
        context.commit(SET_DELETE_ORDERS_CHAIN_RESULT, { chainId, error: false, message: responseData.message });
        context.commit(SET_SYSTEM_MESSAGE, { error: false, datetime: new Date(), message: responseData.message });
        context.commit(DELETE_CONFIRMED_ORDERS_CHAIN, chainId);

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка удаления цепочки документов');
        context.commit(SET_DELETE_ORDERS_CHAIN_RESULT, { chainId, error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });

      } finally {
        context.commit(SET_ORDERS_CHAIN_FINISHED_BEING_DELETED, chainId);
      }
    },
  },
}
