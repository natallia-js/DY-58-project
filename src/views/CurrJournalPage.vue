<template>
  <div class="p-ml-4">
    <h2 class="p-text-center p-mt-3 p-mb-3">Текущий журнал</h2>
  </div>
</template>


<script>
  import { MainMenuItemsKeys } from '@/store/modules/mainMenuItems';
  import { SET_ACTIVE_MAIN_MENU_ITEM } from '@/store/mutation-types';

  export default {
    name: 'dy58-curr-journal-page',

    computed: {
      getMainMenuItemsKeys() {
        return MainMenuItemsKeys;
      },
    },

    mounted() {
      this.$store.commit(SET_ACTIVE_MAIN_MENU_ITEM, this.getMainMenuItemsKeys.currJournal);
    },
  }
</script>
