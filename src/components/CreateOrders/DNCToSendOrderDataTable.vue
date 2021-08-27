<template>
  <div>
    <DataTable
      :value="getCurrAdjacentDNCSectorsDNCShiftForSendingData"
      class="p-datatable-responsive p-datatable-gridlines p-datatable-sm"
      :rowHover="true"
    >
      <template #header>
        <div class="dy58-table-title">
          ДНЦ
        </div>
      </template>

      <Column v-for="col of getCurrSectorsShiftTblColumns"
        :field="col.field"
        :header="col.title"
        :key="col.field"
        :headerStyle="{ width: col.width }"
        headerClass="dy58-table-header-cell-class"
        :bodyStyle="{ width: col.width }"
        bodyClass="dy58-table-content-cell-class"
      >
        <template #body="slotProps">
          <div v-if="col.field !== getCurrSectorsShiftTblColumnNames.notification"
              :class="[
                        'dy58-send-table-data-cell',
                        {'dy58-send-original': [getCurrSectorsShiftTblColumnNames.sector,
                                                getCurrSectorsShiftTblColumnNames.fio].includes(col.field)
                                                && slotProps.data.sendOriginalToDNC === getCurrShiftGetOrderStatus.sendOriginal},
                        {'dy58-send-copy': [getCurrSectorsShiftTblColumnNames.sector,
                                            getCurrSectorsShiftTblColumnNames.fio].includes(col.field)
                                            && slotProps.data.sendOriginalToDNC === getCurrShiftGetOrderStatus.sendCopy},
                      ]"
          >
            {{ slotProps.data[col.field] }}
          </div>
          <div v-if="col.field === getCurrSectorsShiftTblColumnNames.notification">
            <div class="dy58-tbl-send-btns-block">
              <a :class="['dy58-send-status-btn',
                          {'dy58-send-original': slotProps.data.sendOriginalToDNC === getCurrShiftGetOrderStatus.sendOriginal,
                           'dy58-def-btn-color': slotProps.data.sendOriginalToDNC !== getCurrShiftGetOrderStatus.sendOriginal,}]"
                  @click="() => sendOriginalToDefinitSector(slotProps.data.id)"
              >
                Оригинал
              </a>
              <a :class="['dy58-send-status-btn',
                          {'dy58-send-copy': slotProps.data.sendOriginalToDNC === getCurrShiftGetOrderStatus.sendCopy,
                           'dy58-def-btn-color': slotProps.data.sendOriginalToDNC !== getCurrShiftGetOrderStatus.sendCopy,}]"
                  @click="() => sendCopyToDefinitSector(slotProps.data.id)"
              >
                Копия
              </a>
              <a :class="['dy58-send-status-btn',
                          {'dy58-do-not-send': slotProps.data.sendOriginalToDNC === getCurrShiftGetOrderStatus.doNotSend,
                           'dy58-def-btn-color': slotProps.data.sendOriginalToDNC !== getCurrShiftGetOrderStatus.doNotSend,}]"
                  @click="() => doNotSendToDefinitSector(slotProps.data.id)"
              >
                &#9747;
              </a>

            </div>
          </div>
        </template>
      </Column>

      <template #footer>
        <div class="dy58-send-btns-selectors">
          <a :class="['dy58-send-status-btn', 'dy58-send-original']" @click="sendOriginalToAll">
            Оригинал всем
          </a>
          <a :class="['dy58-send-status-btn', 'dy58-send-copy']" @click="sendCopyToAll">
            Копию всем
          </a>
          <a :class="['dy58-send-status-btn', 'dy58-do-not-send']" @click="doNotSendToAll">
            Не уведомлять всех
          </a>
          <a :class="['dy58-send-status-btn', 'dy58-send-original']" @click="sendOriginalToAllLeft">
            Оригинал оставшимся
          </a>
          <a :class="['dy58-send-status-btn', 'dy58-send-copy']" @click="sendCopyToAllLeft">
            Копию оставшимся
          </a>
        </div>
      </template>

    </DataTable>
  </div>
</template>


<script>
  import { mapGetters } from 'vuex';
  import {
    CurrShiftGetOrderStatus,
    CurrSectorsShiftTblColumnNames,
    CurrSectorsShiftTblColumns,
  } from '../../store/modules/currShift';

  export default {
    name: 'dy58-dnc-to-send-order-data-table',

    computed: {
      ...mapGetters([
        'getCurrAdjacentDNCSectorsDNCShiftForSendingData',
      ]),

      getCurrSectorsShiftTblColumnNames() {
        return CurrSectorsShiftTblColumnNames;
      },

      getCurrShiftGetOrderStatus() {
        return CurrShiftGetOrderStatus;
      },

      getCurrSectorsShiftTblColumns() {
        return CurrSectorsShiftTblColumns;
      },
    },

    methods: {
      sendOriginalToAll() {
        this.$store.commit('setGetOrderStatusToAllAdjacentDNCSectorsDNCShift',
          { getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
      },

      sendOriginalToDefinitSector(dncSectorId) {
        this.$store.commit('setGetOrderStatusToDefinitAdjacentDNCSectorDNCShift',
          { dncSectorId, getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
      },

      sendOriginalToAllLeft() {
        this.$store.commit('setGetOrderStatusToAllLeftAdjacentDNCSectorsDNCShift',
          { getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
      },

      sendCopyToAll() {
        this.$store.commit('setGetOrderStatusToAllAdjacentDNCSectorsDNCShift',
          { getOrderStatus: CurrShiftGetOrderStatus.sendCopy });
      },

      sendCopyToDefinitSector(dncSectorId) {
        this.$store.commit('setGetOrderStatusToDefinitAdjacentDNCSectorDNCShift',
          { dncSectorId, getOrderStatus: CurrShiftGetOrderStatus.sendCopy });
      },

      sendCopyToAllLeft() {
        this.$store.commit('setGetOrderStatusToAllLeftAdjacentDNCSectorsDNCShift',
          { getOrderStatus: CurrShiftGetOrderStatus.sendCopy });
      },

      doNotSendToAll() {
        this.$store.commit('setGetOrderStatusToAllAdjacentDNCSectorsDNCShift',
          { getOrderStatus: CurrShiftGetOrderStatus.doNotSend });
      },

      doNotSendToDefinitSector(dncSectorId) {
        this.$store.commit('setGetOrderStatusToDefinitAdjacentDNCSectorDNCShift',
          { dncSectorId, getOrderStatus: CurrShiftGetOrderStatus.doNotSend });
      },
    }
  }
</script>


<style scoped>
</style>
