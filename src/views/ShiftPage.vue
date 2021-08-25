<template>
  <div class="p-ml-4">
    <h2 class="p-text-center p-mt-3 p-mb-2">На смене</h2>
    <div v-if="getLoadingCurrSectorsShiftStatus">
      <ProgressSpinner />
    </div>
  </div>
</template>


<script>
import { mapGetters } from 'vuex';
  import { MainMenuItemsKeys } from '../store/modules/mainMenuItems';

  export default {
    name: 'dy58-shift-page',

    computed: {
      ...mapGetters([
        'getLoadingCurrSectorsShiftStatus',
        'getErrorLoadingCurrSectorsShift',
      ]),

      getMainMenuItemsKeys() {
        return MainMenuItemsKeys;
      },
    },

    mounted() {
      this.$store.commit('setActiveMainMenuItem', this.getMainMenuItemsKeys.currShift);
    },
  }
</script>
