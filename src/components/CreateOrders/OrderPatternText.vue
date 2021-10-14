<template>
  <div v-for="(array, index) of orderPatternArrays" :key="index" style="min-height:1.5rem">
    <template v-for="patternElement of array" :key="patternElement._id">
      <span
        v-if="patternElement.type === getOrderPatternElementTypes.TEXT"
        class="p-mr-2 p-mb-2"
        :style="{ display: 'inline' }"
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
        <order-pattern-element-view
          :element="patternElement"
          @input="handleChangeElementValue"
        />
      </div>
    </template>
  </div>
</template>

<script>
  import OrderPatternElementView from '../OrderPatterns/OrderPatternElementView';
  import { OrderPatternElementType, ElementSizesCorrespondence } from '../../constants/orderPatterns';

  export default {
    name: 'dy58-order-pattern-preview',

    props: {
      // массив элементов шаблона распоряжения
      value: Array,
    },

    data() {
      return {
        // массив элементов шаблона распоряжения, разбитый на подмассивы для удобства отображения
        // (подмассив - один абзац исходного текста: от начала текста до элемента linebreak, либо от
        // одного элемента linebreak до другого элемента linebreak, либо от элемента linebreak до
        // конца текста)
        orderPatternArrays: [],
      };
    },

    components: {
      OrderPatternElementView,
    },

    emits: ['input'],

    computed: {
      getOrderPatternElementTypes() {
        return OrderPatternElementType;
      },
      getElementSizesCorrespondence() {
        return ElementSizesCorrespondence;
      },
    },

    mounted() {
      this.analyzeNewOrderPattern(this.value);
    },

    watch: {
      value: {
        handler(newVal) {
          this.analyzeNewOrderPattern(newVal);
        },
      },
    },

    methods: {
      /**
       * Производит разбиение массива элементов текста распоряжения на подмассивы (отдельные абзацы).
       */
      analyzeNewOrderPattern(newOrderPattern) {
        if (!newOrderPattern || !newOrderPattern.length) {
          if (this.orderPatternArrays.length) {
            this.orderPatternArrays = [];
          }
          return;
        }
        // Формируем массив массивов (учитываем разбиение на абзацы) элементов, которые
        // необходимо отрисовать
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

      handleChangeElementValue(event) {
        this.$emit('input', event);
      },
    },
  };
</script>
