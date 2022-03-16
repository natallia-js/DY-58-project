<template>
  <div v-if="isDSP_or_DSPoperator || isDNC || isECD || isRevisor">
    <div
      v-if="isECD || (isRevisor && getUserWorkPoligon.type === WORK_POLIGON_TYPES.ECD_SECTOR)"
      class="p-mt-3 p-mb-3"
    >
      <h2 class="p-text-center p-mb-2">
        Оперативный журнал ЭЦД
      </h2>
      <h3 class="p-text-center p-mb-2">
        Рабочий полигон {{ getUserWorkPoligonName }}
      </h3>
      <h3 v-if="startDisplayDate" class="p-text-center p-m-2">
        период c {{ startDisplayDate }} по {{ endDisplayDate || 'настоящее время'}}
      </h3>
    </div>
    <div
      v-else-if="isDSP_or_DSPoperator || isDNC ||
        (isRevisor && [WORK_POLIGON_TYPES.DNC_SECTOR, WORK_POLIGON_TYPES.STATION].includes(getUserWorkPoligon.type))"
      class="p-mt-3 p-mb-3"
    >
      <h2 class="p-text-center p-m-2">
        Журнал диспетчерских распоряжений
      </h2>
      <h3 class="p-text-center p-m-2">
        по {{ getUserWorkPoligonTypeName }} Белорусской железной дороги
      </h3>
      <h3 v-if="startDisplayDate" class="p-text-center p-m-2">
        период c {{ startDisplayDate }} по {{ endDisplayDate || 'настоящее время'}}
      </h3>
    </div>
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
  import { computed, ref, watch } from 'vue';
  import { useStore } from 'vuex';
  import { MainMenuItemsKeys } from '@/store/modules/mainMenuItems';
  import { SET_ACTIVE_MAIN_MENU_ITEM } from '@/store/mutation-types';
  import ECDJournal from '@/components/ECDJournal';
  import DNCandDSPJournal from '@/components/DNCandDSPJournal';
  import SearchOrdersParams from '@/components/SearchOrdersParams';
  import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';
  import { getLocaleDateTimeString } from '@/additional/dateTimeConvertions';

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
      const startDisplayDate = ref(null);
      const endDisplayDate = ref(null);

      watch(searchParams, () => {
        startDisplayDate.value = (searchParams.value && searchParams.value.timeSpan && searchParams.value.timeSpan.start)
          ? getLocaleDateTimeString(searchParams.value.timeSpan.start, false) : null;
        endDisplayDate.value = (searchParams.value && searchParams.value.timeSpan && searchParams.value.timeSpan.end)
          ? getLocaleDateTimeString(searchParams.value.timeSpan.end, false) : null;
      });

      return {
        WORK_POLIGON_TYPES,
        isECD: computed(() => store.getters.isECD),
        isDNC: computed(() => store.getters.isDNC),
        isDSP_or_DSPoperator: computed(() => store.getters.isDSP_or_DSPoperator),
        isRevisor: computed(() => store.getters.isRevisor),
        getUserWorkPoligon: computed(() => store.getters.getUserWorkPoligon),
        getUserWorkPoligonName: computed(() => store.getters.getUserWorkPoligonName),
        getUserWorkPoligonTypeName: computed(() => {
          switch (store.getters.getUserWorkPoligon.type) {
            case WORK_POLIGON_TYPES.STATION:
              return `станции ${store.getters.getUserWorkPoligonName}`;
            case WORK_POLIGON_TYPES.DNC_SECTOR:
            case WORK_POLIGON_TYPES.ECD_SECTOR:
              return `участку ${store.getters.getUserWorkPoligonName}`;
            default:
              return '?';
          }
        }),
        searchParams,
        printParams,
        checkDocs,
        startDisplayDate,
        endDisplayDate,
      };
    },
  }
</script>
