<template>
  <!-- Элемент "Текст" -->

  <span v-if="element.type === OrderPatternElementType.TEXT">
    {{ state.elementModelValue }}
  </span>

  <!-- Элемент "Поле ввода" -->

  <AutoWidthInputText
    v-else-if="element.type === OrderPatternElementType.INPUT"
    :width="getElementSizesCorrespondence[element.size]"
    v-model="state.elementModelValue"
    :tooltip="element.ref"
    :placeholder="element.ref"
  />
<!--
  Было до AutoWidthInputText:
  <InputText
    v-else-if="element.type === OrderPatternElementType.INPUT"
    :style="{ width: getElementSizesCorrespondence[element.size] }"
    v-model="state.elementModelValue"
    v-tooltip="element.ref"
    :placeholder="element.ref"
  />-->

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

  <!-- Элемент "Нередактируемый список одиночного выбора" -->

  <AutoWidthDropdown
    v-else-if="element.type === OrderPatternElementType.SELECT"
    :dropdownValues="dropdownValues"
    :width="getElementSizesCorrespondence[element.size]"
    v-model="state.elementModelValue"
    :tooltip="element.ref"
    :placeholder="element.ref"
    :isDropdownEditable="isDropdownEditable"
  />

  <!--
    Было до AutoWidthDropdown:
  <div v-else-if="element.type === OrderPatternElementType.SELECT" v-tooltip="element.ref">
    <Dropdown
      :style="{ width: getElementSizesCorrespondence[element.size] }"
      :options="dropdownValues"
      optionLabel="label"
      optionValue="value"
      v-model="state.elementModelValue"
      v-tooltip="element.ref"
      :placeholder="element.ref"
      :editable="isDropdownEditable"
    />
  </div>-->

  <!-- Элемент "Редактируемый список множественного выбора" -->

  <div v-else-if="element.type === OrderPatternElementType.MULTIPLE_SELECT" v-tooltip="element.ref">
    <MultiSelect
      :style="{ width: getElementSizesCorrespondence[element.size] }"
      :options="multipleValuesForSelection"
      optionLabel="label"
      optionValue="value"
      dataKey="value"
      v-model="state.elementModelValue"
      v-tooltip="element.ref"
      :placeholder="element.ref"
    >
      <template #header>
        <div class="p-grid dy58-multiselect-header">
          <InputText type="text" v-model="state.newMultipleValue" class="p-mr-2 p-col" />
          <Button
            type="button"
            @click="addNewMultipleValue(state.newMultipleValue)"
            icon="pi pi-plus"
            v-tooltip="'Добавить элемент в список и выбрать его'"
            class="p-button-rounded p-button-secondary"
          />
        </div>
      </template>
      <template #option="slotProps">
        <div>
          {{ slotProps.option.label }}&#160;
          <i v-if="isBlockMultipleSelectElement(element)"
            class="pi pi-double-side-arrow"
            @click.stop="handleReverseBlockTitle(slotProps.option.label)"
            v-tooltip="'Поменять названия станций местами'"
          />
        </div>
      </template>
    </MultiSelect>
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
    class="dy58-datetime-element"
  >
    <template #footer>
      <Button @click="state.elementModelValue = new Date()" class="p-mb-2 p-ml-2">
        Текущая дата
      </Button>
    </template>
  </Calendar>

  <!-- Элемент "Время" -->

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
    class="dy58-datetime-element"
  >
    <template #footer>
      <Button @click="state.elementModelValue = new Date()" class="p-mb-2 p-ml-2">
        Текущее время
      </Button>
    </template>
  </Calendar>

  <!-- Элемент "Время / до уведомления" -->

  <TimeOrTillNoticeComponent
    v-else-if="element.type === OrderPatternElementType.TIMETIME_OR_TILL_NOTICE"
    :placeholder="element.ref || 'время'"
    v-tooltip="element.ref"
    :value="state.elementModelValue"
    @input="state.elementModelValue = $event"
  />

  <!-- Элемент "Выдано запрещение ДСП" -->
  <!-- ранее было:
  <CheckboxAndInputOrNothingComponent
    v-else-if="element.type === OrderPatternElementType.CHECKBOX_AND_INPUT_OR_NOTHING"
    :checkboxText="'Выдано запрещение ДСП'"
    :placeholder="element.ref || 'запрещение ДСП'"
    v-tooltip="element.ref"
    :value="state.elementModelValue"
    @input="state.elementModelValue = $event"
  />-->
  <CheckboxComponent
    v-else-if="element.type === OrderPatternElementType.CHECKBOX"
    :checkboxText="'Выдано запрещение ДСП'"
    v-tooltip="element.ref"
    :value="state.elementModelValue"
    @input="state.elementModelValue = $event"
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
    class="dy58-datetime-element"
  >
    <template #footer>
      <Button @click="state.elementModelValue = new Date()" class="p-mb-2 p-ml-2">
        Текущее время
      </Button>
    </template>
  </Calendar>

  <!-- Элемент "Таблица "Поезд ДР" -->

  <div
    v-else-if="element.type === OrderPatternElementType.DR_TRAIN_TABLE"
    class="dy58-dy-train-table-block"
    style="width:100%"
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
        icon="pi pi-book"
        class="p-button-rounded p-button-success p-mr-1"
        v-tooltip.right="DR_TABLE_MENU_ITEMS.SELECT_STATIONS"
        @click="showAddDRTableStationsDialog"
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
      editMode="cell"
      @cell-edit-complete="onDRTimeEditComplete"
      @contextmenu="handleTrainTableRightClick($event)"
    >
      <Column
        v-for="col of DRTrainTableColumns"
        :field="col.field"
        :header="col.header"
        :key="col.field"
        :style="{ minWidth: col.width }"
      >
        <!-- возможность редактировать поля даты-времени прибытия и отправления прямо в таблице -->
        <template
          v-if="['arrivalTime', 'departureTime'].includes(col.field)"
          #editor="{ data, field }"
        >
          <InputMask v-model="data[field]" mask="99:99" autofocus />
        </template>
      </Column>
    </DataTable>

    <ContextMenu ref="menu" :model="drTrainTableContextMenuItems" />

    <!-- Диалог выбора станций для поезда ДР -->
    <Dialog
      header="Выбрать станции для таблицы ДР"
      v-model:visible="addDRTableStationsDialog"
      style="width:450px"
      :modal="true"
      class="p-fluid"
    >
      <MultiSelect
        v-model="selectedStations"
        :options="orderedStations"
        optionLabel="St_Title"
        dataKey="St_ID"
        :filter="true"
        placeholder="Выберите станции из списка"
        scrollHeight="400px"
      >
        <template #option="slotProps">
          <div style="overflow:auto">
            {{ slotProps.option.St_Title }}
          </div>
        </template>
      </MultiSelect>
      <small>! Станции необходимо выбирать в том порядке, в котором они должны быть добавлены в таблицу</small>
      <template #footer>
        <Button label="Закрыть" icon="pi pi-times" class="p-button-text" @click="hideAddDRTableStationsDialog"/>
        <Button label="Добавить" icon="pi pi-check" class="p-button-text" @click="saveNewStationsDRRecords" />
      </template>
    </Dialog>

    <!-- диалог добавления новой записи в таблицу поезда ДР -->
    <Dialog
      :header="addDRTableRecDlgTitle"
      v-model:visible="newDRRecordDialog"
      style="width:450px"
      :modal="true"
      class="p-fluid"
    >
      <form @submit.prevent="handleSubmitNewDRRecord(!v$.$invalid)" class="p-grid">
        <div class="p-field p-col-12 p-d-flex p-flex-column p-m-0">
          <label for="choose-station" :class="{'p-error':v$.station.$invalid && submitted}">
            <span class="dy58-required-field">*</span> Станция
          </label>
          <Dropdown
            id="choose-station"
            v-model="drTableRec.station"
            placeholder="Выберите станцию"
            required="true"
            autofocus
            style="width:100%"
            :class="{'p-invalid':v$.station.$invalid && submitted}"
            :options="getSectorStations"
            optionLabel="St_Title"
          />
          <small v-if="(v$.station.$invalid && submitted) || v$.station.$pending.$response" class="p-error">
            Необходимо указать станцию
          </small>
        </div>
        <div class="p-field p-col-12 p-d-flex p-flex-column p-m-0">
          <label for="arrival-time" :class="{'p-error':v$.arrivalTime.$invalid && submitted}">
            Время прибытия
          </label>
          <InputMask
            id="arrival-time"
            v-model="drTableRec.arrivalTime"
            mask="99:99"
            placeholder="Определить время прибытия"
            :class="{'p-invalid':(v$.arrivalTime.$invalid || v$.times.$invalid) && submitted}"
          />
          <small v-if="(v$.arrivalTime.$invalid && submitted) || v$.arrivalTime.$pending.$response" class="p-error">
            Неверно указано время прибытия
          </small>
        </div>
        <div class="p-field p-col-12 p-d-flex p-flex-column p-m-0">
          <label for="departure-time" :class="{'p-error':v$.departureTime.$invalid && submitted}">
            Время отправления
          </label>
          <InputMask
            id="departure-time"
            v-model="drTableRec.departureTime"
            mask="99:99"
            placeholder="Определить время отправления"
            :class="{'p-invalid':(v$.departureTime.$invalid || v$.times.$invalid) && submitted}"
          />
          <small v-if="(v$.departureTime.$invalid && submitted) || v$.departureTime.$pending.$response" class="p-error">
            Неверно указано время отправления
          </small>
        </div>
        <div class="p-field p-col-12 p-d-flex p-flex-column p-m-0">
          <small class="p-error" v-if="v$.times.$invalid && submitted">
            Необходимо указать время события на станции (прибытие и/или отправление)
          </small>
        </div>
        <div class="p-field p-col-12 p-d-flex p-m-0">
          <small>! При проследовании поездом станции время прибытия = время отправления</small>
        </div>
        <div class="p-field p-col-12 p-d-flex p-jc-end p-m-0">
          <Button class="p-button-text p-mr-2" icon="pi pi-check" label="Добавить" type="submit" />
          <Button class="p-button-text" icon="pi pi-times" label="Закрыть" @click="hideNewDRRecordDialog" />
        </div>
      </form>
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
  import { watch, computed, onMounted, reactive, ref } from 'vue';
  import { useStore } from 'vuex';
  import { useConfirm } from 'primevue/useconfirm';
  import { required } from '@vuelidate/validators';
  import { useVuelidate } from '@vuelidate/core';
  import {
    OrderPatternElementType,
    ElementSizesCorrespondence,
    DRTrainTableColumns,
  } from '@/constants/orderPatterns';
  import {
    GID_EVENT_TYPE,
    FILLED_ORDER_DROPDOWN_ELEMENTS,
    FILLED_ORDER_DATETIME_ELEMENTS,
    FILLED_ORDER_DATE_ELEMENTS,
    FILLED_ORDER_TIME_ELEMENTS,
    FILLED_ORDER_SELECT_MULTIPLE_ELEMENTS,
    BLOCK_PREFIX,
  } from '@/constants/orders';
  import showMessage from '@/hooks/showMessage.hook';
  import { getLocaleTimeString } from '@/additional/dateTimeConvertions';
  import { getOrderTextParamValue } from '@/additional/getOrderTextParamValue';
  import TimeOrTillNoticeComponent from '@/components/OrderPatterns/TimeOrTillNoticeComponent';
  import CheckboxComponent from '@/components/OrderPatterns/CheckboxComponent';
  import AutoWidthInputText from '@/components/OrderPatterns/AutoWidthInputText';
  import AutoWidthDropdown from '@/components/OrderPatterns/AutoWidthDropdown';

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
      selectMultipleValues: {
        type: Array,
        required: false,
      },
      // true - применять к элементам шаблона значения по умолчанию, false - не применять
      applyDefaultOrderPatternElementValues: {
        type: Boolean,
        required: true,
      },
    },

    components: {
      TimeOrTillNoticeComponent,
      CheckboxComponent,
      AutoWidthInputText,
      AutoWidthDropdown,
    },

    emits: ['input'],

    setup(props, { emit }) {
      const { showErrMessage } = showMessage();
      const menu = ref();
      const store = useStore();
      const confirm = useConfirm();

      const multipleValuesForSelection = ref(props.selectMultipleValues ? [...props.selectMultipleValues] : []);

      const addAdditionalValueInMultipleSelectList = (valueToAdd) => {
        if (!valueToAdd) return;
        if (!multipleValuesForSelection.value.find((el) => el.value === valueToAdd)) {
          multipleValuesForSelection.value.push({
            label: valueToAdd,
            value: valueToAdd,
          });
        }
      };

      // Значения элементов шаблонов распоряжений, которые они в соответствии
      // со своим смысловым значением могут принимать по умолчанию.
      // Эта же функция вызывается
      const getDefaultElementModelValue = () => {
        if (!props.element) {
          return null;
        }
        // Если значение по умолчанию применять не нужно, не делаем этого
        if (!props.applyDefaultOrderPatternElementValues) {
          return props.element.value;
        }

        if (props.element.type === OrderPatternElementType.SELECT) {
          switch (props.element.ref) {
            case FILLED_ORDER_DROPDOWN_ELEMENTS.TAKE_DUTY:
              return store.getters.getUserPostFIO({});
            case FILLED_ORDER_DROPDOWN_ELEMENTS.PASS_DUTY:
              // Если существует (ранее изданное) распоряжение ДНЦ/ЭЦД о принятии дежурства НА ДАННОМ РАБОЧЕМ МЕСТЕ,
              // то извлекаем из него должность и ФИО лица для заполнения поля о лице, сдавшем дежурство
              if (store.getters.isDNC || store.getters.isECD) {
                const existingTakeDutyOrder = store.getters.getExistingDNC_ECDTakeDutyOrder;
                if (existingTakeDutyOrder && existingTakeDutyOrder.orderText) {
                  return getOrderTextParamValue(FILLED_ORDER_DROPDOWN_ELEMENTS.TAKE_DUTY,
                    existingTakeDutyOrder.orderText.orderText);
                }
              }
              return null;
            default:
              return props.element.value;
          }
        } else if (props.element.type === OrderPatternElementType.MULTIPLE_SELECT) {
          props.element.value?.forEach((el) => addAdditionalValueInMultipleSelectList(el));
          return props.element.value || [];
        } else if (props.element.type === OrderPatternElementType.DATETIME) {
          switch (props.element.ref) {
            // Дата-время сдачи дежурства одним человеком = дата-время принятия дежурства другим человеком
            case FILLED_ORDER_DATETIME_ELEMENTS.TAKE_DUTY_DATETIME:
            case FILLED_ORDER_DATETIME_ELEMENTS.PASS_DUTY_DATETIME:
              return store.getters.getDefaultPassDutyTime;
            case FILLED_ORDER_DATETIME_ELEMENTS.CURR_DATETIME:
              return new Date();
            default:
              return props.element.value;
          }
        } else if (props.element.type === OrderPatternElementType.DATE) {
          switch (props.element.ref) {
            case FILLED_ORDER_DATE_ELEMENTS.CURR_DATE:
              return new Date();
            default:
              return props.element.value;
          }
        } else if (props.element.type === OrderPatternElementType.TIME) {
          switch (props.element.ref) {
            case FILLED_ORDER_TIME_ELEMENTS.CURR_TIME:
              return new Date();
            default:
              return props.element.value;
          }
        }
        return props.element.value;
      };

      const state = reactive({
        elementModelValue: getDefaultElementModelValue(),
        newMultipleValue: null,
      });

      // Реагируем на изменение списка из вне. При этом необходимо учесть тот факт, что в предыдущий список
      // в функции addNewMultipleValue могли быть добавлены значения, которых нет в новом списке.
      watch(() => props.selectMultipleValues, (value) => {
        // ищем значения предыдущего списка, которых нет в новом списке
        const diffValues = multipleValuesForSelection.value.filter((el) => !value?.find((item) => item.value === el.value)) || [];
        multipleValuesForSelection.value = value ? [...value, ...diffValues] : [...diffValues];
      });

      const addNewMultipleValue = (valueToAdd) => {
        // значения нет в списке -> добавляем его туда
        addAdditionalValueInMultipleSelectList(valueToAdd);
        // выделяем указанное значение, если оно еще не выделено
        if (!state.elementModelValue)
          state.elementModelValue = [{ 0: valueToAdd }];
        else {
          if (!state.elementModelValue.includes(valueToAdd)) {
            state.elementModelValue[Object.keys(state.elementModelValue).length] = valueToAdd;
          }
        }
      };

      // для отслеживания изменения значения поля value объекта element в родительском компоненте
      // (это происходит, в частности, при автоматическом заполнении полей шаблона распоряжения по
      // значениям соответствующих полей связанного распоряжения)
      watch(() => props.element.value, (newVal) => {
        switch (props.element.type) {
          case OrderPatternElementType.SELECT:
            // чтобы значение успешно применилось, оно должно быть в списке выбора
            if (state.elementModelValue !== newVal && props.dropdownValues?.find((el) => el.value === newVal))
              state.elementModelValue = newVal;
            break;
          case OrderPatternElementType.MULTIPLE_SELECT:
            newVal?.forEach((el) => addNewMultipleValue(el));
            break;
          default:
            if (JSON.stringify(state.elementModelValue) !== JSON.stringify(newVal))
              state.elementModelValue = newVal;
            break;
        }
      });

      // При перезагрузке страницы информация о рабочих распоряжениях может появиться позже чем надо,
      // в связи с чем могут оказаться незаполненными данными некоторые поля (например, при перезагрузке
      // циркулярного распоряжения)
      const watchedRawWorkingOrders = ref(false);
      const stopWatchingRawWorkingOrders =
        watch(() => store.getters.ifAllDataLoadedOnApplicationReload, () => {
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
        //if (props.element && props.element.type !== OrderPatternElementType.DR_TRAIN_TABLE) {
          emit('input', {
            elementId: props.element._id,
            value,
            elementType: props.element.type,
            elementRef: props.element.ref,
          });
        //}
      }, { immediate: true }); // обязательно нужно зайти сюда при загрузке страницы

      const selectedDRTableRecord = ref();
      const addDRTableRecDlgTitle = ref('');
      const newDRRecordDialog = ref(false);
      const addDRTableStationsDialog = ref(false);
      const selectedStations = ref([]);
      const drTableRec = ref({});
      const insertNewDRRecPos = ref();
      // true - когда значение insertNewDRRecPos после добавления очередной записи нужно поменять
      // (когда запись в таблицу ДР добавляется в конец списка либо перед выбранной записью);
      // false - когда значение insertNewDRRecPos после добавления очередной записи менять не нужно
      // (когда запись вставляется после текущей)
      const moveInsertNewDRRecPos = ref(true);
      const submitted = ref(false);
      const checkTime = (value) => {
        if (!value) return true;
        const time = value.split(':');
        return !(time[0] < 0 || time[0] > 23 || time[1] < 0 || time[1] > 59);
      }
      const checkTimes = () => drTableRec.value.arrivalTime || drTableRec.value.departureTime;
      const rules = {
        station: { required },
        arrivalTime: { checkTime },
        departureTime: { checkTime },
        times: { checkTimes },
      };
      const v$ = useVuelidate(rules, drTableRec, { $scope: false });

      const DR_TABLE_MENU_ITEMS = {
        PASTE: 'Вставить из буфера обмена',
        SELECT_STATIONS: 'Добавить станции',
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

      const orderedStations = computed(() => {
        const stationsArray = [...store.getters.getSectorStationsWithTrainSectors];
        return stationsArray
          .sort((a, b) => {
            if (a.trainSectorId < b.trainSectorId) return -1;
            if (a.trainSectorId > b.trainSectorId) return 1;
            return a.posInTrainSector - b.posInTrainSector;
          });
      });

      const drTableDataToDisplay = computed(() => {
        if (state.elementModelValue) {
          return state.elementModelValue.map((el, index) => ({
            orderNumber: index + 1,
            ...el,
          }));
        } else {
          return [];
        }
      });

      const checkArrivalDepartureTime = () => {
        if (!drTableRec.value.arrivalTime && !drTableRec.value.departureTime) {
          return false;
        }
        const checkTimeArr = (time) => {
          if (!time) return true;
          return !(time[0] < 0 || time[0] > 23 || time[1] < 0 || time[1] > 59);
        };
        const arrivalTimeArray = drTableRec.value.arrivalTime ? drTableRec.value.arrivalTime.split(':') : null;
        const departureTimeArray = drTableRec.value.departureTime ? drTableRec.value.departureTime.split(':') : null;
        return checkTimeArr(arrivalTimeArray) && checkTimeArr(departureTimeArray);
      };

      const drTrainTableContextMenuItems = computed(() => {
        const items = [{
          label: DR_TABLE_MENU_ITEMS.PASTE,
          command: () => { pasteDRTrainTable(); menu.value.hide(); },
        }, {
          label: DR_TABLE_MENU_ITEMS.SELECT_STATIONS,
          command: () => { showAddDRTableStationsDialog(); menu.value.hide(); },
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
/*
      const emitDRTable = () => {
        emit('input', {
          elementId: props.element._id,
          value: state.elementModelValue,
          elementType: props.element.type,
          elementRef: props.element.ref,
        });
      };
*/

      function fillDRTrainTableWithClipboardData(obj) {
        const trainTimeTable = [];
        let nonExistingStationItemId = -1;
        for (let el of obj) {
          // Определяем объект станции по коду станции ГИД, считанному из буфера обмена
          const stationObject = store.getters.getSectorStationByGID_ESRCode(el.Station);

          // Если объект станции известен, то отображаем наименование станции, в противном случае
          // отобразим считанный из буфера обмена код станции
          const dispStationNameCode = (stationObject && stationObject.St_Title)
            ? `${stationObject.St_Title}`
            : el.Station;

          if (!trainTimeTable.length || trainTimeTable[trainTimeTable.length - 1].station !== dispStationNameCode) {
            trainTimeTable.push({
              stationId: stationObject ? stationObject.St_ID : nonExistingStationItemId,
              station: dispStationNameCode,
              departureTime:
                String(el.EvType) === String(GID_EVENT_TYPE.DEPARURE) || String(el.EvType) === String(GID_EVENT_TYPE.FOLLOWING)
                ? getLocaleTimeString(new Date(el.Time)) : null,
              arrivalTime:
                String(el.EvType) === String(GID_EVENT_TYPE.ARRIVAL) || String(el.EvType) === String(GID_EVENT_TYPE.FOLLOWING)
                ? getLocaleTimeString(new Date(el.Time)) : null,
            });
            if (!stationObject) {
              nonExistingStationItemId += -1;
            }
          } else {
            //
            if (String(el.EvType) === String(GID_EVENT_TYPE.DEPARURE) || String(el.EvType) === String(GID_EVENT_TYPE.FOLLOWING)) {
              trainTimeTable[trainTimeTable.length - 1].departureTime = getLocaleTimeString(new Date(el.Time));
            } else if (String(el.EvType) === String(GID_EVENT_TYPE.ARRIVAL) || String(el.EvType) === String(GID_EVENT_TYPE.FOLLOWING)) {
              trainTimeTable[trainTimeTable.length - 1].arrivalTime = getLocaleTimeString(new Date(el.Time));
            }
          }
        }
        //if (!state.elementModelValue) {
        //  state.elementModelValue = [];
        //}
        //state.elementModelValue.push(...trainTimeTable);

        // Новые данные для таблицы ДР удаляют из нее всю имеющуюся информацию!
        state.elementModelValue = trainTimeTable;
        //emitDRTable();
      }

      onMounted(() => {
        if (props.element.type === OrderPatternElementType.DR_TRAIN_TABLE) {
          const clipboardDRData = store.getters.getDataForDROrderFromClipboard;
          if (clipboardDRData) {
            fillDRTrainTableWithClipboardData(clipboardDRData);
          }
        }
      });

      watch(() => store.getters.getDataForDROrderFromClipboard, (newData) => {
        if (newData && props.element.type === OrderPatternElementType.DR_TRAIN_TABLE) {
          fillDRTrainTableWithClipboardData(newData);
        }
      });

      const pasteDRTrainTable = () => {
        navigator.clipboard.readText()
          .then((text) => {
            const obj = JSON.parse(text);
            if (
              obj instanceof Array && obj.length > 0 &&
              obj[0] instanceof Object && obj[0].Station
            ) {
              fillDRTrainTableWithClipboardData(obj);
            }
          })
          .catch((err) => {
            showErrMessage('Что-то пошло не так: ' + err);
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
            //emitDRTable();
          },
        });
      };

      const showAddDRTableStationsDialog = () => {
        selectedStations.value = [];
        addDRTableStationsDialog.value = true;
      };

      const hideAddDRTableStationsDialog = () => {
        addDRTableStationsDialog.value = false;
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

      const handleSubmitNewDRRecord = (isFormValid) => {
        submitted.value = true;
        if (!isFormValid) {
          showErrMessage('Проверьте правильность заполнения полей формы');
          return;
        }
        if (!state.elementModelValue) {
          state.elementModelValue = [];
        }
        const newElement = {
          stationId: drTableRec.value.station.St_ID,
          station: drTableRec.value.station.St_Title,
          arrivalTime: drTableRec.value.arrivalTime,
          departureTime: drTableRec.value.departureTime,
        };
        // Делаю так для того чтобы была реакция на изменение значения
        state.elementModelValue = [
          ...state.elementModelValue.slice(0, insertNewDRRecPos.value),
          newElement,
          ...state.elementModelValue.slice(insertNewDRRecPos.value),
        ];
        //emitDRTable();

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
      };

      const saveNewDRRecord = () => {
        submitted.value = true;

        if (drTableRec.value.station && checkArrivalDepartureTime()) {
          if (!state.elementModelValue) {
            state.elementModelValue = [];
          }
          const newElement = {
            stationId: drTableRec.value.station.St_ID,
            station: drTableRec.value.station.St_Title,
            arrivalTime: drTableRec.value.arrivalTime,
            departureTime: drTableRec.value.departureTime,
          };
          state.elementModelValue.splice(insertNewDRRecPos.value, 0, newElement);
          //emitDRTable();

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

      const saveNewStationsDRRecords = () => {
        if (!state.elementModelValue) {
          state.elementModelValue = [];
        }
        selectedStations.value.forEach((station) => {
          state.elementModelValue.push({
            stationId: station.St_ID,
            station: station.St_Title,
          });
        });
        addDRTableStationsDialog.value = false;
        //emitDRTable();
      };

      const delDRTableRecord = () => {
        if (!selectedDRTableRecord.value) {
          return;
        }
        state.elementModelValue = state.elementModelValue.filter((_el, index) =>
          (index + 1) !== selectedDRTableRecord.value.orderNumber
        );
        selectedDRTableRecord.value = null;
        /*if (!state.elementModelValue.length) {
          state.elementModelValue = null;
        }*/
        //emitDRTable();
      };

      const handleTrainTableRightClick = (event) => {
        menu.value.show(event);
      };
/*
      const getCurrDRTableSelectedDateTimeValue = (value) => {
        if (!selectedDRTableRecord.value || !value) {
          return new Date();
        }
        const utcString = appDateTimeStringToUTCDateTimeString(value);
        if (!utcString) {
          return new Date();
        }
        return new Date(utcString);
      };
*/
      const onDRTimeEditComplete = (event) => {
        let { data, newValue, field } = event;
        switch (field) {
          case 'arrivalTime':
          case 'departureTime':
            if (data[field] !== newValue) {
              const numArr = newValue.split(':');
              if (+numArr[0] < 0 || +numArr[0] > 23 || +numArr[1] < 0 || +numArr[1] > 59) {
                return;
              }
              state.elementModelValue = state.elementModelValue.map((el) => {
                if (el.stationId !== data.stationId) {
                  return el;
                }
                return {
                  ...el,
                  [field]: newValue,
                };
              });
              //emitDRTable();
            }
            break;
          default:
            break;
        }
      };

      // Определяем, какие элементв шаблона типа "Выпадающий список одиночного выбора" могут редактироваться пользователем
      const isDropdownEditable = computed(() =>
        props.element &&
        props.element.type === OrderPatternElementType.SELECT &&
        (
          props.element.ref === FILLED_ORDER_DROPDOWN_ELEMENTS.WORKS_HEADS ||
          props.element.ref === FILLED_ORDER_DROPDOWN_ELEMENTS.SPEED
        )
      );

      // Данный метод предназначен для использования с отдельным значением элемента 'Множественный выбор'.
      // Причем только с элементом типа 'Перегон'.
      // Позволяет поменять местами названия станций в наименовании перегона.
      // Например, из 'пер.Осиновка - Хлюстино' получаем 'пер.Хлюстино - Осиновка',
      // из 'пер.Минск-Сортировочный - Помыслище' получаем 'пер.Помыслище - Минск-Сортировочный'.
      const handleReverseBlockTitle = (blockTitle) => {
        // !!! Полагаем, что в списке multipleValuesForSelection у всех элементов значения полей label и value одинаковы.
        // Нам необходимо внести изменения во все списки в состоянии компонента, в которые выходит выбранное пользователем значение
        // blockTitle (т.е. в списки multipleValuesForSelection и elementModelValue)

        // Получаем "чистое" наименование перегона (пез префикса, если он в нем присутствует)
        const pureBlockTitle = blockTitle.startsWith(BLOCK_PREFIX) ? blockTitle.split(BLOCK_PREFIX)[1] : blockTitle;

        // Смотрим, какой разделитель используется для разделения наименований станций в наименовании перегона
        // (полагаем, что используемый дефисный символ - неважно какой - должен быть отделен от наименований станций
        // пробелами, это обязательно, т.к. если дефисный символ в строке встречается без пробелов, то полагаем,
        // что он является частью названия станции)
        let stationsSeparator;
        const regexSearchSeparator = /\s+.\s+/;
        const blockNameSearchResults = pureBlockTitle.match(regexSearchSeparator);
        if (blockNameSearchResults?.length)
          stationsSeparator = blockNameSearchResults[0];
        if (!stationsSeparator)
          return;

        // Выделяем из наименования перегона наименования станций
        const stationTitles = pureBlockTitle.split(stationsSeparator).map((title) => title.trim());

        // Формируем новое (перевернутое) наименование перегона
        const reversedBlockTitle = (blockTitle.startsWith(BLOCK_PREFIX) ? BLOCK_PREFIX : '') +
          `${stationTitles[1]} ${stationsSeparator} ${stationTitles[0]}`;

        // Редактируем при помощи нового наименования перегона состояние компонента
        multipleValuesForSelection.value = multipleValuesForSelection.value.map((el) => {
          if (el.value !== blockTitle) return el;
          return { label: reversedBlockTitle, value: reversedBlockTitle};
        });
        if (state.elementModelValue) {
          for (let key in state.elementModelValue) {
            if (state.elementModelValue[key] === blockTitle) {
              state.elementModelValue[key] = reversedBlockTitle;
            }
          }
        }
      };

      return {
        multipleValuesForSelection,
        state,
        selectedDRTableRecord,
        menu,
        v$,
        orderedStations,
        selectedStations,
        addNewMultipleValue,
        addDRTableRecDlgTitle,
        drTableRec,
        addDRTableStationsDialog,
        submitted,
        insertNewDRRecPos,
        drTableDataToDisplay,
        DR_TABLE_MENU_ITEMS,
        getSectorStations: computed(() => store.getters.getSectorStations),
        OrderPatternElementType,
        getElementSizesCorrespondence,
        DRTrainTableColumns,
        drTrainTableContextMenuItems,
        handleTrainTableRightClick,
        pasteDRTrainTable,
        showAddDRTableStationsDialog,
        hideAddDRTableStationsDialog,
        clearDRTrainTable,
        newDRTableRecord,
        newDRTableRecordBefore,
        newDRTableRecordAfter,
        saveNewStationsDRRecords,
        delDRTableRecord,
        newDRRecordDialog,
        hideNewDRRecordDialog,
        saveNewDRRecord,
        onDRTimeEditComplete,
        //getCurrDRTableSelectedDateTimeValue,
        getLocaleTimeString,
        checkArrivalDepartureTime,
        handleSubmitNewDRRecord,
        isDropdownEditable,
        isBlockMultipleSelectElement: (multipleSelectElement) =>
          [FILLED_ORDER_SELECT_MULTIPLE_ELEMENTS.BLOCK].includes(multipleSelectElement?.ref),
        handleReverseBlockTitle,
      };
    },
  };
</script>


<style lang="scss" scoped>
  .p-inputmask {
    width: 100%;
  }
  .dy58-multiselect-header {
    background-color: var(--surface-b);
    padding: 0.5rem;
  }
  /*:deep(.p-multiselect-panel .p-widget .p-multiselect-header) {
    display: none;
  }*/
</style>
