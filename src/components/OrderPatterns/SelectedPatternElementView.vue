<template>
  <allow-clear-input-text
    v-if="element.type === getOrderPatternElementTypes.TEXT"
    :value="elementValue"
    style="width:100%"
    @input="elementValue = $event"
  />
  <InputText
    v-else-if="element.type === getOrderPatternElementTypes.INPUT"
    :style="{width:getElementSizesCorrespondence[element.size]}"
  />
  <Dropdown
    v-else-if="element.type === getOrderPatternElementTypes.SELECT"
    :style="{width:getElementSizesCorrespondence[element.size]}"
  />
  <Calendar
    v-else-if="element.type === getOrderPatternElementTypes.DATE"
    :showIcon="true"
    placeholder="дата"
    :manualInput="false"
  />
  <Calendar
    v-else-if="element.type === getOrderPatternElementTypes.TIME"
    :showTime="true"
    :timeOnly="true"
    :showIcon="true"
    placeholder="время"
    :manualInput="false"
  />
  <Calendar
    v-else-if="element.type === getOrderPatternElementTypes.DATETIME"
    :showTime="true"
    :showIcon="true"
    placeholder="дата-время"
    :manualInput="false"
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
  } from '@/constants/orderPatterns';
  import AllowClearInputText from '@/components/AllowClearInputText';

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
