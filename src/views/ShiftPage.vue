<template>
  <div>
    <h1>На смене</h1>
  </div>
</template>


<script>
  import { MainMenuItemsKeys } from '../store/modules/mainMenuItems';

  export default {
    name: 'dy58-shift-page',

    computed: {
      getMainMenuItemsKeys() {
        return MainMenuItemsKeys;
      },
    },

    mounted() {
      this.$store.commit('setActiveMainMenuItem', this.getMainMenuItemsKeys.currShift);
    },
  }
</script>
