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
          v-if="chosenOrder && (chosenOrder.key === slotProps.node.key)"
          icon="pi pi-ellipsis-h"
          class="p-button-info p-button-sm p-ml-2 p-mr-1 dy58-order-action-button"
          v-tooltip.bottom="'Подробнее'"
          @click="() => showOrderInfo()"
        />
        <Button
          v-if="canUserDelConfirmedOrdersChains && chosenOrder && (chosenOrder.key === slotProps.node.key) &&
            slotProps.node.topLevelNode"
          icon="pi pi-times"
          class="p-button-secondary p-button-sm p-mr-1 dy58-order-action-button"
          v-tooltip.bottom="slotProps.node.children && slotProps.node.children.length ? 'Не показывать цепочку' : 'Не показывать'"
          @click="() => deleteOrdersChain(slotProps.node.orderChainId)"
        />
        <TieredMenu
          ref="createOrderMenu"
          :model="createRelativeOrderContextMenuItems"
          :popup="true"
          id="overlay_tmenu"
        />
        <Button
          v-if="canUserDispatchOrders && chosenOrder && (chosenOrder.key === slotProps.node.key) &&
            getActiveOrders.find((order) => order._id === chosenOrder.key)"
          icon="pi pi-file"
          class="p-button-success p-button-sm dy58-order-action-button"
          v-tooltip.bottom="'Создать'"
          @click="toggleCreateOrderMenu"
          aria-haspopup="true"
          aria-controls="overlay_tmenu"
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
        'canUserDelConfirmedOrdersChains',
        'canUserDispatchOrders',
        'getWorkingOrdersToDisplayAsTree',
        'getOrdersChainsBeingDeleted',
        'getActiveOrders',
        'getCreateRelativeOrderContextMenu',
        'getDeleteOrdersChainAction',
      ]),

      createRelativeOrderContextMenuItems() {
        if (!this.chosenOrder) {
          return null;
        }
        return this.getCreateRelativeOrderContextMenu(this.chosenOrder.key);
      },
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
        this.getDeleteOrdersChainAction(chainId, this.$confirm);
      },

      toggleCreateOrderMenu(event) {
        this.$refs.createOrderMenu.toggle(event);
      },
    },
  }
</script>
