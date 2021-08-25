<template>
  <div>
    <DataTable
      :value="getCurrShift"
      class="p-datatable-responsive p-datatable-gridlines p-datatable-sm"
      :rowHover="true"
      rowGroupMode="subheader" :groupRowsBy="getCurrShiftTblColumnNames.sector"
      sortMode="single" :sortField="getCurrShiftTblColumnNames.sector" :sortOrder="1"
    >
      <template #header>
        <div class="dy58-table-title">
          ДСП
        </div>
      </template>

      <Column
        :field="getCurrShiftTblColumnNames.sector"
        :header="getCurrShiftTblColumnNames.sector"
      >
      </Column>

      <Column v-for="col of getCurrShiftTblColumns"
        :field="col.field"
        :header="col.title"
        :key="col.field"
        :headerStyle="{ width: col.width }"
        headerClass="dy58-table-header-cell-class"
        :bodyStyle="{ width: col.width }"
        bodyClass="dy58-table-content-cell-class"
      >
        <template #body="slotProps">
          <div v-if="col.field !== getCurrShiftTblColumnNames.notification"
              :class="[
                        'dy58-send-table-data-cell',
                        {'dy58-send-original': [getCurrShiftTblColumnNames.station,
                                                getCurrShiftTblColumnNames.post,
                                                getCurrShiftTblColumnNames.fio].includes(col.field)
                                                && slotProps.data.sendOriginal === getCurrShiftGetOrderStatus.sendOriginal},
                        {'dy58-send-copy': [getCurrShiftTblColumnNames.station,
                                            getCurrShiftTblColumnNames.post,
                                            getCurrShiftTblColumnNames.fio].includes(col.field)
                                            && slotProps.data.sendOriginal === getCurrShiftGetOrderStatus.sendCopy},
                      ]"
          >
            {{ slotProps.data[col.field] }}
          </div>
          <div v-if="col.field === getCurrShiftTblColumnNames.notification"
          >
            <div class="dy58-tbl-send-btns-block">
              <a :class="['dy58-send-status-btn',
                          {'dy58-send-original': slotProps.data.sendOriginal === getCurrShiftGetOrderStatus.sendOriginal,
                           'dy58-def-btn-color': slotProps.data.sendOriginal !== getCurrShiftGetOrderStatus.sendOriginal,}]"
                  @click="if (slotProps.data.sendOriginal !== getCurrShiftGetOrderStatus.sendOriginal) {
                            slotProps.data.sendOriginal = getCurrShiftGetOrderStatus.sendOriginal;
                          }"
              >
                Оригинал
              </a>
              <a :class="['dy58-send-status-btn',
                          {'dy58-send-copy': slotProps.data.sendOriginal === getCurrShiftGetOrderStatus.sendCopy,
                           'dy58-def-btn-color': slotProps.data.sendOriginal !== getCurrShiftGetOrderStatus.sendCopy,}]"
                  @click="if (slotProps.data.sendOriginal !== getCurrShiftGetOrderStatus.sendCopy) {
                            slotProps.data.sendOriginal = getCurrShiftGetOrderStatus.sendCopy;
                          }"
              >
                Копия
              </a>
              <a :class="['dy58-send-status-btn',
                          {'dy58-do-not-send': slotProps.data.sendOriginal === getCurrShiftGetOrderStatus.doNotSend,
                           'dy58-def-btn-color': slotProps.data.sendOriginal !== getCurrShiftGetOrderStatus.doNotSend,}]"
                  @click="if (slotProps.data.sendOriginal !== getCurrShiftGetOrderStatus.doNotSend) {
                            slotProps.data.sendOriginal = getCurrShiftGetOrderStatus.doNotSend;
                          }"
              >
                &#9747;
              </a>

            </div>
          </div>
        </template>
      </Column>

      <template #groupheader="slotProps">
        <div class="dy58-table-content-cell-class dy58-shift-tbl-group-header"
        >
          {{ slotProps.data.sector }}
        </div>
      </template>

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
    CurrShiftTblColumnNames,
    CurrShiftTblColumns,
  } from '../../store/modules/currShift1';

  export default {
    name: 'dy58-dsp-to-send-order-data-table',

    computed: {
      ...mapGetters([
        'getCurrShift',
      ]),

      getCurrShiftTblColumnNames() {
        return CurrShiftTblColumnNames;
      },

      getCurrShiftGetOrderStatus() {
        return CurrShiftGetOrderStatus;
      },

      getCurrShiftTblColumns() {
        return CurrShiftTblColumns;
      },
    },

    mounted() {
      this.$store.commit('setCurrShift', []);
    },

    methods: {
      sendOriginalToAll() {
        this.$store.commit('originalToAll');
      },

      sendOriginalToAllLeft() {
        this.$store.commit('originalToAllLeft');
      },

      sendCopyToAll() {
        this.$store.commit('copyToAll');
      },

      sendCopyToAllLeft() {
        this.$store.commit('copyToAllLeft');
      },

      doNotSendToAll() {
        this.$store.commit('doNotSendToAll');
      },
    }
  }
</script>


<style scoped>
</style>
