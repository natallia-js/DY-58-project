<template>
  <div>
    <ShowChoosePersonDlg
      :showDlg="showChoosePersonDlg"
      :personal="sectorPersonal"
      :selectedPerson="selectedPerson"
      :sectorId="sectorId"
      :sectorName="sectorName"
      :workPoligonType="workPoligonTypes.STATION"
      @close="hideChoosePersonDlg"
    ></ShowChoosePersonDlg>

    <DataTable
      :value="getDSPShiftForSendingData"
      class="p-datatable-responsive p-datatable-gridlines p-datatable-sm"
      :rowHover="true"
      rowGroupMode="subheader" :groupRowsBy="getCurrShiftTblColumnNames.sector"
      breakpoint="200px"
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
        bodyClass="dy58-table-middle-content-cell-class dy58-send-table-data-cell"
      >
        <template #body="slotProps">
          <div v-if="col.field !== getCurrShiftTblColumnNames.notification"
              :class="[
                {'dy58-send-original': slotProps.data.sendOriginal === getCurrShiftGetOrderStatus.sendOriginal},
                {'dy58-send-copy': slotProps.data.sendOriginal === getCurrShiftGetOrderStatus.sendCopy},
              ]"
          >
            <span v-if="col.field !== getCurrShiftTblColumnNames.fio">
              {{ slotProps.data[col.field] }}
            </span>
            <span v-else :class="{'dy58-info': slotProps.data.fioOnline}">
              {{ slotProps.data[col.field] }}
              <a
                class="dy58-send-status-btn"
                @click="() => openChoosePersonDlg(
                  slotProps.data.people
                    // Добавляем дополнительное поле для его отображения в диалоговом окне
                    .map((item) => ({ ...item, postFio: `${item.post} ${item.fio}` }))
                    // Удаляем повторяющиеся элементы (в принципе, их не должно быть, т.к. по одному пользователю
                    // рассматривается лишь 1 рабочее место; но если у 2 пользователей одинаковые должности и ФИО,
                    // то дубликатов действительно не будет)
                    .filter((item, index, array) => array.findIndex((el) => el.postFio === item.postFio) === index),
                  slotProps.data.fioId
                    ? { id: slotProps.data.fioId, fio: slotProps.data.fio, online: slotProps.data.fioOnline }
                    : null,
                  slotProps.data.id,
                  slotProps.data.station
                )"
              >
                ...
              </a>
            </span>
          </div>
          <div v-else>
            <div class="dy58-tbl-send-btns-block">
              <a :class="['dy58-send-status-btn',
                    {'dy58-send-original': slotProps.data.sendOriginal === getCurrShiftGetOrderStatus.sendOriginal,
                     'dy58-def-btn-color': slotProps.data.sendOriginal !== getCurrShiftGetOrderStatus.sendOriginal,}]"
                  @click="sendOriginalToDefinitStation(slotProps.data.id)"
              >
                Оригинал
              </a>
              <a :class="['dy58-send-status-btn',
                    {'dy58-send-copy': slotProps.data.sendOriginal === getCurrShiftGetOrderStatus.sendCopy,
                     'dy58-def-btn-color': slotProps.data.sendOriginal !== getCurrShiftGetOrderStatus.sendCopy,}]"
                  @click="sendCopyToDefinitStation(slotProps.data.id)"
              >
                Копия
              </a>
              <a :class="['dy58-send-status-btn',
                    {'dy58-do-not-send': slotProps.data.sendOriginal === getCurrShiftGetOrderStatus.doNotSend,
                     'dy58-def-btn-color': slotProps.data.sendOriginal !== getCurrShiftGetOrderStatus.doNotSend,}]"
                  @click="doNotSendToDefinitStation(slotProps.data.id)"
              >
                &#9747;
              </a>

            </div>
          </div>
        </template>
      </Column>

      <template v-if="trainSectorsNumber > 1" #groupheader="slotProps">
        <div class="dy58-shift-tbl-group-header">
          <Checkbox name="trainSectorCheckbox" :value="slotProps.data.sector" v-model="selectedTrainSectors" />
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
  import { CurrShiftGetOrderStatus } from '@/constants/orders';
  import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';
  import {
    CurrStationsShiftTblColumnNames,
    CurrStationsShiftTblColumns,
  } from '@/store/modules/personal/tablesColumns';
  import ShowChoosePersonDlg from '@/components/CreateOrders/ShowChoosePersonDlg';
  import {
    SET_GET_ORDER_STATUS_TO_ALL_DSP,
    SET_GET_ORDER_STATUS_TO_DEFINIT_DSP,
    SET_GET_ORDER_STATUS_TO_ALL_LEFT_DSP,
  } from '@/store/mutation-types';

  export default {
    name: 'dy58-dsp-to-send-order-data-table',

    emits: ['input'],

    props: {
      // Присутствует формально, не используется в данном модуле
      value: {
        type: Object,
      },
    },

    data() {
      return {
        showChoosePersonDlg: false,
        sectorPersonal: [],
        selectedPerson: null,
        sectorId: -1,
        sectorName: null,
        selectedTrainSectors: [],
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

      workPoligonTypes() {
        return WORK_POLIGON_TYPES;
      },

      trainSectorsNumber() {
        return new Set(this.getDSPShiftForSendingData.map((el) => el.sector)).size;
      },
    },

    mounted() {
      // Поскольку информация о выбранном для отправки распоряжения персонале хранится в глобальном
      // хранилище, ее необходимо подгружать при монтировании компонента, чтобы отображать текущее
      // состояние хранилища (так, если сформировать на закладке "распоряжение" документ, определить
      // адресатов ДСП и назначить им "оригиналы"/"копии" документов, то при переходе на, например, закладку
      // "заявка" без указанного ниже кода будет отображен только сформированный список адресатов ДСП,
      // без обозначений "оригинал"/"копия")
      this.$emit('input', this.getDSPShiftForSendingData
        ? this.getDSPShiftForSendingData
          .filter((item) => item.sendOriginal !== CurrShiftGetOrderStatus.doNotSend)
          : []);
    },

    watch: {
      getDSPShiftForSendingData(newVal) {
        this.$emit('input', newVal
          ? newVal.filter((item) => item.sendOriginal !== CurrShiftGetOrderStatus.doNotSend)
          : []);
      },
    },

    methods: {
      sendOriginalToAll() {
        const selectedTrainSectors = this.selectedTrainSectors.length ? Object.values(this.selectedTrainSectors) : [];
        if (selectedTrainSectors.length === 0) {
          this.$store.commit(SET_GET_ORDER_STATUS_TO_ALL_DSP,
            { getOrderStatus: CurrShiftGetOrderStatus.sendOriginal, trainSectorTitle: null });
        } else {
          selectedTrainSectors.forEach((trainSectorTitle) => {
            this.$store.commit(SET_GET_ORDER_STATUS_TO_ALL_DSP,
              { getOrderStatus: CurrShiftGetOrderStatus.sendOriginal, trainSectorTitle });
          });
        }
      },

      sendOriginalToDefinitStation(stationId) {
        this.$store.commit(SET_GET_ORDER_STATUS_TO_DEFINIT_DSP,
          { stationId, getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
      },

      sendOriginalToAllLeft() {
        const selectedTrainSectors = this.selectedTrainSectors.length ? Object.values(this.selectedTrainSectors) : [];
        if (selectedTrainSectors.length === 0) {
          this.$store.commit(SET_GET_ORDER_STATUS_TO_ALL_LEFT_DSP,
            { getOrderStatus: CurrShiftGetOrderStatus.sendOriginal, trainSectorTitle: null });
        } else {
          selectedTrainSectors.forEach((trainSectorTitle) => {
            this.$store.commit(SET_GET_ORDER_STATUS_TO_ALL_LEFT_DSP,
              { getOrderStatus: CurrShiftGetOrderStatus.sendOriginal, trainSectorTitle });
          });
        }
      },

      sendCopyToAll() {
        const selectedTrainSectors = this.selectedTrainSectors.length ? Object.values(this.selectedTrainSectors) : [];
        if (selectedTrainSectors.length === 0) {
          this.$store.commit(SET_GET_ORDER_STATUS_TO_ALL_DSP,
            { getOrderStatus: CurrShiftGetOrderStatus.sendCopy, trainSectorTitle: null });
        } else {
          selectedTrainSectors.forEach((trainSectorTitle) => {
            this.$store.commit(SET_GET_ORDER_STATUS_TO_ALL_DSP,
              { getOrderStatus: CurrShiftGetOrderStatus.sendCopy, trainSectorTitle });
          });
        }
      },

      sendCopyToDefinitStation(stationId) {
        this.$store.commit(SET_GET_ORDER_STATUS_TO_DEFINIT_DSP,
          { stationId, getOrderStatus: CurrShiftGetOrderStatus.sendCopy });
      },

      sendCopyToAllLeft() {
        const selectedTrainSectors = this.selectedTrainSectors.length ? Object.values(this.selectedTrainSectors) : [];
        if (selectedTrainSectors.length === 0) {
          this.$store.commit(SET_GET_ORDER_STATUS_TO_ALL_LEFT_DSP,
            { getOrderStatus: CurrShiftGetOrderStatus.sendCopy, trainSectorTitle: null });
        } else {
          selectedTrainSectors.forEach((trainSectorTitle) => {
            this.$store.commit(SET_GET_ORDER_STATUS_TO_ALL_LEFT_DSP,
              { getOrderStatus: CurrShiftGetOrderStatus.sendCopy, trainSectorTitle });
          });
        }
      },

      doNotSendToAll() {
        const selectedTrainSectors = this.selectedTrainSectors.length ? Object.values(this.selectedTrainSectors) : [];
        if (selectedTrainSectors.length === 0) {
          this.$store.commit(SET_GET_ORDER_STATUS_TO_ALL_DSP,
            { getOrderStatus: CurrShiftGetOrderStatus.doNotSend, trainSectorTitle: null });
        } else {
          selectedTrainSectors.forEach((trainSectorTitle) => {
            this.$store.commit(SET_GET_ORDER_STATUS_TO_ALL_DSP,
              { getOrderStatus: CurrShiftGetOrderStatus.doNotSend, trainSectorTitle });
          });
        }
      },

      doNotSendToDefinitStation(stationId) {
        this.$store.commit(SET_GET_ORDER_STATUS_TO_DEFINIT_DSP,
          { stationId, getOrderStatus: CurrShiftGetOrderStatus.doNotSend });
      },

      openChoosePersonDlg(people, selectedPerson, sectorId, sectorName) {
        this.sectorPersonal = people || [];
        this.selectedPerson = selectedPerson?.id;
        this.sectorId = sectorId;
        this.sectorName = `ст. ${sectorName}`;
        this.showChoosePersonDlg = true;
      },

      hideChoosePersonDlg() {
        this.showChoosePersonDlg = false;
      },
    }
  }
</script>
