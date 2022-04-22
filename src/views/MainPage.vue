<template>
  <Toast />

  <!-- Этот ConfirmDialog нужен для вложенных компонентов -->
  <ConfirmDialog style="max-width:700px"></ConfirmDialog>

  <div class="p-grid" style="margin:0;">
    <side-menu/>

    <div class="p-col-9" style="flex:1;padding:0;">
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
              Документы в работе
            </div>
            <div class="dy58-table-comment">
              извлекаются цепочки документов, действовавшие с
              <Calendar
                v-model="state.startDateToGetData"
                :showTime="true"
                :showIcon="true"
                :manualInput="false"
              >
                <template #footer>
                  <Button @click="state.startDateToGetData = new Date()" class="p-mb-2 p-ml-2">
                    Текущее время
                  </Button>
                </template>
              </Calendar>
              по настоящее время
            </div>
            <p v-if="getErrorLoadingWorkOrders" class="dy58-bold-error-message">
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
  import { computed, reactive, watch } from 'vue';
  import { useStore } from 'vuex';
  import IncomingNotificationsDataTable from '@/components/IncomingNotificationsDataTable';
  import OrdersInWorkDataTable from '@/components/OrdersInWorkDataTable';
  import OrdersInWorkTree from '@/components/OrdersInWorkTree';
  import SideMenu from '@/components/SideMenu';
  import showMessage from '@/hooks/showMessage.hook';
  import {
    SET_ACTIVE_MAIN_MENU_ITEM,
    SET_DELETE_ORDERS_CHAIN_RESULT_SEEN_BY_USER,
    SET_START_DATE_TO_GET_DATA_NO_CHECK,
    CLEAR_ALL_DELETE_ORDERS_CHAIN_RESULTS_SEEN_BY_USER,
  } from '@/store/mutation-types';
  import { MainMenuItemsKeys } from '@/store/modules/mainMenuItems';


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
        startDateToGetData: store.getters.getStartDateToGetData || new Date(),
      });

      store.commit(SET_ACTIVE_MAIN_MENU_ITEM, MainMenuItemsKeys.mainPage);

      watch(() => state.startDateToGetData, (newVal) => {
        store.commit(SET_START_DATE_TO_GET_DATA_NO_CHECK, newVal);
      });

      watch(() => store.getters.getStartDateToGetData, (newVal) => {
        state.startDateToGetData = newVal;
      });

      /**
       * Отображение результатов удаления цепочек распоряжений.
       * Этот код именно здесь, т.к. удаление цепочек распоряжений может производиться из нескольких мест
       * (компонентов), размещенных на этой странице.
       */
      watch(() => store.getters.getDeleteOrdersChainsResultsUnseenByUserNumber, () => {
        const seenChainIdsResults = [];
        store.getters.getDeleteOrdersChainsResultsUnseenByUser.forEach((result) => {
          if (result.error) {
            showErrMessage(result.message);
          } else {
            showSuccessMessage(result.message);
          }
          seenChainIdsResults.push(result.chainId);
        });
        store.commit(SET_DELETE_ORDERS_CHAIN_RESULT_SEEN_BY_USER, seenChainIdsResults);
        store.commit(CLEAR_ALL_DELETE_ORDERS_CHAIN_RESULTS_SEEN_BY_USER);
      });

      return {
        state,
        isECD: computed(() => store.getters.isECD),
        getLoadingWorkOrdersStatus: computed(() => store.getters.getLoadingWorkOrdersStatus),
        getErrorLoadingWorkOrders: computed(() => store.getters.getErrorLoadingWorkOrders),
        canUserDispatchDSPTakeDutyOrder: computed(() => store.getters.canUserDispatchDSPTakeDutyOrder),
        getExistingDSPTakeDutyOrder: computed(() => store.getters.getExistingDSPTakeDutyOrder),
      };
    },
  };
</script>
