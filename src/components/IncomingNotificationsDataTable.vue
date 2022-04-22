<template>
  <div>
    <ShowIncomingOrderDlg
      :showDlg="state.showIncomingOrderDlg"
      dlgTitle="Информация о входящем уведомлении"
      :order="state.chosenOrder"
      :orderNeedsToBeConfirmed="true"
      :orderIsBeingConfirmed="state.chosenOrder && isOrderBeingConfirmed(state.chosenOrder.id) ? true : false"
      @close="hideOrderInfo"
    >
    </ShowIncomingOrderDlg>

    <DataTable
      :value="getIncomingOrders"
      class="p-datatable-gridlines"
      :rowHover="true"
      :scrollable="true" scrollHeight="200px"
      v-model:selection="state.chosenOrder" selectionMode="single" dataKey="id"
      @row-dblclick="showOrderInfo"
    >
      <template #header>
        <div class="dy58-table-title">
          <i v-if="getLoadingWorkOrdersStatus" class="pi pi-spin pi-spinner"></i>
          Входящие {{ isDSP_or_DSPoperator ? 'документы' : 'уведомления' }}
          <p v-if="getErrorLoadingWorkOrders" class="dy58-bold-error-message">
            {{ getErrorLoadingWorkOrders }}
          </p>
          <p v-if="getReportOnOrdersDeliveryResult && getReportOnOrdersDeliveryResult.error"
            class="dy58-bold-error-message">
            {{ getReportOnOrdersDeliveryResult.message }}
          </p>
        </div>
        <Button
          v-if="state.chosenOrder"
          label="Подробнее"
          @click="showOrderInfo"
          v-tooltip.bottom="`Просмотреть информацию о входящем ${isDSP_or_DSPoperator ? 'документе' : 'уведомлении'}`"
        />
      </template>

      <Column v-for="col of getInputMessTblColumns"
        :field="col.field"
        :header="col.title"
        :key="col.field"
        :style="{ minWidth: col.width, maxWidth: col.maxWidth, textAlign: col.align }"
        headerClass="dy58-table-header-cell-class"
        bodyClass="dy58-table-top-content-cell-class"
      >
        <template #body="slotProps">
          <div style="width:100%;height:100%">
            <span v-if="![getInputMessTblColumnsTitles.state, getInputMessTblColumnsTitles.orderText].includes(col.field)">
              {{ slotProps.data[col.field] }}
            </span>
            <span
              v-else-if="col.field === getInputMessTblColumnsTitles.orderText"
              v-html="slotProps.data[col.field]"
            ></span>
            <div
              v-else-if="col.field === getInputMessTblColumnsTitles.state"
              style="height:100%;display:flex;justify-content:center;align-items:center;"
            >
              <i v-if="isOrderBeingConfirmed(slotProps.data.id)" class="pi pi-spin pi-check-circle"></i>
              <img
                :src="slotProps.data[col.field] === WorkMessStates.cameRecently ? require('@/assets/img/hourglass_black.png') :
                      (slotProps.data[col.field] === WorkMessStates.cameLongAgo ? require('@/assets/img/hourglass_red.png') : '')"
                :alt="slotProps.data[col.field]"
                class="dy58-order-state-img-style"
              />
            </div>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>


<script>
  import { computed, reactive, watch } from 'vue';
  import { useStore } from 'vuex';
  import { WorkMessStates } from '@/constants/orders';
  import ShowIncomingOrderDlg from '@/components/ShowIncomingOrderDlg';
  import showMessage from '@/hooks/showMessage.hook';
  import {
    SET_CONFIRM_ORDER_RESULT_SEEN_BY_USER,
    CLEAR_ALL_CONFIRM_ORDERS_RESULTS_SEEN_BY_USER,
  } from '@/store/mutation-types';

  export default {
    name: 'dy58-incoming-notifications-data-table',

    components: {
      ShowIncomingOrderDlg,
    },

    setup() {
      const store = useStore();
      const { showSuccessMessage, showErrMessage } = showMessage();

      const state = reactive({
        showIncomingOrderDlg: false,
        chosenOrder: null,
      });

      const getIncomingOrders = computed(() => store.getters.getIncomingOrders);

      /**
       * Каждый раз при изменении списка входящих уведомлений смотрим, если в этом списке chosenOrder
       * (если он не null). Если нет, делаем chosenOrder = null.
       */
      watch(getIncomingOrders, (val) => {
        if (!state.chosenOrder) {
          return;
        }
        if (val && val.length) {
          if (!val.find((order) => order.id === state.chosenOrder.id)) {
            state.chosenOrder = null;
          }
        } else {
          state.chosenOrder = null;
        }
      });

      /**
       * Отображение результатов подтверждения распоряжений.
       */
      watch(() => store.getters.getConfirmOrdersResultsUnseenByUserNumber, () => {
        const seenOrderIdsResults = [];
        store.getters.getConfirmOrdersResultsUnseenByUser.forEach((result) => {
          if (result.error) {
            showErrMessage(result.message);
          } else {
            showSuccessMessage(result.message);
          }
          seenOrderIdsResults.push(result.orderId);
        });
        store.commit(SET_CONFIRM_ORDER_RESULT_SEEN_BY_USER, seenOrderIdsResults);
        store.commit(CLEAR_ALL_CONFIRM_ORDERS_RESULTS_SEEN_BY_USER);
      });

      const showOrderInfo = () => {
        state.showIncomingOrderDlg = true;
      };

      const hideOrderInfo = () => {
        state.showIncomingOrderDlg = false;
      };

      return {
        state,
        WorkMessStates,
        showOrderInfo,
        hideOrderInfo,
        getLoadingWorkOrdersStatus: computed(() => store.getters.getLoadingWorkOrdersStatus),
        getReportOnOrdersDeliveryResult: computed(() => store.getters.getReportOnOrdersDeliveryResult),
        getErrorLoadingWorkOrders: computed(() => store.getters.getErrorLoadingWorkOrders),
        getIncomingOrders,
        isDSP_or_DSPoperator: computed(() => store.getters.isDSP_or_DSPoperator),
        getInputMessTblColumnsTitles: computed(() => store.getters.getInputMessTblColumnsTitles),
        getInputMessTblColumns: computed(() => store.getters.getInputMessTblColumns),
        isOrderBeingConfirmed: computed(() => store.getters.isOrderBeingConfirmed),
      };
    },
  }
</script>
