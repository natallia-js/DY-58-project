<template>
  <div class="dy58-title-small p-text-center p-mb-3">Предварительный просмотр</div>
  <div v-for="(array, index) of orderPatternArrays" :key="index" style="min-height:1.5rem">
    <template v-for="patternElement of array" :key="patternElement._id">
      <span
        v-if="patternElement.type === getOrderPatternElementTypes.TEXT"
        class="p-mr-2 p-mb-2"
        :style="{ display: 'inline-block' }"
      >
        <order-pattern-element-view :element="patternElement" />
      </span>
      <div
        v-else
        class="p-mr-2 p-mb-2"
        :style="{
          width: getElementSizesCorrespondence[patternElement.size],
          display: 'inline-block'
        }"
      >
        <order-pattern-element-view :element="patternElement" />
      </div>
    </template>
  </div>
</template>

<script>
  import OrderPatternElementView from './OrderPatternElementView';
  import { OrderPatternElementType, ElementSizesCorrespondence } from '../../constants/orderPatterns';

  export default {
    name: 'dy58-order-pattern-preview',

    props: {
      orderPattern: Array,
    },

    data() {
      return {
        orderPatternArrays: [],
      };
    },

    components: {
      OrderPatternElementView,
    },

    computed: {
      getOrderPatternElementTypes() {
        return OrderPatternElementType;
      },

      getElementSizesCorrespondence() {
        return ElementSizesCorrespondence;
      },
    },

    mounted() {
      this.analyzeNewOrderPattern(this.orderPattern);
    },

    watch: {
      orderPattern: function(newVal) {
        this.analyzeNewOrderPattern(newVal);
      },
    },

    methods: {
      analyzeNewOrderPattern(newOrderPattern) {
        if (!newOrderPattern || !newOrderPattern.length) {
          this.orderPatternArrays = [];
          return;
        }
        const linebreakElementsIndexes = [];
        newOrderPattern.forEach((element, index) => {
          if (element.type === OrderPatternElementType.LINEBREAK) {
            linebreakElementsIndexes.push(index);
          }
        });
        linebreakElementsIndexes.push(newOrderPattern.length);

        let prevLinebreakIndex = 0;
        const orderPatternToDraw = [];
        linebreakElementsIndexes.forEach((element, index) => {
          const arrayPart = newOrderPattern.slice(prevLinebreakIndex, element);
          prevLinebreakIndex = element + 1;
          if (arrayPart) {
            if (arrayPart.length || index !== linebreakElementsIndexes.length - 1) {
              orderPatternToDraw.push(arrayPart);
            }
          }
        });
        this.orderPatternArrays = orderPatternToDraw;
      },
    },
  };
</script>
