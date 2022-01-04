import { computed, watch, reactive } from 'vue';
import { WS_SERVER_PARAMS } from '@/constants/servers';
import { store } from '@/store';
import { SET_ONLINE_SHIFT_PERSONAL } from '@/store/mutation-types';


// handle json messages
function formatMessage(data) {
  try {
    return JSON.parse(data);
  } catch (err) {
    return data;
  }
}


// get epoch timestamp
function getTimestamp() {
  return new Date();
}


// accepts:
// - the url to connect to;
// the hook retries a connection infinitely while it is not OK (unless this behavior is not forbidden)
export default function useWebSocket({ socketUrl }) {
  const state = reactive({
    ws: null,
    updatingAppData: false,
  });

  // number of retry attempts to connect to the websocket server
  const retryNum = computed(() => store.getters.getRetryNum);
  // true - retry to connect to the WS server on connection closure, false - do not retry
  const retryOnCloseWSConnection = computed(() => store.getters.getRetryOnCloseWSConnection);

  let updateDataTimerId;

  function closeWSConnection() {
    if (state.ws) {
      state.ws.close();
    }
  }

  function isConnectionOpen() {
    return state.ws.readyState === 1;
  }

  // retryNum dependency here triggers the connection attempt
  watch(retryNum, (newRetryNum) => {
    if (newRetryNum === 0 || !retryOnCloseWSConnection.value) {
      return;
    }

    state.ws = new WebSocket(socketUrl);

    const sendMessageToServer = (message) => {
      try {
        if (!isConnectionOpen()) {
          return false;
        }
        state.ws.send(JSON.stringify(message));
        return true;
      } catch (err) {
        return false;
      }
    };

    /**
     * actions to perform when a message comes from the websocket server
     */
    const toDoOnWSMessage = (event) => {
      const msg = formatMessage(event.data);
      store.commit('setServerMessage', { message: msg, datetime: getTimestamp() });

      if (msg === WS_SERVER_PARAMS.SERVER_PING_MESSAGE) {
        sendMessageToServer(WS_SERVER_PARAMS.PONG_MESSAGE(store.getters.getUserId));
        return;
      }

      if (msg.match(WS_SERVER_PARAMS.ONLINE_USERS_MESSAGE_PATTERN)) {
        const onlineUsersIds = JSON.parse(msg.slice(7));
        if (Array.isArray(onlineUsersIds)) {
          store.commit(SET_ONLINE_SHIFT_PERSONAL, onlineUsersIds);
        }
        return;
      }
    };

    /**
     * on open we should update connection state and reset the number of connection retries
     */
    const toDoOnOpenWSConnection = () => {
      store.commit('setReadyState', { ready: true, datetime: getTimestamp() });
      store.commit('resetRetryNum');
      store.commit('retryOnCloseWSConnection');

      // Настраиваем периодическое обновление информации в приложении.
      // Обновлению подлежит лишь информация о:
      // - online-статусе персонала рабочего полигона,
      updateDataTimerId = setInterval(() => {
        if (!state.updatingAppData) {
          state.updatingAppData = true;
          sendMessageToServer(WS_SERVER_PARAMS.GET_ONLINE_USERS(store.getters.getShiftPersonalIds));
          state.updatingAppData = false;
        }
      }, WS_SERVER_PARAMS.UPDATE_DATA_INTERVAL);
    };

    /**
     * on close we should update connection state and retry connection if necessary
     */
    const toDoOnCloseWSConnection = () => {
      store.commit('setReadyState', { ready: false, datetime: getTimestamp() });

      // Прекращаем периодическое обновление информации в приложении
      clearTimeout(updateDataTimerId);

      // retry connection logic
      if (retryOnCloseWSConnection.value) {
        setTimeout(() => {
          store.commit('nextRetryNum');
        }, WS_SERVER_PARAMS.RETRY_CONNECTION_INTERVAL);
      }
    };

    state.ws.onopen = toDoOnOpenWSConnection;
    state.ws.onclose = toDoOnCloseWSConnection;
    state.ws.onmessage = toDoOnWSMessage;

    // terminate connection on unmount
    return () => {
      closeWSConnection();
    };
  });

  store.commit('nextRetryNum');

  return {
    closeWSConnection,
  };
}
