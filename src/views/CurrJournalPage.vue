<template>
  <div>
    <h1>Текущий журнал</h1>
  </div>
</template>


<script>
  import { MainMenuItemsKeys } from '../store/modules/mainMenuItems';

  export default {
    name: 'dy58-curr-journal-page',

    computed: {
      getMainMenuItemsKeys() {
        return MainMenuItemsKeys;
      },
    },

    mounted() {
      this.$store.commit('setActiveMainMenuItem', this.getMainMenuItemsKeys.currJournal);
    },
  }
</script>
