import {
  SHOW_APP_SETTINGS,
  SHOW_ORDER_DRAFTS,
  SET_PRINT_PREVIEW,
  SET_SYSTEM_MESSAGE,
  DELETE_ALL_SYSTEM_MESSAGES,
} from '@/store/mutation-types';
import { MAX_SYSTEM_MESSAGES_STORED } from '@/constants/appSettings';


export const common = {
  state: {
    showAppSettings: {
      show: false,
      target: null,
    },
    showOrderDrafts: {
      show: false,
      target: null,
    },
    printPreview: false,
    // Последние сообщения о выполнении системой работы (результаты общения с сервером)
    lastNSystemMessages: [],
  },

  getters: {
    appSettingsVisible(state) {
      return state.showAppSettings.show;
    },

    appSettingsTarget(state) {
      return state.showAppSettings.target;
    },

    orderDraftsPanelVisible(state) {
      return state.showOrderDrafts.show;
    },

    orderDraftsPanelTarget(state) {
      return state.showOrderDrafts.target;
    },

    isPrintPreview(state) {
      return state.printPreview;
    },

    getLastNSystemMessages(state) {
      return state.lastNSystemMessages;
    },
  },

  mutations: {
    [SHOW_APP_SETTINGS] (state, { show, target }) {
      state.showAppSettings = { show, target };
    },

    [SHOW_ORDER_DRAFTS] (state, { show, target }) {
      state.showOrderDrafts = { show, target };
    },

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
