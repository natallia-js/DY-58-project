<template>
  <!-- Элемент "Текст" -->

  <span v-if="element.type === getOrderPatternElementTypes.TEXT">
    {{ state.elementModelValue }}
  </span>

  <!-- Элемент "Поле ввода" -->

  <InputText
    v-else-if="element.type === getOrderPatternElementTypes.INPUT"
    :style="{ width: getElementSizesCorrespondence[element.size] }"
    v-model="state.elementModelValue"
    @input="handleChangeInputText"
    v-tooltip="element.ref"
    :placeholder="element.ref"
  />

  <!-- Элемент "Выпадающий список" -->

  <div v-else-if="element.type === getOrderPatternElementTypes.SELECT" v-tooltip="element.ref">
    <Dropdown
      :style="{ width: getElementSizesCorrespondence[element.size] }"
      :options="dropdownValues"
      optionLabel="label"
      optionValue="value"
      v-model="state.elementModelValue"
      @change="handleChangeDropdown"
      v-tooltip="element.ref"
      :placeholder="element.ref"
    />
  </div>

  <!-- Элемент "Дата" -->

  <Calendar
    v-else-if="element.type === getOrderPatternElementTypes.DATE"
    :showIcon="true"
    :placeholder="element.ref || 'дата'"
    :hideOnDateTimeSelect="true"
    :manualInput="false"
    v-model="state.elementModelValue"
    @dateSelect="handleChangeDateTime"
    v-tooltip="element.ref"
  />

  <!-- Элемент "Таблица "Время" -->

  <Calendar
    v-else-if="element.type === getOrderPatternElementTypes.TIME"
    :showTime="true"
    :timeOnly="true"
    :showIcon="true"
    :hideOnDateTimeSelect="true"
    :manualInput="false"
    :placeholder="element.ref || 'время'"
    v-model="state.elementModelValue"
    @dateSelect="handleChangeDateTime"
    v-tooltip="element.ref"
  />

  <!-- Элемент "Дата-время" -->

  <Calendar
    v-else-if="element.type === getOrderPatternElementTypes.DATETIME"
    :showTime="true"
    :showIcon="true"
    :placeholder="element.ref || 'дата-время'"
    :hideOnDateTimeSelect="true"
    :manualInput="false"
    v-model="state.elementModelValue"
    @dateSelect="handleChangeDateTime"
    v-tooltip="element.ref"
  />

  <!-- Элемент "Таблица "Поезд ДР" -->

  <div v-else-if="element.type === getOrderPatternElementTypes.DR_TRAIN_TABLE" class="dy58-dy-train-table-block">
    <Toast />
    <ConfirmPopup></ConfirmPopup>
    <div class="p-mb-1">
      <Button
        icon="pi pi-download"
        class="p-button-rounded p-button-success p-mr-1"
        v-tooltip.right="DR_TABLE_MENU_ITEMS.PASTE"
        @click="pasteDRTrainTable"
      />
      <Button
        v-if="drTableDataToDisplay.length"
        icon="pi pi-times"
        class="p-button-rounded p-button-secondary p-mr-1"
        v-tooltip.right="DR_TABLE_MENU_ITEMS.CLEAR"
        @click="clearDRTrainTable($event)"
      />
      <Button
        icon="pi pi-plus"
        class="p-button-rounded p-button-info p-mr-1"
        v-tooltip.right="DR_TABLE_MENU_ITEMS.INSERT"
        @click="newDRTableRecord"
      />
      <Button
        v-if="selectedDRTableRecord"
        icon="pi pi-minus"
        class="p-button-rounded p-button-warning"
        v-tooltip.right="DR_TABLE_MENU_ITEMS.DELETE"
        @click="delDRTableRecord"
      />
    </div>
    <DataTable
      :value="drTableDataToDisplay"
      v-model:selection="selectedDRTableRecord" selectionMode="single"
      dataKey="orderNumber"
      class="p-datatable-responsive p-datatable-gridlines p-datatable-sm z-depth-1"
      @contextmenu="handleTrainTableRightClick($event)"
    >
      <Column
        v-for="col of getDRTrainTableColumns"
        :field="col.field"
        :header="col.header"
        :key="col.field"
        :style="{ width: col.width }"
      >
      </Column>
    </DataTable>
    <ContextMenu ref="menu" :model="drTrainTableContextMenuItems">
      <template #item="{item}">
        <p class="p-m-2">
          <a
            href="#!"
            class="dy58-context-menu-item"
            @click="item.handler"
          >
            {{ item.label }}
          </a>
        </p>
      </template>
    </ContextMenu>
    <Dialog
      header="Добавить запись о поезде ДР"
      v-model:visible="newDRRecordDialog"
      :style="{width: '450px'}"
      :modal="true"
      class="p-fluid"
    >
      <div class="p-field">
        <label for="chooseStation"><span style="color:red">*</span> Станция</label>
        <Dropdown
          id="chooseStation"
          v-model="drTableRec.station"
          placeholder="Выберите станцию"
          required="true"
          autofocus
          style="width:100%"
          :class="{'p-invalid': submitted && !drTableRec.station}"
          :options="getSectorStations"
          optionLabel="title"
          optionValue="title"
        />
        <small class="p-error" v-if="submitted && !drTableRec.station">Необходимо указать станцию</small>
      </div>
      <div class="p-field">
        <label for="arrivalDateTime">Время прибытия</label>
        <Calendar
          id="arrivalDateTime"
          v-model="drTableRec.arrivalTime"
          :showTime="true"
          :showIcon="true"
          placeholder="Определить время прибытия"
          required="false"
          :hideOnDateTimeSelect="true"
          :manualInput="false"
          :class="{'p-invalid': submitted && !drTableRec.arrivalTime && !drTableRec.departureTime}"
        />
      </div>
      <div class="p-field">
        <label for="departureDateTime">Время отправления</label>
        <Calendar
          id="departureDateTime"
          v-model="drTableRec.departureTime"
          :showTime="true"
          :showIcon="true"
          placeholder="Определить время отправления"
          required="false"
          :hideOnDateTimeSelect="true"
          :manualInput="false"
          :class="{'p-invalid': submitted && !drTableRec.arrivalTime && !drTableRec.departureTime}"
        />
        <small class="p-error" v-if="submitted && !drTableRec.arrivalTime && !drTableRec.departureTime">
          Необходимо указать время события на станции (прибытие и/или отправление)
        </small>
      </div>
      <small>! При проследовании поездом станции время прибытия = время отправления</small>
      <template #footer>
        <Button label="Отмена" icon="pi pi-times" class="p-button-text" @click="hideNewDRRecordDialog"/>
        <Button label="Добавить" icon="pi pi-check" class="p-button-text" @click="saveNewDRRecord" />
      </template>
    </Dialog>
  </div>

  <!-- Элемент "Перенос строки" -->

  <i
    v-else-if="element.type === getOrderPatternElementTypes.LINEBREAK"
    class="pi pi-reply"
    style="transform: rotate(180deg)"
  ></i>

  <!-- Иной элемент -->

  <template v-else></template>

