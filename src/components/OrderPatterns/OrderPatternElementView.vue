<template>
  <!-- Элемент "Текст" -->

  <span v-if="element.type === OrderPatternElementType.TEXT">
    {{ state.elementModelValue }}
  </span>

  <!-- Элемент "Поле ввода" -->

  <InputText
    v-else-if="element.type === OrderPatternElementType.INPUT"
    :style="{ width: getElementSizesCorrespondence[element.size] }"
    v-model="state.elementModelValue"
    v-tooltip="element.ref"
    :placeholder="element.ref"
  />

  <!-- Элемент "Текстовая область" -->

  <Textarea
    v-else-if="element.type === OrderPatternElementType.TEXT_AREA"
    v-model="state.elementModelValue"
    :autoResize="true"
    rows="2"
    style="width:100%;font-size:inherit;font-family:inherit;"
    class="p-p-1"
    v-tooltip="element.ref"
    :placeholder="element.ref"
  />

  <!-- Элемент "Выпадающий список" -->

  <div v-else-if="element.type === OrderPatternElementType.SELECT" v-tooltip="element.ref">
    <Dropdown
      :style="{ width: getElementSizesCorrespondence[element.size] }"
      :options="dropdownValues"
      optionLabel="label"
      optionValue="value"
      v-model="state.elementModelValue"
      v-tooltip="element.ref"
      :placeholder="element.ref"
    />
  </div>

  <!-- Элемент "Дата" -->

  <Calendar
    v-else-if="element.type === OrderPatternElementType.DATE"
    :showIcon="true"
    :placeholder="element.ref || 'дата'"
    :hideOnDateTimeSelect="true"
    :manualInput="true"
    v-model="state.elementModelValue"
    v-tooltip="element.ref"
  />

  <!-- Элемент "Таблица "Время" -->

  <Calendar
    v-else-if="element.type === OrderPatternElementType.TIME"
    :showTime="true"
    :timeOnly="true"
    :showIcon="true"
    :hideOnDateTimeSelect="true"
    :manualInput="true"
    :placeholder="element.ref || 'время'"
    v-model="state.elementModelValue"
    v-tooltip="element.ref"
  />

  <!-- Элемент "Дата-время" -->

  <Calendar
    v-else-if="element.type === OrderPatternElementType.DATETIME"
    :showTime="true"
    :showIcon="true"
    :placeholder="element.ref || 'дата-время'"
    :hideOnDateTimeSelect="true"
    :manualInput="true"
    v-model="state.elementModelValue"
    v-tooltip="element.ref"
  />

  <!-- Элемент "Таблица "Поезд ДР" -->

  <div
    v-else-if="element.type === OrderPatternElementType.DR_TRAIN_TABLE"
    class="dy58-dy-train-table-block"
  >
    <Toast />
    <ConfirmPopup group="confirmDelAllTableRecords"></ConfirmPopup>
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
        class="p-button-rounded p-button-primary p-mr-1"
        v-tooltip.right="DR_TABLE_MENU_ITEMS.INSERT"
        @click="newDRTableRecord"
      />
      <Button
        v-if="selectedDRTableRecord"
        icon="pi pi-arrow-up"
        class="p-button-rounded p-button-info p-mr-1"
        v-tooltip.right="DR_TABLE_MENU_ITEMS.INSERT_BEFORE"
        @click="newDRTableRecordBefore"
      />
      <Button
        v-if="selectedDRTableRecord"
        icon="pi pi-arrow-down"
        class="p-button-rounded p-button-help p-mr-1"
        v-tooltip.right="DR_TABLE_MENU_ITEMS.INSERT_AFTER"
        @click="newDRTableRecordAfter"
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
      class="p-datatable-gridlines p-datatable-sm z-depth-1"
      :scrollable="true" scrollHeight="400px"
      @contextmenu="handleTrainTableRightClick($event)"
    >
      <Column
        v-for="col of getDRTrainTableColumns"
        :field="col.field"
        :header="col.header"
        :key="col.field"
        :style="{ minWidth: col.width }"
      >
      </Column>
    </DataTable>

    <ContextMenu ref="menu" :model="drTrainTableContextMenuItems" />

    <Dialog
      :header="addDRTableRecDlgTitle"
      v-model:visible="newDRRecordDialog"
      :style="{width: '450px'}"
      :modal="true"
      class="p-fluid"
    >
      <div class="p-field">
        <label for="chooseStation"><span class="dy58-required-field">*</span> Станция</label>
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
    v-else-if="element.type === OrderPatternElementType.LINEBREAK"
    class="pi pi-reply"
    style="transform: rotate(180deg)"
  ></i>

  <!-- Иной элемент -->

  <template v-else></template>

