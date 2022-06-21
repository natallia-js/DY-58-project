<template>
  <div>
    <ShowIncomingOrderDlg
      :showDlg="showIncomingOrderDlg"
      dlgTitle="Информация о рабочем документе"
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
            'dy58-order-being-deleted': getOrdersChainsBeingDeleted.includes(slotProps.node.orderChainId),
          }]"
        >
          <b :class="[{
            'dy58-order-dispatched-on-this-global-poligon':
              getUserWorkPoligon && slotProps.node.senderWorkPoligon &&
              getUserWorkPoligon.type === slotProps.node.senderWorkPoligon.type &&
              String(getUserWorkPoligon.code) === String(slotProps.node.senderWorkPoligon.id)
          }]">
            {{ slotProps.node.specialTrainCategories &&
            slotProps.node.specialTrainCategories.includes(specialOrderDSPTakeDutySign) ?
            specialOrderSubpatternTypes.RECORD : slotProps.node.type }}, №{{ slotProps.node.orderNum || '?' }}
            <span v-if="!slotProps.node.sendOriginal" class="dy58-order-copy">(копия)</span>
          </b>,
          {{ slotProps.node.orderTitle || '?' }},
          от {{ slotProps.node.time }}
        </span>
        <!-- вместо кнопок действий пользователя над распоряжением отображаем статус ожидания,
        если распоряжение "занято" и над ним нельзя выполнять каких-либо действий -->
        <i v-if="!canUserPerformAnyActionOnOrder(slotProps.node.key)"
          class="pi pi-spin pi-check-circle p-ml-2"
        ></i>
        <!-- кнопки допустимых действий над распоряжением -->
        <span v-else>
          <Button
            v-if="chosenOrder && (chosenOrder.key === slotProps.node.key)"
            icon="pi pi-ellipsis-h"
            class="p-button-info p-button p-ml-2 p-mr-1 dy58-order-action-button"
            v-tooltip.bottom="'Подробнее'"
            @click="showOrderInfo"
          />
          <Button
            v-if="chosenOrder && (chosenOrder.key === slotProps.node.key) &&
              slotProps.node.topLevelNode && canOrdersChainBeDeleted(slotProps.node.key)"
            icon="pi pi-times"
            class="p-button-secondary p-button p-mr-1 dy58-order-action-button"
            v-tooltip.bottom="slotProps.node.children && slotProps.node.children.length ? 'Не показывать цепочку' : 'Не показывать'"
            @click="() => deleteOrdersChain(slotProps.node.orderChainId)"
          />
          <template v-if="chosenOrder && (chosenOrder.key === slotProps.node.key) &&
            canDispatchOrdersConnectedToGivenOrder(slotProps.node.key) &&
            createRelativeOrderContextMenuItems && createRelativeOrderContextMenuItems.length"
          >
            <TieredMenu
              ref="createOrderMenu"
              :model="createRelativeOrderContextMenuItems"
              :popup="true"
              id="overlay_tmenu"
            >
              <template #item="{item}">
                <a v-if="!item.isChild" class="dy58-tiered-menu-item" @click="item.command">{{ item.label }}</a>
                <a v-else class="dy58-tiered-menu-subitem" @click="item.command">{{ item.label }}</a>
              </template>
            </TieredMenu>
            <Button
              icon="pi pi-file"
              class="p-button-success p-button dy58-order-action-button"
              v-tooltip.bottom="'Создать'"
              @click="toggleCreateOrderMenu"
              aria-haspopup="true"
              aria-controls="overlay_tmenu"
            />
          </template>
        </span>
      </template>
    </Tree>
  </div>
</template>


<script>
  import { mapGetters } from 'vuex';
  import { getLocaleDateTimeString } from '@/additional/dateTimeConvertions';
  import ShowIncomingOrderDlg from '@/components/ShowIncomingOrderDlg';
  import { SPECIAL_ORDER_DSP_TAKE_DUTY_SIGN, SPECIAL_ORDER_SUBPATTERN_TYPES } from '@/constants/orderPatterns';

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
        'canUserDispatchOrders',
        'canUserPerformAnyActionOnOrder',
        'getWorkingOrdersToDisplayAsTree',
        'getOrdersChainsBeingDeleted',
        'getActiveOrders',
        'getCreateRelativeOrderContextMenu',
        'getDeleteOrdersChainAction',
        'getUserWorkPoligon',
        'canOrdersChainBeDeleted',
        'canDispatchOrdersConnectedToGivenOrder',
      ]),

      createRelativeOrderContextMenuItems() {
        if (!this.chosenOrder) {
          return null;
        }
        return this.getCreateRelativeOrderContextMenu(this.chosenOrder.key);
      },

      specialOrderDSPTakeDutySign() {
        return SPECIAL_ORDER_DSP_TAKE_DUTY_SIGN;
      },

      specialOrderSubpatternTypes() {
        return SPECIAL_ORDER_SUBPATTERN_TYPES;
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
