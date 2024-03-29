<template>
  <div v-for="(array, index) of orderPatternArrays" :key="index" style="min-height:1.5rem">
    <template v-for="patternElement of array" :key="patternElement._id">
      <span
        v-if="patternElement.type === getOrderPatternElementTypes.TEXT"
        class="p-mr-2 p-mb-2"
        :style="{ display: 'inline' }"
      >
        <order-pattern-element-view
          :element="patternElement"
          :applyDefaultOrderPatternElementValues="applyDefaultOrderPatternElementValues"
        />
      </span>
      <div
        v-else
        class="p-mr-2 p-mb-2"
        :style="{
          display: [getOrderPatternElementTypes.TEXT_AREA, getOrderPatternElementTypes.DR_TRAIN_TABLE].includes(patternElement.type) ? 'block' : 'inline-block',
        }"
      >
      <!--
         width: [getOrderPatternElementTypes.TEXT_AREA, getOrderPatternElementTypes.DR_TRAIN_TABLE].includes(patternElement.type) ?
            '100%' : getElementSizesCorrespondence[patternElement.size],
            display: patternElement.type !== getOrderPatternElementTypes.TEXT_AREA ? 'inline-block': 'block',
      -->
        <order-pattern-element-view
          :element="patternElement"
          :dropdownValues="getElementDropdownValues(patternElement.type, patternElement.ref)"
          :selectMultipleValues="getElementMultipleSelectValues(patternElement.type, patternElement.ref)"
          @input="handleChangeElementValue"
          :applyDefaultOrderPatternElementValues="applyDefaultOrderPatternElementValues"
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
    STATION_PREFIX,
    BLOCK_PREFIX,
    FILLED_ORDER_INPUT_ELEMENTS,
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
      // тип документа
      orderType: String,
      // true - применять к элементам шаблона значения по умолчанию, false - не применять
      applyDefaultOrderPatternElementValues: Boolean,
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
        'getActiveOrderByNumber',
        'getActiveOrdersOfGivenType',
        'getCurrDNCSectorWorkPoligonUsers',
        'getCurrECDSectorWorkPoligonUsers',
        'getSelectedOkno',
        'isDNC',
        'isECD',
        'getOrderPatternElementRefMeanings',
        'getPossibleBaseActiveOrdersForNewOrder',
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
            case FILLED_ORDER_DROPDOWN_ELEMENTS.STATION_ACTION_PLACE:
            case FILLED_ORDER_DROPDOWN_ELEMENTS.DPT_STATION:
            case FILLED_ORDER_DROPDOWN_ELEMENTS.ARR_STATION:
              return this.getSectorStations.map((station) => ({
                label: station.St_Title,
                value: station.St_Title,
              })).sort();
            case FILLED_ORDER_DROPDOWN_ELEMENTS.STATION_TRACK:
              return this.getStationTracks([FILLED_ORDER_DROPDOWN_ELEMENTS.STATION, FILLED_ORDER_DROPDOWN_ELEMENTS.STATION_ACTION_PLACE])
                .map((track) => ({
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
            case FILLED_ORDER_DROPDOWN_ELEMENTS.BLOCK_ACTION_PLACE:
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
              return this.getBlockTracks([FILLED_ORDER_DROPDOWN_ELEMENTS.BLOCK, FILLED_ORDER_DROPDOWN_ELEMENTS.BLOCK_ACTION_PLACE])
                .map((track) => ({
                  label: track.BT_Name,
                  value: track.BT_Name,
                }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.DPT_STATION_BLOCK_TRACK:
              return this.getBlockTracks(FILLED_ORDER_DROPDOWN_ELEMENTS.DPT_STATION_BLOCK).map((track) => ({
                label: track.BT_Name,
                value: track.BT_Name,
              }));
            // Список действующих распоряжений ДНЦ; но нас интересуют не все действующие распоряжения, а только те, на основании
            // которых можно создать документ типа this.orderType
            case FILLED_ORDER_DROPDOWN_ELEMENTS.ORDER_NUMBER:
              return this.getPossibleBaseActiveOrdersForNewOrder(this.orderType, ORDER_PATTERN_TYPES.ORDER, null)
                .map((order) => ({
                  label: order.number,
                  value: order.number,
                }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.CLOSE_BLOCK_ORDER_NUMBER:
              return this.getPossibleBaseActiveOrdersForNewOrder(this.orderType, ORDER_PATTERN_TYPES.ORDER, SPECIAL_CLOSE_BLOCK_ORDER_SIGN)
                .map((order) => ({
                  label: order.number,
                  value: order.number,
                }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.REQUEST_NUMBER:
              return this.getPossibleBaseActiveOrdersForNewOrder(this.orderType, ORDER_PATTERN_TYPES.REQUEST)
                .map((order) => ({
                  label: order.number,
                  value: order.number,
                }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.NOTIFICATION_NUMBER:
              return this.getPossibleBaseActiveOrdersForNewOrder(this.orderType, ORDER_PATTERN_TYPES.NOTIFICATION)
                .map((order) => ({
                  label: order.number,
                  value: order.number,
                }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.ECD_ORDER_NUMBER:
              return this.getPossibleBaseActiveOrdersForNewOrder(this.orderType, ORDER_PATTERN_TYPES.ECD_ORDER)
                .map((order) => ({
                  label: order.number,
                  value: order.number,
                }));
            case FILLED_ORDER_DROPDOWN_ELEMENTS.ECD_PROHIBITION_NUMBER:
              return this.getPossibleBaseActiveOrdersForNewOrder(this.orderType, ORDER_PATTERN_TYPES.ECD_PROHIBITION)
                .map((order) => ({
                  label: order.number,
                  value: order.number,
                }));
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
              return this.getOrderPatternElementRefMeanings({ elementType, elementRef }).map((item) => ({ label: item, value: item }));
          }
        };
      },

      getElementMultipleSelectValues() {
        return (elementType, elementRef) => {
          if (elementType !== OrderPatternElementType.MULTIPLE_SELECT) {
            return null;
          }
          // В списках множественного выбора приказов и запрещений ЭЦД хотят видеть не просто номера приказов/запрещений, а строки в формате
          // "<Номер приказа/запрещения> (<список ДСП станций, которым приказ/запрещение было адресовано>; <путь из текста приказа/запрещения>)";
          // при этом в текст сформированного документа должен попасть из этой строки только номер приказа/запрещения
          const getMultipleSelectValuesForECDOrdersAndProhibitions = (orderType) => {
            return this.getActiveOrdersOfGivenType(orderType)
              .map((order) => {
                // формируем строку адресатов приказа/запрещения из числа ДСП
                const stationAddressesInfo = (order.dspToSend || []).map((addresse) => `${addresse.post} ${addresse.placeTitle}`).join(', ');
                // определяем номер пути в тексте приказа/запрещения
                const isTrackElement = (element) =>
                  element?.type === OrderPatternElementType.INPUT &&
                  [FILLED_ORDER_INPUT_ELEMENTS.TRACK].includes(element?.ref);
                const orderTrackFromText = order.orderText?.orderText?.find((el) => isTrackElement(el))?.value;
                // формируем строку с дополнительной информацией, которую необходимо показать пользователю в выпадающем списке
                let additionalInfo = (!orderTrackFromText && stationAddressesInfo === '')
                  ? ''
                  : (orderTrackFromText && stationAddressesInfo !== '')
                    ? ` (${stationAddressesInfo}; путь ${orderTrackFromText})`
                    : orderTrackFromText
                      ? ` (путь ${orderTrackFromText})`
                      : ` (${stationAddressesInfo})`;
                return {
                  label: '№' + order.number + additionalInfo,
                  value: '№' + order.number,
                };
              });
          };
          switch (elementRef) {
            case FILLED_ORDER_SELECT_MULTIPLE_ELEMENTS.STATION:
              return this.getSectorStations.map((station) => ({
                label: STATION_PREFIX + station.St_Title,
                value: STATION_PREFIX + station.St_Title,
              })).sort();
            case FILLED_ORDER_SELECT_MULTIPLE_ELEMENTS.BLOCK:
              return this.getSectorBlocks.map((block) => ({
                label: BLOCK_PREFIX + block.Bl_Title,
                value: BLOCK_PREFIX + block.Bl_Title,
              })).sort();
            // Список действующих приказов ЭЦД; но нас интересуют не все действующие приказы, а только те, на основании
            // которых можно создать документ типа this.orderType
            case FILLED_ORDER_SELECT_MULTIPLE_ELEMENTS.ECD_ACTIVE_ORDER:
              return this.getPossibleBaseActiveOrdersForNewOrder(this.orderType, ORDER_PATTERN_TYPES.ECD_ORDER, null)
                .map((order) => ({
                  label: order.number,
                  value: order.number,
                }));
            // Список действующих запрещений ЭЦД; но нас интересуют не все действующие запрещения, а только те, на основании
            // которых можно создать документ типа this.orderType
            case FILLED_ORDER_SELECT_MULTIPLE_ELEMENTS.ECD_ACTIVE_PROHIBITION:
              return this.getPossibleBaseActiveOrdersForNewOrder(this.orderType, ORDER_PATTERN_TYPES.ECD_PROHIBITION, null)
                .map((order) => ({
                  label: order.number,
                  value: order.number,
                }));
            // Список абсолютно всех действующих приказов ЭЦД
            case FILLED_ORDER_SELECT_MULTIPLE_ELEMENTS.ALL_ECD_ACTIVE_ORDERS:
              return getMultipleSelectValuesForECDOrdersAndProhibitions(ORDER_PATTERN_TYPES.ECD_ORDER);
            // Список абсолютно всех действующих запрещений ЭЦД
            case FILLED_ORDER_SELECT_MULTIPLE_ELEMENTS.ALL_ECD_ACTIVE_PROHIBITIONS:
              return getMultipleSelectValuesForECDOrdersAndProhibitions(ORDER_PATTERN_TYPES.ECD_PROHIBITION);
            default:
              return this.getOrderPatternElementRefMeanings({ elementType, elementRef })
                .map((item) => ({ label: item, value: item }));
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

      getStationTracks(stationElementRefs) {
        const patternStationElement = this.value.find((el) => stationElementRefs.includes(el.ref));
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

      getBlockTracks(blockElementRefs) {
        const patternBlockElement = this.value.find((el) => blockElementRefs.includes(el.ref));
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
            rewriteOtherToSend: false,
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
