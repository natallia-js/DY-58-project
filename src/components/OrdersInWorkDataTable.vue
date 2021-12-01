<template>
  <div>
    <ContextMenu ref="menu" :model="workOrdersTableContextMenuItems">
      <template #item="{item}">
        <p class="p-m-2">
          <a
            href="#!"
            class="dy58-context-menu-item"
            @click="item.handler"
          >
            {{ item.label }}
          </a>
        </p>
      </template>
    </ContextMenu>

    <DataTable
      :value="getWorkingOrders"
      class="p-datatable-gridlines p-datatable-sm"
      :rowHover="true"
      dataKey="id"
      :scrollable="true" scrollHeight="flex"
      v-model:expandedRows="expandedRows"
      contextmenu
      v-model:contextMenuSelection="selectedWorkOrdersTableRecord"
      @rowContextmenu="handleWorkOrdersTableRightClick"
    >
      <Column
        :expander="true"
        :style="{ minWidth: getExpanderColumnObject.width, textAlign: getExpanderColumnObject.align, alignItems: 'center', justifyContent: 'center' }"
        headerClass="dy58-table-header-cell-class"
        bodyClass="dy58-table-content-cell-class"
      />

      <Column v-for="col of getWorkMessTblColumnsExceptExpander"
        :field="col.field"
        :header="col.title"
        :key="col.field"
        :style="{ minWidth: col.width, textAlign: col.align }"
        headerClass="dy58-table-header-cell-class"
        bodyClass="dy58-table-content-cell-class"
      >
        <template #body="slotProps">
          <div
            style="width:100%;height:100%"
            :class="[{
              'dy58-order-being-deleted': getOrdersChainsBeingDeleted.includes(slotProps.data.orderChainId)
            }]"
          >
            <span v-if="![
              getWorkMessTblColumnsTitles.expander,
              getWorkMessTblColumnsTitles.state,
              getWorkMessTblColumnsTitles.orderReceiveStatus].includes(col.field)"
            >
              {{ slotProps.data[col.field] }}
            </span>
            <div v-if="col.field === getWorkMessTblColumnsTitles.orderReceiveStatus"
            >
              <p v-if="slotProps.data[col.field].notDelivered > 0">
                <span class="p-mr-2">Не доставлено:</span>
                <Badge class="dy58-not-delivered-order" :value="slotProps.data[col.field].notDelivered"></Badge>
              </p>
              <p v-if="slotProps.data[col.field].notConfirmed > 0">
                <span class="p-mr-2">Не подтверждено:</span>
                <Badge class="dy58-not-confirmed-order" :value="slotProps.data[col.field].notConfirmed"></Badge>
              </p>
            </div>
            <div v-else-if="col.field === getWorkMessTblColumnsTitles.state">
              <i v-if="isOrderBeingConfirmedForOthers(slotProps.data.id)" class="pi pi-spin pi-check-circle"></i>
              <img
                :src="slotProps.data[col.field] === getWorkMessStates.cameRecently ? require('../assets/img/hourglass_black.png') :
                      (slotProps.data[col.field] === getWorkMessStates.cameLongAgo ? require('../assets/img/hourglass_red.png') : '')"
                :alt="slotProps.data[col.field]"
                class="dy58-order-state-img-style"
              />
            </div>
          </div>
        </template>
      </Column>

      <template #expansion="slotProps">
        <div class="p-grid" style="width:100%;background:var(--dy58-expand-row-bg-color);margin:0;">
          <div class="p-col">
            <div v-if="!slotProps.data.sendOriginal"><b>КОПИЯ</b></div>
            <div class="dy58-order-pattern-border p-p-1" v-html="slotProps.data.orderText"></div>
            <div><b>Из:</b> {{ slotProps.data.place }}</div>
            <div><b>Автор:</b> {{ `${slotProps.data.post} ${slotProps.data.fio}` }}</div>
          </div>
          <div class="p-col">
            <DataTable :value="slotProps.data.receivers()">
              <Column v-for="col2 of getWorkMessReceiversTblColumns"
                :field="col2.field"
                :header="col2.title"
                :key="col2.field"
                :style="{ width: col2.width, }"
                headerClass="dy58-table-header-cell-class"
                bodyClass="dy58-table-content-cell-class dy58-send-table-data-cell"
              >
                <template #body="slotProps2">
                  <div v-if="col2.field !== getWorkMessReceiversTblColumnsTitles.confirmDateTime"
                    style="width:100%"
                    :class="[
                      {'dy58-not-delivered-order': !slotProps2.data.deliverDateTime},
                      {'dy58-not-confirmed-order': slotProps2.data.deliverDateTime && !slotProps2.data.confirmDateTime},
                    ]"
                  >
                    {{ slotProps2.data[col2.field] }}
                  </div>
                  <div v-else>
                    <span v-if="slotProps2.data[col2.field]">
                      {{ getDateTimeString(slotProps2.data[col2.field]) }}
                    </span>
                    <Button
                      v-else-if="isUserOnDuty &&
                        !getOrdersChainsBeingDeleted.includes(slotProps.data.orderChainId) &&
                        !isOrderBeingConfirmedForOthers(slotProps.data.id) &&
                        orderCanBeConfirmedFor(slotProps.data)"
                      label="Подтвердить"
                      class="p-button-primary p-button-text"
                      @click="confirmOrderForOthers(slotProps.data.id, { type: slotProps2.data.type, id: slotProps2.data.id })"
                    />
                  </div>
                </template>
              </Column>
            </DataTable>
            <div style="text-align:right"
              v-if="isUserOnDuty &&
                !getOrdersChainsBeingDeleted.includes(slotProps.data.orderChainId) &&
                !isOrderBeingConfirmedForOthers(slotProps.data.id) &&
                orderCanBeConfirmedFor(slotProps.data) &&
                getOrderUnconfirmedWorkPoligons(slotProps.data.id).length"
            >
              <Button
                label="Подтвердить все"
                class="p-button-primary p-button-text"
                @click="confirmOrderForOthers(slotProps.data.id, null)"
              />
            </div>
          </div>
        </div>
      </template>

    </DataTable>
  </div>
