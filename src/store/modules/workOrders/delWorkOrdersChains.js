import axios from 'axios';
import { DY58_SERVER_ACTIONS_PATHS } from '../../../constants/servers';


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
  },

  mutations: {
    /**
     * Позволяет сохранить результат удаления цепочки распоряжений.
     */
    setDeleteOrdersChainResult(state, { chainId, error, message }) {
      const chainInfo = state.deleteOrdersChainsResults.find((item) => item.chainId === chainId);
      if (!chainInfo) {
        state.deleteOrdersChainsResults.push({ chainId, error, message, wasShownToUser: false });
      } else {
        chainInfo.error = error;
        chainInfo.message = message;
        chainInfo.wasShownToUser = false;
      }
    },

    /**
     * Для данного id цепочки распоряжений устанавливает флаг просмотра пользователем информации
     * о ее удалении из списка распоряжений, находящихся в работе.
     */
    setDeleteOrdersChainResultSeenByUser(state, chainId) {
      const chainInfo = state.deleteOrdersChainsResults.find((item) => item.chainId === chainId);
      if (chainInfo) {
        chainInfo.wasShownToUser = true;
      }
    },

    /**
     * Удаляет результат удаления цепочки распоряжений с заданным id.
     */
    clearDeleteOrdersChainResult(state, chainId) {
      state.deleteOrdersChainsResults = state.deleteOrdersChainsResults.filter((item) => item.chainId !== chainId);
    },

    /**
     * Удаляет все результаты удаления цепочек распоряжений, просмотренные пользователем.
     */
    clearAllDeleteOrdersChainResultsSeenByUser(state) {
      state.deleteOrdersChainsResults = state.deleteOrdersChainsResults.filter((item) => !item.wasShownToUser);
    },

    /**
     * Сохраняет id удаляемой цепочки распоряжений.
     */
    setOrdersChainBeingDeleted(state, chainId) {
      if (!state.ordersChainsBeingDeleted.includes(chainId)) {
        state.ordersChainsBeingDeleted.push(chainId);
      }
    },

    /**
     * Удаляет сохраненный id цепочки распоряжений, операция удаления которой была завершена.
     */
    setOrdersChainFinishedBeingDeleted(state, chainId) {
      state.ordersChainsBeingDeleted = state.ordersChainsBeingDeleted.filter((item) => item !== chainId);
    },

    /**
     * Удаляется (из списка рабочих распоряжений) не вся цепочка рабочих распоряжений,
     * а лишь те принадлежащие ей распоряжения, которые были подтверждены пользователем.
     */
    deleteConfirmedOrdersChain(state, chainId) {
      state.data = state.data.filter((order) => !(order.orderChainId === chainId && order.confirmDateTime));
    },
  },

  actions: {
    /**
     * Позволяет удалить из цепочки рапоряжений с заданным id подтвержденные распоряжения.
     * Данные удаляются лишь из таблицы рабочих распоряжений у заданного полигона управления.
     */
    async delConfirmedOrdersFromChain(context, chainId) {
      if (!context.getters.isUserOnDuty) {
        return;
      }

      context.commit('clearDeleteOrdersChainResult', chainId);
      context.commit('setOrdersChainBeingDeleted', chainId);

      try {
        const headers = {
          'Authorization': `Bearer ${context.getters.getCurrentUserToken}`,
        };
        const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.delConfirmedOrdersFromChain,
          {
            workPoligonType: context.getters.getUserWorkPoligon.type,
            workPoligonId: context.getters.getUserWorkPoligon.code,
            chainId,
          },
          { headers }
        );
        context.commit('setDeleteOrdersChainResult', { chainId, error: false, message: response.data.message });
        context.commit('deleteConfirmedOrdersChain', chainId);

      } catch (error) {
        let errMessage;
        if (error.response) {
          // The request was made and server responded
          errMessage = 'Ошибка удаления цепочки распоряжений: ' + error.response.data ? error.response.data.message : JSON.stringify(error);
        } else if (error.request) {
          // The request was made but no response was received
          errMessage = 'Ошибка удаления цепочки распоряжений: сервер не отвечает';
        } else {
          // Something happened in setting up the request that triggered an Error
          errMessage = 'Произошла неизвестная ошибка при удалении цепочки распоряжений: ' + error.message || JSON.stringify(error);
        }
        context.commit('setDeleteOrdersChainResult', { chainId, error: true, message: errMessage });
      }
      context.commit('setOrdersChainFinishedBeingDeleted', chainId);
    },
  },
}
