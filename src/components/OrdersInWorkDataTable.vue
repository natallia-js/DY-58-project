<template>
  <div>
    <DataTable
      :value="getWorkingOrders"
      class="p-datatable-gridlines p-datatable-sm"
      :rowHover="true"
      dataKey="id"
      :scrollable="true" scrollHeight="flex"
      v-model:expandedRows="expandedRows"
    >
      <template #header>
        <div class="dy58-table-title">
          <div class="p-mb-2">
            <i v-if="getLoadingWorkOrdersStatus" class="pi pi-spin pi-spinner"></i>
            {{ isDSP ? 'Документы' : 'Распоряжения' }} в работе
            <Badge :value="getWorkingOrdersNumber"></Badge>
          </div>
          <div class="dy58-table-comment">
            извлекаются цепочки распоряжений, действовавшие с
            <Calendar
              v-model="startDateToGetData"
              :showTime="true"
              :showIcon="true"
              :manualInput="false"
            />
            по настоящее время
          </div>
          <p v-if="getErrorLoadingWorkOrders" style="color:red;fontSize:1rem;fontWeight:500">
            {{ getErrorLoadingWorkOrders }}
          </p>
        </div>
      </template>

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
          <div style="width:100%;height:100%">
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
                <span class="dy58-margin-after">Не доставлено:</span>
                <Badge class="not-delivered-order" :value="slotProps.data[col.field].notDelivered"></Badge>
              </p>
              <p v-if="slotProps.data[col.field].notConfirmed > 0">
                <span class="dy58-margin-after">Не подтверждено:</span>
                <Badge class="not-confirmed-order" :value="slotProps.data[col.field].notConfirmed"></Badge>
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
                    :class="[{'not-delivered-order': !slotProps.data.deliverDateTime},
                             {'not-confirmed-order': slotProps.data.deliverDateTime && !slotProps.data.confirmDateTime},
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
        startDateToGetData: new Date(),
      };
    },

    computed: {
      ...mapGetters([
        'getStartDateToGetData',
        'getLoadingWorkOrdersStatus',
        'getErrorLoadingWorkOrders',
        'getWorkingOrders',
        'getWorkingOrdersNumber',
        'isDSP',
        'getWorkMessTblColumnsTitles',
        'getWorkMessTblColumns',
        'getWorkMessReceiversTblColumns',
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
    },

    watch: {
      startDateToGetData(newVal) {
        this.$store.commit('setStartDateToGetDataNoCheck', newVal);
      },

      getStartDateToGetData(newVal) {
        this.startDateToGetData = newVal;
      },
    },

    mounted() {
      this.startDateToGetData = this.getStartDateToGetData;
    },
  }
</script>


<style lang="scss" scoped>
  .confirmed-order {
    background-color: var(--dy58-confirmed-order-bg-color) !important;
    color: black;
  }

  .not-delivered-order {
    background-color: var(--dy58-not-read-order-bg-color) !important;
    color: black;
  }

  .not-confirmed-order {
    background-color: var(--dy58-read-order-bg-color) !important;
    color: black;
  }
</style>
