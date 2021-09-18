<template>
  <ShowIncomingOrderDlg
    :showDlg="showIncomingOrderDlg"
    :order="chosenOrder"
    @close="hideOrderInfo"
  >
  </ShowIncomingOrderDlg>
  <div>
    <DataTable
      :value="getIncomingOrders"
      class="p-datatable-gridlines"
      :rowHover="true"
      :scrollable="true" scrollHeight="200px"
      v-model:selection="chosenOrder" selectionMode="single" dataKey="id"
    >
      <template #header>
        <div class="dy58-table-title">
          Входящие {{ isDSP ? 'документы' : 'уведомления' }}
        </div>
        <p class="dy58-table-upper-comment">Количество записей: {{ getIncomingOrdersNumber }}</p>
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
        :style="{ minWidth: col.width, textAlign: col.align }"
        headerClass="dy58-table-header-cell-class"
        bodyClass="dy58-table-content-cell-class"
      >
        <template #body="slotProps">
          <div style="width:100%;height:100%">
            <span v-if="col.field !== getInputMessTblColumnsTitles.state"
            >
              {{ slotProps.data[col.field] }}
            </span>
            <img v-if="col.field === getInputMessTblColumnsTitles.state"
              :src="slotProps.data[col.field] === getIncomingNotificationsStates.cameRecently ? require('../assets/img/hourglass_black.png') :
                    (slotProps.data[col.field] === getIncomingNotificationsStates.cameLongAgo ? require('../assets/img/hourglass_red.png') : '')"
              :alt="slotProps.data[col.field]"
              class="dy58-order-state-img-style"
            />
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
        'getIncomingOrders',
        'getIncomingOrdersNumber',
        'isDSP',
        'getInputMessTblColumnsTitles',
        'getInputMessTblColumns',
      ]),

      getIncomingNotificationsStates() {
        return WorkMessStates;
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


<style scoped>
</style>