</template>


<script>
  import { mapGetters } from 'vuex';
  import { WorkMessStates } from '../constants/orders';
  import { ORDER_PATTERN_TYPES } from '../constants/orderPatterns';
  import { getLocaleDateTimeString } from '../additional/dateTimeConvertions';

  export default {
    name: 'dy58-orders-in-work-data-table',

    data() {
      return {
        expandedRows: [],
        selectedWorkOrdersTableRecord: null,
      };
    },

    computed: {
      ...mapGetters([
        'getLoadingWorkOrdersStatus',
        'getErrorLoadingWorkOrders',
        'getWorkingOrders',
        'getWorkingOrdersNumber',
        'isDSP',
        'isDNC',
        'isECD',
        'getWorkMessTblColumnsTitles',
        'getWorkMessReceiversTblColumnsTitles',
        'getWorkMessTblColumns',
        'getWorkMessReceiversTblColumns',
        'getOrdersChainsBeingDeleted',
        'getOrderUnconfirmedWorkPoligons',
        'getUserWorkPoligon',
        'isOrderBeingConfirmedForOthers',
        'isUserOnDuty',
        'getLastInChainActiveOrders',
      ]),

      getWorkMessStates() {
        return WorkMessStates;
      },

      getWorkMessTblColumnsExceptExpander() {
        return this.getWorkMessTblColumns.filter((el) => el.field !== this.getWorkMessTblColumnsTitles.expander);
      },

      getExpanderColumnObject() {
        return this.getWorkMessTblColumns.find((el) => el.field === this.getWorkMessTblColumnsTitles.expander);
      },

      workOrdersTableContextMenuItems() {
        const items = [];
        if (!this.isUserOnDuty) {
          items.push({
            label: 'Вы не на дежурстве',
            handler: () => {},
          });

        } else if (this.selectedWorkOrdersTableRecord) {
          const ordersInChain = this.$store.getters.getOrdersInChain(this.selectedWorkOrdersTableRecord.orderChainId);
          const confirmDlgMessage = ordersInChain.length === 1
            ? 'Удалить распоряжение из таблицы рабочих распоряжений?'
            : `Удалить цепочку распоряжений (${ordersInChain.reduce((accumulator, currentValue, index) =>
              accumulator + currentValue.type + ' № ' + currentValue.number + `${index === ordersInChain.length - 1 ? '' : ', '}`, '')}) из таблицы рабочих распоряжений?`;
          items.push(
            {
              label: `Не показывать ${ordersInChain.length === 1 ? 'распоряжение' : 'цепочку распоряжений'}`,
              handler: () => {
                this.$confirm.require({
                  header: 'Подтвердите удаление',
                  message: confirmDlgMessage,
                  icon: 'pi pi-exclamation-circle',
                  defaultFocus: 'reject',
                  accept: () => {
                    this.$store.dispatch('delConfirmedOrdersFromChain', this.selectedWorkOrdersTableRecord.orderChainId);
                  },
                });
              },
            }
          );
          // Дополнительное меню о создании на основании выбранного в таблице распоряжения другого
          // распоряжения (следующего за ним в цепочке распоряжений) появляется лишь в том случае,
          // если выбранное распоряжение является последним в своей цепочке и действующим
          if (this.getLastInChainActiveOrders.find((order) => order._id === this.selectedWorkOrdersTableRecord.id)) {
            // У ДНЦ и ДСП предыдущее распоряжение в цепочке может быть любого типа,
            // равно как и следующее за ним распоряжение
            if (this.isDNC) {
              items.push(
                {
                  label: `Создать ${ORDER_PATTERN_TYPES.ORDER.toUpperCase()}`,
                  handler: () => {
                    this.$router.push({
                      name: 'NewOrderPage',
                      params: { orderType: ORDER_PATTERN_TYPES.ORDER, prevOrderId: this.selectedWorkOrdersTableRecord.id },
                    });
                  },
                }
              );
            }
            if (this.isDNC || this.isDSP) {
              items.push(
                {
                  label: `Создать ${ORDER_PATTERN_TYPES.REQUEST.toUpperCase()}`,
                  handler: () => {
                    this.$router.push({
                      name: 'NewOrderPage',
                      params: { orderType: ORDER_PATTERN_TYPES.REQUEST, prevOrderId: this.selectedWorkOrdersTableRecord.id },
                    });
                  },
                },
                {
                  label: `Создать ${ORDER_PATTERN_TYPES.NOTIFICATION.toUpperCase()}`,
                  handler: () => {
                    this.$router.push({
                      name: 'NewOrderPage',
                      params: { orderType: ORDER_PATTERN_TYPES.NOTIFICATION, prevOrderId: this.selectedWorkOrdersTableRecord.id },
                    });
                  },
                }
              );
            }
            // У ЭЦД предыдущее распоряжение в цепочке может быть любого типа, но следующее за ним -
            // только уведомление / отмена запрещения. Приказ и запрещение могут лишь начинать цепочку.
            if (this.isECD) {
              items.push(
                {
                  label: `Создать ${ORDER_PATTERN_TYPES.ECD_NOTIFICATION.toUpperCase()}`,
                  handler: () => {
                    this.$router.push({
                      name: 'NewOrderPage',
                      params: { orderType: ORDER_PATTERN_TYPES.ECD_NOTIFICATION, prevOrderId: this.selectedWorkOrdersTableRecord.id },
                    });
                  },
                }
              );
            }
          }
        }
        return items;
      },

      /**
       * Возвращает true, если пользователь может подтвердить распоряжение за его адресатов.
       * Это возможно в том случае, если распоряжение было издано на том рабочем полигоне, на
       * котором работает пользователь.
       * Возвращает false, если текущий пользователь не имеет права подтверждать распоряжение
       * за других.
       */
      orderCanBeConfirmedFor() {
        return (order) => {
          return (order.senderWorkPoligon.type === this.getUserWorkPoligon.type) &&
            (order.senderWorkPoligon.id === this.getUserWorkPoligon.code);
        };
      },
    },

    methods: {
      handleWorkOrdersTableRightClick(event) {
        this.$refs.menu.show(event.originalEvent);
      },

      getDateTimeString(datetime, showSeconds) {
        return getLocaleDateTimeString(datetime, showSeconds);
      },

      /**
       * Значение параметра workPoligon - объект с информацией о рабочем полигоне, за который необходимо
       * подтвердить распоряжение.
       * Если значение параметра workPoligon null, то распоряжение подтверждается за все рабочие
       * полигоны, которые его еще не подтвердили.
      */
      confirmOrderForOthers(orderId, workPoligon) {
        let confirmWorkPoligons;
        if (!workPoligon) {
          confirmWorkPoligons = this.getOrderUnconfirmedWorkPoligons(orderId);
        } else {
          confirmWorkPoligons = [{
            workPoligonType: workPoligon.type,
            workPoligonId: workPoligon.id,
          }];
        }
        this.$store.dispatch('confirmOrderForOthers', { orderId, confirmWorkPoligons });
      },
    },
  }
</script>
