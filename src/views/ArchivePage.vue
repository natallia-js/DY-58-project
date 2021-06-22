<template>
  <div>
    <h1>Архив</h1>
  </div>
</template>


<script>
  import { MainMenuItemsKeys } from '../store/modules/mainMenuItems';

  export default {
    name: 'dy58-archive-page',

    computed: {
      getMainMenuItemsKeys() {
        return MainMenuItemsKeys;
      },
    },

    mounted() {
      this.$store.commit('setActiveMainMenuItem', this.getMainMenuItemsKeys.archive);
    },
  }
</script>
