<template>
  <div>
    <DataTable
      :value="getCurrNearestECDSectorsECDShiftForSendingData"
      class="p-datatable-responsive p-datatable-gridlines p-datatable-sm"
      :rowHover="true"
    >
      <!--<template #header>
        <div class="dy58-table-title">
          ЭЦД
        </div>
      </template>-->

      <Column v-for="col of getCurrSectorsShiftTblColumns"
        :field="col.field"
        :header="col.title"
        :key="col.field"
        :style="{ width: col.width }"
        headerClass="dy58-table-header-cell-class"
        bodyClass="dy58-table-content-cell-class"
      >
        <template #body="slotProps">
          <div v-if="col.field !== getCurrSectorsShiftTblColumnNames.notification"
              :class="[
                'dy58-send-table-data-cell',
                {'dy58-send-original': [getCurrSectorsShiftTblColumnNames.sector,
                                        getCurrSectorsShiftTblColumnNames.fio].includes(col.field)
                                        && slotProps.data.sendOriginalToECD === getCurrShiftGetOrderStatus.sendOriginal},
                {'dy58-send-copy': [getCurrSectorsShiftTblColumnNames.sector,
                                    getCurrSectorsShiftTblColumnNames.fio].includes(col.field)
                                    && slotProps.data.sendOriginalToECD === getCurrShiftGetOrderStatus.sendCopy},
              ]"
          >
            {{ slotProps.data[col.field] }}
          </div>
          <div v-if="col.field === getCurrSectorsShiftTblColumnNames.notification">
            <div class="dy58-tbl-send-btns-block">
              <a :class="['dy58-send-status-btn',
                    {'dy58-send-original': slotProps.data.sendOriginalToECD === getCurrShiftGetOrderStatus.sendOriginal,
                     'dy58-def-btn-color': slotProps.data.sendOriginalToECD !== getCurrShiftGetOrderStatus.sendOriginal,}]"
                  @click="() => sendOriginalToDefinitSector(slotProps.data.id)"
              >
                Оригинал
              </a>
              <a :class="['dy58-send-status-btn',
                    {'dy58-send-copy': slotProps.data.sendOriginalToECD === getCurrShiftGetOrderStatus.sendCopy,
                     'dy58-def-btn-color': slotProps.data.sendOriginalToECD !== getCurrShiftGetOrderStatus.sendCopy,}]"
                  @click="() => sendCopyToDefinitSector(slotProps.data.id)"
              >
                Копия
              </a>
              <a :class="['dy58-send-status-btn',
                    {'dy58-do-not-send': slotProps.data.sendOriginalToECD === getCurrShiftGetOrderStatus.doNotSend,
                     'dy58-def-btn-color': slotProps.data.sendOriginalToECD !== getCurrShiftGetOrderStatus.doNotSend,}]"
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
  import { CurrShiftGetOrderStatus } from '../../constants/orders';
  import {
    CurrSectorsShiftTblColumnNames,
    CurrSectorsShiftTblColumns,
  } from '../../store/modules/personal';

  export default {
    name: 'dy58-ecd-to-send-order-data-table',

    emits: ['input'],

    computed: {
      ...mapGetters([
        'getCurrNearestECDSectorsECDShiftForSendingData',
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

    mounted() {
      // Поскольку информация о выбранном для отправки распоряжения персонале хранится в глобальном
      // хранилище, ее необходимо подгружать при монтировании компонента, чтобы отображать текущее
      // состояние хранилища
      this.$emit('input', this.getCurrNearestECDSectorsECDShiftForSendingData
        ? this.getCurrNearestECDSectorsECDShiftForSendingData
          .filter((item) => item.sendOriginalToECD !== CurrShiftGetOrderStatus.doNotSend)
          : []);
    },

    watch: {
      getCurrNearestECDSectorsECDShiftForSendingData(newVal) {
        this.$emit('input', newVal
          ? newVal.filter((item) => item.sendOriginalToECD !== CurrShiftGetOrderStatus.doNotSend)
          : []);
      },
    },

    methods: {
      sendOriginalToAll() {
        this.$store.commit('setGetOrderStatusToAllNearestECDSectorsECDShift',
          { getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
      },

      sendOriginalToDefinitSector(ecdSectorId) {
        this.$store.commit('setGetOrderStatusToDefinitNearestECDSectorECDShift',
          { ecdSectorId, getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
      },

      sendOriginalToAllLeft() {
        this.$store.commit('setGetOrderStatusToAllLeftNearestECDSectorsECDShift',
          { getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
      },

      sendCopyToAll() {
        this.$store.commit('setGetOrderStatusToAllNearestECDSectorsECDShift',
          { getOrderStatus: CurrShiftGetOrderStatus.sendCopy });
      },

      sendCopyToDefinitSector(ecdSectorId) {
        this.$store.commit('setGetOrderStatusToDefinitNearestECDSectorECDShift',
          { ecdSectorId, getOrderStatus: CurrShiftGetOrderStatus.sendCopy });
      },

      sendCopyToAllLeft() {
        this.$store.commit('setGetOrderStatusToAllLeftNearestECDSectorsECDShift',
          { getOrderStatus: CurrShiftGetOrderStatus.sendCopy });
      },

      doNotSendToAll() {
        this.$store.commit('setGetOrderStatusToAllNearestECDSectorsECDShift',
          { getOrderStatus: CurrShiftGetOrderStatus.doNotSend });
      },

      doNotSendToDefinitSector(ecdSectorId) {
        this.$store.commit('setGetOrderStatusToDefinitNearestECDSectorECDShift',
          { ecdSectorId, getOrderStatus: CurrShiftGetOrderStatus.doNotSend });
      },
    }
  }
</script>


<style scoped>
</style>
