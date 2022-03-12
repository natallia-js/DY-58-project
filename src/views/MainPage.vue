<template>
  <Toast />

  <!-- Этот ConfirmDialog нужен для вложенных компонентов -->
  <ConfirmDialog style="max-width:700px"></ConfirmDialog>

  <ConfirmPopup group="confirmDelOrderDraft"></ConfirmPopup>

  <CreateDSPTakeDutyOrderDlg
    :showDlg="state.showCreateDSPTakeDutyOrderDlg"
    :editExistingTakeDutyOrder="state.editExistingTakeDutyOrder"
    @close="hidePreviewNewDSPCreateTakeDutyOrderDlg"
  />

  <div class="p-grid" style="margin:0;">
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
          optionGroupLabel="label"
          optionGroupChildren="items"
        >
          <template #optiongroup="slotProps">
            <div class="p-text-capitalize">
              {{ slotProps.option.label }}
            </div>
          </template>
          <template #option="slotProps">
            <i v-if="getIdsOfDraftsBeingDeleted.includes(slotProps.option._id)"
              class="pi pi-spin pi-check-circle p-mr-2"
            ></i>
            <span v-else-if="state.selectedOrderDraft && slotProps.option._id === state.selectedOrderDraft._id"
              class="p-mr-2"
            >
              <Button
                icon="pi pi-file"
                class="p-button-success p-button-sm dy58-order-action-button p-mr-2"
                v-tooltip="'Редактировать'"
                @click="handleEditOrderDraft(slotProps.option._id, slotProps.option.type)"
              />
              <Button
                icon="pi pi-times"
                class="p-button-secondary p-button-sm dy58-order-action-button"
                v-tooltip="'Удалить'"
                @click="handleDelOrderDraft($event, slotProps.option._id, slotProps.option.type)"
              />
            </span>
            <span>
              {{ slotProps.option.displayTitle }}
            </span>
          </template>
        </Listbox>
      </div>
      <div class="p-mt-5">
        <AppSettings />
      </div>
    </div>
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
  import { useRouter } from 'vue-router';
  import { useConfirm } from 'primevue/useconfirm';
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
      const router = useRouter();
      const confirm = useConfirm();
      const { showSuccessMessage, showErrMessage } = showMessage();

      const state = reactive({
        startDateToGetData: store.getters.getStartDateToGetData || new Date(),
        showCreateDSPTakeDutyOrderDlg: false,
        editExistingTakeDutyOrder: false,
        selectedOrderDraft: null,
        orderDrafts: store.getters.getGroupedOrderDrafts,
      });

      watch(() => store.getters.getAllOrderDrafts, () => {
        state.orderDrafts = store.getters.getGroupedOrderDrafts;
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
            orderDraftId,
          },
        });
      };

      /**
       *
       */
      const handleDelOrderDraft = (event, orderDraftId, orderType) => {
        if (!orderDraftId) {
          return;
        }
        confirm.require({
          target: event.currentTarget,
          group: 'confirmDelOrderDraft',
          message: 'Удалить черновик распоряжения?',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            store.dispatch('delOrderDraft', {
              id: orderDraftId,
              type: orderType,
            });
          }
        });
      };

      /**
       * Для отображения результата операции удаления черновика распоряжения на сервере.
       */
      watch(() => store.getters.getDelOrderDraftResult, (newVal) => {
        if (!newVal) {
          return;
        }
        if (!newVal.error) {
          showSuccessMessage(newVal.message);
        } else {
          showErrMessage(newVal.message);
        }
      });

      return {
        state,
        isECD: computed(() => store.getters.isECD),
        getLoadingWorkOrdersStatus: computed(() => store.getters.getLoadingWorkOrdersStatus),
        getWorkingOrdersNumber: computed(() => store.getters.getWorkingOrdersNumber),
        getErrorLoadingWorkOrders: computed(() => store.getters.getErrorLoadingWorkOrders),
        isDSP_or_DSPoperator: computed(() => store.getters.isDSP_or_DSPoperator),
        canUserDispatchDSPTakeDutyOrder: computed(() => store.getters.canUserDispatchDSPTakeDutyOrder),
        getExistingDSPTakeDutyOrder: computed(() => store.getters.getExistingDSPTakeDutyOrder),
        getIdsOfDraftsBeingDeleted: computed(() => store.getters.getIdsOfDraftsBeingDeleted),
        hidePreviewNewDSPCreateTakeDutyOrderDlg,
        handleEditOrderDraft,
        handleDelOrderDraft,
      };
    },
  };
</script>


<style lang="scss" scoped>
  :deep(.p-listbox-list) {
    padding: 0 !important;
  }

  :deep(.p-listbox-item-group) {
    background: var(--surface-b) !important;
  }

  :deep(.p-listbox-item) {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
  }
</style>
