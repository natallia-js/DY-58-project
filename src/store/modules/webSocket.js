import { WS_SERVER_PARAMS } from '../../constants/servers';

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
    setServerMessage(state, messageObject) {
      if (!messageObject) {
        return;
      }
      if (state.lastNServerMessages.length === WS_SERVER_PARAMS.MAX_SERVER_MESSAGES_STORED) {
        state.lastNServerMessages.shift();
      }
      state.lastNServerMessages.push(messageObject);
    },

    setReadyState(state, { ready, datetime }) {
      state.readyState.ready = ready;
      state.readyState.datetime = datetime;
    },

    resetRetryNum(state) {
      state.retryNum = 0;
    },

    nextRetryNum(state) {
      state.retryNum += 1;
    },

    retryOnCloseWSConnection(state) {
      state.retryOnCloseConnection = true;
    },

    doNotRetryOnCloseWSConnection(state) {
      state.retryOnCloseConnection = false;
    },
  },
};
