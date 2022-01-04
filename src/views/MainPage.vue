<template>
  <Toast />

  <ConfirmDialog style="max-width:700px"></ConfirmDialog>

  <div class="p-grid" style="margin:0">
    <div class="p-col-3 dy58-left-menu-panel">
      <Button v-if="isDSP" label="Warning" class="p-button-raised p-button-warning p-mb-2" style="width:100%" />
      <side-menu />
      <AppSettings />
    </div>
    <div class="p-col-9" style="flex:1">
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
              {{ isDSP_or_DSPoperator ? 'Документы' : 'Распоряжения' }} в работе
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
  import { computed, onMounted, reactive, watch } from 'vue';
  import { useStore } from 'vuex';
  import IncomingNotificationsDataTable from '@/components/IncomingNotificationsDataTable';
  import OrdersInWorkDataTable from '@/components/OrdersInWorkDataTable';
  import OrdersInWorkTree from '@/components/OrdersInWorkTree';
  import SideMenu from '@/components/SideMenu';
  import AppSettings from '@/components/AppSettings';
  import showMessage from '@/hooks/showMessage.hook';
  import {
    SET_CONFIRM_ORDER_RESULT_SEEN_BY_USER,
    SET_CONFIRM_ORDER_FOR_OTHERS_RESULT_SEEN_BY_USER,
    SET_ACTIVE_MAIN_MENU_ITEM,
    SET_DELETE_ORDERS_CHAIN_RESULT_SEEN_BY_USER,
    SET_START_DATE_TO_GET_DATA_NO_CHECK,
  } from '@/store/mutation-types';
  import { MainMenuItemsKeys } from '@/store/modules/mainMenuItems';

  export default {
    name: 'dy58-main-page',

    components: {
      SideMenu,
      IncomingNotificationsDataTable,
      OrdersInWorkDataTable,
      OrdersInWorkTree,
      AppSettings,
    },

    setup() {
      const store = useStore();
      const { showSuccessMessage, showErrMessage } = showMessage();

      const state = reactive({
        startDateToGetData: new Date(),
      });

      watch(() => state.startDateToGetData, (newVal) => {
        store.commit(SET_START_DATE_TO_GET_DATA_NO_CHECK, newVal);
      });

      const getStartDateToGetData = computed(() => store.getters.getStartDateToGetData);
      watch(getStartDateToGetData, (newVal) => {
        state.startDateToGetData = newVal;
      });

      watch(() => store.getters.getDeleteOrdersChainsResultsUnseenByUser, (newVal) => {
        newVal.forEach((result) => {
          if (result.error) {
            showErrMessage(result.message);
          } else {
            showSuccessMessage(result.message);
          }
          store.commit(SET_DELETE_ORDERS_CHAIN_RESULT_SEEN_BY_USER, result.chainId);
        });
      });

      watch(() => store.getters.getConfirmOrdersResultsUnseenByUser, (newVal) => {
        newVal.forEach((result) => {
          if (result.error) {
            showErrMessage(result.message);
          } else {
            showSuccessMessage(result.message);
          }
          store.commit(SET_CONFIRM_ORDER_RESULT_SEEN_BY_USER, result.orderId);
        });
      });

      watch(() => store.getters.getConfirmOrdersForOthersResultsUnseenByUser, (newVal) => {
        newVal.forEach((result) => {
          if (result.error) {
            showErrMessage(result.message);
          } else {
            showSuccessMessage(result.message);
          }
          store.commit(SET_CONFIRM_ORDER_FOR_OTHERS_RESULT_SEEN_BY_USER, result.orderId);
        });
      });

      onMounted(() => {
        store.commit(SET_ACTIVE_MAIN_MENU_ITEM, MainMenuItemsKeys.mainPage);
        state.startDateToGetData = getStartDateToGetData.value;
      });

      return {
        state,
        getStartDateToGetData,
        getLoadingWorkOrdersStatus: computed(() => store.getters.getLoadingWorkOrdersStatus),
        getWorkingOrdersNumber: computed(() => store.getters.getWorkingOrdersNumber),
        getErrorLoadingWorkOrders: computed(() => store.getters.getErrorLoadingWorkOrders),
        isDSP: computed(() => store.getters.isDSP),
        isDSP_or_DSPoperator: computed(() => store.getters.isDSP_or_DSPoperator),
      };
    },
  };
</script>
