<template>
  <div>
    <ShowChoosePersonDlg
      :showDlg="showChoosePersonDlg"
      :personal="sectorPersonal"
      :personalPost="getECDPost"
      :sector="sector"
      @close="hideChoosePersonDlg"
    ></ShowChoosePersonDlg>
    <DataTable
      :value="getECDShiftForSendingData"
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
                @click="() => openChoosePersonDlg(slotProps.data.people, slotProps.data.sector)"
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
  import { CurrShiftGetOrderStatus, ReceiversPosts } from '../../constants/orders';
  import {
    CurrSectorsShiftTblColumnNames,
    CurrSectorsShiftTblColumns,
  } from '../../store/modules/personal';
  import ShowChoosePersonDlg from './ShowChoosePersonDlg';

  export default {
    name: 'dy58-ecd-to-send-order-data-table',

    emits: ['input'],

    data() {
      return {
        showChoosePersonDlg: false,
        sectorPersonal: [],
        sector: '',
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

      getECDPost() {
        return ReceiversPosts.ECD;
      },
    },

    mounted() {
      // Поскольку информация о выбранном для отправки распоряжения персонале хранится в глобальном
      // хранилище, ее необходимо подгружать при монтировании компонента, чтобы отображать текущее
      // состояние хранилища
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
        this.$store.commit('setGetOrderStatusToAllECDSectors',
          { getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
      },

      sendOriginalToDefinitSector(ecdSectorId) {
        this.$store.commit('setGetOrderStatusToDefinitECDSector',
          { ecdSectorId, getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
      },

      sendOriginalToAllLeft() {
        this.$store.commit('setGetOrderStatusToAllLeftECDSectors',
          { getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
      },

      sendCopyToAll() {
        this.$store.commit('setGetOrderStatusToAllECDSectors',
          { getOrderStatus: CurrShiftGetOrderStatus.sendCopy });
      },

      sendCopyToDefinitSector(ecdSectorId) {
        this.$store.commit('setGetOrderStatusToDefinitECDSector',
          { ecdSectorId, getOrderStatus: CurrShiftGetOrderStatus.sendCopy });
      },

      sendCopyToAllLeft() {
        this.$store.commit('setGetOrderStatusToAllLeftECDSectors',
          { getOrderStatus: CurrShiftGetOrderStatus.sendCopy });
      },

      doNotSendToAll() {
        this.$store.commit('setGetOrderStatusToAllECDSectors',
          { getOrderStatus: CurrShiftGetOrderStatus.doNotSend });
      },

      doNotSendToDefinitSector(ecdSectorId) {
        this.$store.commit('setGetOrderStatusToDefinitECDSector',
          { ecdSectorId, getOrderStatus: CurrShiftGetOrderStatus.doNotSend });
      },

      openChoosePersonDlg(people, sector) {
        this.sectorPersonal = people || [];
        this.sector = sector;
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
