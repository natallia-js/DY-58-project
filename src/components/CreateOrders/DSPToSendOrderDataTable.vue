<template>
  <div>
    <ShowChoosePersonDlg
      :showDlg="showChoosePersonDlg"
      :personal="sectorPersonal"
      :personalPost="getDSPPost"
      :sector="station"
      @close="hideChoosePersonDlg"
    ></ShowChoosePersonDlg>
    <DataTable
      :value="getDSPShiftForSendingData"
      class="p-datatable-responsive p-datatable-gridlines p-datatable-sm"
      :rowHover="true"
      rowGroupMode="subheader" :groupRowsBy="getCurrShiftTblColumnNames.sector"
      sortMode="single" :sortField="getCurrShiftTblColumnNames.sector" :sortOrder="1"
    >
      <Column
        :field="getCurrShiftTblColumnNames.sector"
        :header="getCurrShiftTblColumnNames.sector"
      >
      </Column>

      <Column v-for="col of getCurrShiftTblColumns"
        :field="col.field"
        :header="col.title"
        :key="col.field"
        :style="{ width: col.width }"
        headerClass="dy58-table-header-cell-class"
        bodyClass="dy58-table-content-cell-class"
      >
        <template #body="slotProps">
          <div v-if="col.field !== getCurrShiftTblColumnNames.notification"
              :class="[
                'dy58-send-table-data-cell',
                {'dy58-send-original': [getCurrShiftTblColumnNames.station,
                                        getCurrShiftTblColumnNames.fio].includes(col.field)
                                        && slotProps.data.sendOriginalToDSP === getCurrShiftGetOrderStatus.sendOriginal},
                {'dy58-send-copy': [getCurrShiftTblColumnNames.station,
                                    getCurrShiftTblColumnNames.fio].includes(col.field)
                                    && slotProps.data.sendOriginalToDSP === getCurrShiftGetOrderStatus.sendCopy},
              ]"
          >
            <span v-if="col.field !== getCurrShiftTblColumnNames.fio">
              {{ slotProps.data[col.field] }}
            </span>
            <span v-else :class="{'dy58-info': slotProps.data.fioOnline}">
              {{ slotProps.data[col.field] }}
              <a
                :class="['dy58-send-status-btn']"
                @click="() => openChoosePersonDlg(slotProps.data.people, slotProps.data.station)"
              >
                ...
              </a>
            </span>
          </div>
          <div v-else>
            <div class="dy58-tbl-send-btns-block">
              <a :class="['dy58-send-status-btn',
                    {'dy58-send-original': slotProps.data.sendOriginalToDSP === getCurrShiftGetOrderStatus.sendOriginal,
                     'dy58-def-btn-color': slotProps.data.sendOriginalToDSP !== getCurrShiftGetOrderStatus.sendOriginal,}]"
                  @click="() => sendOriginalToDefinitStation(slotProps.data.id)"
              >
                Оригинал
              </a>
              <a :class="['dy58-send-status-btn',
                    {'dy58-send-copy': slotProps.data.sendOriginalToDSP === getCurrShiftGetOrderStatus.sendCopy,
                     'dy58-def-btn-color': slotProps.data.sendOriginalToDSP !== getCurrShiftGetOrderStatus.sendCopy,}]"
                  @click="() => sendCopyToDefinitStation(slotProps.data.id)"
              >
                Копия
              </a>
              <a :class="['dy58-send-status-btn',
                    {'dy58-do-not-send': slotProps.data.sendOriginalToDSP === getCurrShiftGetOrderStatus.doNotSend,
                     'dy58-def-btn-color': slotProps.data.sendOriginalToDSP !== getCurrShiftGetOrderStatus.doNotSend,}]"
                  @click="() => doNotSendToDefinitStation(slotProps.data.id)"
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
  import { CurrShiftGetOrderStatus, ReceiversPosts } from '../../constants/orders';
  import {
    CurrStationsShiftTblColumnNames,
    CurrStationsShiftTblColumns,
  } from '../../store/modules/personal';
  import ShowChoosePersonDlg from './ShowChoosePersonDlg';

  export default {
    name: 'dy58-dsp-to-send-order-data-table',

    emits: ['input'],

    data() {
      return {
        showChoosePersonDlg: false,
        sectorPersonal: [],
        station: '',
      };
    },

    components: {
      ShowChoosePersonDlg,
    },

    computed: {
      ...mapGetters([
        'getDSPShiftForSendingData',
      ]),

      getCurrShiftTblColumnNames() {
        return CurrStationsShiftTblColumnNames;
      },

      getCurrShiftGetOrderStatus() {
        return CurrShiftGetOrderStatus;
      },

      getCurrShiftTblColumns() {
        return CurrStationsShiftTblColumns;
      },

      getDSPPost() {
        return ReceiversPosts.DSP;
      },
    },

    mounted() {
      // Поскольку информация о выбранном для отправки распоряжения персонале хранится в глобальном
      // хранилище, ее необходимо подгружать при монтировании компонента, чтобы отображать текущее
      // состояние хранилища
      this.$emit('input', this.getDSPShiftForSendingData
        ? this.getDSPShiftForSendingData
          .filter((item) => item.sendOriginalToDSP !== CurrShiftGetOrderStatus.doNotSend)
          : []);
    },

    watch: {
      getDSPShiftForSendingData(newVal) {
        this.$emit('input', newVal
          ? newVal.filter((item) => item.sendOriginalToDSP !== CurrShiftGetOrderStatus.doNotSend)
          : []);
      },
    },

    methods: {
      sendOriginalToAll() {
        this.$store.commit('setGetOrderStatusToAllDSP',
          { getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
      },

      sendOriginalToDefinitStation(stationId) {
        this.$store.commit('setGetOrderStatusToDefinitDSP',
          { stationId, getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
      },

      sendOriginalToAllLeft() {
        this.$store.commit('setGetOrderStatusToAllLeftDSP',
          { getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
      },

      sendCopyToAll() {
        this.$store.commit('setGetOrderStatusToAllDSP',
          { getOrderStatus: CurrShiftGetOrderStatus.sendCopy });
      },

      sendCopyToDefinitStation(stationId) {
        this.$store.commit('setGetOrderStatusToDefinitDSP',
          { stationId, getOrderStatus: CurrShiftGetOrderStatus.sendCopy });
      },

      sendCopyToAllLeft() {
        this.$store.commit('setGetOrderStatusToAllLeftDSP',
          { getOrderStatus: CurrShiftGetOrderStatus.sendCopy });
      },

      doNotSendToAll() {
        this.$store.commit('setGetOrderStatusToAllDSP',
          { getOrderStatus: CurrShiftGetOrderStatus.doNotSend });
      },

      doNotSendToDefinitStation(stationId) {
        this.$store.commit('setGetOrderStatusToDefinitDSP',
          { stationId, getOrderStatus: CurrShiftGetOrderStatus.doNotSend });
      },

      openChoosePersonDlg(people, station) {
        this.sectorPersonal = people || [];
        this.station = station;
        this.showChoosePersonDlg = true;
      },

      hideChoosePersonDlg() {
        this.showChoosePersonDlg = false;
      },
    }
  }
</script>


<style scoped>
</style>
