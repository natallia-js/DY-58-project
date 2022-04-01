import { watch } from 'vue';
import isValidDateTime from '@/additional/isValidDateTime';


export const useWatchCancelOrderDateTime = ({ state }) => {
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
};
