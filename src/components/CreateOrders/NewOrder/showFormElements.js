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
  const { state, props, isECD, getOrderDraftsOfGivenType } = inputVals;

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

  // отображать ли флаг выбора места действия распоряжения (если false, то соответствующий элемент
  // будет отсутствовать в DOM)
  const showDisplayOnGIDFlag = computed(() =>
    Boolean(
      [ORDER_PATTERN_TYPES.ORDER,
       ORDER_PATTERN_TYPES.ECD_ORDER,
       ORDER_PATTERN_TYPES.ECD_PROHIBITION].includes(props.orderType) &&
      (!state.specialTrainCategories || (
        !state.specialTrainCategories.includes(SPECIAL_CIRCULAR_ORDER_SIGN) &&
        !state.specialTrainCategories.includes(SPECIAL_CLOSE_BLOCK_ORDER_SIGN) &&
        !state.specialTrainCategories.includes(SPECIAL_OPEN_BLOCK_ORDER_SIGN)
      ))
    )
  );

  // отображать ли поля выбора места действия распоряжения (если false, то соответствующий элемент
  // будет отсутствовать в DOM)
  const showDisplayOnGIDFields = computed(() =>
    Boolean(
      [ORDER_PATTERN_TYPES.ORDER,
       ORDER_PATTERN_TYPES.ECD_ORDER,
       ORDER_PATTERN_TYPES.ECD_PROHIBITION].includes(props.orderType) &&
      state.showOnGID.value &&
      // не показываем для распоряжений ДНЦ "о закрытии перегона" и "об открытии перегона"
      !(props.orderType === ORDER_PATTERN_TYPES.ORDER &&
        (state.specialTrainCategories && (
         state.specialTrainCategories.includes(SPECIAL_CLOSE_BLOCK_ORDER_SIGN) ||
         state.specialTrainCategories.includes(SPECIAL_OPEN_BLOCK_ORDER_SIGN)
        ))
      )
    )
  );

  // отображать ли флаг выбора временного промежутка действия распоряжения
  const showDisplayOrderTimespanFlag = computed(() =>
    Boolean(
      [ORDER_PATTERN_TYPES.ORDER,
       ORDER_PATTERN_TYPES.ECD_ORDER,
       ORDER_PATTERN_TYPES.ECD_PROHIBITION].includes(props.orderType) &&
      (!state.specialTrainCategories || (
        !state.specialTrainCategories.includes(SPECIAL_CIRCULAR_ORDER_SIGN) &&
        !state.specialTrainCategories.includes(SPECIAL_CLOSE_BLOCK_ORDER_SIGN) &&
        !state.specialTrainCategories.includes(SPECIAL_OPEN_BLOCK_ORDER_SIGN)
      ))
    )
  );

  // отображать ли поля выбора временного промежутка действия распоряжения
  const showDisplayOrderTimespan = computed(() =>
    Boolean(
      [ORDER_PATTERN_TYPES.ORDER,
       ORDER_PATTERN_TYPES.ECD_ORDER,
       ORDER_PATTERN_TYPES.ECD_PROHIBITION].includes(props.orderType) &&
      state.defineOrderTimeSpan.value &&
      // не показываем для распоряжений ДНЦ "о закрытии перегона" и "об открытии перегона"
      !(props.orderType === ORDER_PATTERN_TYPES.ORDER &&
        (state.specialTrainCategories && (
         state.specialTrainCategories.includes(SPECIAL_CLOSE_BLOCK_ORDER_SIGN) ||
         state.specialTrainCategories.includes(SPECIAL_OPEN_BLOCK_ORDER_SIGN)
        ))
      )
    )
  );

  return {
    showOrderDrafts,
    showConnectedOrderFields,
    showDisplayOnGIDFlag,
    showDisplayOnGIDFields,
    showDisplayOrderTimespanFlag,
    showDisplayOrderTimespan,
  };
};