</template>


<script>
  import { watch, computed, reactive, ref } from 'vue';
  import { useStore } from 'vuex';
  import { useConfirm } from 'primevue/useconfirm';
  import {
    OrderPatternElementType,
    ElementSizesCorrespondence,
    DRTrainTableColumns,
  } from '@/constants/orderPatterns';
  import {
    GID_EVENT_TYPE,
    FILLED_ORDER_DROPDOWN_ELEMENTS,
    FILLED_ORDER_DATETIME_ELEMENTS,
  } from '@/constants/orders';
  import showMessage from '@/hooks/showMessage.hook';
  import { getLocaleDateTimeString } from '@/additional/dateTimeConvertions';
  import getOrderTextParamValue from '@/additional/getOrderTextParamValue';

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

      // Значения элементов шаблонов распоряжений, которые они в соответствии
      // со своим смысловым значением могут принимать по умолчанию
      const getDefaultElementModelValue = () => {
        if (!props.element) {
          return null;
        }
        if (props.element.type === OrderPatternElementType.SELECT) {
          const getPassDutyDNC = () => {
            const existingDNCTakeDutyOrder = store.getters.getExistingDNCTakeDutyOrder;
            if (existingDNCTakeDutyOrder && existingDNCTakeDutyOrder.orderText) {
              return getOrderTextParamValue(FILLED_ORDER_DROPDOWN_ELEMENTS.TAKE_DUTY,
                existingDNCTakeDutyOrder.orderText.orderText);
            }
            return null;
          };
          switch (props.element.ref) {
            case FILLED_ORDER_DROPDOWN_ELEMENTS.TAKE_DUTY:
              return store.getters.getUserPostFIO;
            case FILLED_ORDER_DROPDOWN_ELEMENTS.PASS_DUTY:
              // Если существует (ранее изданное) распоряжение ДНЦ о принятии дежурства НА ДАННОМ РАБОЧЕМ МЕСТЕ,
              // то извлекаем из него должность и ФИО лица для заполнения поля о лице, сдавшем дежурство
              return getPassDutyDNC();
            default:
              return props.element.value;
          }
        } else if (props.element.type === OrderPatternElementType.DATETIME) {
          switch (props.element.ref) {
            // Дата-время сдачи дежурства одним человеком = дата-время принятия дежурства другим человеком
            case FILLED_ORDER_DATETIME_ELEMENTS.TAKE_DUTY_DATETIME:
            case FILLED_ORDER_DATETIME_ELEMENTS.PASS_DUTY_DATETIME:
              return store.getters.getDefaultPassDutyTime;
            default:
              return props.element.value;
          }
        }
        return props.element.value;
      };

      const state = reactive({
        elementModelValue: getDefaultElementModelValue(),
      });

      // для отслеживания изменения значения поля value объекта element в родительском компоненте
      // (это происходит, в частности, при автоматическом заполнении полей шаблона распоряжения по
      // значениям соответствующих полей связанного распоряжения)
      watch(() => props.element.value, (newVal) => state.elementModelValue = newVal);

      // При перезагрузке страницы информация о рабочих распоряжениях может появиться позже чем надо,
      // в связи с чем могут оказаться незаполненными данными некоторые поля (например, при перезагрузке
      // циркулярного распоряжения)
      const watchedRawWorkingOrders = ref(false);
      const stopWatchingRawWorkingOrders = watch(() => store.getters.getRawWorkingOrders, () => {
        if (watchedRawWorkingOrders.value === false && !state.elementModelValue) {
          watchedRawWorkingOrders.value = true;
          state.elementModelValue = getDefaultElementModelValue();
        }
      });
      watch(watchedRawWorkingOrders, (newVal) => {
        if (newVal === true) {
          stopWatchingRawWorkingOrders();
        }
      });

      // Любое изменение значения элемента должно быть известно "наверху"
      watch(() => state.elementModelValue, (value) => {
        if (props.element && props.element.type !== OrderPatternElementType.DR_TRAIN_TABLE) {
          emit('input', {
            elementId: props.element._id,
            value,
            elementType: props.element.type,
            elementRef: props.element.ref,
          });
        }
      }, { immediate: true }); // обязательно нужно зайти сюда при загрузке страницы

      const selectedDRTableRecord = ref();
      const addDRTableRecDlgTitle = ref('');
      const newDRRecordDialog = ref(false);
      const drTableRec = ref({});
      const submitted = ref(false);
      const insertNewDRRecPos = ref();
      // true - когда значение insertNewDRRecPos после добавления очередной записи нужно поменять
      // (когда запись в таблицу ДР добавляется в конец списка либо перед выбранной записью);
      // false - когда значение insertNewDRRecPos после добавления очередной записи менять не нужно
      // (когда запись вставляется после текущей)
      const moveInsertNewDRRecPos = ref(true);

      const DR_TABLE_MENU_ITEMS = {
        PASTE: 'Вставить из буфера обмена',
        CLEAR: 'Очистить таблицу',
        INSERT: 'Добавить запись',
        INSERT_BEFORE: 'Добавить перед',
        INSERT_AFTER: 'Добавить после',
        DELETE: 'Удалить запись',
      };

      const ADD_DR_TABLE_REC_DLG_TITLE = 'Добавить запись о поезде ДР';
      const ADD_DR_TABLE_REC_BEFORE_DLG_TITLE = 'Добавить запись о поезде ДР перед текущей';
      const ADD_DR_TABLE_REC_AFTER_DLG_TITLE = 'Добавить запись о поезде ДР после текущей';

      const getElementSizesCorrespondence = computed(() => ElementSizesCorrespondence);
      const getDRTrainTableColumns = computed(() => DRTrainTableColumns);

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
          command: () => { pasteDRTrainTable(); menu.value.hide(); },
        }];
        if (drTableDataToDisplay.value.length) {
          items.push(
            {
              label: DR_TABLE_MENU_ITEMS.CLEAR,
              command: (event) => { clearDRTrainTable(event); menu.value.hide(); },
            }
          );
        }
        items.push(
          {
            label: DR_TABLE_MENU_ITEMS.INSERT,
            command: () => { newDRTableRecord(); menu.value.hide(); },
          }
        );
        if (selectedDRTableRecord.value) {
          items.push(
            {
              label: DR_TABLE_MENU_ITEMS.INSERT_BEFORE,
              command: () => { newDRTableRecordBefore(); menu.value.hide(); },
            },
            {
              label: DR_TABLE_MENU_ITEMS.INSERT_AFTER,
              command: () => { newDRTableRecordAfter(); menu.value.hide(); },
            },
            {
              label: DR_TABLE_MENU_ITEMS.DELETE,
              command: () => { delDRTableRecord(); menu.value.hide(); },
            }
          );
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
                const stationObject = store.getters.getSectorStationByESRCode(el.Station);
                //
                const dispStationNameCode = (stationObject && stationObject.St_Title)
                  ? `${stationObject.St_Title} (${el.Station})`
                  : el.Station;

                if (!trainTimeTable.length || trainTimeTable[trainTimeTable.length - 1].station !== dispStationNameCode) {
                  //
                  trainTimeTable.push({
                    stationId: stationObject ? stationObject.St_ID : null,
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
          group: "confirmDelAllTableRecords",
          message: 'Удалить все записи таблицы?',
          icon: 'pi pi-exclamation-circle',
          accept: () => {
            state.elementModelValue = null;
            emit('input', {
              elementId: props.element._id,
              value: state.elementModelValue,
              elementType: props.element.type,
              elementRef: props.element.ref,
            });
          },
        });
      };

      const showNewDRRecordDialog = (dlgTitle) => {
        addDRTableRecDlgTitle.value = dlgTitle;
        drTableRec.value = {};
        submitted.value = false;
        newDRRecordDialog.value = true;
        insertNewDRRecPos.value = null;
        moveInsertNewDRRecPos.value = true;
      };

      const newDRTableRecord = () => {
        showNewDRRecordDialog(ADD_DR_TABLE_REC_DLG_TITLE);
        insertNewDRRecPos.value = state.elementModelValue ? state.elementModelValue.length : 0;
      };

      const newDRTableRecordBefore = () => {
        if (!selectedDRTableRecord.value) {
          newDRTableRecord(ADD_DR_TABLE_REC_DLG_TITLE);
        } else {
          showNewDRRecordDialog(ADD_DR_TABLE_REC_BEFORE_DLG_TITLE);
          insertNewDRRecPos.value = selectedDRTableRecord.value.orderNumber - 1;
          moveInsertNewDRRecPos.value = true;
        }
      };

      const newDRTableRecordAfter = () => {
        if (!selectedDRTableRecord.value) {
          newDRTableRecord(ADD_DR_TABLE_REC_DLG_TITLE);
        } else {
          showNewDRRecordDialog(ADD_DR_TABLE_REC_AFTER_DLG_TITLE);
          insertNewDRRecPos.value = selectedDRTableRecord.value.orderNumber;
          moveInsertNewDRRecPos.value = false;
        }
      };

      const hideNewDRRecordDialog = () => {
        newDRRecordDialog.value = false;
        submitted.value = false;
        insertNewDRRecPos.value = null;
        moveInsertNewDRRecPos.value = true;
      };

      const saveNewDRRecord = () => {
        submitted.value = true;

        if (drTableRec.value.station && (drTableRec.value.arrivalTime || drTableRec.value.departureTime)) {
          if (!state.elementModelValue) {
            state.elementModelValue = [];
          }
          const newElement = {
            stationId: drTableRec.value.station.id,
            station: drTableRec.value.station.title,
            arrivalTime: getLocaleDateTimeString(drTableRec.value.arrivalTime, false),
            departureTime: getLocaleDateTimeString(drTableRec.value.departureTime, false),
          };
          state.elementModelValue.splice(insertNewDRRecPos.value, 0, newElement);
          emit('input', {
            elementId: props.element._id,
            value: state.elementModelValue,
            elementType: props.element.type,
            elementRef: props.element.ref,
          });

          drTableRec.value = {};
          submitted.value = false;

          // Определяем действия, которые необходимо произвести после добавления новой записи в таблицу
          // при условии, что требуется сдвинуть позицию вставки следующей записи
          if (moveInsertNewDRRecPos.value) {
            // Если в таблице выделена запись и новая запись добавлена была перед нею, то необходимо, чтобы
            // после добавления новой записи выделение осталось на текущей записи
            if (selectedDRTableRecord.value && selectedDRTableRecord.value.orderNumber === insertNewDRRecPos.value + 1) {
              selectedDRTableRecord.value = drTableDataToDisplay.value.find((el) => el.orderNumber === insertNewDRRecPos.value + 2)
            }
            // Смещаем позицию вставки очередной записи
            insertNewDRRecPos.value += 1;
          }
        }
      };

      const delDRTableRecord = () => {
        if (!selectedDRTableRecord.value) {
          return;
        }
        state.elementModelValue = state.elementModelValue.filter((_el, index) =>
          (index + 1) !== selectedDRTableRecord.value.orderNumber
        );
        selectedDRTableRecord.value = null;
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

      const handleTrainTableRightClick = (event) => {
        menu.value.show(event);
      };

      return {
        state,
        selectedDRTableRecord,
        menu,
        addDRTableRecDlgTitle,
        drTableRec,
        submitted,
        insertNewDRRecPos,
        drTableDataToDisplay,
        DR_TABLE_MENU_ITEMS,
        getSectorStations,
        OrderPatternElementType,
        getElementSizesCorrespondence,
        getDRTrainTableColumns,
        drTrainTableContextMenuItems,
        handleTrainTableRightClick,
        pasteDRTrainTable,
        clearDRTrainTable,
        newDRTableRecord,
        newDRTableRecordBefore,
        newDRTableRecordAfter,
        delDRTableRecord,
        newDRRecordDialog,
        hideNewDRRecordDialog,
        saveNewDRRecord,
      };
    },
  };
</script>
