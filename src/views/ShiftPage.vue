<template>
  <div class="p-ml-4">
    <h2 class="p-text-center p-mt-3 p-mb-3">Персонал рабочего полигона</h2>
    <p>
      <span class="p-text-italic">Примечание:</span>
      <span class="dy58-info"> Данным цветом</span> выделен персонал, находящийся в сети (online), а
      <span class="dy58-error-message"> таким цветом</span> выделен персонал, зарегистрированный на соответствующем участке без права работы в системе (т.е. не имеет роли)
    </p>
    <div v-if="getLoadingCurrSectorsShiftStatus">
      <ProgressSpinner />
    </div>
    <div v-else-if="!getErrorLoadingCurrSectorsShift" class="p-ml-2 p-mt-2 p-mr-4 p-mb-4">
      <view-shift-for-d-s-p
        v-if="getUserWorkPoligon && getUserWorkPoligon.type === WORK_POLIGON_TYPES.STATION"
      />
      <view-shift-for-d-n-c
        v-if="getUserWorkPoligon && getUserWorkPoligon.type === WORK_POLIGON_TYPES.DNC_SECTOR"
      />
      <view-shift-for-e-c-d
        v-if="getUserWorkPoligon && getUserWorkPoligon.type === WORK_POLIGON_TYPES.ECD_SECTOR"
      />
    </div>
    <div v-else class="dy58-error-message p-mt-2 p-mb-2">
      {{ getErrorLoadingCurrSectorsShift }}
    </div>
  </div>
</template>


<script>
  import { computed } from 'vue';
  import { useStore } from 'vuex';
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

    setup() {
      const store = useStore();

      store.commit(SET_ACTIVE_MAIN_MENU_ITEM, MainMenuItemsKeys.currShift);

      return {
        getLoadingCurrSectorsShiftStatus: computed(() => store.getters.getLoadingCurrSectorsShiftStatus),
        getErrorLoadingCurrSectorsShift: computed(() => store.getters.getErrorLoadingCurrSectorsShift),
        getUserWorkPoligon: computed(() => store.getters.getUserWorkPoligon),
        WORK_POLIGON_TYPES,
      };
    },
  }
</script>
