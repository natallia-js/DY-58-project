<template>
  <div v-if="isDSP_or_DSPoperator || isDNC || isECD || isRevisor">
    <search-orders-params
      :displayVerifyFunctions="isRevisor"
      @input="searchParams = $event"
      @print="printParams = $event"
      @createCheckRecord="checkDocs = true"
    />
    <div class="dy58-journal-container">
      <ECDJournal
        v-if="isECD || (isRevisor && getUserWorkPoligon.type === WORK_POLIGON_TYPES.ECD_SECTOR)"
        :searchParams="searchParams"
        :printParams="printParams"
        :checkDocs="checkDocs"
        @finishedCreatingCheckRecord="checkDocs = false"
      />
      <DNCandDSPJournal
        v-else-if="isDSP_or_DSPoperator || isDNC ||
          (isRevisor && [WORK_POLIGON_TYPES.DNC_SECTOR, WORK_POLIGON_TYPES.STATION].includes(getUserWorkPoligon.type))"
        :searchParams="searchParams"
        :printParams="printParams"
        :checkDocs="checkDocs"
        @finishedCreatingCheckRecord="checkDocs = false"
      />
    </div>
  </div>
  <div v-else class="dy58-user-action-forbidden-block">
    Для вас не предусмотрен функционал работы с Журналом распоряжений
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
  import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';

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
      const checkDocs = ref(false);

      return {
        WORK_POLIGON_TYPES,
        isECD: computed(() => store.getters.isECD),
        isDNC: computed(() => store.getters.isDNC),
        isDSP_or_DSPoperator: computed(() => store.getters.isDSP_or_DSPoperator),
        isRevisor: computed(() => store.getters.isRevisor),
        getUserWorkPoligon: computed(() => store.getters.getUserWorkPoligon),
        searchParams,
        printParams,
        checkDocs,
      };
    },
  }
</script>
