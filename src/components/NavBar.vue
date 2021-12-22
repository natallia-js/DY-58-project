<template>
  <ShowUserDataDlg :showDlg="showUserDataDlg" @close="hideUserInfo"></ShowUserDataDlg>

  <Menubar :model="getMainMenuItems">
    <template #end>
      <Button
        :label="`${getUserPost} ${getUserWorkPoligonName} ${getUserFIO}`"
        icon="pi pi-user"
        @click="showUserInfo"
        v-tooltip.bottom="'Просмотреть информацию о текущем пользователе'"
        style="width:100%;height:100%"
        class="p-button-raised p-button-secondary"
      />
    </template>
  </Menubar>
</template>


<script>
  import { mapGetters } from 'vuex';
  import ShowUserDataDlg from '../components/ShowUserDataDlg.vue';

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
  .p-menubar :deep(.p-submenu-list) {
    z-index: 999999;
  }

 /* .p-menubar :deep(.p-menubar-end) {
    align-self: stretch;
  }*/
</style>
