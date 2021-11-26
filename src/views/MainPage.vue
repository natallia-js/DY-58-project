<template>
  <Toast />

  <ShowUserDataDlg :showDlg="state.showUserDataDlg" @close="hideUserInfo"></ShowUserDataDlg>

  <ConfirmDialog style="max-width:700px"></ConfirmDialog>

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
                v-model="state.startDateToGetData"
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
  import { computed, onMounted, reactive, watch } from 'vue';
  import { MainMenuItemsKeys } from '../store/modules/mainMenuItems';
  import IncomingNotificationsDataTable from '../components/IncomingNotificationsDataTable';
  import ShowUserDataDlg from '../components/ShowUserDataDlg';
  import OrdersInWorkDataTable from '../components/OrdersInWorkDataTable';
  import OrdersInWorkTree from '@/components/OrdersInWorkTree.vue';
  import showMessage from '../hooks/showMessage.hook';
  import { useStore } from 'vuex';

  export default {
    name: 'dy58-main-page',

    components: {
      SideMenu,
      IncomingNotificationsDataTable,
      OrdersInWorkDataTable,
      ShowUserDataDlg,
      OrdersInWorkTree,
    },

    setup() {
      const store = useStore();
      const { showSuccessMessage, showErrMessage } = showMessage();

      const state = reactive({
        showUserDataDlg: false,
        startDateToGetData: new Date(),
      });

      const getCurrDateTimeString = computed(() => store.getters.getCurrDateTimeString);
      const getUserPostFIO = computed(() => store.getters.getUserPostFIO);
      const getUserCredential = computed(() => store.getters.getUserCredential);
      const getLoadingWorkOrdersStatus = computed(() => store.getters.getLoadingWorkOrdersStatus);
      const getWorkingOrdersNumber = computed(() => store.getters.getWorkingOrdersNumber);
      const getErrorLoadingWorkOrders = computed(() => store.getters.getErrorLoadingWorkOrders);
      const isDSP = computed(() => store.getters.isDSP);
      const getMainMenuItemsKeys = computed(() => MainMenuItemsKeys);

      const changedStartDateToGetData = computed(() => state.startDateToGetData);
      watch(changedStartDateToGetData, (newVal) => {
        store.commit('setStartDateToGetDataNoCheck', newVal);
      });

      const getStartDateToGetData = computed(() => store.getters.getStartDateToGetData);
      watch(getStartDateToGetData, (newVal) => {
        state.startDateToGetData = newVal;
      });

      const deleteOrdersChainsResults = computed(() => store.getters.getDeleteOrdersChainsResultsUnseenByUser);
      watch(deleteOrdersChainsResults, (newVal) => {
        newVal.forEach((result) => {
          if (result.error) {
            showErrMessage(result.message);
          } else {
            showSuccessMessage(result.message);
          }
          store.commit('setDeleteOrdersChainResultSeenByUser', result.chainId);
        });
      });

      onMounted(() => {
        store.commit('setActiveMainMenuItem', getMainMenuItemsKeys.value.mainPage);
        state.startDateToGetData = getStartDateToGetData.value;
      });

      const showUserInfo = () => {
        state.showUserDataDlg = true;
      };

      const hideUserInfo = () => {
        state.showUserDataDlg = false;
      };

      return {
        state,
        getCurrDateTimeString,
        getUserPostFIO,
        getUserCredential,
        getStartDateToGetData,
        getLoadingWorkOrdersStatus,
        getWorkingOrdersNumber,
        getErrorLoadingWorkOrders,
        isDSP,
        getMainMenuItemsKeys,
        showUserInfo,
        hideUserInfo,
      };
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
  };
</script>
