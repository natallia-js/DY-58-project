<template>
  <div>
    <search-orders-params
      @input="searchParams = $event"
      @print="printParams = $event"
    />
    <div v-if="isECD">
      <ECDJournal
        :searchParams="searchParams"
        :printParams="printParams"
      />
    </div>
    <div v-else>
      Для НЕ ЭЦД пока не готово
    </div>
  </div>
</template>


<script>
  import { computed, ref } from 'vue';
  import { useStore } from 'vuex';
  import { MainMenuItemsKeys } from '@/store/modules/mainMenuItems';
  import { SET_ACTIVE_MAIN_MENU_ITEM } from '@/store/mutation-types';
  import ECDJournal from '@/components/ECDJournal';
  import SearchOrdersParams from '@/components/SearchOrdersParams';

  export default {
    name: 'dy58-curr-journal-page',

    components: {
      SearchOrdersParams,
      ECDJournal,
    },

    setup() {
      const store = useStore();

      store.commit(SET_ACTIVE_MAIN_MENU_ITEM, MainMenuItemsKeys.ordersJournal);

      const searchParams = ref(null);
      const printParams = ref(null);

      return {
        isECD: computed(() => store.getters.isECD),
        searchParams,
        printParams,
      };
    },
  }
</script>
