<template>
  <div>
    <ShowChoosePersonDlg
      :showDlg="showChoosePersonDlg"
      :personal="sectorPersonal"
      :selectedPerson="selectedPerson"
      :sectorId="sectorId"
      :sectorName="sectorName"
      :workPoligonType="workPoligonTypes.DNC_SECTOR"
      @close="hideChoosePersonDlg"
    ></ShowChoosePersonDlg>

    <DataTable
      :value="getDNCShiftForSendingData"
      class="p-datatable-responsive p-datatable-gridlines p-datatable-sm"
      :rowHover="true"
    >
      <Column v-for="col of getCurrSectorsShiftTblColumns"
        :field="col.field"
        :header="col.title"
        :key="col.field"
        :style="{ width: col.width }"
        headerClass="dy58-table-header-cell-class"
        bodyClass="dy58-table-content-cell-class dy58-send-table-data-cell"
      >
        <template #body="slotProps">
          <div v-if="col.field !== getCurrSectorsShiftTblColumnNames.notification"
              :class="[
                {'dy58-send-original': [getCurrSectorsShiftTblColumnNames.sector,
                                        getCurrSectorsShiftTblColumnNames.fio].includes(col.field)
                                        && slotProps.data.sendOriginal === getCurrShiftGetOrderStatus.sendOriginal},
                {'dy58-send-copy': [getCurrSectorsShiftTblColumnNames.sector,
                                    getCurrSectorsShiftTblColumnNames.fio].includes(col.field)
                                    && slotProps.data.sendOriginal === getCurrShiftGetOrderStatus.sendCopy},
              ]"
          >
            <span v-if="col.field !== getCurrSectorsShiftTblColumnNames.fio">
              {{ slotProps.data[col.field] }}
            </span>
            <span v-else :class="{'dy58-info': slotProps.data.fioOnline}">
              {{ slotProps.data[col.field] }}
              <a
                :class="['dy58-send-status-btn']"
                @click="() => openChoosePersonDlg(
                  slotProps.data.people
                    // Добавляем дополнительное поле для его отображения в диалоговом окне
                    .map((item) => ({ ...item, postFio: `${item.post} ${item.fio}` }))
                    // Удаляем повторяющиеся элементы
                    .filter((item, index, array) => array.findIndex((el) => el.postFio === item.postFio) === index),
                  slotProps.data.fioId
                    ? { id: slotProps.data.fioId, fio: slotProps.data.fio, online: slotProps.data.fioOnline }
                    : null,
                  slotProps.data.id,
                  slotProps.data.sector
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
                  @click="() => sendOriginalToDefinitSector(slotProps.data.id)"
              >
                Оригинал
              </a>
              <a :class="['dy58-send-status-btn',
                    {'dy58-send-copy': slotProps.data.sendOriginal === getCurrShiftGetOrderStatus.sendCopy,
                     'dy58-def-btn-color': slotProps.data.sendOriginal !== getCurrShiftGetOrderStatus.sendCopy,}]"
                  @click="() => sendCopyToDefinitSector(slotProps.data.id)"
              >
                Копия
              </a>
              <a :class="['dy58-send-status-btn',
                    {'dy58-do-not-send': slotProps.data.sendOriginal === getCurrShiftGetOrderStatus.doNotSend,
                     'dy58-def-btn-color': slotProps.data.sendOriginal !== getCurrShiftGetOrderStatus.doNotSend,}]"
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
  import { CurrShiftGetOrderStatus } from '@/constants/orders';
  import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';
  import {
    CurrSectorsShiftTblColumnNames,
    CurrSectorsShiftTblColumns,
  } from '@/store/modules/personal';
  import ShowChoosePersonDlg from '@/components/CreateOrders/ShowChoosePersonDlg';
  import {
    SET_GET_ORDER_STATUS_TO_ALL_DNC_SECTORS,
    SET_GET_ORDER_STATUS_TO_DEFINIT_DNC_SECTOR,
    SET_GET_ORDER_STATUS_TO_ALL_LEFT_DNC_SECTORS,
  } from '@/store/mutation-types';

  export default {
    name: 'dy58-dnc-to-send-order-data-table',

    emits: ['input'],

    data() {
      return {
        showChoosePersonDlg: false,
        sectorPersonal: [],
        selectedPerson: null,
        sectorId: -1,
        sectorName: null,
      };
    },

    components: {
      ShowChoosePersonDlg,
    },

    computed: {
      ...mapGetters([
        'getDNCShiftForSendingData',
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

      workPoligonTypes() {
        return WORK_POLIGON_TYPES;
      },
    },

    mounted() {
      // Поскольку информация о выбранном для отправки распоряжения персонале хранится в глобальном
      // хранилище, ее необходимо подгружать при монтировании компонента, чтобы отображать текущее
      // состояние хранилища
      this.$emit('input', this.getDNCShiftForSendingData
        ? this.getDNCShiftForSendingData
          .filter((item) => item.sendOriginal !== CurrShiftGetOrderStatus.doNotSend)
          : []);
    },

    watch: {
      getDNCShiftForSendingData(newVal) {
        this.$emit('input', newVal
          ? newVal.filter((item) => item.sendOriginal !== CurrShiftGetOrderStatus.doNotSend)
          : []);
      },
    },

    methods: {
      sendOriginalToAll() {
        this.$store.commit(SET_GET_ORDER_STATUS_TO_ALL_DNC_SECTORS,
          { getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
      },

      sendOriginalToDefinitSector(dncSectorId) {
        this.$store.commit(SET_GET_ORDER_STATUS_TO_DEFINIT_DNC_SECTOR,
          { dncSectorId, getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
      },

      sendOriginalToAllLeft() {
        this.$store.commit(SET_GET_ORDER_STATUS_TO_ALL_LEFT_DNC_SECTORS,
          { getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
      },

      sendCopyToAll() {
        this.$store.commit(SET_GET_ORDER_STATUS_TO_ALL_DNC_SECTORS,
          { getOrderStatus: CurrShiftGetOrderStatus.sendCopy });
      },

      sendCopyToDefinitSector(dncSectorId) {
        this.$store.commit(SET_GET_ORDER_STATUS_TO_DEFINIT_DNC_SECTOR,
          { dncSectorId, getOrderStatus: CurrShiftGetOrderStatus.sendCopy });
      },

      sendCopyToAllLeft() {
        this.$store.commit(SET_GET_ORDER_STATUS_TO_ALL_LEFT_DNC_SECTORS,
          { getOrderStatus: CurrShiftGetOrderStatus.sendCopy });
      },

      doNotSendToAll() {
        this.$store.commit(SET_GET_ORDER_STATUS_TO_ALL_DNC_SECTORS,
          { getOrderStatus: CurrShiftGetOrderStatus.doNotSend });
      },

      doNotSendToDefinitSector(dncSectorId) {
        this.$store.commit(SET_GET_ORDER_STATUS_TO_DEFINIT_DNC_SECTOR,
          { dncSectorId, getOrderStatus: CurrShiftGetOrderStatus.doNotSend });
      },

      openChoosePersonDlg(people, selectedPerson, sectorId, sectorName) {
        this.sectorPersonal = people || [];
        this.selectedPerson = selectedPerson;
        this.sectorId = sectorId;
        this.sectorName = `уч. ДНЦ ${sectorName}`;
        this.showChoosePersonDlg = true;
      },

      hideChoosePersonDlg() {
        this.showChoosePersonDlg = false;
      },
    }
  }
</script>
