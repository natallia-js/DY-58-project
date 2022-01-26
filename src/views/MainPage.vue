<template>
  <Toast />

  <!-- Этот ConfirmDialog нужен для вложенных компонентов -->
  <ConfirmDialog style="max-width:700px"></ConfirmDialog>

  <CreateDSPTakeDutyOrderDlg
    :showDlg="state.showCreateDSPTakeDutyOrderDlg"
    :editExistingTakeDutyOrder="state.editExistingTakeDutyOrder"
    @close="hidePreviewNewDSPCreateTakeDutyOrderDlg"
  />

  <div class="p-grid" style="margin:0">
    <div class="p-col-3 dy58-left-menu-panel">
      <!-- Данная кнопка - ТОЛЬКО ДЛЯ ДСП и ТОЛЬКО ЕСЛИ ОН НА ДЕЖУРСТВЕ. Проверяем:
      // если в списке рабочих распоряжений отсутствует распоряжение о принятии держурства,
      // изданное ЭТИМ же пользователем не ранее времени его последнего принятия дежурства, то
      // необходимо предупредить об этом пользователя и предложить ему издать такое распоряжение-->
      <Button
        v-if="canUserDispatchDSPTakeDutyOrder"
        label="Запись о приеме/сдаче дежурства"
        class="p-button-raised p-button-warning p-mb-2"
        style="width:100%"
        @click="() => { state.editExistingTakeDutyOrder = false; state.showCreateDSPTakeDutyOrderDlg = true; }"
      />
      <Button
        v-if="getExistingDSPTakeDutyOrder && canUserDispatchDSPTakeDutyOrder"
        label="Редактировать текущую запись о приеме/сдаче дежурства"
        class="p-button-raised p-button-secondary p-mb-2"
        style="width:100%"
        @click="() => { state.editExistingTakeDutyOrder = true; state.showCreateDSPTakeDutyOrderDlg = true; }"
      />
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
  import { computed, reactive, watch } from 'vue';
  import { useStore } from 'vuex';
  import IncomingNotificationsDataTable from '@/components/IncomingNotificationsDataTable';
  import OrdersInWorkDataTable from '@/components/OrdersInWorkDataTable';
  import OrdersInWorkTree from '@/components/OrdersInWorkTree';
  import SideMenu from '@/components/SideMenu';
  import AppSettings from '@/components/AppSettings';
  import CreateDSPTakeDutyOrderDlg from '@/components/CreateOrders/CreateDSPTakeDutyOrderDlg';
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
      CreateDSPTakeDutyOrderDlg,
    },

    setup() {
      const store = useStore();
      const { showSuccessMessage, showErrMessage } = showMessage();

      const state = reactive({
        startDateToGetData: store.getters.getStartDateToGetData || new Date(),
        showCreateDSPTakeDutyOrderDlg: false,
        editExistingTakeDutyOrder: false,
      });

      store.commit(SET_ACTIVE_MAIN_MENU_ITEM, MainMenuItemsKeys.mainPage);

      watch(() => state.startDateToGetData, (newVal) => {
        store.commit(SET_START_DATE_TO_GET_DATA_NO_CHECK, newVal);
      });

      watch(() => store.getters.getStartDateToGetData, (newVal) => {
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

      /**
       * Скрытие диалогового окна создания распоряжения о принятии дежурства ДСП.
       */
      const hidePreviewNewDSPCreateTakeDutyOrderDlg = () => {
        state.showCreateDSPTakeDutyOrderDlg = false;
      };

      return {
        state,
        getLoadingWorkOrdersStatus: computed(() => store.getters.getLoadingWorkOrdersStatus),
        getWorkingOrdersNumber: computed(() => store.getters.getWorkingOrdersNumber),
        getErrorLoadingWorkOrders: computed(() => store.getters.getErrorLoadingWorkOrders),
        isDSP_or_DSPoperator: computed(() => store.getters.isDSP_or_DSPoperator),
        canUserDispatchDSPTakeDutyOrder: computed(() => store.getters.canUserDispatchDSPTakeDutyOrder),
        getExistingDSPTakeDutyOrder: computed(() => store.getters.getExistingDSPTakeDutyOrder),
        hidePreviewNewDSPCreateTakeDutyOrderDlg,
      };
    },
  };
</script>
