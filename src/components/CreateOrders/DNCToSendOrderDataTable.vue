<template>
  <ShowChoosePersonDlg
    :showDlg="showChoosePersonDlg"
    :personal="sectorPersonal"
    :personalPost="getDNCPost"
    :sector="sector"
    @close="hideChoosePersonDlg"
  ></ShowChoosePersonDlg>
  <div>
    <DataTable
      :value="getDNCShiftForSendingData"
      class="p-datatable-responsive p-datatable-gridlines p-datatable-sm"
      :rowHover="true"
    >
      <!--<template #header>
        <div class="dy58-table-title">
          ДНЦ
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
                                        && slotProps.data.sendOriginalToDNC === getCurrShiftGetOrderStatus.sendOriginal},
                {'dy58-send-copy': [getCurrSectorsShiftTblColumnNames.sector,
                                    getCurrSectorsShiftTblColumnNames.fio].includes(col.field)
                                    && slotProps.data.sendOriginalToDNC === getCurrShiftGetOrderStatus.sendCopy},
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
  import { CurrShiftGetOrderStatus, ReceiversPosts } from '../../constants/orders';
  import {
    CurrSectorsShiftTblColumnNames,
    CurrSectorsShiftTblColumns,
  } from '../../store/modules/personal';
  import ShowChoosePersonDlg from '../../components/ShowChoosePersonDlg';

  export default {
    name: 'dy58-dnc-to-send-order-data-table',

    emits: ['input'],

    data() {
      return {
        showChoosePersonDlg: false,
        sectorPersonal: [],
        sector: null,
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

      getDNCPost() {
        return ReceiversPosts.DNC;
      },
    },

    mounted() {
      // Поскольку информация о выбранном для отправки распоряжения персонале хранится в глобальном
      // хранилище, ее необходимо подгружать при монтировании компонента, чтобы отображать текущее
      // состояние хранилища
      this.$emit('input', this.getDNCShiftForSendingData
        ? this.getDNCShiftForSendingData
          .filter((item) => item.sendOriginalToDNC !== CurrShiftGetOrderStatus.doNotSend)
          : []);
    },

    watch: {
      getDNCShiftForSendingData(newVal) {console.log(newVal)
        this.$emit('input', newVal
          ? newVal.filter((item) => item.sendOriginalToDNC !== CurrShiftGetOrderStatus.doNotSend)
          : []);
      },
    },

    methods: {
      sendOriginalToAll() {
        this.$store.commit('setGetOrderStatusToAllDNCSectors',
          { getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
      },

      sendOriginalToDefinitSector(dncSectorId) {
        this.$store.commit('setGetOrderStatusToDefinitDNCSector',
          { dncSectorId, getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
      },

      sendOriginalToAllLeft() {
        this.$store.commit('setGetOrderStatusToAllLeftDNCSectors',
          { getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
      },

      sendCopyToAll() {
        this.$store.commit('setGetOrderStatusToAllDNCSectors',
          { getOrderStatus: CurrShiftGetOrderStatus.sendCopy });
      },

      sendCopyToDefinitSector(dncSectorId) {
        this.$store.commit('setGetOrderStatusToDefinitDNCSector',
          { dncSectorId, getOrderStatus: CurrShiftGetOrderStatus.sendCopy });
      },

      sendCopyToAllLeft() {
        this.$store.commit('setGetOrderStatusToAllLeftDNCSectors',
          { getOrderStatus: CurrShiftGetOrderStatus.sendCopy });
      },

      doNotSendToAll() {
        this.$store.commit('setGetOrderStatusToAllDNCSectors',
          { getOrderStatus: CurrShiftGetOrderStatus.doNotSend });
      },

      doNotSendToDefinitSector(dncSectorId) {
        this.$store.commit('setGetOrderStatusToDefinitDNCSector',
          { dncSectorId, getOrderStatus: CurrShiftGetOrderStatus.doNotSend });
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
