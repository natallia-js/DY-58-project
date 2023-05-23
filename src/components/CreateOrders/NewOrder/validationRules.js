import { reactive, watch } from 'vue';
import { helpers, minLength, required  } from '@vuelidate/validators';
import { ORDER_ELEMENTS_CAN_BE_EMPTY } from '@/constants/orders';
import { ORDER_PATTERN_TYPES, OrderPatternElementType } from '@/constants/orderPatterns';
import isValidDateTime from '@/additional/isValidDateTime';
import isNumber from '@/additional/isNumber';


/**
 * Данный модуль предназначен для проверки параметров издаваемого распоряжения.
 */
export const useNewOrderValidationRules = ({ state, props /*, relatedOrderObject */, isECD, isDNC }) => {

  const ERR_MESSAGES = {
    orderNumberRequired: 'Не указан номер документа',
    orderNumberMustBeNumber: 'Номер документа должен быть числом',
    orderCreateDateTimeNotValidDateTime: 'Неверный формат даты создания документа',
    orderTextSourceRequired: 'Не указан источник текста документа',
    orderTitleRequired: 'Не указано название документа',
    orderTextRequired: 'Не указан текст документа',
    orderTextFieldValuesRequired: 'В шаблоне документа заполнены не все обязательные для заполнения поля',
    orderStartTimeRequired: 'Не указана дата начала действия документа',
    orderStartTimeNotValidDateTime: 'Неверный формат даты начала действия документа',
    orderEndDateNoLessStartDate: 'Дата окончания действия документа не может быть меньше даты начала действия документа',
    orderCancelOrEndDate: 'Документ должен действовать до отмены либо иметь дату окончания действия',
    placeTypeRequired: 'Не указан тип места действия документа',
    placeValueRequired: 'Не указано место действия документа',
    createDateTimeRequired: 'Не указано время создания документа',
    atLeastOneAddresseeRequired: 'Должен быть указан, как минимум, один адресат',
    dncAddresseeRequired: 'Среди адресатов документа должен быть ДНЦ',
    prevRelatedOrderRequired: 'Не указан связанный документ',
  };

  // --------------------------------------

  const endDateNoLessStartDate = (value) => !value ? true :
    !state.timeSpan.start ? true : (isValidDateTime(value) && value >= state.timeSpan.start);

  const cancelOrEndDate = (value) => value || state.timeSpan.end;

  // Проверка элементов шаблона распоряжения на наличие в них значений.
  // Для ДСП и ДНЦ:
  // значение должно присутствовать у всех элементов шаблона, кроме элементов типа
  // 'редактируемый список множественного выбора', 'перенос строки', 'текстовая область'
  // и 'выдано запрещение ДСП', а также элементов, смысловые значения которых находятся в определенном списке
  // Для ЭЦД:
  // значение может отсутствовать у абсолютно любого элемента шаблона
  const orderTextFieldsNotEmpty = (orderText) => {
    if (isECD.value) {
      return true;
  }
    for (let orderTextElement of orderText) {
      if (![OrderPatternElementType.MULTIPLE_SELECT, OrderPatternElementType.LINEBREAK,
            OrderPatternElementType.TEXT_AREA, OrderPatternElementType.CHECKBOX_AND_INPUT_OR_NOTHING,
            OrderPatternElementType.CHECKBOX,
          ].includes(orderTextElement.type) &&
          !ORDER_ELEMENTS_CAN_BE_EMPTY.includes(orderTextElement.ref) && !orderTextElement.value)
      {
        return false;
      }
    }
    return true;
  };

  const checkOrderTextDateTimeParams = (/*orderText*/) => {
    // Здесь нельзя использовать isValidDateTime, т.к. он не работает со строками
    /*for (let orderTextElement of orderText) {
      if ([OrderPatternElementType.DATE, OrderPatternElementType.TIME, OrderPatternElementType.DATETIME]
        .includes(orderTextElement.type) && !isValidDateTime(orderTextElement.value)) {
          console.log('checkOrderTextDateTimeParams false')
        return false;
      }
    }*/
    return true;
  };
/*
  const cancelOrderDateTimeNoLessOrderStartDate = (value) => {
    if (!relatedOrderObject.value) {
      return true;
    }
    return relatedOrderObject.value.timeSpan.start <= value;
  };
*/

  const prevRelatedOrderIsRequired = (value) => {
    return value && !value.null;
  };

  const atLeastOneAddresseeIsRequired = () => {
    return (state.dncSectorsToSendOrder.length > 0) || (state.dspSectorsToSendOrder.length > 0) ||
      (state.ecdSectorsToSendOrder.length > 0) || (state.otherSectorsToSendOrder.length > 0);
  };

  // Заявка и уведомление, издаваемые не ДНЦ, должны обязательно в адресатах иметь ДНЦ
  const dncAddresseeRequiredForNotDSPUser = () => isDNC.value || (state.dncSectorsToSendOrder.length > 0);

  // --------------------------------------

  const orderTextRules = {
    orderTextSource: {
      required: helpers.withMessage(ERR_MESSAGES.orderTextSourceRequired, required),
    },
    patternId: {},
    orderTitle: {
      required: helpers.withMessage(ERR_MESSAGES.orderTitleRequired, required),
    },
    orderText: {
      required: helpers.withMessage(ERR_MESSAGES.orderTextRequired, required),
      orderTextFieldsNotEmpty: helpers.withMessage(ERR_MESSAGES.orderTextFieldValuesRequired, orderTextFieldsNotEmpty),
      checkOrderTextDateTimeParams
    },
  };

  const placeRules = {
    place: {
      required: helpers.withMessage(ERR_MESSAGES.placeTypeRequired, required),
    },
    value: {
      required: helpers.withMessage(ERR_MESSAGES.placeValueRequired, required),
    },
  };

  const timeSpanRules = {
    start: {
      required: helpers.withMessage(ERR_MESSAGES.orderStartTimeRequired, required),
      isValidDateTime: helpers.withMessage(ERR_MESSAGES.orderStartTimeNotValidDateTime, isValidDateTime),
    },
    end: {
      endDateNoLessStartDate: helpers.withMessage(ERR_MESSAGES.orderEndDateNoLessStartDate, endDateNoLessStartDate),
    },
    tillCancellation: {
      cancelOrEndDate: helpers.withMessage(ERR_MESSAGES.orderCancelOrEndDate, cancelOrEndDate),
    },
  };

  const rules = reactive({
    number: {
      required: helpers.withMessage(ERR_MESSAGES.orderNumberRequired, required),
      isNumber: helpers.withMessage(ERR_MESSAGES.orderNumberMustBeNumber, isNumber),
    },
    createDateTime: {
      required: helpers.withMessage(ERR_MESSAGES.createDateTimeRequired, required),
      isValidDateTime: helpers.withMessage(ERR_MESSAGES.orderCreateDateTimeNotValidDateTime, isValidDateTime),
    },
    createDateTimeString: {
      required: helpers.withMessage(ERR_MESSAGES.createDateTimeRequired, required),
    },
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
      rules.allAddressees = {
        atLeastOneAddresseeIsRequired: helpers.withMessage(ERR_MESSAGES.atLeastOneAddresseeRequired, atLeastOneAddresseeIsRequired),
      };
      break;
    case ORDER_PATTERN_TYPES.ECD_NOTIFICATION:
      rules.prevRelatedOrder = {
        prevRelatedOrderIsRequired: helpers.withMessage(ERR_MESSAGES.prevRelatedOrderRequired, prevRelatedOrderIsRequired),
      };
      //rules.cancelOrderDateTime = { required, isValidDateTime, cancelOrderDateTimeNoLessOrderStartDate };
      break;
    case ORDER_PATTERN_TYPES.REQUEST:
      rules.allAddressees = {
        dncAddresseeRequiredForNotDSPUser: helpers.withMessage(ERR_MESSAGES.dncAddresseeRequired, dncAddresseeRequiredForNotDSPUser),
        atLeastOneAddresseeIsRequired: helpers.withMessage(ERR_MESSAGES.atLeastOneAddresseeRequired, atLeastOneAddresseeIsRequired),
      };
      break;
    case ORDER_PATTERN_TYPES.NOTIFICATION:
      rules.allAddressees = {
        dncAddresseeRequiredForNotDSPUser: helpers.withMessage(ERR_MESSAGES.dncAddresseeRequired, dncAddresseeRequiredForNotDSPUser)
      };
      break;
    default:
      break;
  }

  watch(() => state.showOnGID, (newVal) => {
    rules.orderPlace = newVal?.value ? placeRules : {};
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
