<template>
  <span v-if="element.type === getOrderPatternElementTypes.TEXT">
    {{ element.value }}
  </span>
  <InputText
    v-else-if="element.type === getOrderPatternElementTypes.INPUT"
    :style="{ width: getElementSizesCorrespondence[element.size] }"
  />
  <Dropdown
    v-else-if="element.type === getOrderPatternElementTypes.SELECT"
    :style="{ width: getElementSizesCorrespondence[element.size] }"
  />
  <Calendar
    v-else-if="element.type === getOrderPatternElementTypes.DATE"
    :dateFormat="getDateFormat"
    :showIcon="true"
    placeholder="дата"
  />
  <Calendar
    v-else-if="element.type === getOrderPatternElementTypes.TIME"
    :showTime="true"
    :timeOnly="true"
    :showIcon="true"
    placeholder="время"
  />
  <Calendar
    v-else-if="element.type === getOrderPatternElementTypes.DATETIME"
    :dateFormat="getDateFormat"
    :showTime="true"
    :showIcon="true"
    placeholder="дата-время"
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
    DateFormat,
    DRTrainTableColumns,
  } from '../../constants/orderPatterns';

  export default {
    name: 'dy58-order-pattern-element-view',

    props: ['element'],

    computed: {
      getOrderPatternElementTypes() {
        return OrderPatternElementType;
      },
      getElementSizesCorrespondence() {
        return ElementSizesCorrespondence;
      },
      getDateFormat() {
        return DateFormat;
      },
      getDRTrainTableColumns() {
        return DRTrainTableColumns;
      },
    },
  };
</script>
