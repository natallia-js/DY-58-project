<template>
  <Toast />

  <ConfirmDialog style="max-width:700px"></ConfirmDialog>

  <div class="p-grid" style="margin:0">
    <div class="p-col-3 dy58-left-menu-panel">
      <Button v-if="isDSP" label="Warning" class="p-button-raised p-button-warning p-mb-2" style="width:100%" />
      <side-menu />
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
  import SideMenu from '../components/SideMenu.vue';
  import { computed, onMounted, reactive, watch } from 'vue';
  import { MainMenuItemsKeys } from '../store/modules/mainMenuItems';
  import IncomingNotificationsDataTable from '../components/IncomingNotificationsDataTable';
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
      OrdersInWorkTree,
    },

    setup() {
      const store = useStore();
      const { showSuccessMessage, showErrMessage } = showMessage();

      const state = reactive({
        startDateToGetData: new Date(),
      });

      const getCurrDateTimeString = computed(() => store.getters.getCurrDateTimeString);

      const getLoadingWorkOrdersStatus = computed(() => store.getters.getLoadingWorkOrdersStatus);
      const getWorkingOrdersNumber = computed(() => store.getters.getWorkingOrdersNumber);
      const getErrorLoadingWorkOrders = computed(() => store.getters.getErrorLoadingWorkOrders);

      const isDSP_or_DSPoperator = computed(() => store.getters.isDSP_or_DSPoperator);
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

      const confirmIncomingOrdersResults = computed(() => store.getters.getConfirmOrdersResultsUnseenByUser);
      watch(confirmIncomingOrdersResults, (newVal) => {
        newVal.forEach((result) => {
          if (result.error) {
            showErrMessage(result.message);
          } else {
            showSuccessMessage(result.message);
          }
          store.commit('setConfirmOrderResultSeenByUser', result.orderId);
        });
      });

      const confirmIncomingOrdersForOthersResults = computed(() => store.getters.getConfirmOrdersForOthersResultsUnseenByUser);
      watch(confirmIncomingOrdersForOthersResults, (newVal) => {
        newVal.forEach((result) => {
          if (result.error) {
            showErrMessage(result.message);
          } else {
            showSuccessMessage(result.message);
          }
          store.commit('setConfirmOrderForOthersResultSeenByUser', result.orderId);
        });
      });

      onMounted(() => {
        store.commit('setActiveMainMenuItem', getMainMenuItemsKeys.value.mainPage);
        state.startDateToGetData = getStartDateToGetData.value;
      });

      return {
        state,
        getCurrDateTimeString,
        getStartDateToGetData,
        getLoadingWorkOrdersStatus,
        getWorkingOrdersNumber,
        getErrorLoadingWorkOrders,
        isDSP_or_DSPoperator,
        getMainMenuItemsKeys,
      };
    },
  };
</script>
