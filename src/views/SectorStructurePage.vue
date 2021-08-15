<template>
  <div class="p-ml-4">
    <h2 class="p-text-center p-mt-3 p-mb-2">Структура участка</h2>
    <div v-if="getLoadingCurrWorkPoligonStructureStatus">
      <ProgressSpinner />
    </div>
    <div v-else-if="!getErrorLoadingCurrWorkPoligonStructure" class="p-ml-2 p-mt-2 p-mr-4 p-mb-4">
      <view-station-poligon-structure
        v-if="getUserWorkPoligon && getUserWorkPoligon.type === getWorkPoligonTypes.STATION"
        :stationObj="getWorkPoligon"
      />
      <view-d-n-c-sector-poligon-structure
        v-else-if="getUserWorkPoligon && getUserWorkPoligon.type === getWorkPoligonTypes.DNC_SECTOR"
        :sectorObj="getWorkPoligon"
      />
      <view-e-c-d-sector-poligon-structure
        v-else-if="getUserWorkPoligon && getUserWorkPoligon.type === getWorkPoligonTypes.ECD_SECTOR"
        :sectorObj="getWorkPoligon"
      />
    </div>
    <div v-else>
      {{ getErrorLoadingCurrWorkPoligonStructure }}
    </div>
  </div>
</template>


<script>
  import { mapGetters } from 'vuex';
  import { MainMenuItemsKeys } from '../store/modules/mainMenuItems';
  import ViewStationPoligonStructure from '../components/ViewStationPoligonStructure';
  import ViewDNCSectorPoligonStructure from '../components/ViewDNCSectorPoligonStructure';
  import ViewECDSectorPoligonStructure from '../components/ViewECDSectorPoligonStructure';
  import { WORK_POLIGON_TYPES } from '../constants/appCredentials';

  export default {
    name: 'dy58-sector-structure-page',

    components: {
      ViewStationPoligonStructure,
      ViewDNCSectorPoligonStructure,
      ViewECDSectorPoligonStructure,
    },

    computed: {
      ...mapGetters([
        'getUserWorkPoligon',
        'getUserWorkPoligonData',
        'getLoadingCurrWorkPoligonStructureStatus',
        'getErrorLoadingCurrWorkPoligonStructure',
      ]),

      getMainMenuItemsKeys() {
        return MainMenuItemsKeys;
      },
      getWorkPoligonTypes() {
        return WORK_POLIGON_TYPES;
      },
      getWorkPoligon() {
        const poligon = this.getUserWorkPoligon ?? {};
        if (this.getUserWorkPoligonData) {
          return { ...poligon, ...this.getUserWorkPoligonData };
        }
        return poligon;
      },
    },

    mounted() {
      this.$store.commit('setActiveMainMenuItem', this.getMainMenuItemsKeys.sectorStructure);
    },
  }
</script>
