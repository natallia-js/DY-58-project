<template>
  <ShowUserDataDlg :showDlg="showUserDataDlg" @close="hideUserInfo"></ShowUserDataDlg>
  <div class="p-grid" style="margin:0">
    <div class="p-col-3 dy58-left-menu-panel">
      <div class="dy58-date-user-block p-p-3 p-d-flex p-jc-center p-ai-center p-flex-wrap">
        <p class="dy58-text-big p-m-2 p-text-center p-text-bold" style="width:100%">
          {{ getCurrDateTimeString }}
        </p>
        <Button
          :label="getUserPostFIO"
          icon="pi pi-user"
          @click="showUserInfo"
          v-tooltip.bottom="'Просмотреть информацию о текущем пользователе'"
          style="width:100%;"
          class="dy58-curr-user-button"
        />
      </div>
      <side-menu />
    </div>
    <div class="p-col-9" style="flex:1">
      <!--
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
      -->
      <div class="p-d-flex p-flex-column">
        <div>
          <!-- Таблица входящих уведомлений -->
          <IncomingNotificationsDataTable />
        </div>
        <br>
        <!-- Информация о распоряжениях в работе -->
        <div class="p-datatable-header dy58-work-orders-tabview p-pt-3">
          <div class="dy58-table-title p-pb-2">
            <div class="p-mb-2">
              <i v-if="getLoadingWorkOrdersStatus" class="pi pi-spin pi-spinner"></i>
              {{ isDSP ? 'Документы' : 'Распоряжения' }} в работе
              <Badge :value="getWorkingOrdersNumber"></Badge>
            </div>
            <div class="dy58-table-comment">
              извлекаются цепочки распоряжений, действовавшие с
              <Calendar
                v-model="startDateToGetData"
                :showTime="true"
                :showIcon="true"
                :manualInput="false"
              />
              по настоящее время
            </div>
            <div class="dy58-table-comment">
              (изменение времени запроса информации будет применено при очередном обновлении данных)
            </div>
            <p v-if="getErrorLoadingWorkOrders" style="color:red;fontSize:1rem;fontWeight:500">
              {{ getErrorLoadingWorkOrders }}
            </p>
          </div>
        </div>
        <TabView class="dy58-work-orders-tabview">
          <TabPanel header="Табличный вид">
            <!-- Таблица распоряжений в работе -->
            <orders-in-work-data-table />
          </TabPanel>
          <TabPanel header="В виде дерева">
            <!-- Дерево распоряжений в работе -->
            <orders-in-work-tree />
          </TabPanel>
        </TabView>
      </div>
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
  import OrdersInWorkTree from '@/components/OrdersInWorkTree.vue';

  export default {
    name: 'dy58-main-page',

    data() {
      return {
        showUserDataDlg: false,
        startDateToGetData: new Date(),
      };
    },

    components: {
      SideMenu,
      IncomingNotificationsDataTable,
      OrdersInWorkDataTable,
      ShowUserDataDlg,
      OrdersInWorkTree,
    },

    computed: {
      ...mapGetters([
        'getCurrDateTimeString',
        'getUserPostFIO',
        'getUserCredential',
        'getStartDateToGetData',
        'getLoadingWorkOrdersStatus',
        'getWorkingOrdersNumber',
        'getErrorLoadingWorkOrders',
        'isDSP',
      ]),

      getMainMenuItemsKeys() {
        return MainMenuItemsKeys;
      },
    },

    watch: {
      startDateToGetData(newVal) {
        this.$store.commit('setStartDateToGetDataNoCheck', newVal);
      },

      getStartDateToGetData(newVal) {
        this.startDateToGetData = newVal;
      },
    },

    mounted() {
      this.$store.commit('setActiveMainMenuItem', this.getMainMenuItemsKeys.mainPage);
      this.startDateToGetData = this.getStartDateToGetData;
    },

    methods: {
      showUserInfo() {
        this.showUserDataDlg = true;
      },

      hideUserInfo() {
        this.showUserDataDlg = false;
      },

/*
      createNewOrder() {
        //if (isAuthenticated) {
          //this.$router.push('/dashboard')
        //} else {
          this.$router.push('/newOrderPage');
        //}
      },
    */
    },
  };
</script>


<style lang="scss" scoped>
</style>
