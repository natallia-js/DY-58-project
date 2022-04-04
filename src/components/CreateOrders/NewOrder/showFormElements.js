import { computed } from 'vue';
import {
  ORDER_PATTERN_TYPES,
  SPECIAL_CIRCULAR_ORDER_SIGN,
  SPECIAL_CLOSE_BLOCK_ORDER_SIGN,
  SPECIAL_OPEN_BLOCK_ORDER_SIGN,
} from '@/constants/orderPatterns';


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
    [ORDER_PATTERN_TYPES.ECD_ORDER, ORDER_PATTERN_TYPES.ECD_PROHIBITION].includes(props.orderType)
  );

  // Отображать ли поля выбора места действия распоряжения (если false, то соответствующий элемент
  // будет отсутствовать в DOM).
  const showDisplayOnGIDFields = computed(() =>
    // state.showOnGID.value определяет, показать или скрыть поля при showDisplayOnGIDFlag = true
    showDisplayOnGIDFlag.value && state.showOnGID.value
  );

  // Определяет необходимость указывать место действия распоряжения.
  // Для этого не обязательно видеть соответствующий флаг.
  // Так, для распоряжений ДНЦ о закрытии и открытии перегона поля места
  // действия распоряжения не будут отображаться, но их заполнение обязательно!
  // Данные будут браться из текста распоряжения.
  const getUserDutyToDefineOrderPlace = computed(() =>
    (state.specialTrainCategories && (
      state.specialTrainCategories.includes(SPECIAL_CLOSE_BLOCK_ORDER_SIGN) ||
      state.specialTrainCategories.includes(SPECIAL_OPEN_BLOCK_ORDER_SIGN)
    )) ? showOnGIDOptions[1] : state.showOnGID);

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
  // Так, для распоряжений ДНЦ о закрытии и открытии перегона поля времени
  // действия распоряжения не будут отображаться, но их заполнение обязательно!
  // Данные будут браться из текста распоряжения.
  const getUserDutyToDefineOrderTimeSpan = computed(() =>
    (state.specialTrainCategories && (
      state.specialTrainCategories.includes(SPECIAL_CLOSE_BLOCK_ORDER_SIGN) ||
      state.specialTrainCategories.includes(SPECIAL_OPEN_BLOCK_ORDER_SIGN)
    )) ? defineOrderTimeSpanOptions[1] : state.defineOrderTimeSpan);

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
