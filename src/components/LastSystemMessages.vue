<template>
  <Accordion>
    <AccordionTab>
      <template #header>
        Последние сообщения системы ({{ MAX_SYSTEM_MESSAGES_STORED }})
      </template>
      <div v-if="!lastNSystemMessages || !lastNSystemMessages.length">
        сообщений нет
      </div>
      <div v-else class="dy58-additional-info-scroll-block">
        <p v-for="(message, index) in lastNSystemMessages"
          :key="index"
          :class="message.error ? 'dy58-error-message' : ''"
        >
          <span class="p-text-bold">{{ getLocaleDateTimeString(message.datetime, true) }}: </span>
          <span v-if="!message.message">?</span>
          <span v-else>{{ message.message }}</span>
        </p>
      </div>
    </AccordionTab>
  </Accordion>
</template>


<script>
  import { computed } from 'vue';
  import { useStore } from 'vuex';
  import { getLocaleDateTimeString } from '@/additional/dateTimeConvertions';
  import { MAX_SYSTEM_MESSAGES_STORED } from '@/constants/appSettings';

  export default {
    name: 'dy58-last-systen-messages',

    setup() {
      const store = useStore();

      return {
        MAX_SYSTEM_MESSAGES_STORED,
        lastNSystemMessages: computed(() => store.getters.getLastNSystemMessages),
        getLocaleDateTimeString,
      };
    },
  };
</script>