</template>


<script>
  import { onMounted, watch, computed, reactive, ref } from 'vue';
  import {
    OrderPatternElementType,
    ElementSizesCorrespondence,
    DRTrainTableColumns,
  } from '../../constants/orderPatterns';
  import { GID_EVENT_TYPE } from '../../constants/orders';
  import showMessage from '../../hooks/showMessage.hook';
  import { getLocaleDateTimeString } from '../../additional/dateTimeConvertions';
  import { useStore } from 'vuex';
  import { useConfirm } from "primevue/useconfirm";

  export default {
    name: 'dy58-order-pattern-element-view',

    props: {
      element: {
        type: Object,
        required: true,
      },
      dropdownValues: {
        type: Array,
        required: false,
      },
    },

    emits: ['input'],

    setup(props, { emit }) {
      const { showErrMessage } = showMessage();
      const menu = ref();
      const store = useStore();
      const confirm = useConfirm();

      const state = reactive({
        elementModelValue: null,
      });

      const selectedDRTableRecord = ref();
      const newDRRecordDialog = ref(false);
      const drTableRec = ref({});
      const submitted = ref(false);

      const DR_TABLE_MENU_ITEMS = {
        PASTE: 'Вставить из буфера обмена',
        CLEAR: 'Очистить таблицу',
        INSERT: 'Добавить запись',
        DELETE: 'Удалить запись',
      };

      const getOrderPatternElementTypes = computed(() => OrderPatternElementType);
      const getElementSizesCorrespondence = computed(() => ElementSizesCorrespondence);
      const getDRTrainTableColumns = computed(() => DRTrainTableColumns);
      const elementValue = computed(() => props.element ? props.element.value : null);
      const drTableDataToDisplay = computed(() => !state.elementModelValue ? [] :
        state.elementModelValue.map((el, index) => {
          return {
            orderNumber: index + 1,
            ...el,
          };
        }
      ));
      const drTrainTableContextMenuItems = computed(() => {
        const items = [{
          label: DR_TABLE_MENU_ITEMS.PASTE,
          handler: () => { pasteDRTrainTable(); menu.value.hide(); },
        }];
        if (drTableDataToDisplay.value.length) {
          items.push({
            label: DR_TABLE_MENU_ITEMS.CLEAR,
            handler: (event) => { clearDRTrainTable(event); menu.value.hide(); },
          });
        }
        items.push({
          label: DR_TABLE_MENU_ITEMS.INSERT,
          handler: () => { newDRTableRecord(); menu.value.hide(); },
        });
        if (selectedDRTableRecord.value) {
          items.push({
            label: DR_TABLE_MENU_ITEMS.DELETE,
            handler: () => { delDRTableRecord(); menu.value.hide(); },
          });
        }
        return items;
      });
      const getSectorStations = computed(() =>
        store.getters.getSectorStations.map((station) => {
          return {
            id: station.St_ID,
            title: `${station.St_Title} (${station.St_UNMC})`,
          };
        })
      );

      const pasteDRTrainTable = () => {
        navigator.clipboard.readText()
          .then((text) => {
            const obj = JSON.parse(text);
            if (obj instanceof Array) {
              const trainTimeTable = [];
              for (let el of obj) {
                //
                const stationName = store.getters.getSectorStationTitleByESRCode(el.Station);
                //
                const dispStationNameCode = stationName ? `${stationName} (${el.Station})` : el.Station;

                if (!trainTimeTable.length || trainTimeTable[trainTimeTable.length - 1].station !== dispStationNameCode) {
                  //
                  trainTimeTable.push({
                    station: dispStationNameCode,
                    departureTime:
                      String(el.EvType) === String(GID_EVENT_TYPE.DEPARURE) || String(el.EvType) === String(GID_EVENT_TYPE.FOLLOWING)
                      ? getLocaleDateTimeString(new Date(el.Time), false) : null,
                    arrivalTime:
                      String(el.EvType) === String(GID_EVENT_TYPE.ARRIVAL) || String(el.EvType) === String(GID_EVENT_TYPE.FOLLOWING)
                      ? getLocaleDateTimeString(new Date(el.Time), false) : null,
                  });
                } else {
                  //
                  if (String(el.EvType) === String(GID_EVENT_TYPE.DEPARURE) || String(el.EvType) === String(GID_EVENT_TYPE.FOLLOWING)) {
                    trainTimeTable[trainTimeTable.length - 1].departureTime = getLocaleDateTimeString(new Date(el.Time), false);
                  } else if (String(el.EvType) === String(GID_EVENT_TYPE.ARRIVAL) || String(el.EvType) === String(GID_EVENT_TYPE.FOLLOWING)) {
                    trainTimeTable[trainTimeTable.length - 1].arrivalTime = getLocaleDateTimeString(new Date(el.Time), false);
                  }
                }
              }
              if (!state.elementModelValue) {
                state.elementModelValue = [];
              }
              state.elementModelValue.push(...trainTimeTable);
              emit('input', {
                elementId: props.element._id,
                value: state.elementModelValue,
                elementType: props.element.type,
                elementRef: props.element.ref,
              });
            }
          })
          .catch((err) => {
            showErrMessage('Что пошло не так: ' + err);
          });
      };

      const clearDRTrainTable = (event) => {
        confirm.require({
          target: event.target,
          message: 'Удалить все записи таблицы?',
          icon: 'pi pi-exclamation-triangle',
          acceptLabel: 'Да',
          rejectLabel: 'Нет',
          accept: () => {
            state.elementModelValue = null;
            emit('input', {
              elementId: props.element._id,
              value: state.elementModelValue,
              elementType: props.element.type,
              elementRef: props.element.ref,
            });
          },
          reject: () => {},
        });
      };

      const newDRTableRecord = () => {
        drTableRec.value = {};
        submitted.value = false;
        newDRRecordDialog.value = true;
      };

      const hideNewDRRecordDialog = () => {
        newDRRecordDialog.value = false;
        submitted.value = false;
      };

      const saveNewDRRecord = () => {
        submitted.value = true;

        if (drTableRec.value.station && (drTableRec.value.arrivalTime || drTableRec.value.departureTime)) {
          if (!state.elementModelValue) {
            state.elementModelValue = [];
          }
          state.elementModelValue.push({
            station: drTableRec.value.station,
            arrivalTime: getLocaleDateTimeString(drTableRec.value.arrivalTime, false),
            departureTime: getLocaleDateTimeString(drTableRec.value.departureTime, false),
          });
          emit('input', {
            elementId: props.element._id,
            value: state.elementModelValue,
            elementType: props.element.type,
            elementRef: props.element.ref,
          });

          drTableRec.value = {};
          submitted.value = false;
        }
      };

      const delDRTableRecord = () => {
        if (!selectedDRTableRecord.value) {
          return;
        }
        state.elementModelValue = state.elementModelValue.filter((_el, index) =>
          (index + 1) !== selectedDRTableRecord.value.orderNumber
        );
        if (!state.elementModelValue.length) {
          state.elementModelValue = null;
        }
        emit('input', {
          elementId: props.element._id,
          value: state.elementModelValue,
          elementType: props.element.type,
          elementRef: props.element.ref,
        });
      };

      // для отслеживания изменения значения поля value объекта element в родительском компоненте
      // (это происходит, в частности, при автоматическом заполнении полей шаблона распоряжения по
      // значениям соответствующих полей связанного распоряжения)
      watch(elementValue, (newVal) => state.elementModelValue = newVal);

      onMounted(() => {
        if (props.element) {
          state.elementModelValue = props.element.value;
        }
      });

      const handleChangeInputText = (event) => {
        emit('input', {
          elementId: props.element._id,
          value: event.target.value,
          elementType: props.element.type,
          elementRef: props.element.ref,
        });
      };

      const handleChangeDropdown = (event) => {
        emit('input', {
          elementId: props.element._id,
          value: event.value,
          elementType: props.element.type,
          elementRef: props.element.ref,
        });
      };

      const handleChangeDateTime = (value) => {
        emit('input', {
          elementId: props.element._id,
          value,
          elementType: props.element.type,
          elementRef: props.element.ref,
        });
      };

      const handleTrainTableRightClick = (event) => {
        menu.value.show(event);
      };

      return {
        state,
        selectedDRTableRecord,
        menu,
        drTableRec,
        submitted,
        drTableDataToDisplay,
        DR_TABLE_MENU_ITEMS,
        getSectorStations,
        getOrderPatternElementTypes,
        getElementSizesCorrespondence,
        getDRTrainTableColumns,
        elementValue,
        drTrainTableContextMenuItems,
        handleChangeInputText,
        handleChangeDropdown,
        handleChangeDateTime,
        handleTrainTableRightClick,
        pasteDRTrainTable,
        clearDRTrainTable,
        newDRTableRecord,
        delDRTableRecord,
        newDRRecordDialog,
        hideNewDRRecordDialog,
        saveNewDRRecord,
      };
    },
  };
  /*
  [{"Station":"138507","Time":"2021-11-22T06:00:00","EvType":1},
   {"Station":"138507","Time":"2021-11-22T06:05:00","EvType":3},
   {"Station":"141800","Time":"2021-11-22T07:00:00","EvType":2},
   {"Station":"141406","Time":"2021-11-22T07:45:00","EvType":1},
   {"Station":"165311","Time":"2021-11-22T08:00:00","EvType":1}]
  */
</script>
