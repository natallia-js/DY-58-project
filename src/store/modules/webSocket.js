import { WS_SERVER_PARAMS } from '@/constants/servers';
import {
  SET_SERVER_MESSAGE,
  SET_WS_READY_STATE,
  RESET_RETRY_NUM,
  NEXT_RETRY_NUM,
  RETRY_ON_CLOSE_WS_CONNECTION,
  DO_NOT_RETRY_ON_CLOSE_WS_CONNECTION,
  DEL_ALL_WS_SERVER_MESSAGES,
} from '@/store/mutation-types';


export const webSocket = {
  state: {
    lastNServerMessages: [],
    readyState: {
      ready: false,
      datetime: null,
    },
    // number of retry connect attempts
    retryNum: 0,
    // true - retry connect to the server on close WebSocket connection,
    // false - do not retry
    retryOnCloseConnection: true,
  },

  getters: {
    getLastNServerMessages(state) {
      return state.lastNServerMessages;
    },

    getReadyState(state) {
      return state.readyState;
    },

    getRetryNum(state) {
      return state.retryNum;
    },

    getRetryOnCloseWSConnection(state) {
      return state.retryOnCloseConnection;
    },
  },

  mutations: {
    [SET_SERVER_MESSAGE] (state, messageObject) {
      if (!messageObject) {
        return;
      }
      if (state.lastNServerMessages.length === WS_SERVER_PARAMS.MAX_SERVER_MESSAGES_STORED) {
        state.lastNServerMessages.pop();
      }
      state.lastNServerMessages.unshift(messageObject);
    },

    [SET_WS_READY_STATE] (state, { ready, datetime }) {
      state.readyState.ready = ready;
      state.readyState.datetime = datetime;
    },

    [RESET_RETRY_NUM] (state) {
      state.retryNum = 0;
    },

    [NEXT_RETRY_NUM] (state) {
      state.retryNum += 1;
    },

    [RETRY_ON_CLOSE_WS_CONNECTION] (state) {
      state.retryOnCloseConnection = true;
    },

    [DO_NOT_RETRY_ON_CLOSE_WS_CONNECTION] (state) {
      state.retryOnCloseConnection = false;
    },

    [DEL_ALL_WS_SERVER_MESSAGES] (state) {
      state.lastNServerMessages = [];
    },
  },
};
