<template>
  <div class="p-ml-4">
    <h2 class="p-text-center p-mt-3 p-mb-3">Персонал рабочего полигона</h2>
    <p><i>Примечание:</i> <span class="dy58-info">Данным цветом</span> выделен персонал, находящийся в сети</p>
    <div v-if="getLoadingCurrSectorsShiftStatus">
      <ProgressSpinner />
    </div>
    <div v-else-if="!getErrorLoadingCurrSectorsShift" class="p-ml-2 p-mt-2 p-mr-4 p-mb-4">
      <view-shift-for-d-s-p
        v-if="getUserWorkPoligon && getUserWorkPoligon.type === getWorkPoligonTypes.STATION"
      />
      <view-shift-for-d-n-c
        v-if="getUserWorkPoligon && getUserWorkPoligon.type === getWorkPoligonTypes.DNC_SECTOR"
      />
      <view-shift-for-e-c-d
        v-if="getUserWorkPoligon && getUserWorkPoligon.type === getWorkPoligonTypes.ECD_SECTOR"
      />
    </div>
    <div v-else class="dy58-error p-mt-2 p-mb-2">
      {{ getErrorLoadingCurrSectorsShift }}
    </div>
  </div>
</template>


<script>
  import { mapGetters } from 'vuex';
  import { MainMenuItemsKeys } from '@/store/modules/mainMenuItems';
  import { SET_ACTIVE_MAIN_MENU_ITEM } from '@/store/mutation-types';
  import ViewShiftForDSP from '@/components/ViewShiftForDSP';
  import ViewShiftForDNC from '@/components/ViewShiftForDNC';
  import ViewShiftForECD from '@/components/ViewShiftForECD';
  import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';

  export default {
    name: 'dy58-shift-page',

    components: {
      ViewShiftForDSP,
      ViewShiftForDNC,
      ViewShiftForECD,
    },

    computed: {
      ...mapGetters([
        'getLoadingCurrSectorsShiftStatus',
        'getErrorLoadingCurrSectorsShift',
        'getUserWorkPoligon',
      ]),
      getMainMenuItemsKeys() {
        return MainMenuItemsKeys;
      },
      getWorkPoligonTypes() {
        return WORK_POLIGON_TYPES;
      },
    },

    mounted() {
      this.$store.commit(SET_ACTIVE_MAIN_MENU_ITEM, this.getMainMenuItemsKeys.currShift);
    },
  }
</script>
