<template>
  <div>
    <DataTable
      :value="getOrdersInWork"
      class="p-datatable-gridlines p-datatable-sm"
      :rowHover="true"
      :scrollable="true" scrollHeight="350px"
      dataKey="id"
      v-model:expandedRows="expandedRows"
    >
      <template #header>
        <div class="dy58-table-title">
          {{ showOrdersInWorkForDSP() ? 'Документы' : 'Распоряжения' }} в работе
        </div>
        <p class="dy58-table-upper-comment">Количество записей: {{ getOrdersInWorkNumber }}</p>
      </template>

      <Column
        :expander="true"
        headerStyle="width: 3rem"
        headerClass="dy58-table-header-cell-class"
        bodyStyle="width: 3rem"
      />

      <Column v-for="col of getWorkMessTblColumns"
        :field="col.field"
        :header="col.title"
        :key="col.field"
        :headerStyle="{ width: col.width, }"
        headerClass="dy58-table-header-cell-class"
        :bodyStyle="{ width: col.width }"
        bodyClass="dy58-table-content-cell-class"
      >
        <template #body="slotProps">
          <span v-if="![getWorkMessTblColumnsTitles.state, getWorkMessTblColumnsTitles.orderReceiveStatus].includes(col.field)"
          >
            {{ slotProps.data[col.field] }}
          </span>
          <div v-if="col.field === getWorkMessTblColumnsTitles.orderReceiveStatus"
          >
            <span class="dy58-margin-after">Не прочитано:</span>
            <span class="new badge not-read-order black-text" data-badge-caption="">{{ slotProps.data[col.field]().notRead }}</span>
            <br>
            <span class="dy58-margin-after">Не подтверждено:</span>
            <span class="new badge read-order black-text" data-badge-caption="">{{ slotProps.data[col.field]().notConfirmed }}</span>
          </div>
          <img v-if="col.field === getWorkMessTblColumnsTitles.state"
            :src="slotProps.data[col.field] === getWorkMessStates.cameRecently ? require('../assets/img/hourglass_black.png') :
                  (slotProps.data[col.field] === getWorkMessStates.cameLongAgo ? require('../assets/img/hourglass_red.png') : '')"
            :alt="slotProps.data[col.field]"
            class="dy58-order-state-img-style"
          />
        </template>
      </Column>

      <template #expansion="slotProps">
        <div class="dy58-order-details">

          <div class="dy58-order-text dy58-margin-after">
            {{ slotProps.data.orderText }}
          </div>

          <div class="dy58-order-receivers">
            <DataTable :value="slotProps.data.receivers">
              <Column v-for="col2 of getWorkMessReceiversTblColumns"
                :field="col2.field"
                :header="col2.title"
                :key="col2.field"
                :headerStyle="{ width: col2.width, }"
                headerClass="dy58-table-header-cell-class"
                :bodyStyle="{ width: col2.width }"
                bodyClass="dy58-table-content-cell-class dy58-no-padding"
              >
                <template #body="slotProps">
                  <div
                    :class="[
                             {'confirmed-order': slotProps.data.status === getWorkMessStatus.confirmed},
                             {'read-order': slotProps.data.status === getWorkMessStatus.read},
                             {'not-read-order': slotProps.data.status === getWorkMessStatus.notRead},
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
  import {
    WorkMessStatus,
    WorkMessStates,
    WorkMessTblColumnsTitles,
    WorkMessReceiversTblColumnsTitles,
    WorkMessTblColumns,
    WorkMessReceiversTblColumns,
  } from '../store/modules/ordersInWork';
  import { APP_CREDENTIALS } from '../constants/appCredentials';

  export default {
    name: 'dy58-orders-in-work-data-table',

    data() {
      return {
        expandedRows: []
      }
    },

    computed: {
      ...mapGetters([
        'getOrdersInWork',
        'getOrdersInWorkNumber',
        'getUserCredential',
      ]),

      getWorkMessStatus() {
        return WorkMessStatus;
      },

      getWorkMessStates() {
        return WorkMessStates;
      },

      getWorkMessTblColumnsTitles() {
        return WorkMessTblColumnsTitles;
      },

      getWorkMessTblColumns() {
        return WorkMessTblColumns;
      },

      getWorkMessReceiversTblColumns() {
        if (!this.showOrdersInWorkForECD()) {
          return WorkMessReceiversTblColumns;
        }
        return WorkMessReceiversTblColumns.map(col => {
          if (col.field === WorkMessReceiversTblColumnsTitles.post) {
            return { field: col.field, title: col.altTitle, width: col.width };
          }
          return col;
        });
      },
    },

    mounted() {
      this.$store.commit('setOrdersInWork', []);
    },

    methods: {
      showOrdersInWorkForDSP() {
        return this.getUserCredential === APP_CREDENTIALS.DSP_FULL;
      },

      showOrdersInWorkForECD() {
        return this.getUserCredential === APP_CREDENTIALS.ECD_FULL;
      },
    }
  }
</script>


<style lang="scss" scoped>
  .dy58-order-details {
    padding: 1rem;
    display: flex;
    flex-direction: row;
  }

  .dy58-order-text, .dy58-order-receivers {
    flex-basis: 50%;
  }

  .confirmed-order {
    background-color: var(--dy58-confirmed-order-bg-color) !important;
  }

  .read-order {
    background-color: var(--dy58-read-order-bg-color) !important;
  }

  .not-read-order {
    background-color: var(--dy58-not-read-order-bg-color) !important;
  }
</style>
