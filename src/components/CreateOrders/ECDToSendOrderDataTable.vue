<template>
  <div>
    <ShowChoosePersonDlg
      :showDlg="showChoosePersonDlg"
      :personal="sectorPersonal"
      :selectedPerson="selectedPerson"
      :sectorId="sectorId"
      :sectorName="sectorName"
      :workPoligonType="workPoligonTypes.ECD_SECTOR"
      @close="hideChoosePersonDlg"
    ></ShowChoosePersonDlg>

    <DataTable
      :value="getECDShiftForSendingData"
      class="p-datatable-responsive p-datatable-gridlines p-datatable-sm"
      :rowHover="true"
      breakpoint="200px"
    >
      <Column v-for="col of getCurrSectorsShiftTblColumns"
        :field="col.field"
        :header="col.title"
        :key="col.field"
        :style="{ width: col.width }"
        headerClass="dy58-table-header-cell-class"
        bodyClass="dy58-table-middle-content-cell-class dy58-send-table-data-cell"
      >
        <template #body="slotProps">
          <div v-if="col.field !== getCurrSectorsShiftTblColumnNames.notification"
            :class="[
              {'dy58-send-original': slotProps.data.sendOriginal === getCurrShiftGetOrderStatus.sendOriginal},
              {'dy58-send-copy': slotProps.data.sendOriginal === getCurrShiftGetOrderStatus.sendCopy},
            ]"
          >
            <span v-if="col.field !== getCurrSectorsShiftTblColumnNames.fio">
              {{ slotProps.data[col.field] }}
            </span>
            <span v-else
              :class="{
                'dy58-online-onduty-color': slotProps.data.lastUserChoiceFIOOnline && slotProps.data.lastUserChoiceFIOOnDuty,
                'dy58-online-notonduty-color': slotProps.data.lastUserChoiceFIOOnline && !slotProps.data.lastUserChoiceFIOOnDuty,
              }"
            >
              {{ slotProps.data[col.field] }}
              <a
                :class="['dy58-send-status-btn']"
                @click="() => openChoosePersonDlg(
                  slotProps.data.people
                    // Добавляем дополнительное поле для его отображения в диалоговом окне
                    .map((item) => ({ ...item, postFio: `${item.post} ${item.fio}` }))
                    // Удаляем повторяющиеся элементы
                    .filter((item, index, array) => array.findIndex((el) => el.postFio === item.postFio) === index),
                  slotProps.data.lastUserChoiceFIOId ? { id: slotProps.data.lastUserChoiceFIOId } : null,
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
                  @click="sendOriginalToDefinitSector(slotProps.data.id)"
              >
                Оригинал
              </a>
              <a :class="['dy58-send-status-btn',
                    {'dy58-send-copy': slotProps.data.sendOriginal === getCurrShiftGetOrderStatus.sendCopy,
                     'dy58-def-btn-color': slotProps.data.sendOriginal !== getCurrShiftGetOrderStatus.sendCopy,}]"
                  @click="sendCopyToDefinitSector(slotProps.data.id)"
              >
                Копия
              </a>
              <a :class="['dy58-send-status-btn',
                    {'dy58-do-not-send': slotProps.data.sendOriginal === getCurrShiftGetOrderStatus.doNotSend,
                     'dy58-def-btn-color': slotProps.data.sendOriginal !== getCurrShiftGetOrderStatus.doNotSend,}]"
                  @click="doNotSendToDefinitSector(slotProps.data.id)"
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
  } from '@/store/modules/personal/tablesColumns';
  import ShowChoosePersonDlg from '@/components/CreateOrders/ShowChoosePersonDlg';
  import {
    SET_GET_ORDER_STATUS_TO_ALL_ECD_SECTORS,
    SET_GET_ORDER_STATUS_TO_DEFINIT_ECD_SECTOR,
    SET_GET_ORDER_STATUS_TO_ALL_LEFT_ECD_SECTORS,
  } from '@/store/mutation-types';

  export default {
    name: 'dy58-ecd-to-send-order-data-table',

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
      };
    },

    components: {
      ShowChoosePersonDlg,
    },

    computed: {
      ...mapGetters([
        'getECDShiftForSendingData',
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
      // состояние хранилища (так, если сформировать на закладке "приказ" документ, определить
      // адресатов ЭЦД и назначить им "оригиналы"/"копии" документов, то при переходе на, например, закладку
      // "уведомление" без указанного ниже кода будет отображен только сформированный список адресатов ЭЦД,
      // без обозначений "оригинал"/"копия")
      this.$emit('input', this.getECDShiftForSendingData
        ? this.getECDShiftForSendingData
          .filter((item) => item.sendOriginal !== CurrShiftGetOrderStatus.doNotSend)
          : []);
    },

    watch: {
      getECDShiftForSendingData(newVal) {
        this.$emit('input', newVal
          ? newVal.filter((item) => item.sendOriginal !== CurrShiftGetOrderStatus.doNotSend)
          : []);
      },
    },

    methods: {
      sendOriginalToAll() {
        this.$store.commit(SET_GET_ORDER_STATUS_TO_ALL_ECD_SECTORS,
          { getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
      },

      sendOriginalToDefinitSector(ecdSectorId) {
        this.$store.commit(SET_GET_ORDER_STATUS_TO_DEFINIT_ECD_SECTOR,
          { ecdSectorId, getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
      },

      sendOriginalToAllLeft() {
        this.$store.commit(SET_GET_ORDER_STATUS_TO_ALL_LEFT_ECD_SECTORS,
          { getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
      },

      sendCopyToAll() {
        this.$store.commit(SET_GET_ORDER_STATUS_TO_ALL_ECD_SECTORS,
          { getOrderStatus: CurrShiftGetOrderStatus.sendCopy });
      },

      sendCopyToDefinitSector(ecdSectorId) {
        this.$store.commit(SET_GET_ORDER_STATUS_TO_DEFINIT_ECD_SECTOR,
          { ecdSectorId, getOrderStatus: CurrShiftGetOrderStatus.sendCopy });
      },

      sendCopyToAllLeft() {
        this.$store.commit(SET_GET_ORDER_STATUS_TO_ALL_LEFT_ECD_SECTORS,
          { getOrderStatus: CurrShiftGetOrderStatus.sendCopy });
      },

      doNotSendToAll() {
        this.$store.commit(SET_GET_ORDER_STATUS_TO_ALL_ECD_SECTORS,
          { getOrderStatus: CurrShiftGetOrderStatus.doNotSend });
      },

      doNotSendToDefinitSector(ecdSectorId) {
        this.$store.commit(SET_GET_ORDER_STATUS_TO_DEFINIT_ECD_SECTOR,
          { ecdSectorId, getOrderStatus: CurrShiftGetOrderStatus.doNotSend });
      },

      openChoosePersonDlg(people, selectedPerson, sectorId, sectorName) {
        this.sectorPersonal = people || [];
        this.selectedPerson = selectedPerson?.id;
        this.sectorId = sectorId;
        this.sectorName = `уч. ЭЦД ${sectorName}`;
        this.showChoosePersonDlg = true;
      },

      hideChoosePersonDlg() {
        this.showChoosePersonDlg = false;
      },
    }
  }
</script>
