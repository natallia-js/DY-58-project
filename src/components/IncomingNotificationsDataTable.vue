<template>
  <div>
    <ShowIncomingOrderDlg
      :showDlg="showIncomingOrderDlg"
      dlgTitle="Информация о входящем уведомлении"
      :order="chosenOrder"
      :orderNeedsToBeConfirmed="true"
      :orderIsBeingConfirmed="chosenOrder && isOrderBeingConfirmed(chosenOrder.id)"
      @close="hideOrderInfo"
    >
    </ShowIncomingOrderDlg>

    <DataTable
      :value="getIncomingOrders"
      class="p-datatable-gridlines"
      :rowHover="true"
      :scrollable="true" scrollHeight="200px"
      v-model:selection="chosenOrder" selectionMode="single" dataKey="id"
    >
      <template #header>
        <div class="dy58-table-title">
          <i v-if="getLoadingWorkOrdersStatus" class="pi pi-spin pi-spinner"></i>
          Входящие {{ isDSP ? 'документы' : 'уведомления' }}
          <Badge :value="getIncomingOrdersNumber"></Badge>
          <p v-if="getErrorLoadingWorkOrders" style="color:red;fontSize:1rem;fontWeight:500">
            {{ getErrorLoadingWorkOrders }}
          </p>
          <p v-if="getReportOnOrdersDeliveryResult && getReportOnOrdersDeliveryResult.error"
            style="color:red;fontSize:1rem;fontWeight:500">
            {{ getReportOnOrdersDeliveryResult.message }}
          </p>
        </div>
        <Button
          v-if="chosenOrder"
          label="Подробнее"
          @click="showOrderInfo"
          v-tooltip.bottom="'Просмотреть информацию о входящем уведомлении'"
        />
      </template>

      <Column v-for="col of getInputMessTblColumns"
        :field="col.field"
        :header="col.title"
        :key="col.field"
        :style="{ minWidth: col.width, maxWidth: col.maxWidth, textAlign: col.align }"
        headerClass="dy58-table-header-cell-class"
        bodyClass="dy58-table-content-cell-class"
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
            <div v-else-if="col.field === getInputMessTblColumnsTitles.state">
              <i v-if="isOrderBeingConfirmed(slotProps.data.id)" class="pi pi-spin pi-check-circle"></i>
              <img
                :src="slotProps.data[col.field] === getIncomingNotificationsStates.cameRecently ? require('../assets/img/hourglass_black.png') :
                      (slotProps.data[col.field] === getIncomingNotificationsStates.cameLongAgo ? require('../assets/img/hourglass_red.png') : '')"
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
  import { mapGetters } from 'vuex';
  import { WorkMessStates } from '../constants/orders';
  import ShowIncomingOrderDlg from '../components/ShowIncomingOrderDlg';

  export default {
    name: 'dy58-incoming-notifications-data-table',

    data() {
      return {
        showIncomingOrderDlg: false,
        chosenOrder: null,
      };
    },

    computed: {
      ...mapGetters([
        'getLoadingWorkOrdersStatus',
        'getReportOnOrdersDeliveryResult',
        'getErrorLoadingWorkOrders',
        'getIncomingOrders',
        'getIncomingOrdersNumber',
        'isDSP',
        'getInputMessTblColumnsTitles',
        'getInputMessTblColumns',
        'isOrderBeingConfirmed',
      ]),

      getIncomingNotificationsStates() {
        return WorkMessStates;
      },
    },

    watch: {
      /**
       * Каждый раз при изменении списка входящих уведомлений смотрим, если в этом списке chosenOrder
       * (если он не null). Если нет, делаем chosenOrder = null.
       */
      getIncomingOrders: function(val) {
        if (!this.chosenOrder) {
          return;
        }
        if (val && val.length) {
          if (!val.find((order) => order.id === this.chosenOrder.id)) {
            this.chosenOrder = null;
          }
        } else {
          this.chosenOrder = null;
        }
      },
    },

    components: {
      ShowIncomingOrderDlg,
    },

    methods: {
      showOrderInfo() {
        this.showIncomingOrderDlg = true;
      },

      hideOrderInfo() {
        this.showIncomingOrderDlg = false;
      },
    },
  }
</script>
