<template>
  <div>
    <ShowOtherReceiverDlg
      :showDlg="showOtherReceiverDlg"
      :dlgTitle="showOtherReceiverDlgTitle"
      :user="user"
      @input="handleInputFromOtherReceiverDlg"
      @close="handleHideOtherReceiverDlg"
    ></ShowOtherReceiverDlg>

    <ShowChooseOtherPersonalDlg
      :showDlg="showChooseOtherReceiversDlg"
      :personal="sectorPersonal"
      :selectedPerson="selectedOtherPlacePerson"
      :sectorName="sectorName"
      @input="handleChoosePeople"
      @close="handleHideOtherReceiversDlg"
    ></ShowChooseOtherPersonalDlg>

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
            <a v-if="col.field === getOtherShiftTblColumnNames.placeTitle && slotProps.data.existingStructuralDivision"
              class="dy58-send-status-btn"
              @click="() => openChoosePeopleDlg(
                slotProps.data[getOtherShiftTblColumnNames.placeTitle]
              )"
            >
              ...
            </a>
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
    CLEAR_OTHER_SHIFT,
  } from '@/store/mutation-types';
  import ShowOtherReceiverDlg from '@/components/CreateOrders/ShowOtherReceiverDlg';
  import ShowChooseOtherPersonalDlg from '@/components/CreateOrders/ShowChooseOtherPersonalDlg';

  export default {
    name: 'dy58-ecd-to-send-order-data-table',

    emits: ['input'],

    props: {
      // Присутствует формально, не используется в данном модуле
      value: {
        type: Object,
      },
      lastOtherToSendSource: {
        type: Array,
      },
    },

    data() {
      return {
        showOtherReceiverDlg: false,
        showOtherReceiverDlgTitle: '',
        selectedUser: null,
        user: null,
        addNewRec: true, // true = add, false = edit
        showChooseOtherReceiversDlg: false,
        sectorPersonal: [],
        //selectedSectorPeople: [],
        selectedSectorsPeople: [],
        sectorId: -1,
        sectorName: null,
        showChoosePeopleDlg: false,
        selectedOtherPlacePerson: null,
      };
    },

    components: {
      ShowOtherReceiverDlg,
      ShowChooseOtherPersonalDlg,
    },

    computed: {
      ...mapGetters([
        'getOtherShiftForSendingData',
        'isECD',
        'getUserId',
        'getStructuralDivisions',
        'getStructuralDivisionById',
        'getExistingDNC_ECDTakeDutyOrder',
        'getFirstOrderInChain',
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

      existingDNC_ECDTakeDutyOrderDateTime() {
        return this.getExistingDNC_ECDTakeDutyOrder ? this.getExistingDNC_ECDTakeDutyOrder.createDateTime.getTime() : null;
      },
    },

    mounted() {
      this.$store.commit(CLEAR_OTHER_SHIFT);
      this.$emit('input', this.getOtherShiftForSendingData
        ? this.getOtherShiftForSendingData
          .filter((item) => item.sendOriginal !== CurrShiftGetOrderStatus.doNotSend)
          : []);
    },

    watch: {
      // Реакция на изменение источника "иных" адресатов (связанный документ, черновик документа,
      // последнее циркулярное распоряжение)
      lastOtherToSendSource(newValue) {
        if (newValue) {
          this.selectedSectorsPeople = [];
          newValue.forEach((el) => {
            this.$store.commit(ADD_OTHER_GET_ORDER_RECORD, el);
            if (el.additionalId) {
              const sector = this.selectedSectorsPeople.find((item) => item.placeTitle === el.placeTitle);
              if (sector) {
                sector.selectedPeople.push(el.additionalId);
              } else {
                this.selectedSectorsPeople.push({
                  placeTitle: el.placeTitle,
                  selectedPeople: [el.additionalId],
                });
              }
            }
          });
        }
      },

      getOtherShiftForSendingData(newVal) {
        this.$emit('input', newVal
          ? newVal.filter((item) => item.sendOriginal !== CurrShiftGetOrderStatus.doNotSend)
          : []);
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
          if (this.isECD) {
            const otherId = this.$store.getters.getNewOtherPersonId({ placeTitle: userData.placeTitle, post: userData.post, fio: userData.fio });
            if (otherId) {
              this.$store.commit(SET_GET_ORDER_STATUS_TO_DEFINIT_OTHER_SHIFT,
                { otherId, getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
            }
          }
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
        this.$store.commit(DEL_OTHER_GET_ORDER_RECORD, this.selectedUser._id);

        const deletedUserSectorChosenUsers = this.selectedSectorsPeople.find((el) => el.placeTitle === this.selectedUser.placeTitle);
        if (deletedUserSectorChosenUsers) {
          deletedUserSectorChosenUsers.selectedPeople = deletedUserSectorChosenUsers.selectedPeople.filter((additionalId) =>
            additionalId !== this.selectedUser.additionalId);
        }
        this.selectedUser = null;
      },

      handleHideOtherReceiverDlg() {
        this.showOtherReceiverDlg = false;
      },

      getStructuralDivisionFullInfo(division) {
        if (!division) return null;
        return `${division.placeTitle}${division.post ? ' ' + division.post : ''}${division.fio ? ' ' + division.fio : ''}`;
      },

      openChoosePeopleDlg(placeTitle) {
        this.sectorPersonal = this.getStructuralDivisions
          .filter((el) => el.placeTitle === placeTitle)
          .sort((a, b) => {
            if (!a.position && b.position)
              return 1;
            if (a.position && !b.position)
              return -1;
            return a.position - b.position;
          })
          .map((el) => ({
            label: this.getStructuralDivisionFullInfo(el),
            value: el.additionalId,
          }));
        this.sectorName = placeTitle;
        const selectedOtherPerson = this.$store.getters.getOtherPlaceSelectedPerson(placeTitle);
        this.selectedOtherPlacePerson = selectedOtherPerson ? selectedOtherPerson.additionalId : null;
        this.showChooseOtherReceiversDlg = true;
      },

      /**
       * Реакция на выбор предопределенных "иных" лиц в диалоговом окне.
       */
      handleChoosePeople(newSelectedPeople) {
        // Все новые выбранные записи включаем в список иных адресатов
        if (newSelectedPeople && newSelectedPeople.length) {
          newSelectedPeople.forEach((additionalId) => {
            const person = this.getStructuralDivisions.find((el) => el.additionalId === additionalId);
            if (person)
              this.$store.commit(ADD_OTHER_GET_ORDER_RECORD, { ...person, existingStructuralDivision: true });
          });
        }
        // Удаляем те записи, которые ранее были выбраны, а теперь - нет
        const prevSelectedPersonal = this.$store.getters.getOtherShiftByPlaceTitle(this.sectorName);
        prevSelectedPersonal.forEach((el) => {
          if (!(newSelectedPeople || []).includes(el.additionalId)) {
            this.$store.commit(DEL_OTHER_GET_ORDER_RECORD, el._id);
          }
        });
        // Ищем сохраненную информацию о выбранном персонале по текущему участку и обновляем ее локально
        // (либо запоминаем, если не существует локально)
        const sector = this.selectedSectorsPeople.find((el) => el.placeTitle === this.sectorName);
        if (sector) {
          sector.selectedPeople = newSelectedPeople;
        } else {
          this.selectedSectorsPeople.push({
            placeTitle: this.sectorName,
            selectedPeople: newSelectedPeople || [],
          });
        }
      },

      handleHideOtherReceiversDlg() {
        this.showChooseOtherReceiversDlg = false;
      },
    }
  }
</script>
