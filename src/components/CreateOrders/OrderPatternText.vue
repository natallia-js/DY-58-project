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
          :dropdownValues="getElementDropdownValues(patternElement.ref)"
          @input="handleChangeElementValue"
        />
      </div>
    </template>
  </div>
</template>

<script>
  import OrderPatternElementView from '../OrderPatterns/OrderPatternElementView';
  import { OrderPatternElementType, ElementSizesCorrespondence } from '../../constants/orderPatterns';
  import { mapGetters } from 'vuex';
  import { FILLED_ORDER_DROPDOWN_ELEMENTS } from '../../constants/orders';

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
      ...mapGetters([
        'getSectorStations',
        'getSectorStationByTitle',
        'getSectorBlocks',
        'getSectorBlocksByStationTitle',
      ]),

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

      getStationTracks(stationElementRef) {
        const patternStationElement = this.value.find((el) => el.ref === stationElementRef);
        if (patternStationElement) {
          const stationObject = this.getSectorStationByTitle(patternStationElement.value);
          if (stationObject) {
            return stationObject.TStationTracks;
          }
        }
        return [];
      },

      getStationBlocks(stationElementRef) {
        const patternStationElement = this.value.find((el) => el.ref === stationElementRef);
        console.log(patternStationElement)
        if (patternStationElement) {
          const blocks = this.getSectorBlocksByStationTitle(patternStationElement.value);
          console.log(blocks)
          return blocks;
        }
        return [];
      },

      getElementDropdownValues(elementRef) {
        switch (elementRef) {
          case FILLED_ORDER_DROPDOWN_ELEMENTS.STATION:
          case FILLED_ORDER_DROPDOWN_ELEMENTS.DPT_STATION:
          case FILLED_ORDER_DROPDOWN_ELEMENTS.ARR_STATION:
            return this.getSectorStations.map((station) => {
              return {
                label: station.St_Title,
                value: station.St_Title,
              };
            }).sort();
          case FILLED_ORDER_DROPDOWN_ELEMENTS.STATION_TRACK:
            return this.getStationTracks(FILLED_ORDER_DROPDOWN_ELEMENTS.STATION).map((track) => {
              return {
                label: track.ST_Name,
                value: track.ST_Name,
              };
            });
          case FILLED_ORDER_DROPDOWN_ELEMENTS.DPT_STATION_TRACK:
            return this.getStationTracks(FILLED_ORDER_DROPDOWN_ELEMENTS.DPT_STATION).map((track) => {
              return {
                label: track.ST_Name,
                value: track.ST_Name,
              };
            });
          case FILLED_ORDER_DROPDOWN_ELEMENTS.ARR_STATION_TRACK:
            return this.getStationTracks(FILLED_ORDER_DROPDOWN_ELEMENTS.ARR_STATION).map((track) => {
              return {
                label: track.ST_Name,
                value: track.ST_Name,
              };
            });
          case FILLED_ORDER_DROPDOWN_ELEMENTS.BLOCK:
            return this.getSectorBlocks.map((block) => {
              return {
                label: block.Bl_Title,
                value: block.Bl_Title,
              };
            }).sort();
          case FILLED_ORDER_DROPDOWN_ELEMENTS.DPT_STATION_BLOCK:
            return this.getStationBlocks(FILLED_ORDER_DROPDOWN_ELEMENTS.DPT_STATION).map((block) => {
              return {
                label: block.Bl_Title,
                value: block.Bl_Title,
              };
            }).sort();
          default:
            return [];
        }
      },

      handleChangeElementValue(event) {
        this.$emit('input', event);
      },
    },
  };
</script>
