import {
  ORDER_TEXT_SOURCE,
  ORDER_PLACE_VALUES,
  FILLED_ORDER_DATETIME_ELEMENTS,
  FILLED_ORDER_DROPDOWN_ELEMENTS,
  FILLED_ORDER_INPUT_ELEMENTS,
  CurrShiftGetOrderStatus,
} from '@/constants/orders';
import {
  ORDER_PATTERN_TYPES,
  SPECIAL_CLOSE_BLOCK_ORDER_SIGN,
  OrderPatternElementType,
} from '@/constants/orderPatterns';
import {
  SET_GET_ORDER_STATUS_TO_DEFINIT_DSP,
  SET_GET_ORDER_STATUS_TO_ALL_DSP,
} from '@/store/mutation-types';


export const useSetAndAnalyzeOrderText = (inputVals) => {
  const { state, props, store, relatedOrderObject /*, showConnectedOrderFields*/, selectedOkno } = inputVals;

  /**
   * Находит все элементы текущего шаблона распоряжения с типом elType, смысловым значением elRef,
   * и устанавливает им значение value.
   */
  const changeOrderPatternElementValue = (elType, elRef, value) => {
    if (state.orderText && state.orderText.patternId && state.orderText.orderText) {
      const textElements = state.orderText.orderText.filter((el) => el.type === elType && el.ref === elRef);
      textElements.forEach((el) => {
        if (el.value !== value) {
          el.value = value;
        }
      });
    }
  };

  /**
   * Возвращает значение первого элемента шаблонного распоряжения, тип и смысловое значение которого лежат в
   * списке elTypesRefs (массив двумерных массивов). Если ничего не найдет, то возвратит null.
   * Если firstFilledElement = true, то ищется значение первого заполненного (непустого) элемента шаблона.
   */
  const getOrderPatternElementValue = ({ elTypesRefs, firstFilledElement = true }) => {
    if (!state.orderText || !state.orderText.orderText || !state.orderText.patternId || !elTypesRefs || !elTypesRefs.length)
      return null;
    const typesRefsIncludes = (type, ref) =>
      elTypesRefs.find((el) => el && el.length === 2 && el[0] === type && el[1] === ref) ? true : false;
    const valueExists = (value) => {
      switch (typeof value) {
        case 'object':
          if (Array.isArray(value))
            return value.length ? true : false;
          return Boolean(value);
        default:
          return Boolean(value);
      }
    };
    const considerValueFill = (value) => !firstFilledElement || (firstFilledElement && valueExists(value));
    const orderTextElement = state.orderText.orderText.find((el) => typesRefsIncludes(el.type, el.ref) && considerValueFill(el.value));
    return orderTextElement ? orderTextElement.value : null;
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
            changeOrderPatternElementValue(OrderPatternElementType.SELECT, FILLED_ORDER_DROPDOWN_ELEMENTS.CLOSE_BLOCK_ORDER_NUMBER, orderNumber);
          } else {
            changeOrderPatternElementValue(OrderPatternElementType.SELECT, FILLED_ORDER_DROPDOWN_ELEMENTS.ORDER_NUMBER, orderNumber);
          }
          break;
        case ORDER_PATTERN_TYPES.REQUEST:
          changeOrderPatternElementValue(OrderPatternElementType.SELECT, FILLED_ORDER_DROPDOWN_ELEMENTS.REQUEST_NUMBER, orderNumber);
          break;
        case ORDER_PATTERN_TYPES.NOTIFICATION:
          changeOrderPatternElementValue(OrderPatternElementType.SELECT, FILLED_ORDER_DROPDOWN_ELEMENTS.NOTIFICATION_NUMBER, orderNumber);
          break;
        case ORDER_PATTERN_TYPES.ECD_ORDER:
          changeOrderPatternElementValue(OrderPatternElementType.SELECT, FILLED_ORDER_DROPDOWN_ELEMENTS.ECD_ORDER_NUMBER, orderNumber);
          break;
        case ORDER_PATTERN_TYPES.ECD_PROHIBITION:
          changeOrderPatternElementValue(OrderPatternElementType.SELECT, FILLED_ORDER_DROPDOWN_ELEMENTS.ECD_PROHIBITION_NUMBER, orderNumber);
          break;
      }
    }
  };

  /**
   * Позволяет заполнить в тексте шаблонного распоряжения-заявки поля, соответствующие выбранному "окну".
   */
  const setRequestOrderTextFields = () => {
    if (!selectedOkno.value || !state.orderText.patternId || props.orderType !== ORDER_PATTERN_TYPES.REQUEST) {
      return;
    }
    // работы
    changeOrderPatternElementValue(OrderPatternElementType.INPUT, FILLED_ORDER_INPUT_ELEMENTS.WORKS, selectedOkno.value.typeWork);

    // место работ
    if (selectedOkno.value.km1 || selectedOkno.value.km2 || selectedOkno.value.comment) {
      let place = `${selectedOkno.value.km1}` || ''; // пример: 776
      if (selectedOkno.value.pk1) {
        place += ` км ПК ${selectedOkno.value.pk1}`; // пример: 776 км ПК 1
        if (selectedOkno.value.km2) {
          place += ` - ${selectedOkno.value.km2} км`; // пример: 776 км ПК 1 - 777 км
          if (selectedOkno.value.pk2) {
            place += ` ПК ${selectedOkno.value.pk2}`; // пример: 776 км ПК 1 - 777 км ПК 2
          }
        } else {
          if (selectedOkno.value.pk2) {
            place += ` - ${selectedOkno.value.pk2}`; // пример: 776 км ПК 1 - 3
          }
        }
      } else {
        if (selectedOkno.value.km2) {
          place += ` - ${selectedOkno.value.km2} км`; // пример: 776 - 777 км
        } else {
          place += ` км`; // пример: 776 км
        }
        if (selectedOkno.value.pk2) {
          place += ` ПК ${selectedOkno.value.pk2}`; // пример: 1) 776 - 777 км ПК 2; 2) 776 км ПК 2
        }
      }
      if (selectedOkno.value.comment) {
        if (place) {
          place += ` ${selectedOkno.value.comment}`;
        } else {
          place = selectedOkno.value.comment;
        }
      }
      changeOrderPatternElementValue(OrderPatternElementType.INPUT, FILLED_ORDER_INPUT_ELEMENTS.WORK_PLACE, place);
    }

    // пути перегона
    if (selectedOkno.value.mainLine || selectedOkno.value.line) {
      changeOrderPatternElementValue(OrderPatternElementType.INPUT, FILLED_ORDER_INPUT_ELEMENTS.BLOCK_TRACKS,
        selectedOkno.value.mainLine ? selectedOkno.value.mainLine + ' гл. путь' : selectedOkno.value.line + ' путь');
    }

    // перегон
    changeOrderPatternElementValue(OrderPatternElementType.SELECT, FILLED_ORDER_DROPDOWN_ELEMENTS.BLOCK,
      store.getters.getBlockTitleByStationsUNMCs(selectedOkno.value.sta1, selectedOkno.value.sta2));
    changeOrderPatternElementValue(OrderPatternElementType.SELECT, FILLED_ORDER_DROPDOWN_ELEMENTS.BLOCK_ACTION_PLACE,
        store.getters.getBlockTitleByStationsUNMCs(selectedOkno.value.sta1, selectedOkno.value.sta2));

    // в качестве руководителя работ устанавливаем первого из основных руководителей, остальные (основные и дополнительные)
    // будут в соответствующем списке выбора
    if (selectedOkno.value && selectedOkno.value.mainPerf && selectedOkno.value.mainPerf.length) {
      changeOrderPatternElementValue(OrderPatternElementType.SELECT, FILLED_ORDER_DROPDOWN_ELEMENTS.WORKS_HEADS,
        `${selectedOkno.value.mainPerf[0].post} ${selectedOkno.value.mainPerf[0].fio}`);
    }

    // продолжительность "окна"
    if (selectedOkno.value.duration) {
      const oknoDuration = +selectedOkno.value.duration;
      const oknoDurationHours = Math.trunc(oknoDuration / 60);
      const oknoDurationMinutes = oknoDuration - oknoDurationHours * 60;
      changeOrderPatternElementValue(OrderPatternElementType.INPUT, FILLED_ORDER_INPUT_ELEMENTS.OKNO_DURATION,
        `${oknoDurationHours >= 10 ? oknoDurationHours : '0' + oknoDurationHours}ч. ${oknoDurationMinutes >= 10 ? oknoDurationMinutes : '0' + oknoDurationMinutes}мин.`);
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

    // id станций, которым необходимо отправить оригинал документа
    const stationsToSendOrder = [];

    // Если в тексте распоряжения встречается поле 'Станция(место действия)',
    // то значение этого поля (первого встречающегося) устанавливается в качестве места действия
    // распоряжения (если установлен соответствующий флаг).
    // Также, определяются станции-получатели документа (секция "Кому") - это все станции в полях
    // 'Станция', 'Станция(место действия)', 'Станция отправления' либо 'Станция прибытия'.
    let placeSet = false;

    const stationActionPlaceElements = event.orderText.filter((el) => el.ref === FILLED_ORDER_DROPDOWN_ELEMENTS.STATION_ACTION_PLACE);
    console.log('stationActionPlaceElements',stationActionPlaceElements);
    const otherStationElements = event.orderText.filter((el) =>
      [FILLED_ORDER_DROPDOWN_ELEMENTS.STATION,
       FILLED_ORDER_DROPDOWN_ELEMENTS.DPT_STATION,
       FILLED_ORDER_DROPDOWN_ELEMENTS.ARR_STATION].includes(el.ref));

    stationActionPlaceElements.forEach((stationElement) => {
      const resetOrderPlace = () => {
        // Если установлен флаг необходимости определения места действия распоряжения (отображения на ГИД),
        // то обнуляем место действия распоряжения
        if (state.showOnGID.value === true && !placeSet) {
          state.orderPlace = { place: ORDER_PLACE_VALUES.station, value: null };
        }
      };
      if (stationElement.value) {
        const stationId = store.getters.getSectorStationIdByTitle(stationElement.value);
        if (stationId) {
          // Если установлен флаг необходимости определения места действия распоряжения (отображения на ГИД),
          // то определяется место действия распоряжения
          if (state.showOnGID.value === true && !placeSet) {
            state.orderPlace = { place: ORDER_PLACE_VALUES.station, value: stationId };
            placeSet = true;
          }
          // Для отображения станции в списке "Кому" необходимо ее туда добавить, если ее там еще нет
          stationsToSendOrder.push(stationId);
        } else {
          resetOrderPlace();
        }
      } else {
        resetOrderPlace();
      }
    });

    otherStationElements.forEach((stationElement) => {
      if (stationElement.value) {
        const stationId = store.getters.getSectorStationIdByTitle(stationElement.value);
        if (stationId) {
          // Для отображения станции в списке "Кому" необходимо ее туда добавить, если ее там еще нет
          stationsToSendOrder.push(stationId);
        }
      }
    });

    // Если в тексте распоряжения встречается поле 'Перегон(место действия)',
    // то значение этого поля (первого встречающегося) устанавливается в качестве места действия
    // распоряжения (если установлен соответствующий флаг). Но только при условии что ранее (см. выше)
    // не было установлено место действия при анализе поля станции!
    // В любом случае, определяются станции-получатели документа (секция "Кому") - это все станции в полях
    // 'Перегон', 'Перегон(место действия)', 'Перегон станции отправления'.

    const blockActionPlaceElements = event.orderText.filter((el) => el.ref === FILLED_ORDER_DROPDOWN_ELEMENTS.BLOCK_ACTION_PLACE);
    console.log('blockActionPlaceElements',blockActionPlaceElements)
    const otherBlockElements = event.orderText.filter((el) =>
      [FILLED_ORDER_DROPDOWN_ELEMENTS.BLOCK,
       FILLED_ORDER_DROPDOWN_ELEMENTS.DPT_STATION_BLOCK].includes(el.ref));

    blockActionPlaceElements.forEach((blockElement) => {
      const resetOrderPlace = () => {
        // Если установлен флаг необходимости определения места действия распоряжения (отображения на ГИД),
        // при этом место действия распоряжения ранее не было определено, то обнуляем место действия распоряжения
        if (state.showOnGID.value === true && !placeSet) {
          state.orderPlace = { place: ORDER_PLACE_VALUES.span, value: null };
        }
      };
      if (blockElement.value) {
        const blockId = store.getters.getSectorBlockIdByTitle(blockElement.value);
        console.log('blockId',blockId)
        if (blockId) {
          // Если установлен флаг необходимости определения места действия распоряжения (отображения на ГИД),
          // при этом место действия распоряжения ранее не было определено, то определяется место действия распоряжения
          if (state.showOnGID.value === true && !placeSet) {
            state.orderPlace = { place: ORDER_PLACE_VALUES.span, value: blockId };
            placeSet = true;
          }
          // Для отображения перегона в списке "Кому" необходимо туда добавить обе его станции,
          // если их там еще нет
          const stationsIds = store.getters.getSectorBlockStationsIds(blockId);
          if (stationsIds) {
            stationsToSendOrder.push(...stationsIds);
          }
        } else {
          resetOrderPlace();
        }
      } else {
        resetOrderPlace();
      }
    });

    otherBlockElements.forEach((blockElement) => {
      if (blockElement.value) {
        const blockId = store.getters.getSectorBlockIdByTitle(blockElement.value);
        if (blockId) {
          // Для отображения перегона в списке "Кому" необходимо туда добавить обе его станции,
          // если их там еще нет
          const stationsIds = store.getters.getSectorBlockStationsIds(blockId);
          if (stationsIds) {
            stationsToSendOrder.push(...stationsIds);
          }
        }
      }
    });

    if (stationsToSendOrder.length) {
      // Отменяем отправку документа всем станциям, которые до этого были назначены
      store.commit(SET_GET_ORDER_STATUS_TO_ALL_DSP, { getOrderStatus: CurrShiftGetOrderStatus.doNotSend });
      // Формируем список станций-адресатов документа заново
      stationsToSendOrder.forEach((stationId) => {
        store.commit(SET_GET_ORDER_STATUS_TO_DEFINIT_DSP,
          { stationId, getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
      });
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
    getOrderPatternElementValue,
    setRequestOrderTextFields,
    setOrderText,
  };
};
