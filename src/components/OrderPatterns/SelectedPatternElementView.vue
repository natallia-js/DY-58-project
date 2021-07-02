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
  } from '../../constants/orderPatterns';

  export default {
    name: 'dy58-selected-pattern-element-view',

    data() {
      return {
        elementValue: null,
      };
    },

    props: {
      element: Object,
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
      getDateFormat() {
        return DateFormat;
      },
    },
  };
</script>
