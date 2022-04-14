import { reactive, watch } from 'vue';
import { minLength, required  } from '@vuelidate/validators';
import { ORDER_ELEMENTS_CAN_BE_EMPTY } from '@/constants/orders';
import { ORDER_PATTERN_TYPES, OrderPatternElementType } from '@/constants/orderPatterns';
import isValidDateTime from '@/additional/isValidDateTime';
import isNumber from '@/additional/isNumber';

/**
 * Данный модуль предназначен для проверки параметров издаваемого распоряжения.
 */
export const useNewOrderValidationRules = (state, props, relatedOrderObject) => {

  const endDateNoLessStartDate = (value) => {
    return !value ? true :
      !state.timeSpan.start ? true : (isValidDateTime(value) && value >= state.timeSpan.start);
  };

  const cancelOrEndDate = (value) => value || state.timeSpan.end;

  // Проверка элементов шаблона распоряжения на наличие в них значений.
  // Значение должно присутствовать у всех элементов шаблона, кроме элементов типа
  // 'перенос строки' и 'текстовая область', а также элементов, смысловые значения
  // которых находятся в определенном списке
  const orderTextFieldsNotEmpty = (orderText) => {
    for (let orderTextElement of orderText) {
      if (![OrderPatternElementType.LINEBREAK, OrderPatternElementType.TEXT_AREA].includes(orderTextElement.type) &&
        !ORDER_ELEMENTS_CAN_BE_EMPTY.includes(orderTextElement.ref) && !orderTextElement.value) {
        return false;
      }
    }
    return true;
  };

  const checkOrderTextDateTimeParams = (orderText) => {
    for (let orderTextElement of orderText) {
      if ([OrderPatternElementType.DATE, OrderPatternElementType.TIME, OrderPatternElementType.DATETIME]
        .includes(orderTextElement.type) && !isValidDateTime(orderTextElement.value)) {
        return false;
      }
    }
    return true;
  };

  const cancelOrderDateTimeNoLessOrderStartDate = (value) => {
    if (!relatedOrderObject.value) {
      return true;
    }
    return relatedOrderObject.value.timeSpan.start <= value;
  };

  const orderTextRules = {
    orderTextSource: { required },
    patternId: {},
    orderTitle: { required },
    orderText: { required, orderTextFieldsNotEmpty, checkOrderTextDateTimeParams },
  };

  const placeRules = {
    place: { required },
    value: { required },
  };

  const timeSpanRules = {
    start: { required, isValidDateTime },
    end: { endDateNoLessStartDate },
    tillCancellation: { cancelOrEndDate },
  };

  const prevRelatedOrderIsRequired = (value) => {
    return value && !value.null;
  };

  const atLeastOneAddresseeIsRequired = () => {
    return (state.dncSectorsToSendOrder.length > 0) || (state.dspSectorsToSendOrder.length > 0) ||
      (state.ecdSectorsToSendOrder.length > 0) || (state.otherSectorsToSendOrder.length > 0);
  };

  const rules = reactive({
    number: { required, isNumber },
    createDateTime: { required, isValidDateTime },
    createDateTimeString: { required },
    prevRelatedOrder: {},
    orderPlace: {},
    timeSpan: {},
    orderText: orderTextRules,
    // ! <minLength: minLength(1)> означает, что минимальная длина массива должна быть равна нулю
    dncSectorsToSendOrder: { minLength: minLength(1) },
    dspSectorsToSendOrder: { minLength: minLength(1) },
    ecdSectorsToSendOrder: { minLength: minLength(1) },
    otherSectorsToSendOrder: { minLength: minLength(1) },
    allAddressees: {},
    createdOnBehalfOf: {},
  });

  switch (props.orderType) {
    case ORDER_PATTERN_TYPES.ORDER:
      rules.orderPlace = state.showOnGID.value ? placeRules : {};
      rules.timeSpan = state.defineOrderTimeSpan.value ? timeSpanRules : {};
      rules.allAddressees = { atLeastOneAddresseeIsRequired };
      break;
    case ORDER_PATTERN_TYPES.ECD_NOTIFICATION:
      rules.prevRelatedOrder = { prevRelatedOrderIsRequired };
      rules.cancelOrderDateTime = { required, isValidDateTime, cancelOrderDateTimeNoLessOrderStartDate };
      break;
    case ORDER_PATTERN_TYPES.REQUEST:
    case ORDER_PATTERN_TYPES.NOTIFICATION:
      rules.allAddressees = { atLeastOneAddresseeIsRequired };
      break;
    default:
      break;
  }

  watch(() => state.showOnGID, (newVal) => {
    rules.orderPlace = newVal.value ? placeRules : {};
    if (state.resetValueOnWatchChanges === true) {
      state.orderPlace = { place: null, value: null };
    }
  }, { immediate: true }); // call on page load

  watch(() => state.defineOrderTimeSpan, (newVal) => {
    rules.timeSpan = newVal.value ? timeSpanRules : {};
    if (state.resetValueOnWatchChanges === true) {
      state.timeSpan = { start: null, end: null, tillCancellation: null };
    } else {
      // Это делаю именно здесь, не в 'watch(() => state.showOnGID...', т.к. это должно быть
      // в одном месте, после того как будет обработана вся информация по черновику распоряжения.
      // Только по окончании обработки данной информации разрешаем reset полей при выборе режимов
      // ввода данных
      state.resetValueOnWatchChanges = true;
    }
  }, { immediate: true }); // call on page load

  return {
    rules,
  };
};
