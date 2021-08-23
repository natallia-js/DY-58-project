import { computed, watch } from 'vue';
import { useStore } from 'vuex';
import { WS_SERVER_PARAMS } from '../constants/servers';


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
// the hook retries a connection infinitely while it is not OK
export default function useWebSocket({ socketUrl }) {
  const store = useStore();

  // number of retry attempts to connect to the websocket server
  const retryNum = computed(() => store.getters.getRetryNum);

  // retryNum dependency here triggers the connection attempt
  watch(retryNum, (newRetryNum) => {
    if (newRetryNum === 0) {
      return;
    }
    const ws = new WebSocket(socketUrl);

    const sendMessageToServer = (message) => {
      try {
        ws.send(JSON.stringify(message));
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
      }
    };

    /**
     * on open we should update connection state and reset the number of connection retries
     */
    const toDoOnOpenWSConnection = () => {
      store.commit('setReadyState', { ready: true, datetime: getTimestamp() });
      store.commit('resetRetryNum');
      ws.onmessage = toDoOnWSMessage;
    };

    /**
     * on close we should update connection state and retry connection
     */
    const toDoOnCloseWSConnection = () => {
      store.commit('setReadyState', { ready: false, datetime: getTimestamp() });

      // retry connection logic
      setTimeout(() => {
        store.commit('nextRetryNum');
      }, WS_SERVER_PARAMS.RETRY_INTERVAL);
    };

    ws.onopen = toDoOnOpenWSConnection;
    ws.onclose = toDoOnCloseWSConnection;

    // terminate connection on unmount
    return () => {
      if (ws) {
        ws.close();
      }
    };
  });

  store.commit('nextRetryNum');

  return {};
}
