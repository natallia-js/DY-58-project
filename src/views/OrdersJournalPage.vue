<template>
  <div>
    <search-orders-params
      @input="searchParams = $event"
      @print="printParams = $event"
    />
    <div v-if="isECD" class="p-ml-1 p-mr-1">
      <ECDJournal
        :searchParams="searchParams"
        :printParams="printParams"
      />
    </div>
    <div v-else-if="isDSP_or_DSPoperator || isDNC" class="p-ml-1 p-mr-1">
      <DNCandDSPJournal/>
    </div>
    <div v-else>
       Для Вас не предусмотрен функционал работы с Журналом распоряжений
    </div>
  </div>
</template>


<script>
  import { computed, ref } from 'vue';
  import { useStore } from 'vuex';
  import { MainMenuItemsKeys } from '@/store/modules/mainMenuItems';
  import { SET_ACTIVE_MAIN_MENU_ITEM } from '@/store/mutation-types';
  import ECDJournal from '@/components/ECDJournal';
  import DNCandDSPJournal from '@/components/DNCandDSPJournal';
  import SearchOrdersParams from '@/components/SearchOrdersParams';

  export default {
    name: 'dy58-curr-journal-page',

    components: {
      SearchOrdersParams,
      ECDJournal,
      DNCandDSPJournal,
    },

    setup() {
      const store = useStore();

      store.commit(SET_ACTIVE_MAIN_MENU_ITEM, MainMenuItemsKeys.ordersJournal);

      const searchParams = ref(null);
      const printParams = ref(null);

      return {
        isECD: computed(() => store.getters.isECD),
        isDNC: computed(() => store.getters.isDNC),
        isDSP_or_DSPoperator: computed(() => store.getters.isDSP_or_DSPoperator),
        searchParams,
        printParams,
      };
    },
  }
</script>
