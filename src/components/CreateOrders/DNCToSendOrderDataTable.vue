<template>
  <div class="dy58-dnc-tbl-block">
    <!-- classes 'p-datatable-responsive', 'p-datatable-gridlines', 'p-datatable-sm' - PrimeVue classes -->
    <!-- class 'z-depth-1' - materializescc class -->
    <DataTable
      :value="getCurrSectorsShift"
      class="p-datatable-responsive p-datatable-gridlines p-datatable-sm z-depth-1"
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
        :headerStyle="{ width: col.width, }"
        headerClass="dy58-table-header-cell-class"
        :bodyStyle="{ width: col.width }"
        bodyClass="dy58-table-content-cell-class dy58-no-padding"
      >
        <template #body="slotProps">
          <div v-if="col.field !== getCurrSectorsShiftTblColumnNames.notification"
              :class="[
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
          <div v-if="col.field === getCurrSectorsShiftTblColumnNames.notification"
          >
            <div class="dy58-tbl-send-btns-block">
              <a :class="['waves-effect',
                          'waves-light',
                          'btn-small',
                          'dy58-send-status-btn',
                          {'dy58-send-original': slotProps.data.sendOriginal === getCurrSectorsShiftGetOrderStatus.sendOriginal,
                           'dy58-def-btn-color': slotProps.data.sendOriginal !== getCurrSectorsShiftGetOrderStatus.sendOriginal,}]"
                  @click="if (slotProps.data.sendOriginal !== getCurrSectorsShiftGetOrderStatus.sendOriginal) {
                            slotProps.data.sendOriginal = getCurrSectorsShiftGetOrderStatus.sendOriginal;
                          }"
              >
                Оригинал
              </a>
              <a :class="['waves-effect',
                          'waves-light',
                          'btn-small',
                          'dy58-send-status-btn',
                          {'dy58-send-copy': slotProps.data.sendOriginal === getCurrSectorsShiftGetOrderStatus.sendCopy,
                           'dy58-def-btn-color': slotProps.data.sendOriginal !== getCurrSectorsShiftGetOrderStatus.sendCopy,}]"
                  @click="if (slotProps.data.sendOriginal !== getCurrSectorsShiftGetOrderStatus.sendCopy) {
                            slotProps.data.sendOriginal = getCurrSectorsShiftGetOrderStatus.sendCopy;
                          }"
              >
                Копия
              </a>
              <a :class="['waves-effect',
                          'waves-light',
                          'btn-small',
                          'dy58-send-status-btn',
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
          <a :class="['waves-effect',
                      'waves-light',
                      'btn-small',
                      'dy58-send-status-btn',
                      'no-uppercase',
                      'dy58-send-original',
                      'tooltipped',]"
              data-position="bottom" data-tooltip="Оригинал всем"
              @click="sendOriginalToAll"
          >
            Оригинал всем
          </a>
          <a :class="['waves-effect',
                      'waves-light',
                      'btn-small',
                      'dy58-send-status-btn',
                      'no-uppercase',
                      'dy58-send-copy',
                      'tooltipped',]"
              data-position="bottom" data-tooltip="Копию всем"
              @click="sendCopyToAll"
          >
            Копию всем
          </a>
          <a :class="['waves-effect',
                      'waves-light',
                      'btn-small',
                      'dy58-send-status-btn',
                      'no-uppercase',
                      'dy58-do-not-send',
                      'tooltipped',]"
              data-position="bottom" data-tooltip="Не уведомлять всех"
              @click="doNotSendToAll"
          >
            Не уведомлять всех
          </a>
          <a :class="['waves-effect',
                      'waves-light',
                      'btn-small',
                      'dy58-send-status-btn',
                      'no-uppercase',
                      'dy58-send-original',
                      'tooltipped',]"
              data-position="bottom" data-tooltip="Оригинал оставшимся"
              @click="sendOriginalToAllLeft"
          >
            Оригинал оставшимся
          </a>
          <a :class="['waves-effect',
                      'waves-light',
                      'btn-small',
                      'dy58-send-status-btn',
                      'no-uppercase',
                      'dy58-send-copy',
                      'tooltipped',]"
              data-position="bottom" data-tooltip="Копию оставшимся"
              @click="sendCopyToAllLeft"
          >
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
  } from '../../store/modules/currSectorsShift';

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

  .dy58-dnc-tbl-block {
    min-width: 700px;
  }

</style>