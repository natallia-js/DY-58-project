import {
  SHOW_APP_SETTINGS,
  SHOW_ORDER_DRAFTS,
  SET_PRINT_PREVIEW,
  SET_SYSTEM_MESSAGE,
  DELETE_ALL_SYSTEM_MESSAGES,
  SET_ALL_DATA_LOADED_ON_APP_RELOAD,
  SET_ALLOW_APPLICATION_NAVIGATION,
  SET_DO_NOT_ALLOW_APPLICATION_NAVIGATION,
} from '@/store/mutation-types';
import { MAX_SYSTEM_MESSAGES_STORED } from '@/constants/appSettings';


export const common = {
  state: {
    allDataLoadedOnApplicationReload: false,
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
    // Определяет, хочет ли пользователь в данный момент перемещаться между вкладками (пунктами меню) приложения.
    // Он может не хотеть, если в данный момент, например, заполняет форму для создания нового распоряжения.
    allowApplicationNavigation: true,
  },

  getters: {
    ifAllowApplicationNavigation(state) {
      return state.allowApplicationNavigation;
    },

    ifAllDataLoadedOnApplicationReload(state) {
      return state.allDataLoadedOnApplicationReload;
    },

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
    [SET_ALLOW_APPLICATION_NAVIGATION] (state) {
      if (!state.allowApplicationNavigation)
        state.allowApplicationNavigation = true;
    },

    [SET_DO_NOT_ALLOW_APPLICATION_NAVIGATION] (state) {
      if (state.allowApplicationNavigation)
        state.allowApplicationNavigation = false;
    },

    [SET_ALL_DATA_LOADED_ON_APP_RELOAD] (state) {
      state.allDataLoadedOnApplicationReload = true;
    },

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
