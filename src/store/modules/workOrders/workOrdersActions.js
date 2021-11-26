import axios from 'axios';
import { DY58_SERVER_ACTIONS_PATHS } from '../../../constants/servers';


/**
 * Данный модуль предназначен для работы с рабочими распоряжениями.
 */
export const workOrdersActions = {
  getters: {
    getOrdersChainsBeingDeleted(state) {
      return state.ordersChainsBeingDeleted;
    },

    getDeletedOrdersChains(state) {
      return state.deleteOrdersChainsResults.filter((res) => !res.error).map((res) => res.chainId);
    },

    getDeleteOrdersChainsResultsUnseenByUser(state) {
      return state.deleteOrdersChainsResults.filter((res) => !res.wasShownToUser);
    },
  },

  mutations: {
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

    setDeleteOrdersChainResultSeenByUser(state, chainId) {
      const chainInfo = state.deleteOrdersChainsResults.find((item) => item.chainId === chainId);
      if (chainInfo) {
        chainInfo.wasShownToUser = true;
      }
    },

    clearDeleteOrdersChainResult(state, chainId) {
      state.deleteOrdersChainsResults = state.deleteOrdersChainsResults.filter((item) => item.chainId !== chainId);
    },

    clearAllDeleteOrdersChainResultsSeenByUser(state) {
      state.deleteOrdersChainsResults = state.deleteOrdersChainsResults.filter((item) => !item.wasShownToUser);
    },

    setOrdersChainBeingDeleted(state, chainId) {
      if (!state.ordersChainsBeingDeleted.includes(chainId)) {
        state.ordersChainsBeingDeleted.push(chainId);
      }
    },

    setOrdersChainFinishedBeingDeleted(state, chainId) {
      state.ordersChainsBeingDeleted = state.ordersChainsBeingDeleted.filter((item) => item !== chainId);
    },
  },

  actions: {
    /**
     * Позволяет удалить из цепочки рапоряжений с заданным id подтвержденные распоряжения.
     * Данные удаляются лищь из таблицы рабочих распоряжений у заданного полигона управления.
     */
    async delConfirmedOrdersFromChain(context, chainId) {
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

      } catch (error) {
        let errMessage;
        if (error.response) {
          // The request was made and server responded
          errMessage = 'Ошибка удаления цепочки распоряжений: ' + error.response.data ? error.response.data.message : '?';
        } else if (error.request) {
          // The request was made but no response was received
          errMessage = 'Ошибка удаления цепочки распоряжений: сервер не отвечает';
        } else {
          // Something happened in setting up the request that triggered an Error
          errMessage = 'Произошла неизвестная ошибка при удалении цепочки распоряжений: ' + error.message || '?';
        }
        context.commit('setDeleteOrdersChainResult', { chainId, error: true, message: errMessage });
      }
      context.commit('setOrdersChainFinishedBeingDeleted', chainId);
    },
  },
}
