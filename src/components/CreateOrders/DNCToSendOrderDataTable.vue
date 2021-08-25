<template>
  <div>
    <DataTable
      :value="getCurrSectorsShift"
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
                                                getCurrSectorsShiftTblColumnNames.post,
                                                getCurrSectorsShiftTblColumnNames.fio].includes(col.field)
                                                && slotProps.data.sendOriginal === getCurrSectorsShiftGetOrderStatus.sendOriginal},
                        {'dy58-send-copy': [getCurrSectorsShiftTblColumnNames.sector,
                                            getCurrSectorsShiftTblColumnNames.post,
                                            getCurrSectorsShiftTblColumnNames.fio].includes(col.field)
                                            && slotProps.data.sendOriginal === getCurrSectorsShiftGetOrderStatus.sendCopy},
                      ]"
          >
            {{ slotProps.data[col.field] }}
          </div>
          <div v-if="col.field === getCurrSectorsShiftTblColumnNames.notification">
            <div class="dy58-tbl-send-btns-block">
              <a :class="['dy58-send-status-btn',
                          {'dy58-send-original': slotProps.data.sendOriginal === getCurrSectorsShiftGetOrderStatus.sendOriginal,
                           'dy58-def-btn-color': slotProps.data.sendOriginal !== getCurrSectorsShiftGetOrderStatus.sendOriginal,}]"
                  @click="if (slotProps.data.sendOriginal !== getCurrSectorsShiftGetOrderStatus.sendOriginal) {
                            slotProps.data.sendOriginal = getCurrSectorsShiftGetOrderStatus.sendOriginal;
                          }"
              >
                Оригинал
              </a>
              <a :class="['dy58-send-status-btn',
                          {'dy58-send-copy': slotProps.data.sendOriginal === getCurrSectorsShiftGetOrderStatus.sendCopy,
                           'dy58-def-btn-color': slotProps.data.sendOriginal !== getCurrSectorsShiftGetOrderStatus.sendCopy,}]"
                  @click="if (slotProps.data.sendOriginal !== getCurrSectorsShiftGetOrderStatus.sendCopy) {
                            slotProps.data.sendOriginal = getCurrSectorsShiftGetOrderStatus.sendCopy;
                          }"
              >
                Копия
              </a>
              <a :class="['dy58-send-status-btn',
                          {'dy58-do-not-send': slotProps.data.sendOriginal === getCurrSectorsShiftGetOrderStatus.doNotSend,
                           'dy58-def-btn-color': slotProps.data.sendOriginal !== getCurrSectorsShiftGetOrderStatus.doNotSend,}]"
                  @click="if (slotProps.data.sendOriginal !== getCurrSectorsShiftGetOrderStatus.doNotSend) {
                            slotProps.data.sendOriginal = getCurrSectorsShiftGetOrderStatus.doNotSend;
                          }"
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
    CurrSectorsShiftGetOrderStatus,
    CurrSectorsShiftTblColumnNames,
    CurrSectorsShiftTblColumns,
  } from '../../store/modules/currShift';

  export default {
    name: 'dy58-dnc-to-send-order-data-table',

    computed: {
      ...mapGetters([
        'getCurrSectorsShift',
      ]),

      getCurrSectorsShiftTblColumnNames() {
        return CurrSectorsShiftTblColumnNames;
      },

      getCurrSectorsShiftGetOrderStatus() {
        return CurrSectorsShiftGetOrderStatus;
      },

      getCurrSectorsShiftTblColumns() {
        return CurrSectorsShiftTblColumns;
      },
    },

    mounted() {
      this.$store.commit('setCurrSectorsShift', []);
    },

    methods: {
      sendOriginalToAll() {
        this.$store.commit('originalToAllSectorsShift');
      },

      sendOriginalToAllLeft() {
        this.$store.commit('originalToAllLeftSectorsShift');
      },

      sendCopyToAll() {
        this.$store.commit('copyToAllSectorsShift');
      },

      sendCopyToAllLeft() {
        this.$store.commit('copyToAllLeftSectorsShift');
      },

      doNotSendToAll() {
        this.$store.commit('doNotSendToAllSectorsShift');
      },
    }
  }
</script>


<style scoped>
</style>
