import { computed } from 'vue';
import {
  ORDER_PATTERN_TYPES,
  SPECIAL_CIRCULAR_ORDER_SIGN,
} from '@/constants/orderPatterns';
import {
  FILLED_ORDER_DROPDOWN_ELEMENTS,
  FILLED_ORDER_DATETIME_ELEMENTS,
} from '@/constants/orders';

/**
 * Данный модуль предназначен для определения необходимости отображения на форме создания
 * документа (распоряжения, заявки, уведомления, ...) тех или иных элементов.
 */
 export const useShowFormElements = (inputVals) => {
  const {
    state, props, isECD, getOrderDraftsOfGivenType, showOnGIDOptions, defineOrderTimeSpanOptions,
  } = inputVals;

  // показывать ли список черновиков документов текущего типа (если false, то соответствующий элемент
  // будет отсутствовать в DOM)
  const showOrderDrafts = computed(() => Boolean(isECD.value && getOrderDraftsOfGivenType.value.length));

  // показывать ли поля выбора связанного распоряжения (если false, то соответствующий элемент
  // будет отсутствовать в DOM)
  const showConnectedOrderFields = computed(() =>
    Boolean(
      (props.orderType !== ORDER_PATTERN_TYPES.ECD_ORDER) &&
      (!state.specialTrainCategories || !state.specialTrainCategories.includes(SPECIAL_CIRCULAR_ORDER_SIGN))
    )
  );

  // Отображать ли флаг выбора места действия распоряжения (если false, то соответствующий элемент
  // будет отсутствовать в DOM). Для всех распоряжений ДНЦ данный флаг будет отсутствовать. Если его
  // необходимо будет включить, то нужно не забыть о state.specialTrainCategories: при создании
  // циркулярного распоряжения ДНЦ и распоряжений о закрытии/открытии перегона данный флаг не нужно
  // отображать.
  const showDisplayOnGIDFlag = computed(() =>
    // Для ЭЦД в будущем может понадобиться указывать место действия документа, но пока его надо скрыть
    // [ORDER_PATTERN_TYPES.ECD_ORDER, ORDER_PATTERN_TYPES.ECD_PROHIBITION].includes(props.orderType)
    false
  );

  // Отображать ли поля выбора места действия распоряжения (если false, то соответствующий элемент
  // будет отсутствовать в DOM).
  const showDisplayOnGIDFields = computed(() =>
    // state.showOnGID.value определяет, показать или скрыть поля при showDisplayOnGIDFlag = true
    showDisplayOnGIDFlag.value && state.showOnGID.value
  );

  // Определяет необходимость указывать место действия распоряжения.
  // Для этого не обязательно видеть соответствующий флаг.
  // Если в тексте шаблонного распоряжения содержится элемент с одним из заданных
  // смысловых значений, то полагается, что из него будет взята информация о месте действия документа.
  const getUserDutyToDefineOrderPlace = computed(() => {
    const isElementWithOrderPlaceMarker = (element) =>
      element.ref === FILLED_ORDER_DROPDOWN_ELEMENTS.STATION_ACTION_PLACE ||
      element.ref === FILLED_ORDER_DROPDOWN_ELEMENTS.BLOCK_ACTION_PLACE;
    return state.orderText?.orderText?.find((el) => isElementWithOrderPlaceMarker(el) ) != null
      ? showOnGIDOptions[1]
      : showOnGIDOptions[0];
  });

  // Отображать ли флаг выбора временного промежутка действия распоряжения.
  // Для всех распоряжений ДНЦ эти поля будут отсутствовать. Если их необходимо будет включить,
  // то нужно не забыть о state.specialTrainCategories: при создании циркулярного распоряжения ДНЦ
  // и распоряжений о закрытии/открытии перегона данные поля не нужно отображать.
  const showDisplayOrderTimespanFlag = computed(() => false);

  // Отображать ли поля выбора временного промежутка действия распоряжения (если false, то
  // соответствующий элемент будет отсутствовать в DOM).
  const showDisplayOrderTimespan = computed(() =>
    // state.defineOrderTimeSpan.value определяет, показать или скрыть поля при showDisplayOrderTimespanFlag = true
    showDisplayOrderTimespanFlag.value && state.defineOrderTimeSpan.value
  );

  // Определяет необходимость указывать время действия распоряжения.
  // Для этого не обязательно видеть соответствующий флаг.
  // Если в тексте шаблонного распоряжения содержится элемент с одним из заданных
  // смысловых значений, то полагается, что из него будет взята информация о времени действия документа.
  const getUserDutyToDefineOrderTimeSpan = computed(() => {
    const isElementWithOrderTimespanMarker = (element) =>
      element.ref === FILLED_ORDER_DATETIME_ELEMENTS.CLOSE_BLOCK_DATETIME ||
      element.ref === FILLED_ORDER_DATETIME_ELEMENTS.OPEN_BLOCK_DATETIME ||
      element.ref === FILLED_ORDER_DATETIME_ELEMENTS.DOCUMENT_START_DATETIME ||
      element.ref === FILLED_ORDER_DATETIME_ELEMENTS.DOCUMENT_END_DATETIME;
    return state.orderText?.orderText?.find((el) => isElementWithOrderTimespanMarker(el) ) != null
      ? defineOrderTimeSpanOptions[1]
      : defineOrderTimeSpanOptions[0];
  });

  return {
    showOrderDrafts,
    showConnectedOrderFields,
    showDisplayOnGIDFlag,
    showDisplayOnGIDFields,
    getUserDutyToDefineOrderPlace,
    showDisplayOrderTimespanFlag,
    showDisplayOrderTimespan,
    getUserDutyToDefineOrderTimeSpan,
  };
};
