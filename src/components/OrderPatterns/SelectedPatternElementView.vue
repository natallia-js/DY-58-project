<template>
  <InputText
    v-if="element.type === getOrderPatternElementTypes.TEXT"
    style="width:100%"
    v-model="elementValue"
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
  <i v-else-if="element.type === getOrderPatternElementTypes.LINEBREAK"></i>
  <template v-else></template>
</template>


<script>
  import {
    OrderPatternElementType,
    ElementSizesCorrespondence,
    DateFormat,
  } from '../../constants/orderPatterns';

  export default {
    name: 'dy58-selected-pattern-element-view',

    data() {
      return {
        elementValue: this.element.value,
      };
    },

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
