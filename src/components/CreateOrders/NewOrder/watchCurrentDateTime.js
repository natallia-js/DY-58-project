import { computed, watch } from 'vue';
import { RESET_ORDER_NUMBERS_DATA } from '@/store/mutation-types';

/**
 * Данный модуль предназначен для работы с текущими датой и временем.
 */
export const useWatchCurrentDateTime = (state, props, store) => {
  const getCurrDateTimeWithoutMilliseconds = computed(() => store.getters.getCurrDateTimeWithoutMilliseconds);

  // Каждый раз, когда происходит изменение текущего времени, производим проверку на
  // совпадение месяца и года текущего времени с месяцем и годом даты последнего изданного
  // распоряжения данного типа. Если не совпадает, то производим переход на новый "журнал"
  // путем сброса номера распоряжений заданного типа.
  watch(getCurrDateTimeWithoutMilliseconds, (newVal) => {
    const lastOrderDateTime = store.getters.getLastOrderDateTime(props.orderType);
    if (lastOrderDateTime) {
      if (
        (newVal.getMonth() !== lastOrderDateTime.getMonth()) ||
        (newVal.getFullYear() !== lastOrderDateTime.getFullYear())
      ) {
        store.commit(RESET_ORDER_NUMBERS_DATA, props.orderType);
      }
    }
    state.createDateTime = newVal;
  });

  const getCurrDateTimeString = computed(() => store.getters.getCurrDateTimeString);

  // Для оперативного отображения текущих даты и времени (дата-время создания распоряжения)
  watch(getCurrDateTimeString, (newVal) => {
    state.createDateTimeString = newVal;
  });
};
