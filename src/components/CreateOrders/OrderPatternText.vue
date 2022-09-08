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
          width: [getOrderPatternElementTypes.TEXT_AREA, getOrderPatternElementTypes.DR_TRAIN_TABLE].includes(patternElement.type) ?
            '100%' : getElementSizesCorrespondence[patternElement.size],
          display: patternElement.type !== getOrderPatternElementTypes.TEXT_AREA ? 'inline-block': 'block',
        }"
      >
        <order-pattern-element-view
          :element="patternElement"
          :dropdownValues="getElementDropdownValues(patternElement.type, patternElement.ref)"
          :selectMultipleValues="getElementMultipleSelectValues(patternElement.type, patternElement.ref)"
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
    SPECIAL_CLOSE_BLOCK_ORDER_SIGN,
    OrderPatternElementType,
    ElementSizesCorrespondence,
  } from '@/constants/orderPatterns';
  import {
    CurrShiftGetOrderStatus,
    FILLED_ORDER_DATE_ELEMENTS,
    FILLED_ORDER_DATETIME_ELEMENTS,
    FILLED_ORDER_DROPDOWN_ELEMENTS,
    FILLED_ORDER_SELECT_MULTIPLE_ELEMENTS,
    SWITCH_OFF_ON_ITEMS,
    MOVEMENT_DIRECTION_ITEMS,
    AUXILIARY_MODE_KIND_ITEMS,
    ARRIVE_RETURN_ITEMS,
    MOVEMENT_SYSTEM_ITEMS,
    EXACT_PLACE_ITEMS,
    ACTIONS_ORDER_ITEMS,
    WORK_CATEGORIES_ITEMS,
    WHAT_SHOULD_BE_DONE_FOR_WORK_ITEMS,
    WORK_IF_THERE_ARE_ITEMS,
    WORKS_OBJECT_ITEMS,
    WORK_DONE_FROM_ITEMS,
    OBJECT_ITEMS,
    TRACK_ITEMS,
    NARYAD_DOPUSK_ITEMS,
    TRAINS_ITEMS,
    TRACK_SECTION_BEFORE_ITEMS,
    TRACK_KIND_ITEMS,
    CONNECTION_KIND_ITEMS,
    ACTIONS_ITEMS,
    ACTIONS_NOTIFICATIONS_ITEMS,
    ACTIONS_ORDER_NOTIFICATION_ITEMS,
    ISSUED_DSP_BAN_ITEMS,
    WORKS_OBJECT_NOTIFICATION_ITEMS,
    SPEED_ITEMS,
  } from '@/constants/orders';
  import {
    SET_GET_ORDER_STATUS_TO_ALL_DSP,
    SET_GET_ORDER_STATUS_TO_DEFINIT_DSP,
  } from '@/store/mutation-types';
  import { APPLY_PERSONAL_FOR_SENDING_DATA_ACTION } from '@/store/action-types';

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
        'getCurrDNCSectorWorkPoligonUsers',
        'getCurrECDSectorWorkPoligonUsers',
        'getSelectedOkno',
        'isDNC',
        'isECD',
      ]),

      getOrderPatternElementTypes() {
        return OrderPatternElementType;
      },

      getElementSizesCorrespondence() {
        return ElementSizesCorrespondence;
      },

      getElementDropdownValues() {
        return (elementType, elementRef) => {
          if (elementType !== OrderPatternElementType.SELECT) {
            return null;
          }
          switch (elementRef) {
            case FILLED_ORDER_DROPDOWN_ELEMENTS.STATION:
            case FILLED_ORDER_DROPDOWN_ELEMENTS.DPT_STATION:
            case FILLED_ORDER_DROPDOWN_ELEMENTS.ARR_STATION:
              return this.getSectorStations.map((station) => ({
                label: station.St_Title,
                value: station.St_Title,
              })).sort();
            case FILLED_ORDER_DROPDOWN_ELEMENTS.STATION_TRACK:
              return this.getStationTracks(FILLED_ORDER_DROPDOWN_ELEMENTS.STATION).map((track) => ({
                label: track.ST_Name,
                value: track.ST_Name,
              }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.DPT_STATION_TRACK:
              return this.getStationTracks(FILLED_ORDER_DROPDOWN_ELEMENTS.DPT_STATION).map((track) => ({
                label: track.ST_Name,
                value: track.ST_Name,
              }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.ARR_STATION_TRACK:
              return this.getStationTracks(FILLED_ORDER_DROPDOWN_ELEMENTS.ARR_STATION).map((track) => ({
                label: track.ST_Name,
                value: track.ST_Name,
              }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.BLOCK:
              return this.getSectorBlocks.map((block) => ({
                label: block.Bl_Title,
                value: block.Bl_Title,
              })).sort();
            case FILLED_ORDER_DROPDOWN_ELEMENTS.DPT_STATION_BLOCK:
              return this.getStationBlocks(FILLED_ORDER_DROPDOWN_ELEMENTS.DPT_STATION).map((block) => ({
                label: block.Bl_Title,
                value: block.Bl_Title,
              })).sort();
            case FILLED_ORDER_DROPDOWN_ELEMENTS.BLOCK_TRACK:
              return this.getBlockTracks(FILLED_ORDER_DROPDOWN_ELEMENTS.BLOCK).map((track) => ({
                label: track.BT_Name,
                value: track.BT_Name,
              }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.DPT_STATION_BLOCK_TRACK:
              return this.getBlockTracks(FILLED_ORDER_DROPDOWN_ELEMENTS.DPT_STATION_BLOCK).map((track) => ({
                label: track.BT_Name,
                value: track.BT_Name,
              }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.ORDER_NUMBER:
              return this.getActiveOrdersOfGivenType(ORDER_PATTERN_TYPES.ORDER).map((order) => ({
                label: order.number,
                value: order.number,
              }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.CLOSE_BLOCK_ORDER_NUMBER:
              return this.getActiveOrdersOfGivenType(ORDER_PATTERN_TYPES.ORDER, SPECIAL_CLOSE_BLOCK_ORDER_SIGN).map((order) => ({
                label: order.number,
                value: order.number,
              }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.REQUEST_NUMBER:
              return this.getActiveOrdersOfGivenType(ORDER_PATTERN_TYPES.REQUEST).map((order) => ({
                label: order.number,
                value: order.number,
              }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.NOTIFICATION_NUMBER:
              return this.getActiveOrdersOfGivenType(ORDER_PATTERN_TYPES.NOTIFICATION).map((order) => ({
                label: order.number,
                value: order.number,
              }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.ECD_ORDER_NUMBER:
              return this.getActiveOrdersOfGivenType(ORDER_PATTERN_TYPES.ECD_ORDER).map((order) => ({
                label: order.number,
                value: order.number,
              }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.ECD_PROHIBITION_NUMBER:
              return this.getActiveOrdersOfGivenType(ORDER_PATTERN_TYPES.ECD_PROHIBITION).map((order) => ({
                label: order.number,
                value: order.number,
              }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.SWITCH_OFF_ON:
              return SWITCH_OFF_ON_ITEMS.map((item) => ({ label: item, value: item }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.EXACT_PLACE:
              return EXACT_PLACE_ITEMS.map((item) => ({ label: item, value: item }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.ACTIONS_ORDER:
              return ACTIONS_ORDER_ITEMS.map((item) => ({ label: item, value: item }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.WORK_CATEGORIES:
              return WORK_CATEGORIES_ITEMS.map((item) => ({ label: item, value: item }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.WHAT_SHOULD_BE_DONE_FOR_WORK:
              return WHAT_SHOULD_BE_DONE_FOR_WORK_ITEMS.map((item) => ({ label: item, value: item }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.WORK_IF_THERE_ARE:
              return WORK_IF_THERE_ARE_ITEMS.map((item) => ({ label: item, value: item }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.NARYAD_DOPUSK:
              return NARYAD_DOPUSK_ITEMS.map((item) => ({ label: item, value: item }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.ARRIVE_RETURN:
              return ARRIVE_RETURN_ITEMS.map((item) => ({ label: item, value: item }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.AUXILIARY_MODE_KIND:
              return AUXILIARY_MODE_KIND_ITEMS.map((item) => ({ label: item, value: item }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.MOVEMENT_DIRECTION:
              return MOVEMENT_DIRECTION_ITEMS.map((item) => ({ label: item, value: item }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.MOVEMENT_SYSTEM:
              return MOVEMENT_SYSTEM_ITEMS.map((item) => ({ label: item, value: item }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.TRAINS:
              return TRAINS_ITEMS.map((item) => ({ label: item, value: item }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.TRACK_SECTION_BEFORE:
              return TRACK_SECTION_BEFORE_ITEMS.map((item) => ({ label: item, value: item }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.TRACK_KIND:
              return TRACK_KIND_ITEMS.map((item) => ({ label: item, value: item }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.CONNECTION_KIND:
              return CONNECTION_KIND_ITEMS.map((item) => ({ label: item, value: item }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.ACTIONS:
              return ACTIONS_ITEMS.map((item) => ({ label: item, value: item }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.ACTIONS_NOTIFICATIONS:
              return ACTIONS_NOTIFICATIONS_ITEMS.map((item) => ({ label: item, value: item }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.ACTIONS_ORDER_NOTIFICATION:
              return ACTIONS_ORDER_NOTIFICATION_ITEMS.map((item) => ({ label: item, value: item }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.ISSUED_DSP_BAN:
              return ISSUED_DSP_BAN_ITEMS.map((item) => ({ label: item, value: item }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.PASS_DUTY:
            case FILLED_ORDER_DROPDOWN_ELEMENTS.TAKE_DUTY:
              if (this.isDNC)
                return this.getCurrDNCSectorWorkPoligonUsers.map((item) => ({
                  label: item.postFIO,
                  value: item.postFIO,
                }));
              if (this.isECD)
                return this.getCurrECDSectorWorkPoligonUsers.map((item) => ({
                  label: item.postFIO,
                  value: item.postFIO,
                }));
              return [];
            case FILLED_ORDER_DROPDOWN_ELEMENTS.SPEED:
              return SPEED_ITEMS.map((item) => ({ label: item, value: item }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.WORKS_HEADS:
              return !this.getSelectedOkno
                ? null
                : [...new Set(
                    (this.getSelectedOkno.mainPerf
                      ? this.getSelectedOkno.mainPerf.map((p) => `${p.post} ${p.fio}`)
                      : []
                    ).concat(!this.getSelectedOkno.dopPerf
                      ? []
                      : this.getSelectedOkno.dopPerf.map((p) => `${p.post} ${p.fio}`)
                    )
                  )].map((personString) => ({ label: personString, value: personString }));
            default:
              return [];
          }
        };
      },

      getElementMultipleSelectValues() {
        return (elementType, elementRef) => {
          if (elementType !== OrderPatternElementType.MULTIPLE_SELECT) {
            return null;
          }
          switch (elementRef) {
            case FILLED_ORDER_SELECT_MULTIPLE_ELEMENTS.STATION:
              return this.getSectorStations.map((station) => ({
                label: station.St_Title,
                value: station.St_Title,
              })).sort();
            case FILLED_ORDER_SELECT_MULTIPLE_ELEMENTS.BLOCK:
              return this.getSectorBlocks.map((block) => ({
                label: block.Bl_Title,
                value: block.Bl_Title,
              })).sort();
            case FILLED_ORDER_SELECT_MULTIPLE_ELEMENTS.WORKS_OBJECT:
              return WORKS_OBJECT_ITEMS.map((item) => ({ label: item, value: item }));
            case FILLED_ORDER_SELECT_MULTIPLE_ELEMENTS.WORK_DONE_FROM:
              return WORK_DONE_FROM_ITEMS.map((item) => ({ label: item, value: item }));
            case FILLED_ORDER_SELECT_MULTIPLE_ELEMENTS.TRACK:
              return TRACK_ITEMS.map((item) => ({ label: item, value: item }));
            case FILLED_ORDER_SELECT_MULTIPLE_ELEMENTS.OBJECT:
              return OBJECT_ITEMS.map((item) => ({ label: item, value: item }));
            case FILLED_ORDER_SELECT_MULTIPLE_ELEMENTS.WORKS_OBJECT_NOTIFICATION:
              return WORKS_OBJECT_NOTIFICATION_ITEMS.map((item) => ({ label: item, value: item }));
            default:
              return [];
          }
        };
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
          if (arrayPart.length || index !== linebreakElementsIndexes.length - 1) {
            orderPatternToDraw.push(arrayPart);
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

      handleChangeElementValue(event) {
        this.$emit('input', event);

        let elementToChangeValue;
        let tmp;

        const applyPersonalForSendingData = (tmp) => {
          this.$store.dispatch(APPLY_PERSONAL_FOR_SENDING_DATA_ACTION, {
            dspToSend: tmp.dspToSend,
            dncToSend: tmp.dncToSend,
            ecdToSend: tmp.ecdToSend,
            otherToSend: tmp.otherToSend,
          });
        };

        switch (event.elementType) {
          // Изменилось значение в поле даты-времени
          case OrderPatternElementType.DATETIME:
            switch (event.elementRef) {
              // Изменилась дата-время сдачи дежурства ДНЦ
              case FILLED_ORDER_DATETIME_ELEMENTS.PASS_DUTY_DATETIME:
                // Такую же дату-время устанавливаем в поле даты-времени принятия дежурства ДНЦ (если оно есть)
                elementToChangeValue = this.value.find((el) =>
                  (el.type === OrderPatternElementType.DATETIME && el.ref === FILLED_ORDER_DATETIME_ELEMENTS.TAKE_DUTY_DATETIME));
                if (elementToChangeValue) {
                  elementToChangeValue.value = event.value;
                }
                break;
            }
            break;
          // Изменилось значение в выпадающем списке
          case OrderPatternElementType.SELECT:
            switch (event.elementRef) {
              // Изменился номер действующего распоряжения
              case FILLED_ORDER_DROPDOWN_ELEMENTS.ORDER_NUMBER:
              case FILLED_ORDER_DROPDOWN_ELEMENTS.CLOSE_BLOCK_ORDER_NUMBER:
                // Ищем в шаблоне поле с датой (датой-временем) издания действующего распоряжения
                elementToChangeValue = this.value.find((el) =>
                  (el.type === OrderPatternElementType.DATE && el.ref === FILLED_ORDER_DATE_ELEMENTS.ORDER_DATE) ||
                  (el.type === OrderPatternElementType.DATETIME && el.ref === FILLED_ORDER_DATETIME_ELEMENTS.ORDER_DATETIME));
                // Если элемент с датой (либо датой-временем) издания присутствует, то необходимо изменить его значение
                if (elementToChangeValue) {
                  tmp = this.getActiveOrderByNumber(
                    ORDER_PATTERN_TYPES.ORDER,
                    event.value,
                    event.elementRef === FILLED_ORDER_DROPDOWN_ELEMENTS.CLOSE_BLOCK_ORDER_NUMBER ? SPECIAL_CLOSE_BLOCK_ORDER_SIGN : null
                  );
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
                // Из выбранного приказа ЭЦД извлекаем всех его получателей и устанавливаем в
                // качестве получателей создаваемого документа
                tmp = this.getActiveOrderByNumber(ORDER_PATTERN_TYPES.ECD_ORDER, event.value);
                if (tmp) {
                  applyPersonalForSendingData(tmp);
                  // Ищем в текущем шаблоне документа (создаваемого) поле с датой (либо датой-временем)
                  // издания действующего приказа ЭЦД
                  elementToChangeValue = this.value.find((el) =>
                    (el.type === OrderPatternElementType.DATE && el.ref === FILLED_ORDER_DATE_ELEMENTS.ECD_ORDER_DATE) ||
                    (el.type === OrderPatternElementType.DATETIME && el.ref === FILLED_ORDER_DATETIME_ELEMENTS.ECD_ORDER_DATETIME));
                  // Если элемент с датой (либо датой-временем) издания присутствует, то необходимо изменить его значение
                  if (elementToChangeValue) {
                    elementToChangeValue.value = tmp.createDateTime;
                  }
                }
                break;
              // Изменился номер действующего запрещения ЭЦД
              case FILLED_ORDER_DROPDOWN_ELEMENTS.ECD_PROHIBITION_NUMBER:
                // Из выбранного запрещения ЭЦД извлекаем всех его получателей и устанавливаем в
                // качестве получателей создаваемого документа
                tmp = this.getActiveOrderByNumber(ORDER_PATTERN_TYPES.ECD_PROHIBITION, event.value);
                if (tmp) {
                  applyPersonalForSendingData(tmp);
                  // Ищем в текущем шаблоне документа (создаваемого) поле с датой (либо датой-временем)
                  // издания действующего запрещения ЭЦД
                  elementToChangeValue = this.value.find((el) =>
                    (el.type === OrderPatternElementType.DATE && el.ref === FILLED_ORDER_DATE_ELEMENTS.ECD_PROHIBITION_DATE) ||
                    (el.type === OrderPatternElementType.DATETIME && el.ref === FILLED_ORDER_DATETIME_ELEMENTS.ECD_PROHIBITION_DATETIME));
                  // Если элемент с датой (либо датой-временем) издания присутствует, то необходимо изменить его значение
                  if (elementToChangeValue) {
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
