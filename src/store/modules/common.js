import {
  SET_PRINT_PREVIEW,
  SET_SYSTEM_MESSAGE,
  DELETE_ALL_SYSTEM_MESSAGES,
} from '@/store/mutation-types';
import { MAX_SYSTEM_MESSAGES_STORED } from '@/constants/appSettings';


export const common = {
  state: {
    printPreview: false,
    // Последние сообщения о выполнении системой работы (результаты общения с сервером)
    lastNSystemMessages: [],
  },

  getters: {
    isPrintPreview(state) {
      return state.printPreview;
    },

    getLastNSystemMessages(state) {
      return state.lastNSystemMessages;
    },
  },

  mutations: {
    [SET_PRINT_PREVIEW] (state, value) {
      state.printPreview = value;
    },

    [SET_SYSTEM_MESSAGE] (state, messageObject) {
      if (!messageObject) {
        return;
      }
      if (state.lastNSystemMessages.length === MAX_SYSTEM_MESSAGES_STORED) {
        state.lastNSystemMessages.pop();
      }
      state.lastNSystemMessages.unshift(messageObject);
    },

    [DELETE_ALL_SYSTEM_MESSAGES] (state) {
      state.lastNSystemMessages = [];
    },
  },
}
