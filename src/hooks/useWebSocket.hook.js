import { computed, watch, reactive } from 'vue';
import { WS_SERVER_PARAMS } from '@/constants/servers';
import { store } from '@/store';
import {
  SET_ONLINE_SHIFT_PERSONAL,
  SET_SERVER_MESSAGE,
  SET_WS_READY_STATE,
  RESET_RETRY_NUM,
  NEXT_RETRY_NUM,
} from '@/store/mutation-types';


// handle json messages
function formatMessage(data) {
  try {
    return JSON.parse(data);
  } catch (err) {
    return data;
  }
}


// WebSocket client hook.
// Accepts:
// - parameter 'socketUrl' - the (server) url to connect to.
// The hook retries a connection infinitely while it is not OK (unless this behavior is not forbidden).
export default function useWebSocket({ socketUrl }) {
  const state = reactive({
    ws: null,
  });

  // number of retry attempts to connect to the websocket server
  const retryNum = computed(() => store.getters.getRetryNum);
  // true - retry to connect to the WS server on connection closure, false - do not retry
  const retryOnCloseWSConnection = computed(() => store.getters.getRetryOnCloseWSConnection);
  // таймер для периодического обновления информации в приложении
  let updateDataTimerId = null;

  function isWSConnectionOpen() {
    return (state.ws && state.ws.readyState === WebSocket.OPEN) ? true : false;
  }

  function isWSConnectionClosed() {
    return (state.ws && state.ws.readyState === WebSocket.CLOSED) ? true : false;
  }

  // retryNum dependency here triggers the connection attempt
  watch(retryNum, (newRetryNum) => {
    // незакрытое соединение не открываем повторно
    if (state.ws && !isWSConnectionClosed()) {
      return;
    }
    if (newRetryNum === 0 || !retryOnCloseWSConnection.value) {
      return;
    }

    state.ws = new WebSocket(socketUrl);

    const sendMessageToServer = (message) => {
      try {
        if (!isWSConnectionOpen()) {
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
      store.commit(SET_SERVER_MESSAGE, { message: msg, datetime: new Date() });
      // Обработка PING-сообщения от сервера
      if (msg === WS_SERVER_PARAMS.SERVER_PING_MESSAGE) {
        sendMessageToServer(WS_SERVER_PARAMS.PONG_MESSAGE(store.getters.getUserId));
        return;
      }
      // Обработка сообщения от сервера, содержащего информацию об id online-пользователей
      if (msg.match(WS_SERVER_PARAMS.ONLINE_USERS_MESSAGE_PATTERN)) {
        const onlineUsersIds = JSON.parse(msg.slice(7));
        if (Array.isArray(onlineUsersIds)) {
          store.commit(SET_ONLINE_SHIFT_PERSONAL, onlineUsersIds);
        }
        return;
      }
    };

    /**
     * on open we should update connection state and set periodical data requests to the WS server
     */
    const toDoOnOpenWSConnection = () => {
      store.commit(SET_WS_READY_STATE, { ready: true, datetime: new Date() });
      store.commit(RESET_RETRY_NUM);

      // Настраиваем периодическое обновление информации в приложении.
      // Обновлению подлежит лишь информация о:
      // - online-статусе персонала рабочего полигона
      updateDataTimerId = setInterval(() => {
        sendMessageToServer(WS_SERVER_PARAMS.GET_ONLINE_USERS(store.getters.getShiftPersonalIds));
      }, WS_SERVER_PARAMS.UPDATE_DATA_INTERVAL);
    };

    /**
     * on close we should update connection state, stop periodical data requests to the WS server
     * and retry connection if necessary
     */
    const toDoOnCloseWSConnection = () => {
      store.commit(SET_WS_READY_STATE, { ready: false, datetime: new Date() });

      // Прекращаем периодическое обновление информации в приложении
      clearTimeout(updateDataTimerId);
      updateDataTimerId = null;

      // retry connection logic
      if (retryOnCloseWSConnection.value) {
        setTimeout(() => store.commit(NEXT_RETRY_NUM), WS_SERVER_PARAMS.RETRY_CONNECTION_INTERVAL);
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

  function closeWSConnection() {
    if (state.ws) {
      state.ws.close();
    }
  }

  function startWork() {
    store.commit(NEXT_RETRY_NUM);
  }

  function stopWork() {
    closeWSConnection();
    store.commit(RESET_RETRY_NUM);
  }

  return {
    startWork,
    stopWork,
  };
}
