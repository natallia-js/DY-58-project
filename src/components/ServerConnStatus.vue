<template>
  <Accordion>
    <AccordionTab>
      <template #header>
        Состояние соединения с сервером: &#160;
        <span v-if="!serverConnectionState">
          Неизвестно
        </span>
        <span v-else-if="serverConnectionState.ready" class="dy58-info">
          <span class="p-text-bold">Активно</span>
          с {{ serverConnectionState.datetime ? getLocaleDateTimeString(serverConnectionState.datetime, true) : '?' }}
        </span>
        <span v-else class="dy58-attention">
          <span class="p-text-bold">Неактивно</span>
          с {{ serverConnectionState.datetime ? getLocaleDateTimeString(serverConnectionState.datetime, true) : '?' }},
          попыток восстановить соединение: {{ serverConnectRetryAttemptsNumber }}
        </span>
      </template>
      Последние сообщения, полученные от сервера ({{ MAX_SERVER_MESSAGES_STORED }}):
      <div v-if="!lastNServerMessages || !lastNServerMessages.length">
        сообщений нет
      </div>
      <div v-else class="dy58-additional-info-scroll-block">
        <p v-for="(message, index) in lastNServerMessages" :key="index">
          <span class="p-text-bold">{{ getLocaleDateTimeString(message.datetime, true) }}: </span>
          <span v-if="!message.message">?</span>
          <span v-if="message.message.length <= MAX_MESSAGE_STRING_LENGTH_TO_DISPLAY">{{ message.message }}</span>
          <span v-else>{{ message.message.slice(0, MAX_MESSAGE_STRING_LENGTH_TO_DISPLAY) }}...</span>
        </p>
      </div>
    </AccordionTab>
  </Accordion>
</template>


<script>
  import { computed } from 'vue';
  import { useStore } from 'vuex';
  import { getLocaleDateTimeString } from '@/additional/dateTimeConvertions';
  import { WS_SERVER_PARAMS } from '@/constants/servers';

  const MAX_MESSAGE_STRING_LENGTH_TO_DISPLAY = 300;

  export default {
    name: 'dy58-server-conn-status',

    setup() {
      const store = useStore();

      return {
        MAX_SERVER_MESSAGES_STORED: WS_SERVER_PARAMS.MAX_SERVER_MESSAGES_STORED,
        serverConnectionState: computed(() => store.getters.getReadyState),
        serverConnectRetryAttemptsNumber: computed(() => store.getters.getRetryNum),
        lastNServerMessages: computed(() => store.getters.getLastNServerMessages),
        MAX_MESSAGE_STRING_LENGTH_TO_DISPLAY,
        getLocaleDateTimeString,
      };
    },
  };
</script>
