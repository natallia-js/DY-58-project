import {
  ORDER_TEXT_SOURCE,
  ORDER_PLACE_VALUES,
  FILLED_ORDER_DATETIME_ELEMENTS,
  FILLED_ORDER_DROPDOWN_ELEMENTS,
} from '@/constants/orders';
import {
  ORDER_PATTERN_TYPES,
  SPECIAL_CLOSE_BLOCK_ORDER_SIGN,
} from '@/constants/orderPatterns';


export const useSetAndAnalyzeOrderText = ({ state, store, relatedOrderObject /*, showConnectedOrderFields*/ }) => {

  const changeOrderPatternElementValue = (elRef, value) => {
    if (state.orderText && state.orderText.patternId && state.orderText.orderText) {
      const textElement = state.orderText.orderText.find((el) => el.ref === elRef);
      if (textElement && textElement.value !== value) {
        textElement.value = value;
      }
    }
  };

  /**
   * Позволяет установить в тексте шаблонного распоряжения номер выбранного для связи документа
   * (если в тексте есть специально предназначенный для этого элемент).
   */
  const setRelatedOrderNumberInOrderText = () => {
    if (relatedOrderObject.value && state.orderText.patternId) {
      const orderNumber = relatedOrderObject.value.number;
      switch (relatedOrderObject.value.type) {
        case ORDER_PATTERN_TYPES.ORDER:
          if (relatedOrderObject.value.specialTrainCategories &&
            relatedOrderObject.value.specialTrainCategories.includes(SPECIAL_CLOSE_BLOCK_ORDER_SIGN)) {
            changeOrderPatternElementValue(FILLED_ORDER_DROPDOWN_ELEMENTS.CLOSE_BLOCK_ORDER_NUMBER, orderNumber);
          } else {
            changeOrderPatternElementValue(FILLED_ORDER_DROPDOWN_ELEMENTS.ORDER_NUMBER, orderNumber);
          }
          break;
        case ORDER_PATTERN_TYPES.REQUEST:
          changeOrderPatternElementValue(FILLED_ORDER_DROPDOWN_ELEMENTS.REQUEST_NUMBER, orderNumber);
          break;
        case ORDER_PATTERN_TYPES.NOTIFICATION:
          changeOrderPatternElementValue(FILLED_ORDER_DROPDOWN_ELEMENTS.NOTIFICATION_NUMBER, orderNumber);
          break;
        case ORDER_PATTERN_TYPES.ECD_ORDER:
          changeOrderPatternElementValue(FILLED_ORDER_DROPDOWN_ELEMENTS.ECD_ORDER_NUMBER, orderNumber);
          break;
        case ORDER_PATTERN_TYPES.ECD_PROHIBITION:
          changeOrderPatternElementValue(FILLED_ORDER_DROPDOWN_ELEMENTS.ECD_PROHIBITION_NUMBER, orderNumber);
          break;
      }
    }
  };

  const addStationToSendOrder = (stationId) => {
    if (!state.dspSectorsToSendOrder.find((el) => el.type === ORDER_PLACE_VALUES.station && el.id === stationId)) {
      const stationToSendOrder = store.getters.getDSPShiftForSendingData.find((el) => el.type === ORDER_PLACE_VALUES.station && el.id === stationId);
      if (stationToSendOrder) {
        state.dspSectorsToSendOrder.push(stationToSendOrder);
      }
    }
  };

  /**
   * Позволяет зафиксировать изменения, производимые пользователм в тексте распоряжения.
   * Кроме того, для шаблонного распоряжения анализирует устанавливаемые в поля распоряжения значения.
   */
  const setOrderText = (event) => {
    state.orderText = event;

    if (!event || event.orderTextSource !== ORDER_TEXT_SOURCE.pattern || !event.orderText) {
      return;
    }
    // Если установлен флаг определения места действия распоряжения (отображения на ГИД),
    // то при изменении ряда полей в тексте шаблонного распоряжения их значения устанавливаются
    // в качестве места действия распоряжения
    if (state.showOnGID.value === true) {
      // Если в тексте распоряжения встречается поле 'Станция', 'Станция отправления' либо 'Станция прибытия',
      // то значение этого поля (первого встречающегося) устанавливается в качестве места действия
      // распоряжения
      let placeSet = false;
      const stationElement = event.orderText.find((el) =>
        [FILLED_ORDER_DROPDOWN_ELEMENTS.STATION,
         FILLED_ORDER_DROPDOWN_ELEMENTS.DPT_STATION,
         FILLED_ORDER_DROPDOWN_ELEMENTS.ARR_STATION].includes(el.ref));
      if (stationElement) {
        if (stationElement.value) {
          const stationId = store.getters.getSectorStationIdByTitle(stationElement.value);
          if (stationId) {
            state.orderPlace = { place: ORDER_PLACE_VALUES.station, value: stationId };
            placeSet = true;
            // Для отображения станции в списке "Кому" необходимо ее туда добавить, если ее там еще нет
            addStationToSendOrder(stationId);
          }
        } else {
          state.orderPlace = { place: ORDER_PLACE_VALUES.station, value: null };
        }
      }
      // Если в тексте распоряжения встречается поле 'Перегон' либо 'Перегон станции отправления',
      // то значение этого поля (первого встречающегося) устанавливается в качестве места действия
      // распоряжения. Но только при условии что ранее (см. выше) не было установлено место действия
      // при анализе поля станции!
      if (!placeSet) {
        const blockElement = event.orderText.find((el) =>
          [FILLED_ORDER_DROPDOWN_ELEMENTS.BLOCK,
           FILLED_ORDER_DROPDOWN_ELEMENTS.DPT_STATION_BLOCK].includes(el.ref));
        if (blockElement) {
          if (blockElement.value) {
            const blockId = store.getters.getSectorBlockIdByTitle(blockElement.value);
            if (blockId) {
              state.orderPlace = { place: ORDER_PLACE_VALUES.span, value: blockId };
              placeSet = true;
              // Для отображения перегона в списке "Кому" необходимо туда добавить обе его станции,
              // если их там еще нет
              const stationsIds = store.getters.getSectorBlockStationsIds(blockId);
              if (stationsIds) {
                addStationToSendOrder(stationsIds[0]);
                addStationToSendOrder(stationsIds[1]);
              }
            }
          } else {
            state.orderPlace = { place: ORDER_PLACE_VALUES.span, value: null };
          }
        }
      }
    }
    // Если установлен флаг определения времени действия распоряжения, то при изменении ряда полей
    // в тексте шаблонного распоряжения их значения устанавливаются в качестве времени действия распоряжения
    if (state.defineOrderTimeSpan.value === true) {
      // Если в тексте распоряжения встречается поле даты-времени 'Дата-время закрытия перегона',
      // то значение этого поля (первого встречающегося) устанавливается в качестве даты-времени
      // начала действия распоряжения
      let timeSet = false;
      const closeBlockDateTimeElement = event.orderText.find((el) =>
        el.ref === FILLED_ORDER_DATETIME_ELEMENTS.CLOSE_BLOCK_DATETIME);
      if (closeBlockDateTimeElement) {
        if (closeBlockDateTimeElement.value) {
          state.timeSpan = { start: closeBlockDateTimeElement.value, end: null, tillCancellation: true };
          timeSet = true;
        } else {
          state.timeSpan = { start: null, end: null, tillCancellation: false };
        }
      }
      // Если в тексте распоряжения встречается поле даты-времени 'Дата-время открытия перегона',
      // то значение этого поля (первого встречающегося) устанавливается в качестве даты-времени
      // начала и окончания действия распоряжения. Но только при условии что ранее (см. выше)
      // не было установлено время действия!
      if (!timeSet) {
        const openBlockDateTimeElement = event.orderText.find((el) =>
          el.ref === FILLED_ORDER_DATETIME_ELEMENTS.OPEN_BLOCK_DATETIME);
        if (openBlockDateTimeElement) {
          if (openBlockDateTimeElement.value) {
            state.timeSpan = {
              start: openBlockDateTimeElement.value,
              end: openBlockDateTimeElement.value,
              tillCancellation: false,
            };
          } else {
            state.timeSpan = { start: null, end: null, tillCancellation: false };
          }
        }
      }
    }

    // Пока нижеследующий кусок кода не использую из-за "накладности":
/*
    // Если на форме присутствуют элементы, предназначенные для указания связанного распоряжения (ранее
    // изданного), то при изменении ряда значений элементов шаблона распоряжения можно автоматически
    // выбрать связанное распоряжение
    if (showConnectedOrderFields.value) {
      const trySetRelatedOrder = (orderTextElement, orderType, specialRelatedOrderSign = null) => {
        if (orderTextElement) {
          if (orderTextElement.value) {
            const orderObject = store.getters.getActiveOrderByNumber(
              orderType, orderTextElement.value, specialRelatedOrderSign
            );
            state.prevRelatedOrder = orderObject ? { [orderObject._id]: true } : null;
          }
          // else здесь НЕТ, т.к. поле со связанным распоряжением видимо пользователю, он может вручную там
          // все поправить
        }
      };
      // Если в тексте распоряжения встречается поле 'Номер действующего распоряжения на закрытие перегона',
      // то значение этого поля (первого встречающегося) используется для определения связанного распоряжения
      let activeOrderNumberElement = event.orderText.find((el) =>
        el.ref === FILLED_ORDER_DROPDOWN_ELEMENTS.CLOSE_BLOCK_ORDER_NUMBER);
      trySetRelatedOrder(activeOrderNumberElement, ORDER_PATTERN_TYPES.ORDER, SPECIAL_CLOSE_BLOCK_ORDER_SIGN);

      // То же самое, только для поля 'Номер действующего распоряжения'
      activeOrderNumberElement = event.orderText.find((el) =>
        el.ref === FILLED_ORDER_DROPDOWN_ELEMENTS.ORDER_NUMBER);
      trySetRelatedOrder(activeOrderNumberElement, ORDER_PATTERN_TYPES.ORDER);

      // То же самое, только для поля 'Номер действующей заявки'
      activeOrderNumberElement = event.orderText.find((el) =>
        el.ref === FILLED_ORDER_DROPDOWN_ELEMENTS.REQUEST_NUMBER);
      trySetRelatedOrder(activeOrderNumberElement, ORDER_PATTERN_TYPES.REQUEST);

      // То же самое, только для поля 'Номер действующего уведомления'
      activeOrderNumberElement = event.orderText.find((el) =>
        el.ref === FILLED_ORDER_DROPDOWN_ELEMENTS.NOTIFICATION_NUMBER);
      trySetRelatedOrder(activeOrderNumberElement, ORDER_PATTERN_TYPES.NOTIFICATION);

      // То же самое, только для поля 'Номер действующего приказа ЭЦД'
      activeOrderNumberElement = event.orderText.find((el) =>
        el.ref === FILLED_ORDER_DROPDOWN_ELEMENTS.ECD_ORDER_NUMBER);
      trySetRelatedOrder(activeOrderNumberElement, ORDER_PATTERN_TYPES.ECD_ORDER);

      // То же самое, только для поля 'Номер действующего запрещения ЭЦД'
      activeOrderNumberElement = event.orderText.find((el) =>
        el.ref === FILLED_ORDER_DROPDOWN_ELEMENTS.ECD_PROHIBITION_NUMBER);
      trySetRelatedOrder(activeOrderNumberElement, ORDER_PATTERN_TYPES.ECD_PROHIBITION);
    }*/
  };

  return {
    setRelatedOrderNumberInOrderText,
    setOrderText,
  };
};
