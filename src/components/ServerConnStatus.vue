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
        {{ message.datetime.toLocaleString() }}: {{ message.message }}
      </p>
    </div>
  </div>
</template>


<script>
  import { computed } from 'vue';
  import { useStore } from 'vuex';

  export default {
    name: 'dy58-server-conn-status',

    setup() {
      const store = useStore();

      const serverConnectionState = computed(() => store.getters.getReadyState);
      const serverConnectRetryAttemptsNumber = computed(() => store.getters.getRetryNum);
      const lastNServerMessages = computed(() =>  store.getters.getLastNServerMessages);

      return {
        serverConnectionState,
        serverConnectRetryAttemptsNumber,
        lastNServerMessages,
      };
    },
  };
</script>


<style scoped>
</style>
