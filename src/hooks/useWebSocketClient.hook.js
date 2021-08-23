import useWebSocket from './useWebSocket.hook';
import { reactive } from 'vue';
import { WS_SERVER_ADDRESS } from '../constants/servers';

export default function useWebSocketClient() {
  const state = reactive({
    ws: null,
  });

  /*const wsData = computed(() => state.ws ? state.ws.data : null);

  // receive messages
  watch(wsData, (newWSData) => {
    if (newWSData) {
      const { message } = newWSData;
      console.log('newWSData', newWSData, message);
    }
  });*/

  const connect = () => {
    state.ws = useWebSocket({ socketUrl: WS_SERVER_ADDRESS });
  };
/*
  // send messages
  const sendData = () => {
    const message = txtRef.current.value || '';
    if (message) {
      setMessagesList((messagesList) =>
        [].concat(sendTag(message), messagesList)
      );
      ws.send(message);
    }
  };*/

  return {
    state,
    connect,
  };
}
