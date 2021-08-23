<template>
  <ShowUserDataDlg :showDlg="showUserDataDlg" @close="hideUserInfo"></ShowUserDataDlg>
  <div class="p-grid">
    <div class="p-col-3">
      <div class="dy58-date-user-block p-p-3 p-d-flex p-jc-center p-ai-center p-flex-wrap">
        <p class="dy58-text-big p-m-2 p-text-center">{{ getCurrDateTimeString }}</p>
        <Button
          :label="getUserPostFIO"
          icon="pi pi-user"
          class="p-button-info"
          @click="showUserInfo"
          v-tooltip.bottom="'Просмотреть информацию о текущем пользователе'"
        />
      </div>
      <side-menu />
    </div>
    <div class="p-col-9">
      <div class="p-mt-3">
        <Button
          type="button"
          label="Создать"
          class="p-mr-2"
          v-tooltip.bottom="'Создать новое распоряжение'"
          @click="createNewOrder"
        />
        <Button
          type="button"
          label="Открыть / закрыть перегон"
          class="p-mr-2"
          v-if="userIs_DNC()"
          v-tooltip.bottom="'Создать распоряжение на открытие / закрытие перегона'"
        />
        <Button
          type="button"
          label="Циркулярное распоряжение"
          class="p-mr-2"
          v-if="userIs_DNC_or_ECD()"
          v-tooltip.bottom="'Создать циркулярное распоряжение'"
        />
      </div>
      <br>
      <!-- Таблица входящих уведомлений -->
      <IncomingNotificationsDataTable />
      <br>
      <!-- Таблица распоряжений в работе -->
      <OrdersInWorkDataTable />
    </div>
  </div>
</template>


<script>
  import SideMenu from '../components/SideMenu.vue';
  import { mapGetters } from 'vuex';
  import { MainMenuItemsKeys } from '../store/modules/mainMenuItems';
  import IncomingNotificationsDataTable from '../components/IncomingNotificationsDataTable';
  import ShowUserDataDlg from '../components/ShowUserDataDlg';
  import OrdersInWorkDataTable from '../components/OrdersInWorkDataTable';
  import { APP_CREDENTIALS } from '../constants/appCredentials';

  export default {
    name: 'dy58-main-page',

    data() {
      return {
        showUserDataDlg: false,
      };
    },

    components: {
      SideMenu,
      IncomingNotificationsDataTable,
      OrdersInWorkDataTable,
      ShowUserDataDlg,
    },

    computed: {
      ...mapGetters([
        'getCurrDateTimeString',
        'getUserPostFIO',
        'getUserCredential',
      ]),

      getMainMenuItemsKeys() {
        return MainMenuItemsKeys;
      },
    },

    mounted() {
      this.$store.commit('setActiveMainMenuItem', this.getMainMenuItemsKeys.mainPage);
    },

    methods: {
      userIs_DNC_or_ECD() {
        return this.getUserCredential === APP_CREDENTIALS.DNC_FULL ||
               this.getUserCredential === APP_CREDENTIALS.ECD_FULL;
      },

      userIs_DNC() {
        return this.getUserCredential === APP_CREDENTIALS.DNC_FULL;
      },

      showUserInfo() {
        this.showUserDataDlg = true;
      },

      hideUserInfo() {
        this.showUserDataDlg = false;
      },

      createNewOrder() {
        //if (isAuthenticated) {
          //this.$router.push('/dashboard')
        //} else {
          this.$router.push('/newOrderPage');
        //}
      },
    },
  };
</script>


<style lang="scss" scoped>
  .dy58-date-user-block {
    background-color: var(--dy58-tbl-header-bg-color);
  }
</style>
