import { computed, watch } from 'vue';
import { RESET_ORDER_NUMBERS_DATA } from '@/store/mutation-types';
import { ALL_ORDERS_TYPE_ECD } from '@/constants/orderPatterns';

/**
 * Данный модуль предназначен для работы с текущими датой и временем.
 */
export const useWatchCurrentDateTime = ({ state, props, store }) => {
  // Каждый раз, когда происходит изменение текущего времени, производим проверку на
  // совпадение месяца и года текущего времени с месяцем и годом даты последнего изданного
  // распоряжения данного типа. Если не совпадает, то производим переход на новый "журнал"
  // путем сброса номера распоряжений заданного типа.

  const isECD = computed(() => store.getters.isECD);

  watch(() => store.getters.getCurrDateTimeWithoutMilliseconds, (newVal) => {
    const lastOrderDateTime = store.getters.getLastOrderDateTime(!isECD.value ? props.orderType : ALL_ORDERS_TYPE_ECD);
    if (lastOrderDateTime) {
      if (
        (newVal.getMonth() !== lastOrderDateTime.getMonth()) ||
        (newVal.getFullYear() !== lastOrderDateTime.getFullYear())
      ) {
        store.commit(RESET_ORDER_NUMBERS_DATA, !isECD.value ? props.orderType : ALL_ORDERS_TYPE_ECD);
      }
    }
    if (state.updateCreateDateTimeRegularly) {
      state.createDateTime = newVal;
    }
  });

  // Для оперативного отображения текущих даты и времени (дата-время создания распоряжения)
  watch(() => store.getters.getCurrDateTimeString, (newVal) => {
    if (state.updateCreateDateTimeRegularly) {
      state.createDateTimeString = newVal;
    }
  });
};
