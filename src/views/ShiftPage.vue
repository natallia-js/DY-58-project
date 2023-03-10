<template>
  <div class="p-ml-4">
    <h2 class="p-text-center p-mt-3 p-mb-3">Персонал рабочего полигона</h2>
    <div v-if="getLoadingCurrSectorsShiftStatus" class="p-mb-2">
      <ProgressSpinner />
    </div>
    <div v-else-if="!getErrorLoadingCurrSectorsShift" class="p-ml-2 p-mt-2 p-mr-4 p-mb-4">

      <div class="p-mb-2">
        <Checkbox
          id="show-only-online-users"
          :binary="true"
          v-model="showOnlyOnlineUsers"
        />
        <label for="show-only-online-users">&#160;показать только online-пользователей</label>
      </div>
      <div class="p-mb-2">
        <Checkbox
          id="show-only-dnc-ecd-dsp"
          :binary="true"
          v-model="showOnlyDNC_ECD_DSPUsers"
        />
        <label for="show-only-dnc-ecd-dsp">&#160;показать только пользователей с полномочиями ДНЦ, ЭЦД, Ответственных на станции за "ДУ-58"</label>
      </div>

      <div class="p-mb-2" style="font-size: 0.9rem">
        <span class="dy58-online-onduty-color"> Данным цветом</span> выделен персонал, находящийся в сети (online) и на дежурстве,
        <span class="dy58-online-notonduty-color">этим цветом</span> выделен персонал, находящийся в сети (online), но не на дежурстве, а
        <span class="dy58-error-message">таким цветом</span> выделен персонал, зарегистрированный на соответствующем участке,
        но не имеющий полномочий ДНЦ (DNC_FULL), ЭЦД (ECD_FULL), ДСП (DSP_FULL), Оператора при ДСП (DSP_Operator)
        либо Руководителя работ (STATION_WORKS_MANAGER)
      </div>

      <view-shift-for-d-s-p
        v-if="getUserWorkPoligon && getUserWorkPoligon.type === WORK_POLIGON_TYPES.STATION"
        :showOnlyDNC_ECD_DSPUsers="showOnlyDNC_ECD_DSPUsers"
        :showOnlyOnlineUsers="showOnlyOnlineUsers"
      />
      <view-shift-for-d-n-c
        v-if="getUserWorkPoligon && getUserWorkPoligon.type === WORK_POLIGON_TYPES.DNC_SECTOR"
        :showOnlyDNC_ECD_DSPUsers="showOnlyDNC_ECD_DSPUsers"
        :showOnlyOnlineUsers="showOnlyOnlineUsers"
      />
      <view-shift-for-e-c-d
        v-if="getUserWorkPoligon && getUserWorkPoligon.type === WORK_POLIGON_TYPES.ECD_SECTOR"
        :showOnlyDNC_ECD_DSPUsers="showOnlyDNC_ECD_DSPUsers"
        :showOnlyOnlineUsers="showOnlyOnlineUsers"
      />
    </div>
    <div v-else class="dy58-error-message p-mt-2 p-mb-2">
      {{ getErrorLoadingCurrSectorsShift }}
    </div>
  </div>
</template>


<script>
  import { computed, ref } from 'vue';
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

      const showOnlyOnlineUsers = ref(false);
      const showOnlyDNC_ECD_DSPUsers = ref(true);

      store.commit(SET_ACTIVE_MAIN_MENU_ITEM, MainMenuItemsKeys.currShift);

      return {
        showOnlyOnlineUsers,
        showOnlyDNC_ECD_DSPUsers,
        getLoadingCurrSectorsShiftStatus: computed(() => store.getters.getLoadingCurrSectorsShiftStatus),
        getErrorLoadingCurrSectorsShift: computed(() => store.getters.getErrorLoadingCurrSectorsShift),
        getUserWorkPoligon: computed(() => store.getters.getUserWorkPoligon),
        WORK_POLIGON_TYPES,
      };
    },
  }
</script>
