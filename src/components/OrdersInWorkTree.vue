<template>
  <div>
    <ShowIncomingOrderDlg
      :showDlg="showIncomingOrderDlg"
      dlgTitle="Информация о рабочем распоряжении"
      :order="chosenOrder"
      :orderNeedsToBeConfirmed="false"
      @close="hideOrderInfo"
    >
    </ShowIncomingOrderDlg>

    <Tree
      :value="getWorkingOrdersToDisplayAsTree"
      selectionMode="single"
      @node-select="onNodeSelect"
    >
      <template #default="slotProps">
        <span
          :class="[{
            'dy58-order-being-deleted': getOrdersChainsBeingDeleted.includes(slotProps.node.orderChainId)
          }]"
        >
          <b>{{ slotProps.node.type }}, №{{ slotProps.node.orderNum || '?' }}</b>,
          {{ slotProps.node.orderTitle || '?' }},
          от {{ slotProps.node.time }}
        </span>
        <Button
          icon="pi pi-ellipsis-h"
          class="p-button-info p-button-sm p-ml-2 p-mr-1 dy58-tree-order-action-button"
          v-tooltip.right="'Подробнее'"
          @click="() => showOrderInfo(slotProps.node.key)"
        />
        <Button
          v-if="isUserOnDuty && slotProps.node.topLevelNode"
          icon="pi pi-times"
          class="p-button-secondary p-button-sm p-mr-1 dy58-tree-order-action-button"
          v-tooltip.right="slotProps.node.children && slotProps.node.children.length ? 'Не показывать цепочку' : 'Не показывать'"
          @click="() => deleteOrdersChain(slotProps.node.orderChainId)"
        />
      </template>
    </Tree>
  </div>
</template>


<script>
  import { mapGetters } from 'vuex';
  import { getLocaleDateTimeString } from '../additional/dateTimeConvertions';
  import ShowIncomingOrderDlg from '../components/ShowIncomingOrderDlg';

  export default {
    name: 'dy58-orders-in-work-tree',

    components: {
      ShowIncomingOrderDlg,
    },

    data() {
      return {
        startDateToGetData: new Date(),
        showIncomingOrderDlg: false,
        chosenOrder: null,
      };
    },

    computed: {
      ...mapGetters([
        'isUserOnDuty',
        'getWorkingOrdersToDisplayAsTree',
        'getOrdersChainsBeingDeleted',
      ]),
    },

    methods: {
      getLocDateTimeString(datetime) {
        return getLocaleDateTimeString(datetime, true);
      },

      showOrderInfo() {
        this.showIncomingOrderDlg = true;
      },

      hideOrderInfo() {
        this.showIncomingOrderDlg = false;
      },

      onNodeSelect(node) {
        this.chosenOrder = node;
      },

      deleteOrdersChain(chainId) {
        const ordersInChain = this.$store.getters.getOrdersInChain(chainId);
        const confirmDlgMessage = ordersInChain.length === 1
          ? 'Удалить распоряжение из таблицы рабочих распоряжений?'
          : `Удалить цепочку распоряжений (${ordersInChain.reduce((accumulator, currentValue, index) =>
            accumulator + currentValue.type + ' № ' + currentValue.number + `${index === ordersInChain.length - 1 ? '' : ', '}`, '')}) из таблицы рабочих распоряжений?`;
        this.$confirm.require({
          header: 'Подтвердите удаление',
          message: confirmDlgMessage,
          icon: 'pi pi-exclamation-circle',
          defaultFocus: 'reject',
          accept: () => {
            this.$store.dispatch('delConfirmedOrdersFromChain', chainId);
          },
        });
      },
    },
  }
</script>


<style scoped>
  .dy58-tree-order-action-button {
    width: 20px !important;
    height: 20px !important;
  }
</style>
