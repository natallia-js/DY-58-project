<template>
  <span v-if="element.type === getOrderPatternElementTypes.TEXT">
    {{ element.value }}
  </span>
  <InputText
    v-else-if="element.type === getOrderPatternElementTypes.INPUT"
    :style="{width:getElementSizesCorrespondence[element.size]}"
    class="p-ml-1 p-mr-1 p-mb-2"
  />
  <Dropdown
    v-else-if="element.type === getOrderPatternElementTypes.SELECT"
    :style="{width:getElementSizesCorrespondence[element.size]}"
    class="p-ml-1 p-mr-1 p-mb-2"
  />
  <Calendar
    v-else-if="element.type === getOrderPatternElementTypes.DATE"
    :dateFormat="getDateFormat"
    :showIcon="true"
    placeholder="дата"
    class="p-ml-1 p-mr-1 p-mb-2"
  />
  <Calendar
    v-else-if="element.type === getOrderPatternElementTypes.TIME"
    :showTime="true"
    :timeOnly="true"
    :showIcon="true"
    placeholder="время"
    class="p-ml-1 p-mr-1 p-mb-2"
  />
  <Calendar
    v-else-if="element.type === getOrderPatternElementTypes.DATETIME"
    :dateFormat="getDateFormat"
    :showTime="true"
    :showIcon="true"
    placeholder="дата-время"
    class="p-ml-1 p-mr-1 p-mb-2"
  />
  <i
    v-else-if="element.type === getOrderPatternElementTypes.LINEBREAK"
    class="pi pi-reply p-ml-1 p-mr-1"
  ></i>
  <template v-else></template>
</template>


<script>
  import {
    OrderPatternElementType,
    ElementSizesCorrespondence,
    DateFormat,
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
    },
  };
</script>
