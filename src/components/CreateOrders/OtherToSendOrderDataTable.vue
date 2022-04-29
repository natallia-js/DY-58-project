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
      breakpoint="200px"
      rowGroupMode="rowspan"
      :groupRowsBy="getOtherShiftTblColumnNames.placeTitle"
    >
      <template #header>
        <div class="p-mb-2">
          <Button class="p-mr-2" label="Добавить" @click="handleAddNewRec" />
          <Button v-if="selectedUser" class="p-mr-2" label="Редактировать" @click="handleEditRec" />
          <Button v-if="selectedUser" label="Удалить" @click="handleDelRec" />
        </div>
        <MultiSelect
          v-if="isECD"
          v-model="selectedDivisions"
          :options="getStructuralDivisions"
          optionLabel="fullInfo"
          optionValue="additionalId"
          placeholder="Выберите структурные подразделения"
          display="chip"
          style="width:100%"
        />
      </template>

      <Column v-for="col of getOtherShiftTblColumns"
        :field="col.field"
        :header="col.title"
        :key="col.field"
        :style="{ width: col.width }"
        headerClass="dy58-table-header-cell-class"
        bodyClass="dy58-table-middle-content-cell-class dy58-send-table-data-cell"
      >
        <template #body="slotProps">
          <div v-if="col.field !== getOtherShiftTblColumnNames.notification"
              :class="[
                {'dy58-send-original': slotProps.data.sendOriginal === getCurrShiftGetOrderStatus.sendOriginal},
                {'dy58-send-copy': slotProps.data.sendOriginal === getCurrShiftGetOrderStatus.sendCopy},
              ]"
          >
            {{ slotProps.data[col.field] }}
          </div>
          <div v-else>
            <div class="dy58-tbl-send-btns-block">
              <a :class="['dy58-send-status-btn',
                    {'dy58-send-original': slotProps.data.sendOriginal === getCurrShiftGetOrderStatus.sendOriginal,
                     'dy58-def-btn-color': slotProps.data.sendOriginal !== getCurrShiftGetOrderStatus.sendOriginal,}]"
                  @click="sendOriginalToDefinitSector(slotProps.data._id)"
              >
                Оригинал
              </a>
              <a :class="['dy58-send-status-btn',
                    {'dy58-send-copy': slotProps.data.sendOriginal === getCurrShiftGetOrderStatus.sendCopy,
                     'dy58-def-btn-color': slotProps.data.sendOriginal !== getCurrShiftGetOrderStatus.sendCopy,}]"
                  @click="sendCopyToDefinitSector(slotProps.data._id)"
              >
                Копия
              </a>
              <a :class="['dy58-send-status-btn',
                    {'dy58-do-not-send': slotProps.data.sendOriginal === getCurrShiftGetOrderStatus.doNotSend,
                     'dy58-def-btn-color': slotProps.data.sendOriginal !== getCurrShiftGetOrderStatus.doNotSend,}]"
                  @click="doNotSendToDefinitSector(slotProps.data._id)"
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
  import { OtherShiftTblColumnNames, OtherShiftTblColumns } from '@/store/modules/personal/tablesColumns';
  import {
    SET_GET_ORDER_STATUS_TO_ALL_OTHER_SHIFT,
    SET_GET_ORDER_STATUS_TO_DEFINIT_OTHER_SHIFT,
    SET_GET_ORDER_STATUS_TO_ALL_LEFT_OTHER_SHIFT,
    ADD_OTHER_GET_ORDER_RECORD,
    EDIT_OTHER_GET_ORDER_RECORD,
    DEL_OTHER_GET_ORDER_RECORD,
    DEL_UNSELECTED_STRUCTURAL_DIVISIONS,
  } from '@/store/mutation-types';
  import ShowOtherReceiverDlg from '@/components/CreateOrders/ShowOtherReceiverDlg';

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
        showOtherReceiverDlg: false,
        showOtherReceiverDlgTitle: '',
        selectedUser: null,
        user: null,
        addNewRec: true, // true = add, false = edit
        selectedDivisions: null, // массив id выбранных (из существующих в БД на сервере) структурных подразделений,
                                 // только для ЭЦД!
      };
    },

    components: {
      ShowOtherReceiverDlg,
    },

    computed: {
      ...mapGetters([
        'getOtherShiftForSendingData',
        'isECD',
        'getStructuralDivisions',
        'getStructuralDivisionById',
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
        if (this.isECD) {
          if (newVal) {
            const selectedDivisonsIds = newVal
              .filter((el) => el.additionalId && el.additionalId > 0)
              .map((el) => el.additionalId);
            if ((this.selectedDivisions || selectedDivisonsIds) &&
              JSON.stringify(this.selectedDivisions) !== JSON.stringify(selectedDivisonsIds)) {
              this.selectedDivisions = selectedDivisonsIds;
            }
          } else if (this.selectedDivisions || this.selectedDivisions.length) {
            this.selectedDivisions = null;
          }
        }
        this.$emit('input', newVal
          ? newVal.filter((item) => item.sendOriginal !== CurrShiftGetOrderStatus.doNotSend)
          : []);
      },

      // Учитываем, что могло измениться как одно значение, так и сразу несколько
      // (когда устанавливается / снимается флаг выделения всех записей).
      // Только для ЭЦД!
      selectedDivisions(newVal) {
        if (this.isECD) {
          const selectedRecs = newVal ? newVal.map((id) => this.getStructuralDivisionById(id)) : [];
          if (selectedRecs.length) {
            selectedRecs.forEach((rec) => {
              if (rec) {
                this.$store.commit(ADD_OTHER_GET_ORDER_RECORD, rec);
              }
            });
          }
          this.$store.commit(DEL_UNSELECTED_STRUCTURAL_DIVISIONS, selectedRecs.map((el) => el.additionalId));
        }
      },
    },

    methods: {
      sendOriginalToAll() {
        this.$store.commit(SET_GET_ORDER_STATUS_TO_ALL_OTHER_SHIFT,
          { getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
      },

      sendOriginalToDefinitSector(otherId) {
        this.$store.commit(SET_GET_ORDER_STATUS_TO_DEFINIT_OTHER_SHIFT,
          { otherId, getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
      },

      sendOriginalToAllLeft() {
        this.$store.commit(SET_GET_ORDER_STATUS_TO_ALL_LEFT_OTHER_SHIFT,
          { getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
      },

      sendCopyToAll() {
        this.$store.commit(SET_GET_ORDER_STATUS_TO_ALL_OTHER_SHIFT,
          { getOrderStatus: CurrShiftGetOrderStatus.sendCopy });
      },

      sendCopyToDefinitSector(otherId) {
        this.$store.commit(SET_GET_ORDER_STATUS_TO_DEFINIT_OTHER_SHIFT,
          { otherId, getOrderStatus: CurrShiftGetOrderStatus.sendCopy });
      },

      sendCopyToAllLeft() {
        this.$store.commit(SET_GET_ORDER_STATUS_TO_ALL_LEFT_OTHER_SHIFT,
          { getOrderStatus: CurrShiftGetOrderStatus.sendCopy });
      },

      doNotSendToAll() {
        this.$store.commit(SET_GET_ORDER_STATUS_TO_ALL_OTHER_SHIFT,
          { getOrderStatus: CurrShiftGetOrderStatus.doNotSend });
      },

      doNotSendToDefinitSector(otherId) {
        this.$store.commit(SET_GET_ORDER_STATUS_TO_DEFINIT_OTHER_SHIFT,
          { otherId, getOrderStatus: CurrShiftGetOrderStatus.doNotSend });
      },

      handleInputFromOtherReceiverDlg(userData) {
        if (this.addNewRec) {
          this.$store.commit(ADD_OTHER_GET_ORDER_RECORD, { ...userData });
        } else {
          this.selectedUser = { ...userData };
          this.$store.commit(EDIT_OTHER_GET_ORDER_RECORD, { ...userData });
        }
      },

      handleAddNewRec() {
        if (!this.addNewRec) {
          this.addNewRec = true;
        }
        if (this.user) {
          this.user = null;
        }
        this.showOtherReceiverDlgTitle = 'Введите информацию о получателе документа';
        this.showOtherReceiverDlg = true;
      },

      handleEditRec() {
        if (this.addNewRec) {
          this.addNewRec = false;
        }
        this.user = this.selectedUser;
        this.showOtherReceiverDlgTitle = 'Отредактируйте информацию о получателе документа';
        this.showOtherReceiverDlg = true;
      },

      handleDelRec() {
        if (this.selectedUser.additionalId > 0) {
          this.selectedDivisions = this.selectedDivisions.filter((el) => el !== this.selectedUser.additionalId);
        }
        this.$store.commit(DEL_OTHER_GET_ORDER_RECORD, this.selectedUser._id);
        this.selectedUser = null;
      },

      handleHideOtherReceiverDlg() {
        this.showOtherReceiverDlg = false;
      },
    }
  }
</script>
