<template>
  <div>
    <ShowOtherReceiverDlg
      :showDlg="showOtherReceiverDlg"
      :dlgTitle="showOtherReceiverDlgTitle"
      :user="user"
      @input="handleInputFromOtherReceiverDlg"
      @close="handleHideOtherReceiverDlg"
    ></ShowOtherReceiverDlg>
    <DataTable
      :value="getOtherShiftForSendingData"
      class="p-datatable-responsive p-datatable-gridlines p-datatable-sm"
      :rowHover="true"
      v-model:selection="selectedUser" selectionMode="single" dataKey="_id"
    >
      <template #header>
        <Button class="p-mr-2" label="Добавить" @click="handleAddNewRec" />
        <Button v-if="selectedUser" class="p-mr-2" label="Редактировать" @click="handleEditRec" />
        <Button v-if="selectedUser" label="Удалить" @click="handleDelRec" />
      </template>

      <Column v-for="col of getOtherShiftTblColumns"
        :field="col.field"
        :header="col.title"
        :key="col.field"
        :style="{ width: col.width }"
        headerClass="dy58-table-header-cell-class"
        bodyClass="dy58-table-content-cell-class"
      >
        <template #body="slotProps">
          <div v-if="col.field !== getOtherShiftTblColumnNames.notification"
              :class="[
                'dy58-send-table-data-cell',
                {'dy58-send-original': [getOtherShiftTblColumnNames.placeTitle,
                                        getOtherShiftTblColumnNames.post,
                                        getOtherShiftTblColumnNames.fio].includes(col.field)
                                        && slotProps.data.sendOriginal === getCurrShiftGetOrderStatus.sendOriginal},
                {'dy58-send-copy': [getOtherShiftTblColumnNames.placeTitle,
                                    getOtherShiftTblColumnNames.post,
                                    getOtherShiftTblColumnNames.fio].includes(col.field)
                                    && slotProps.data.sendOriginal === getCurrShiftGetOrderStatus.sendCopy},
              ]"
          >
            {{ slotProps.data[col.field] }}
          </div>
          <div v-else>
            <div class="dy58-tbl-send-btns-block">
              <a :class="['dy58-send-status-btn',
                    {'dy58-send-original': slotProps.data.sendOriginal === getCurrShiftGetOrderStatus.sendOriginal,
                     'dy58-def-btn-color': slotProps.data.sendOriginal !== getCurrShiftGetOrderStatus.sendOriginal,}]"
                  @click="() => sendOriginalToDefinitSector(slotProps.data._id)"
              >
                Оригинал
              </a>
              <a :class="['dy58-send-status-btn',
                    {'dy58-send-copy': slotProps.data.sendOriginal === getCurrShiftGetOrderStatus.sendCopy,
                     'dy58-def-btn-color': slotProps.data.sendOriginal !== getCurrShiftGetOrderStatus.sendCopy,}]"
                  @click="() => sendCopyToDefinitSector(slotProps.data._id)"
              >
                Копия
              </a>
              <a :class="['dy58-send-status-btn',
                    {'dy58-do-not-send': slotProps.data.sendOriginal === getCurrShiftGetOrderStatus.doNotSend,
                     'dy58-def-btn-color': slotProps.data.sendOriginal !== getCurrShiftGetOrderStatus.doNotSend,}]"
                  @click="() => doNotSendToDefinitSector(slotProps.data._id)"
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
  import { OtherShiftTblColumnNames, OtherShiftTblColumns } from '../../store/modules/personal';
  import ShowOtherReceiverDlg from './ShowOtherReceiverDlg';

  export default {
    name: 'dy58-ecd-to-send-order-data-table',

    emits: ['input'],

    data() {
      return {
        showOtherReceiverDlg: false,
        showOtherReceiverDlgTitle: '',
        selectedUser: null,
        user: null,
        addNewRec: true, // true = add, false = edit
      };
    },

    components: {
      ShowOtherReceiverDlg,
    },

    computed: {
      ...mapGetters([
        'getOtherShiftForSendingData',
      ]),

      getOtherShiftTblColumnNames() {
        return OtherShiftTblColumnNames;
      },

      getCurrShiftGetOrderStatus() {
        return CurrShiftGetOrderStatus;
      },

      getOtherShiftTblColumns() {
        return OtherShiftTblColumns;
      },
    },

    mounted() {
      // Поскольку информация о выбранном для отправки распоряжения персонале хранится в глобальном
      // хранилище, ее необходимо подгружать при монтировании компонента, чтобы отображать текущее
      // состояние хранилища
      this.$emit('input', this.getOtherShiftForSendingData
        ? this.getOtherShiftForSendingData
          .filter((item) => item.sendOriginal !== CurrShiftGetOrderStatus.doNotSend)
          : []);
    },

    watch: {
      getOtherShiftForSendingData(newVal) {
        this.$emit('input', newVal
          ? newVal.filter((item) => item.sendOriginal !== CurrShiftGetOrderStatus.doNotSend)
          : []);
      },
    },

    methods: {
      sendOriginalToAll() {
        this.$store.commit('setGetOrderStatusToAllOtherShift',
          { getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
      },

      sendOriginalToDefinitSector(otherId) {
        this.$store.commit('setGetOrderStatusToDefinitOtherShift',
          { otherId, getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
      },

      sendOriginalToAllLeft() {
        this.$store.commit('setGetOrderStatusToAllLeftOtherShift',
          { getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
      },

      sendCopyToAll() {
        this.$store.commit('setGetOrderStatusToAllOtherShift',
          { getOrderStatus: CurrShiftGetOrderStatus.sendCopy });
      },

      sendCopyToDefinitSector(otherId) {
        this.$store.commit('setGetOrderStatusToDefinitOtherShift',
          { otherId, getOrderStatus: CurrShiftGetOrderStatus.sendCopy });
      },

      sendCopyToAllLeft() {
        this.$store.commit('setGetOrderStatusToAllLeftOtherShift',
          { getOrderStatus: CurrShiftGetOrderStatus.sendCopy });
      },

      doNotSendToAll() {
        this.$store.commit('setGetOrderStatusToAllOtherShift',
          { getOrderStatus: CurrShiftGetOrderStatus.doNotSend });
      },

      doNotSendToDefinitSector(otherId) {
        this.$store.commit('setGetOrderStatusToDefinitOtherShift',
          { otherId, getOrderStatus: CurrShiftGetOrderStatus.doNotSend });
      },

      handleInputFromOtherReceiverDlg(userData) {
        if (this.addNewRec) {
          this.$store.commit('addOtherGetOrderRecord', { ...userData });
        } else {
          this.selectedUser = { ...userData };
          this.$store.commit('editOtherGetOrderRecord', { ...userData });
        }
      },

      handleAddNewRec() {
        if (!this.addNewRec) {
          this.addNewRec = true;
        }
        if (this.user) {
          this.user = null;
        }
        this.showOtherReceiverDlgTitle = "Введите информацию о получателе распоряжения";
        this.showOtherReceiverDlg = true;
      },

      handleEditRec() {
        if (this.addNewRec) {
          this.addNewRec = false;
        }
        this.user = this.selectedUser;
        this.showOtherReceiverDlgTitle = "Отредактируйте информацию о получателе распоряжения";
        this.showOtherReceiverDlg = true;
      },

      handleDelRec() {
        this.$store.commit('delOtherGetOrderRecord', this.selectedUser._id);
        this.selectedUser = null;
      },

      handleHideOtherReceiverDlg() {
        this.showOtherReceiverDlg = false;
      },
    }
  }
</script>


<style scoped>
</style>
