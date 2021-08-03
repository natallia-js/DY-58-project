<template>
  <allow-clear-input-text
    v-if="element.type === getOrderPatternElementTypes.TEXT"
    :value="elementValue"
    style="width:100%"
    @changeValue="(val) => { elementValue = val; }"
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
  import AllowClearInputText from '../AllowClearInputText';

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
      element(newVal) {console.log('***',newVal, this.elementValue)
        this.elementValue = newVal ? newVal.value : null;
      },
      elementValue(newVal) {console.log('el val', newVal)
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

    methods: {
      handleClearElementValue() {
        this.elementValue = null;
      },
    },
  };
</script>
