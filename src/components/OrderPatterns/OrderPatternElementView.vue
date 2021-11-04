<template>
  <span v-if="element.type === getOrderPatternElementTypes.TEXT">
    {{ elementModelValue }}
  </span>
  <InputText
    v-else-if="element.type === getOrderPatternElementTypes.INPUT"
    :style="{ width: getElementSizesCorrespondence[element.size] }"
    v-model="elementModelValue"
    @input="handleChangeInputText"
    v-tooltip="element.ref"
    :placeholder="element.ref"
  />
  <div v-else-if="element.type === getOrderPatternElementTypes.SELECT" v-tooltip="element.ref">
    <Dropdown
      :style="{ width: getElementSizesCorrespondence[element.size] }"
      :options="dropdownValues"
      optionLabel="label"
      optionValue="value"
      v-model="elementModelValue"
      @change="handleChangeDropdown"
      v-tooltip="element.ref"
      :placeholder="element.ref"
    />
  </div>
  <Calendar
    v-else-if="element.type === getOrderPatternElementTypes.DATE"
    :showIcon="true"
    :placeholder="element.ref || 'дата'"
    :hideOnDateTimeSelect="true"
    :manualInput="false"
    v-model="elementModelValue"
    @dateSelect="handleChangeDateTime"
    v-tooltip="element.ref"
  />
  <Calendar
    v-else-if="element.type === getOrderPatternElementTypes.TIME"
    :showTime="true"
    :timeOnly="true"
    :showIcon="true"
    :hideOnDateTimeSelect="true"
    :manualInput="false"
    :placeholder="element.ref || 'время'"
    v-model="elementModelValue"
    @dateSelect="handleChangeDateTime"
    v-tooltip="element.ref"
  />
  <Calendar
    v-else-if="element.type === getOrderPatternElementTypes.DATETIME"
    :showTime="true"
    :showIcon="true"
    :placeholder="element.ref || 'дата-время'"
    :hideOnDateTimeSelect="true"
    :manualInput="false"
    v-model="elementModelValue"
    @dateSelect="handleChangeDateTime"
    v-tooltip="element.ref"
  />
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
  } from '../../constants/orderPatterns';

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

    data() {
      return {
        elementModelValue: null,
      };
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
      elementValue() {
        return this.element ? this.element.value : null;
      },
    },

    watch: {
      // для отслеживания изменения значения поля value объекта element в родительском компоненте
      // (это происходит, в частности, при автоматическом заполнении полей шаблона распоряжения по
      // значениям соответствующих полей связанного распоряжения)
      elementValue: {
        handler(newVal) {
          this.elementModelValue = newVal;
        }
      },
    },

    mounted() {
      if (this.element) {
        this.elementModelValue = this.element.value;
      }
    },

    methods: {
      handleChangeInputText(event) {
        this.$emit('input', {
          elementId: this.element._id,
          value: event.target.value,
          elementType: this.element.type,
          elementRef: this.element.ref,
        });
      },

      handleChangeDropdown(event) {
        this.$emit('input', {
          elementId: this.element._id,
          value: event.value,
          elementType: this.element.type,
          elementRef: this.element.ref,
        });
      },

      handleChangeDateTime(value) {
        this.$emit('input', {
          elementId: this.element._id,
          value,
          elementType: this.element.type,
          elementRef: this.element.ref,
        });
      },
    },
  };
</script>
