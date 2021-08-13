<template>
  <div>
    <h1>Структура участка</h1>
  </div>
</template>


<script>
  import { MainMenuItemsKeys } from '../store/modules/mainMenuItems';

  export default {
    name: 'dy58-sector-structure-page',

    computed: {
      getMainMenuItemsKeys() {
        return MainMenuItemsKeys;
      },
    },

    mounted() {
      this.$store.commit('setActiveMainMenuItem', this.getMainMenuItemsKeys.sectorStructure);
    },
  }
</script>
