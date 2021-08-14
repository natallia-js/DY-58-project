<template>
  <div class="p-ml-4">
    <h2 class="p-text-center p-mt-2 p-mb-2">Структура участка</h2>
    <view-station-poligon-structure
      v-if="getUserWorkPoligon && getUserWorkPoligon.type === getWorkPoligonTypes.STATION"
      :stationObj="getWorkPoligon"
    />
    <view-d-n-c-sector-poligon-structure
      v-else-if="getUserWorkPoligon && getUserWorkPoligon.type === getWorkPoligonTypes.DNC_SECTOR"
      :sectorObj="getWorkPoligon"
    />
  </div>
</template>


<script>
  import { mapGetters } from 'vuex';
  import { MainMenuItemsKeys } from '../store/modules/mainMenuItems';
  import ViewStationPoligonStructure from '../components/ViewStationPoligonStructure';
  import ViewDNCSectorPoligonStructure from '../components/ViewDNCSectorPoligonStructure';
  import { WORK_POLIGON_TYPES } from '../constants/appCredentials';

  export default {
    name: 'dy58-sector-structure-page',

    components: {
      ViewStationPoligonStructure,
      ViewDNCSectorPoligonStructure,
    },

    computed: {
      ...mapGetters([
        'getUserWorkPoligon',
        'getUserWorkPoligonData',
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
