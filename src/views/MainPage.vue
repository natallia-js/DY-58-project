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
      <div v-if="isECD" class="p-mt-5">
        <div class="p-mb-2" style="color:white">Черновики документов</div>
        <Listbox
          v-model="state.selectedOrderDraft"
          :options="state.orderDrafts"
          optionLabel="createDateTime"
        >
          <template #option="slotProps">
            <div>
              <Button
                v-if="state.selectedOrderDraft && slotProps.option._id === state.selectedOrderDraft._id"
                icon="pi pi-file"
                class="p-button-success p-button-sm dy58-order-action-button p-mr-2"
                v-tooltip="'Редактировать'"
                @click="handleEditOrderDraft(slotProps.option._id, slotProps.option.type)"
              />
              <span>
                <span class="p-text-capitalize">{{ slotProps.option.type }}.</span>
                {{ slotProps.option.orderText.orderTitle || ''}}
                ({{ getLocaleDateTimeString(slotProps.option.createDateTime) }})
              </span>
            </div>
          </template>
        </Listbox>
      </div>
      <div class="p-mt-5">
        <AppSettings />
      </div>
    </div>
    <div class="p-col-9" style="flex:1;padding:0">
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
  import router from '@/router';
  import IncomingNotificationsDataTable from '@/components/IncomingNotificationsDataTable';
  import OrdersInWorkDataTable from '@/components/OrdersInWorkDataTable';
  import OrdersInWorkTree from '@/components/OrdersInWorkTree';
  import SideMenu from '@/components/SideMenu';
  import AppSettings from '@/components/AppSettings';
  import CreateDSPTakeDutyOrderDlg from '@/components/CreateOrders/CreateDSPTakeDutyOrderDlg';
  import showMessage from '@/hooks/showMessage.hook';
  import {
    SET_ACTIVE_MAIN_MENU_ITEM,
    SET_DELETE_ORDERS_CHAIN_RESULT_SEEN_BY_USER,
    SET_START_DATE_TO_GET_DATA_NO_CHECK,
    CLEAR_ALL_DELETE_ORDERS_CHAIN_RESULTS_SEEN_BY_USER,
  } from '@/store/mutation-types';
  import { MainMenuItemsKeys } from '@/store/modules/mainMenuItems';
  import { getLocaleDateTimeString } from '@/additional/dateTimeConvertions';


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
        selectedOrderDraft: null,
        orderDrafts: store.getters.getAllOrderDrafts,
      });

      watch(() => store.getters.getAllOrderDrafts, (newVal) => {
        state.orderDrafts = newVal;
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
      watch(() => store.getters.getDeleteOrdersChainsResultsUnseenByUserNumber, (newVal) => {
        if (newVal === 0) {
          return;
        }
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

      watch(() => store.getters.getAssertOrderError, (newVal) => {
        if (newVal) {
          showErrMessage(newVal);
        }
      });

      /**
       * Скрытие диалогового окна создания распоряжения о принятии дежурства ДСП.
       */
      const hidePreviewNewDSPCreateTakeDutyOrderDlg = () => {
        state.showCreateDSPTakeDutyOrderDlg = false;
      };

      /**
       *
       */
      const handleEditOrderDraft = (orderDraftId, orderType) => {
        router.push({
          name: 'NewOrderPage',
          params: {
            orderType: orderType,
            prevOrderId: null,
            orderDraftType: orderType,
            orderDraftId,
          },
        });
      };

      return {
        state,
        isECD: computed(() => store.getters.isECD),
        getLoadingWorkOrdersStatus: computed(() => store.getters.getLoadingWorkOrdersStatus),
        getWorkingOrdersNumber: computed(() => store.getters.getWorkingOrdersNumber),
        getErrorLoadingWorkOrders: computed(() => store.getters.getErrorLoadingWorkOrders),
        isDSP_or_DSPoperator: computed(() => store.getters.isDSP_or_DSPoperator),
        canUserDispatchDSPTakeDutyOrder: computed(() => store.getters.canUserDispatchDSPTakeDutyOrder),
        getExistingDSPTakeDutyOrder: computed(() => store.getters.getExistingDSPTakeDutyOrder),
        hidePreviewNewDSPCreateTakeDutyOrderDlg,
        handleEditOrderDraft,
        getLocaleDateTimeString,
      };
    },
  };
</script>


<style lang="scss" scoped>
  :deep(.p-listbox-list) {
    padding: 0 !important;
  }

  :deep(.p-listbox-item) {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
  }
</style>
