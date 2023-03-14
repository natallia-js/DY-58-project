<template>
  <allow-clear-input-text
    v-if="element.type === getOrderPatternElementTypes.TEXT"
    :value="elementValue"
    style="width:100%"
    @input="elementValue = $event"
  />
  <div v-else-if="element.type === getOrderPatternElementTypes.INPUT">
    <InputText
      :style="{width:getElementSizesCorrespondence[element.size]}"
      v-model="elementValue"
    />
    <div>*Текст, введенный в поле выше, будет полагаться значением по умолчанию</div>
  </div>
  <div v-else-if="element.type === getOrderPatternElementTypes.TEXT_AREA">
    <Textarea
      :autoResize="true"
      rows="2"
      style="width:100%;font-size:inherit;font-family:inherit;"
      class="p-p-1"
      v-model="elementValue"
    />
    <div>*Текст, введенный в поле выше, будет полагаться значением по умолчанию</div>
  </div>
  <Dropdown
    v-else-if="element.type === getOrderPatternElementTypes.SELECT"
    :style="{width:getElementSizesCorrespondence[element.size]}"
  />
  <MultiSelect
    v-else-if="element.type === getOrderPatternElementTypes.MULTIPLE_SELECT"
    :style="{width: getElementSizesCorrespondence[element.size]}"
  />
  <Calendar
    v-else-if="element.type === getOrderPatternElementTypes.DATE"
    :showIcon="true"
    placeholder="дата"
    :manualInput="false"
    class="dy58-datetime-element"
  >
    <template #footer>
      <Button class="p-mb-2 p-ml-2">
        Текущая дата
      </Button>
    </template>
  </Calendar>
  <Calendar
    v-else-if="element.type === getOrderPatternElementTypes.TIME"
    :showTime="true"
    :timeOnly="true"
    :showIcon="true"
    placeholder="время"
    :manualInput="false"
    class="dy58-datetime-element"
  >
    <template #footer>
      <Button class="p-mb-2 p-ml-2">
        Текущее время
      </Button>
    </template>
  </Calendar>
  <TimeOrTillNoticeComponent
    v-else-if="element.type === getOrderPatternElementTypes.TIMETIME_OR_TILL_NOTICE"
    :placeholder="'время'"
  />
  <!-- ранее было:
  <CheckboxAndInputOrNothingComponent
    v-else-if="element.type === getOrderPatternElementTypes.CHECKBOX_AND_INPUT_OR_NOTHING"
    :checkboxText="'Выдано запрещение ДСП'"
    :placeholder="'запрещение ДСП'"
  />-->
  <CheckboxComponent
    v-else-if="element.type === getOrderPatternElementTypes.CHECKBOX"
    :checkboxText="'Выдано запрещение ДСП'"
  />
  <Calendar
    v-else-if="element.type === getOrderPatternElementTypes.DATETIME"
    :showTime="true"
    :showIcon="true"
    placeholder="дата-время"
    :manualInput="false"
    class="dy58-datetime-element"
  >
    <template #footer>
      <Button class="p-mb-2 p-ml-2">
        Текущее время
      </Button>
    </template>
  </Calendar>
  <DataTable
    v-else-if="element.type === getOrderPatternElementTypes.DR_TRAIN_TABLE"
    :value="[]"
    class="p-datatable-responsive p-datatable-gridlines p-datatable-sm z-depth-1"
  >
    <Column
      v-for="col of getDRTrainTableColumns"
      :field="col.field"
      :header="col.header"
      :key="col.field"
    >
    </Column>
  </DataTable>
  <i
    v-else-if="element.type === getOrderPatternElementTypes.LINEBREAK"
    class="pi pi-reply"
    style="transform: rotate(180deg)"
  ></i>
  <template v-else></template>
</template>


<script>
  import {
    OrderPatternElementType,
    ElementSizesCorrespondence,
    DRTrainTableColumns,
  } from '@/constants/orderPatterns';
  import AllowClearInputText from '@/components/AllowClearInputText';
  import TimeOrTillNoticeComponent from '@/components/OrderPatterns/TimeOrTillNoticeComponent';
  import CheckboxComponent from '@/components/OrderPatterns/CheckboxComponent';

  export default {
    name: 'dy58-selected-pattern-element-view',

    emits: ['changePatternElementValue'],

    data() {
      return {
        elementValue: null,
      };
    },

    props: {
      element: Object,
    },

    components: {
      AllowClearInputText,
      TimeOrTillNoticeComponent,
      CheckboxComponent,
    },

    watch: {
      element(newVal) {
        this.elementValue = newVal ? newVal.value : null;
      },
      elementValue(newVal) {
        this.$emit('changePatternElementValue', newVal);
      },
    },

    mounted() {
      this.elementValue = this.element ? this.element.value : null;
    },

    computed: {
      getOrderPatternElementTypes() {
        return OrderPatternElementType;
      },
      getElementSizesCorrespondence() {
        return ElementSizesCorrespondence;
      },
      getDRTrainTableColumns() {
        return DRTrainTableColumns;
      },
    },

    methods: {
      handleClearElementValue() {
        this.elementValue = null;
      },
    },
  };
</script>
