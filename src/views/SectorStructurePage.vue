<template>
  <div class="p-ml-4">
    <h2 class="p-text-center p-mt-3 p-mb-3">Структура рабочего полигона</h2>
    <div v-if="getLoadingCurrWorkPoligonStructureStatus">
      <ProgressSpinner />
    </div>
    <div v-else-if="!getErrorLoadingCurrWorkPoligonStructure" class="p-ml-2 p-mt-2 p-mr-4 p-mb-4">
      <view-station-poligon-structure
        v-if="getUserWorkPoligon && getUserWorkPoligon.type === WORK_POLIGON_TYPES.STATION"
        :stationObj="getWorkPoligon"
      />
      <view-d-n-c-sector-poligon-structure
        v-else-if="getUserWorkPoligon && getUserWorkPoligon.type === WORK_POLIGON_TYPES.DNC_SECTOR"
        :sectorObj="getWorkPoligon"
      />
      <view-e-c-d-sector-poligon-structure
        v-else-if="getUserWorkPoligon && getUserWorkPoligon.type === WORK_POLIGON_TYPES.ECD_SECTOR"
        :sectorObj="getWorkPoligon"
      />
    </div>
    <div v-else class="dy58-error-message p-mt-2 p-mb-2">
      {{ getErrorLoadingCurrWorkPoligonStructure }}
    </div>
  </div>
</template>


<script>
  import { computed } from 'vue';
  import { useStore } from 'vuex';
  import { MainMenuItemsKeys } from '@/store/modules/mainMenuItems';
  import { SET_ACTIVE_MAIN_MENU_ITEM } from '@/store/mutation-types';
  import ViewStationPoligonStructure from '@/components/ViewStationPoligonStructure';
  import ViewDNCSectorPoligonStructure from '@/components/ViewDNCSectorPoligonStructure';
  import ViewECDSectorPoligonStructure from '@/components/ViewECDSectorPoligonStructure';
  import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';

  export default {
    name: 'dy58-sector-structure-page',

    components: {
      ViewStationPoligonStructure,
      ViewDNCSectorPoligonStructure,
      ViewECDSectorPoligonStructure,
    },

    setup() {
      const store = useStore();

      store.commit(SET_ACTIVE_MAIN_MENU_ITEM, MainMenuItemsKeys.sectorStructure);

      const getUserWorkPoligon = computed(() => store.getters.getUserWorkPoligon);
      const getUserWorkPoligonData = computed(() => store.getters.getUserWorkPoligonData);
      const getWorkPoligon = computed(() => {
        const poligon = getUserWorkPoligon.value ?? {};
        if (getUserWorkPoligonData.value) {
          return { ...poligon, ...getUserWorkPoligonData.value };
        }
        return poligon;
      });

      return {
        WORK_POLIGON_TYPES,
        getUserWorkPoligon,
        getWorkPoligon,
        getLoadingCurrWorkPoligonStructureStatus: computed(() => store.getters.getLoadingCurrWorkPoligonStructureStatus),
        getErrorLoadingCurrWorkPoligonStructure: computed(() => store.getters.getErrorLoadingCurrWorkPoligonStructure),
      };
    },
  }
</script>
