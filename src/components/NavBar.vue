<template>
  <ShowUserDataDlg :showDlg="showUserDataDlg" @close="hideUserInfo"></ShowUserDataDlg>
  <Menubar :model="getMainMenuItems">
    <template #end>
      <Button
        :label="`${getUserPost} ${getUserFIO} ${getUserWorkPoligonName(false)}`"
        icon="pi pi-user"
        @click="showUserInfo"
        v-tooltip.bottom="'Просмотреть информацию о текущем пользователе'"
        style="width:100%;height:100%"
        :class="{
          'p-button-raised': true,
          'p-button-danger': ifUserWorksOffline,
          'p-button-secondary': !ifUserWorksOffline && isUserOnDuty,
          'p-button-warning': !ifUserWorksOffline && !isUserOnDuty,
          'dy58-blinking-button': ifUserWorksOffline && isWebSocketConnectionActive,
        }"
      />
    </template>
  </Menubar>
</template>


<script>
  import { mapGetters } from 'vuex';
  import ShowUserDataDlg from '@/components/ShowUserDataDlg.vue';

  export default {
    name: 'dy58-nav-bar',

    data() {
      return {
        showUserDataDlg: false,
      };
    },

    components: {
      ShowUserDataDlg,
    },

    computed: mapGetters([
      'getMainMenuItems',
      'getUserWorkPoligonName',
      'getUserPost',
      'getUserFIO',
      'isUserOnDuty',
      'ifUserWorksOffline',
      'isWebSocketConnectionActive',
    ]),

    methods: {
      showUserInfo() {
        this.showUserDataDlg = true;
      },

      hideUserInfo() {
        this.showUserDataDlg = false;
      },
    },
  };
</script>


<style lang="scss" scoped>
  /* Нужно для того, чтобы выпадающее меню о выходе из системы было поверх всего, а не под таблицей */
  .p-menubar :deep(.p-submenu-list) {
    z-index: 999999;
  }

  :deep(.p-menubar-root-list) {
    align-items: stretch !important;
  }

  :deep(.p-menuitem-link) {
    height: 100% !important;
  }
</style>
