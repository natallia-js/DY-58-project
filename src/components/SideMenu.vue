<template>
  <CreateDSPTakeDutyOrderDlg
    :showDlg="showCreateDSPTakeDutyOrderDlg"
    @close="hidePreviewNewDSPCreateTakeDutyOrderDlg"
  />

  <ConfirmPopup group="confirmDelOrderDraft"></ConfirmPopup>

  <OverlayPanel
    ref="appSettingsOverlayPanel"
    appendTo="body"
    :showCloseIcon="true"
    id="app-settings-overlay_panel"
    style="width:400px"
    :breakpoints="{'960px':'75vw'}"
  >
    <AppSettings />
  </OverlayPanel>

  <ContextMenu ref="submenu" :model="submenuItems" />

  <OverlayPanel
    ref="orderDraftsOverlayPanel"
    appendTo="body"
    :showCloseIcon="true"
    id="order-drafts-overlay_panel"
    :breakpoints="{'960px':'75vw'}"
  >
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
  </OverlayPanel>

  <MegaMenu :model="getLeftMenuItems" orientation="vertical">
    <template #item="{item}">
      <div v-if="item.command" class="dy58-img-style" style="display:inline-block;">
        <img
          :src="item.imgURL"
          style="display:block;width:100%;"
          class="dy58-command-item"
          v-tooltip="item.label"
          @click="handlePerformItemCommand($event, item)"
        />
      </div>
      <img v-else :src="item.imgURL" v-tooltip="item.label" class="dy58-img-style" />
      <Badge v-if="item.error" severity="danger" value="!" v-tooltip="item.error" class="dy58-img-tag"></Badge>
      <Badge v-else-if="item.info" :value="item.info" class="dy58-img-tag"></Badge>
      <Badge v-else-if="item.dangerInfo" severity="danger" :value="item.dangerInfo" class="dy58-img-tag"></Badge>
      <i v-else-if="item.icon" :class="item.icon" class="dy58-img-tag" />
    </template>
  </MegaMenu>
</template>


<script>
  import { computed, reactive, ref, watch } from 'vue';
  import { useStore } from 'vuex';
  import { useRouter } from 'vue-router';
  import { useConfirm } from 'primevue/useconfirm';
  import AppSettings from '@/components/AppSettings';
  import CreateDSPTakeDutyOrderDlg from '@/components/CreateOrders/CreateDSPTakeDutyOrderDlg';
  import { SET_SHOW_CREATE_DSP_TAKE_DUTY_ORDER_DLG } from '@/store/mutation-types';
  import { DEL_ORDER_DRAFT_ACTION } from '@/store/action-types';
  import showMessage from '@/hooks/showMessage.hook';

  export default {
    name: 'dy58-side-menu2',

    components: {
      AppSettings,
      CreateDSPTakeDutyOrderDlg,
    },

    setup() {
      const store = useStore();
      const router = useRouter();
      const confirm = useConfirm();
      const { showSuccessMessage, showErrMessage } = showMessage();
      const appSettingsOverlayPanel = ref();
      const orderDraftsOverlayPanel = ref();
      // Для отображения подпунктов меню создания распоряжения о поезде ПВ / ПД / ПВПД
      const submenuItems = ref([]);
      const submenu = ref();

      const state = reactive({
        selectedOrderDraft: null,
        orderDrafts: store.getters.getGroupedOrderDrafts,
      });

      watch(() => store.getters.getAllOrderDrafts, () => {
        state.orderDrafts = store.getters.getGroupedOrderDrafts;
      });

      watch(() => store.getters.appSettingsVisible, () => {
        appSettingsOverlayPanel.value.toggle(store.getters.appSettingsTarget);
      });

      watch(() => store.getters.orderDraftsPanelVisible, () => {
        orderDraftsOverlayPanel.value.toggle(store.getters.orderDraftsPanelTarget);
      });

      /**
       * Обработка запроса на редактирование черновика распоряжения
       */
      const handleEditOrderDraft = (orderDraftId, orderType) => {
        router.push({
          name: 'NewOrderPage',
          params: {
            orderType: orderType,
            orderPatternSpecialSign: null,
            prevOrderId: null,
            orderDraftId,
          },
        });
      };

      /**
       * Обработка запроса на удаление черновика распоряжения
       */
      const handleDelOrderDraft = (event, orderDraftId, orderType) => {
        if (!orderDraftId) {
          return;
        }
        confirm.require({
          target: event.currentTarget,
          group: 'confirmDelOrderDraft',
          message: 'Удалить черновик документа?',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            store.dispatch(DEL_ORDER_DRAFT_ACTION, {
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

      /**
       * Скрытие диалогового окна создания распоряжения о принятии дежурства ДСП.
       */
      const hidePreviewNewDSPCreateTakeDutyOrderDlg = () => {
        store.commit(SET_SHOW_CREATE_DSP_TAKE_DUTY_ORDER_DLG, false);
      };

      /**
       * Обработка нажатия на кнопку бокового меню.
       */
      const handlePerformItemCommand = (event, item) => {
        if (item && item.command) {
          const result = item.command(event);
          // Если массив, то необходимо отобразить подпункты меню
          if (result instanceof Array) {
            submenuItems.value = [...result];
            submenu.value.show(event);
          }
        }
      };

      return {
        state,
        submenuItems,
        getLeftMenuItems: computed(() => store.getters.getLeftMenuItems),
        showCreateDSPTakeDutyOrderDlg: computed(() => store.getters.showCreateDSPTakeDutyOrderDlg),
        getIdsOfDraftsBeingDeleted: computed(() => store.getters.getIdsOfDraftsBeingDeleted),
        appSettingsOverlayPanel,
        orderDraftsOverlayPanel,
        submenu,
        handleEditOrderDraft,
        handleDelOrderDraft,
        hidePreviewNewDSPCreateTakeDutyOrderDlg,
        handlePerformItemCommand,
      };
    },
  };
</script>


<style lang="scss" scoped>
  .p-megamenu {
    border-radius: 0;
    background-color: #424b5f;
  }

  .p-megamenu.p-megamenu-vertical {
    width: 4rem;
  }

  :deep(.p-menuitem) {
    text-align: center;
    margin: 0.8rem 0;
    position: relative;
  }

  .dy58-img-style {
    width: 2rem !important;
    height: auto !important;
  }

  .dy58-img-tag {
    position: absolute;
    bottom: 0;
    right: 5px;
  }

  .p-badge {
    padding: 0;
  }

  .dy58-command-item {
    transition: all 0.2s linear;
    cursor: pointer;
  }

  .dy58-command-item:hover {
    transform: scale(1.4);
  }

  :deep(.p-listbox-list) {
    padding: 0 !important;
    max-width: 400px !important;
    max-height: 600px !important;
    overflow-y: scroll;
  }

  :deep(.p-listbox-item-group) {
    background: var(--surface-b) !important;
  }

  :deep(.p-listbox-item) {
    padding-left: 0.5rem !important;
    padding-right: 0.5rem !important;
  }

  .dy58-submenu-item {
    text-align: center;
    cursor: pointer;
  }

  .dy58-submenu-item:hover {
    transform: scale(1.2);
  }
</style>
