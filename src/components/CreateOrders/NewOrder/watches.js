import { watch } from 'vue';
import isValidDateTime from '@/additional/isValidDateTime';
import {
  SET_GET_ORDER_STATUS_TO_ALL_DSP,
  SET_GET_ORDER_STATUS_TO_DEFINIT_DSP,
} from '@/store/mutation-types';
import {
  CurrShiftGetOrderStatus,
  ORDER_PLACE_VALUES,
} from '@/constants/orders';
import {
  SPECIAL_CLOSE_BLOCK_ORDER_SIGN,
  SPECIAL_OPEN_BLOCK_ORDER_SIGN,
} from '@/constants/orderPatterns';


/**
 * Данный модуль предназначен для оперативного реагирования на происходящие изменения
 * при работе с формой создания распоряжения.
 */
export const useWatches = (inputVals) => {
  const {
    state, props, store, emit,
    showSuccessMessage, showErrMessage, initialOrderText,
    currentOrderDraft, applySelectedOrderDraft, applySelectedOrderDraftPersonal,
    relatedOrderObject, showOnGIDOptions, defineOrderTimeSpanOptions,
  } = inputVals;

  // ---------------- CHANGE ORDER NUMBER ---------------------

  // Номер распоряжения заданного типа рассчитывается автоматически и отображается пользователю
  watch(() => store.getters.getNextOrdersNumber(props.orderType), (newVal) => state.number = newVal);

  // ---------------- CHANGE CANCEL ORDER DATETIME ---------------------

  /**
   * Обнуляем значения секунд и миллисекунд у выбранного значения времени отмены действия распоряжения
   * (чтобы не было проблем при сравнении с датой начала действия соответствующего распоряжения,
   * например, когда необходимо отменить в то же время, когда оно начало действовать, если издано
   * было случайно).
   */
  watch(() => state.cancelOrderDateTime, (value) => {
    if (value && isValidDateTime(value)) {
      state.cancelOrderDateTime.setSeconds(0, 0);
    }
  });

  // ---------------- CHANGE ORDER PATTERN(-S) ---------------------

  // Сюда попадаем (в частности) при перезагрузке страницы, когда не сразу доступны шаблоны распоряжений
  watch([() => store.getters.getAllOrderPatterns, () => props.orderPatternId],
    ([newPatterns, newOrderPatternId]) => {
      if (newPatterns && newPatterns.length && newOrderPatternId) {
        state.orderText = { ...initialOrderText() };
      }
    }
  );

  /**
   * При смене шаблона распоряжения извлекает отметки об особой категории поезда,
   * закрепленные за данным шаблоном.
   */
  watch(() => state.orderText.patternId, (newVal) => {
    if (!newVal) {
      state.specialTrainCategories = null;
      state.showOnGID = showOnGIDOptions[0];
      state.defineOrderTimeSpan = defineOrderTimeSpanOptions[0];
    } else {
      state.specialTrainCategories = store.getters.getOrderPatternSpecialTrainCategories(newVal);
      // Для распоряжений ДНЦ о закрытии и открытии перегона поля ввода места и времени
      // действия распоряжения не будут отображаться, но их заполнение обязательно!
      // Данные будут браться из текста распоряжения
      if (state.specialTrainCategories && (
        state.specialTrainCategories.includes(SPECIAL_CLOSE_BLOCK_ORDER_SIGN) ||
        state.specialTrainCategories.includes(SPECIAL_OPEN_BLOCK_ORDER_SIGN)
      )) {
        state.showOnGID = showOnGIDOptions[1];
        state.defineOrderTimeSpan = defineOrderTimeSpanOptions[1];
      } else {
        state.showOnGID = showOnGIDOptions[0];
        state.defineOrderTimeSpan = defineOrderTimeSpanOptions[0];
      }
    }
  });

  // ---------------- CHANGE RELATED ORDER OBJECT ---------------------

  watch(relatedOrderObject, (newVal) => {
    emit('changeProps', {
      orderType: props.orderType,
      prevOrderId: newVal ? newVal._id : null,
      orderDraftId: props.orderDraftId,
    });
  });

  // ---------------- ORDER DRAFTS ---------------------

  watch(() => props.orderDraftId, () => {
    state.currentOrderDraftId = props.orderDraftId;
  });

  // При выборе черновика распоряжения производим заполнение полей состояния (формы) значениями его полей
  watch(currentOrderDraft, (newVal) => {
    applySelectedOrderDraft();
    emit('changeProps', {
      orderType: props.orderType,
      prevOrderId: props.prevOrderId,
      orderDraftId: newVal ? newVal._id : null,
    });
  });

  // Сюда попадаем (в частности) при перезагрузке страницы, когда не сразу доступны черновики распоряжений
  // (id нужного черновика может быть, а вот подгрузки всех черновиков нужно подождать)
  watch(() => store.getters.getAllOrderDrafts, (newVal) => {
    if (!state.currentOrderDraftId || !newVal || !newVal.length) {
      return;
    }
    // Искусственно вызываем отображение данных выбранного черновика
    const tmp = state.currentOrderDraftId;
    state.currentOrderDraftId = null;
    state.currentOrderDraftId = tmp;
  });

  watch(() => store.getters.getSectorPersonal, () => {
    applySelectedOrderDraftPersonal();
  });

  // ---------------- ORDER PLACE DEPENDENCIES ---------------------

  // При изменении значения параметра места действия распоряжения меняем список "Кому" по станциям,
  // а также, при необходимости, заполняем значения соответствующих полей в тексте распоряжения
  watch(() => state.orderPlace.value, (newValue) => {
    if (!state.resetValueOnWatchChanges || !newValue) {
      return;
    }
    // Вначале все записи "чистим" (т.е. отменяем передачу всем, кто до этого был назначен)
    store.commit(SET_GET_ORDER_STATUS_TO_ALL_DSP, { getOrderStatus: CurrShiftGetOrderStatus.doNotSend });
    let blockObject;
    switch (state.orderPlace.place) {
      case ORDER_PLACE_VALUES.station:
        // Затем назначаем получение оригинала распоряжения выбранной станции
        store.commit(SET_GET_ORDER_STATUS_TO_DEFINIT_DSP,
          { stationId: newValue, getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
        break;
      case ORDER_PLACE_VALUES.span:
        // Затем назначаем получение оригинала распоряжения станциям выбранного перегона
        blockObject = store.getters.getSectorBlockById(newValue);
        if (blockObject) {
          store.commit(SET_GET_ORDER_STATUS_TO_DEFINIT_DSP,
            { stationId: blockObject.Bl_StationID1, getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
          store.commit(SET_GET_ORDER_STATUS_TO_DEFINIT_DSP,
            { stationId: blockObject.Bl_StationID2, getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
        }
        break;
    }
  });

  // ---------------- DISPLAY OPERATIONS' RESULTS ---------------------

  /**
   * Для отображения результата операции издания распоряжения (отправки на сервер).
   */
  watch(() => store.getters.getDispatchOrderResult, (newVal) => {
    if (!newVal || newVal.orderType !== props.orderType) {
      return;
    }
    if (!newVal.error) {
      showSuccessMessage(newVal.message);
      if (state.prevRelatedOrder) {
        state.prevRelatedOrder = null;
        state.cancelOrderDateTime = null;
      }
    } else {
      showErrMessage(newVal.message);
    }
  });

  /**
   * Для отображения результата операции сохранения черновика распоряжения (отправки на сервер) -
   * используется как при создании нового черновика, так и при редактировании существующего.
   */
  watch(() => store.getters.getSaveOrderDraftResult, (newVal) => {
    if (!newVal || newVal.orderType !== props.orderType) {
      return;
    }
    if (!newVal.error) {
      showSuccessMessage(newVal.message);
    } else {
      showErrMessage(newVal.message);
    }
  });
};
