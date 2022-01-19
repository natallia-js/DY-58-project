<template>
  <div>
    Состояние связи с сервером:
    <span v-if="!serverConnectionState">
      Неизвестно
    </span>
    <span v-else-if="serverConnectionState.ready" class="dy58-info">
      <span class="p-text-bold">Активно</span>
      с {{serverConnectionState.datetime ? serverConnectionState.datetime.toLocaleString() : '?'}}
    </span>
    <span v-else class="dy58-attention">
      <span class="p-text-bold">Неактивно</span>
      с {{serverConnectionState.datetime ? serverConnectionState.datetime.toLocaleString() : '?'}},
      попыток восстановить соединение: {{ serverConnectRetryAttemptsNumber }}
    </span>
  </div>
  <div>
    Последние сообщения, полученные от сервера:
    <div v-if="!lastNServerMessages || !lastNServerMessages.length">
      сообщений нет
    </div>
    <div v-else>
      <p v-for="(message, index) in lastNServerMessages" :key="index">
        <span>{{ message.datetime.toLocaleString() }}: </span>
        <span v-if="!message.message">?</span>
        <span v-if="message.message.length <= MAX_MESSAGE_STRING_LENGTH_TO_DISPLAY">{{ message.message }}</span>
        <span v-else>{{ message.message.slice(0, MAX_MESSAGE_STRING_LENGTH_TO_DISPLAY) }}...</span>
      </p>
    </div>
  </div>
</template>


<script>
  import { computed } from 'vue';
  import { useStore } from 'vuex';

  const MAX_MESSAGE_STRING_LENGTH_TO_DISPLAY = 300;

  export default {
    name: 'dy58-server-conn-status',

    setup() {
      const store = useStore();

      return {
        serverConnectionState: computed(() => store.getters.getReadyState),
        serverConnectRetryAttemptsNumber: computed(() => store.getters.getRetryNum),
        lastNServerMessages: computed(() => store.getters.getLastNServerMessages),
        MAX_MESSAGE_STRING_LENGTH_TO_DISPLAY,
      };
    },
  };
</script>
