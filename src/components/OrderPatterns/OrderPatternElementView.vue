<template>
  <span v-if="element.type === getOrderPatternElementTypes.TEXT">
    {{ element.value }}
  </span>
  <InputText
    v-else-if="element.type === getOrderPatternElementTypes.INPUT"
    :style="{ width: getElementSizesCorrespondence[element.size] }"
    :modelValue="element.value"
    @input="handleChangeInputText"
  />
  <Dropdown
    v-else-if="element.type === getOrderPatternElementTypes.SELECT"
    :style="{ width: getElementSizesCorrespondence[element.size] }"
    :modelValue="element.value"
    @input="handleChangeInputText"
  />
  <Calendar
    v-else-if="element.type === getOrderPatternElementTypes.DATE"
    :showIcon="true"
    placeholder="дата"
    :hideOnDateTimeSelect="true"
    :manualInput="false"
    v-model="elementModelValue"
    @dateSelect="handleChangeDateTime"
  />
  <Calendar
    v-else-if="element.type === getOrderPatternElementTypes.TIME"
    :showTime="true"
    :timeOnly="true"
    :showIcon="true"
    :hideOnDateTimeSelect="true"
    :manualInput="false"
    placeholder="время"
    v-model="elementModelValue"
    @dateSelect="handleChangeDateTime"
  />
  <Calendar
    v-else-if="element.type === getOrderPatternElementTypes.DATETIME"
    :showTime="true"
    :showIcon="true"
    placeholder="дата-время"
    :hideOnDateTimeSelect="true"
    :manualInput="false"
    v-model="elementModelValue"
    @dateSelect="handleChangeDateTime"
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

    props: ['element'],

    emits: ['input'],

    data() {
      return {
        orderPatternArrays: [],
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
    },

    mounted() {
      if (this.element) {
        this.elementModelValue = this.element.value;
      }
    },

    methods: {
      handleChangeInputText(event) {
        this.$emit('input', { elementId: this.element._id, value: event.target.value });
      },

      handleChangeDateTime(value) {
        this.$emit('input', { elementId: this.element._id, value });
      },
    },
  };
</script>
