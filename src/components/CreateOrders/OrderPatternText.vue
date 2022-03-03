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
  import { mapGetters } from 'vuex';
  import OrderPatternElementView from '@/components/OrderPatterns/OrderPatternElementView';
  import {
    ORDER_PATTERN_TYPES,
    OrderPatternElementType,
    ElementSizesCorrespondence,
  } from '@/constants/orderPatterns';
  import {
    CurrShiftGetOrderStatus,
    FILLED_ORDER_DATE_ELEMENTS,
    FILLED_ORDER_DATETIME_ELEMENTS,
    FILLED_ORDER_DROPDOWN_ELEMENTS,
  } from '@/constants/orders';
  import {
    SET_GET_ORDER_STATUS_TO_ALL_DSP,
    SET_GET_ORDER_STATUS_TO_DEFINIT_DSP,
  } from '@/store/mutation-types';

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
        'getSectorBlockByTitle',
        'getActiveOrdersOfGivenType',
        'getActiveOrderByNumber',
      ]),

      getOrderPatternElementTypes() {
        return OrderPatternElementType;
      },

      getElementSizesCorrespondence() {
        return ElementSizesCorrespondence;
      },
    },

    mounted() { console.log('mounted',this.value)
      this.analyzeNewOrderPattern(this.value);
    },

    watch: {
      value: {
        handler(newVal) {console.log(newVal)
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
            return stationObject.TStationTracks || [];
          }
        }
        return [];
      },

      getStationBlocks(stationElementRef) {
        const patternStationElement = this.value.find((el) => el.ref === stationElementRef);
        if (patternStationElement) {
          const blocks = this.getSectorBlocksByStationTitle(patternStationElement.value);
          return blocks || [];
        }
        return [];
      },

      getBlockTracks(blockElementRef) {
        const patternBlockElement = this.value.find((el) => el.ref === blockElementRef);
        if (patternBlockElement) {
          const blockObject = this.getSectorBlockByTitle(patternBlockElement.value);
          if (blockObject) {
            return blockObject.TBlockTracks || [];
          }
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
          case FILLED_ORDER_DROPDOWN_ELEMENTS.BLOCK_TRACK:
            return this.getBlockTracks(FILLED_ORDER_DROPDOWN_ELEMENTS.BLOCK).map((track) => {
              return {
                label: track.BT_Name,
                value: track.BT_Name,
              };
            });
          case FILLED_ORDER_DROPDOWN_ELEMENTS.DPT_STATION_BLOCK_TRACK:
            return this.getBlockTracks(FILLED_ORDER_DROPDOWN_ELEMENTS.DPT_STATION_BLOCK).map((track) => {
              return {
                label: track.BT_Name,
                value: track.BT_Name,
              };
            });
          case FILLED_ORDER_DROPDOWN_ELEMENTS.ORDER_NUMBER:
            return this.getActiveOrdersOfGivenType(ORDER_PATTERN_TYPES.ORDER).map((order) => {
              return {
                label: order.number,
                value: order.number,
              };
            });
          case FILLED_ORDER_DROPDOWN_ELEMENTS.REQUEST_NUMBER:
            return this.getActiveOrdersOfGivenType(ORDER_PATTERN_TYPES.REQUEST).map((order) => {
              return {
                label: order.number,
                value: order.number,
              };
            });
          case FILLED_ORDER_DROPDOWN_ELEMENTS.NOTIFICATION_NUMBER:
            return this.getActiveOrdersOfGivenType(ORDER_PATTERN_TYPES.NOTIFICATION).map((order) => {
              return {
                label: order.number,
                value: order.number,
              };
            });
          case FILLED_ORDER_DROPDOWN_ELEMENTS.ECD_ORDER_NUMBER:
             return this.getActiveOrdersOfGivenType(ORDER_PATTERN_TYPES.ECD_ORDER).map((order) => {
              return {
                label: order.number,
                value: order.number,
              };
            });
          case FILLED_ORDER_DROPDOWN_ELEMENTS.ECD_PROHIBITION_NUMBER:
             return this.getActiveOrdersOfGivenType(ORDER_PATTERN_TYPES.ECD_PROHIBITION).map((order) => {
              return {
                label: order.number,
                value: order.number,
              };
            });
          default:
            return [];
        }
      },

      handleChangeElementValue(event) {
        this.$emit('input', event);

        let elementToChangeValue;
        let tmp;
        switch (event.elementType) {
          // Изменилось значение в выпадающем списке
          case OrderPatternElementType.SELECT:
            switch (event.elementRef) {
              // Изменился номер действующего распоряжения
              case FILLED_ORDER_DROPDOWN_ELEMENTS.ORDER_NUMBER:
                // Ищем в шаблоне поле с датой (либо датой-временем) издания действующего распоряжения
                elementToChangeValue = this.value.find((el) =>
                  (el.type === OrderPatternElementType.DATE && el.ref === FILLED_ORDER_DATE_ELEMENTS.ORDER_DATE) ||
                  (el.type === OrderPatternElementType.DATETIME && el.ref === FILLED_ORDER_DATETIME_ELEMENTS.ORDER_DATETIME));
                // Если элемент с датой (либо датой-временем) издания присутствует, то необходимо изменить его значение
                if (elementToChangeValue) {
                  tmp = this.getActiveOrderByNumber(ORDER_PATTERN_TYPES.ORDER, event.value);
                  if (tmp) {
                    elementToChangeValue.value = tmp.createDateTime;
                  }
                }
                break;
              // Изменился номер действующей заявки
              case FILLED_ORDER_DROPDOWN_ELEMENTS.REQUEST_NUMBER:
                // Ищем в шаблоне поле с датой (либо датой-временем) издания действующей заявки
                elementToChangeValue = this.value.find((el) =>
                  (el.type === OrderPatternElementType.DATE && el.ref === FILLED_ORDER_DATE_ELEMENTS.REQUEST_DATE) ||
                  (el.type === OrderPatternElementType.DATETIME && el.ref === FILLED_ORDER_DATETIME_ELEMENTS.REQUEST_DATETIME));
                // Если элемент с датой (либо датой-временем) издания присутствует, то необходимо изменить его значение
                if (elementToChangeValue) {
                  tmp = this.getActiveOrderByNumber(ORDER_PATTERN_TYPES.REQUEST, event.value);
                  if (tmp) {
                    elementToChangeValue.value = tmp.createDateTime;
                  }
                }
                break;
              // Изменился номер действующего уведомления
              case FILLED_ORDER_DROPDOWN_ELEMENTS.NOTIFICATION_NUMBER:
                // Ищем в шаблоне поле с датой (либо датой-временем) издания действующего уведомления
                elementToChangeValue = this.value.find((el) =>
                  (el.type === OrderPatternElementType.DATE && el.ref === FILLED_ORDER_DATE_ELEMENTS.NOTIFICATION_DATE) ||
                  (el.type === OrderPatternElementType.DATETIME && el.ref === FILLED_ORDER_DATETIME_ELEMENTS.NOTIFICATION_DATETIME));
                // Если элемент с датой (либо датой-временем) издания присутствует, то необходимо изменить его значение
                if (elementToChangeValue) {
                  tmp = this.getActiveOrderByNumber(ORDER_PATTERN_TYPES.NOTIFICATION, event.value);
                  if (tmp) {
                    elementToChangeValue.value = tmp.createDateTime;
                  }
                }
                break;
              // Изменился номер действующего приказа ЭЦД
              case FILLED_ORDER_DROPDOWN_ELEMENTS.ECD_ORDER_NUMBER:
                // Ищем в шаблоне поле с датой (либо датой-временем) издания действующего приказа ЭЦД
                elementToChangeValue = this.value.find((el) =>
                  (el.type === OrderPatternElementType.DATE && el.ref === FILLED_ORDER_DATE_ELEMENTS.ECD_ORDER_DATE) ||
                  (el.type === OrderPatternElementType.DATETIME && el.ref === FILLED_ORDER_DATETIME_ELEMENTS.ECD_ORDER_DATETIME));
                // Если элемент с датой (либо датой-временем) издания присутствует, то необходимо изменить его значение
                if (elementToChangeValue) {
                  tmp = this.getActiveOrderByNumber(ORDER_PATTERN_TYPES.ECD_ORDER, event.value);
                  if (tmp) {
                    elementToChangeValue.value = tmp.createDateTime;
                  }
                }
                break;
              // Изменился номер действующего запрещения ЭЦД
              case FILLED_ORDER_DROPDOWN_ELEMENTS.ECD_ORDER_PROHIBITION:
                // Ищем в шаблоне поле с датой (либо датой-временем) издания действующего запрещения ЭЦД
                elementToChangeValue = this.value.find((el) =>
                  (el.type === OrderPatternElementType.DATE && el.ref === FILLED_ORDER_DATE_ELEMENTS.ECD_PROHIBITION_DATE) ||
                  (el.type === OrderPatternElementType.DATETIME && el.ref === FILLED_ORDER_DATETIME_ELEMENTS.ECD_PROHIBITION_DATETIME));
                // Если элемент с датой (либо датой-временем) издания присутствует, то необходимо изменить его значение
                if (elementToChangeValue) {
                  tmp = this.getActiveOrderByNumber(ORDER_PATTERN_TYPES.ECD_PROHIBITION, event.value);
                  if (tmp) {
                    elementToChangeValue.value = tmp.createDateTime;
                  }
                }
                break;
            }
            break;
          case OrderPatternElementType.DR_TRAIN_TABLE:
            // Вначале все записи "чистим" (т.е. отменяем передачу всем, кто до этого был назначен)
            this.$store.commit(SET_GET_ORDER_STATUS_TO_ALL_DSP,
              { getOrderStatus: CurrShiftGetOrderStatus.doNotSend });
            // Затем, при необходимости, назначаем получение оригинала распоряжения тем станциям,
            // которые присутствуют в таблице поезда, идущего ДР
            if (event.value && event.value.length) {
              event.value.forEach((item) => {
                if (item.stationId) {
                  this.$store.commit(SET_GET_ORDER_STATUS_TO_DEFINIT_DSP,
                    { stationId: item.stationId, getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
                }
              });
            }
            break;
        }
      },
    },
  };
</script>
