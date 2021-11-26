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
                || getDeletedOrdersChains.includes(slotProps.data.orderChainId)
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
            <img v-if="col.field === getWorkMessTblColumnsTitles.state"
              :src="slotProps.data[col.field] === getWorkMessStates.cameRecently ? require('../assets/img/hourglass_black.png') :
                    (slotProps.data[col.field] === getWorkMessStates.cameLongAgo ? require('../assets/img/hourglass_red.png') : '')"
              :alt="slotProps.data[col.field]"
              class="dy58-order-state-img-style"
            />
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
                <template #body="slotProps">
                  <div style="width:100%"
                    :class="[
                              {'dy58-not-delivered-order': !slotProps.data.deliverDateTime},
                              {'dy58-not-confirmed-order': slotProps.data.deliverDateTime && !slotProps.data.confirmDateTime},
                            ]"
                  >
                    {{ slotProps.data[col2.field] }}
                  </div>
                </template>
              </Column>

            </DataTable>
          </div>
        </div>
      </template>

    </DataTable>
  </div>
</template>


<script>
  import { mapGetters } from 'vuex';
  import { WorkMessStates } from '../constants/orders';

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
        'getWorkMessTblColumnsTitles',
        'getWorkMessTblColumns',
        'getWorkMessReceiversTblColumns',
        'getOrdersChainsBeingDeleted',
        'getDeletedOrdersChains',
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
        if (this.selectedWorkOrdersTableRecord)
        {
          const ordersInChain = this.$store.getters.getOrdersInChain(this.selectedWorkOrdersTableRecord.orderChainId);
          const confirmDlgMessage = ordersInChain.length === 1
            ? 'Удалить распоряжение из таблицы рабочих распоряжений?'
            : `Удалить цепочку распоряжений (${ordersInChain.reduce((accumulator, currentValue, index) =>
              accumulator + currentValue.type + ' № ' + currentValue.number + `${index === ordersInChain.length - 1 ? '' : ', '}`, '')}) из таблицы рабочих распоряжений?`;
          items.push({
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
          });
        }
        return items;
      },
    },

    methods: {
      handleWorkOrdersTableRightClick(event) {
        this.$refs.menu.show(event.originalEvent);
      },
    },
  }
</script>
