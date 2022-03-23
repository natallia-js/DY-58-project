<template>
  <div class="p-mb-3">
    Громкость аудио
  </div>
  <div class="p-d-flex p-ai-center">
    <div style="width:15%;text-align:center;">
      <i v-if="state.currentSoundVolume === MIN_SOUND_VALUE" class="pi pi-volume-off"></i>
      <i v-else class="pi pi-volume-up"></i>
    </div>
    <div style="width:70%;height:auto" class="p-mr-2 p-ml-2">
      <Slider
        v-model="state.currentSoundVolume"
        :min="MIN_SOUND_VALUE"
        :max="MAX_SOUND_VALUE"
        :step="CHANGE_SOUND_STEP"
      />
    </div>
    <div style="width:15%;text-align:center;">
      {{ state.currentSoundVolume }}
    </div>
  </div>
</template>

<script>
  import { reactive, watch } from 'vue';
  import { useStore } from 'vuex';
  import { MIN_SOUND_VALUE, MAX_SOUND_VALUE, CHANGE_SOUND_STEP } from '@/constants/appSettings';

  export default {
    name: 'dy58-app-settings',

    setup() {
      const store = useStore();

      const state = reactive({
        currentSoundVolume: store.getters.getSoundsVolume,
      });

      watch(() => store.getters.getSoundsVolume, (vol) => {
        if (state.currentSoundVolume !== vol) {
          state.currentSoundVolume = vol;
        }
      });

      watch(() => state.currentSoundVolume, (vol) => {
        store.commit('setSoundsVolume', vol);
      });

      return {
        state,
        MIN_SOUND_VALUE,
        MAX_SOUND_VALUE,
        CHANGE_SOUND_STEP,
      };
    }
  };
</script>
