import { ORDER_PATTERN_TYPES, SPECIAL_ORDER_DSP_TAKE_DUTY_SIGN } from '@/constants/orderPatterns';


/**
 * Позволяет для данного объекта Date получить его строковое представление в формате dd.mm.yyyy.
 *
 * @param {Date} date - объект Date для отображения в виде строки
 * @returns строковое представление заданного объекта Date
 */
 export function getLocaleDateString(date) {
  if (date instanceof Date) {
    return `${date.toLocaleDateString('ru', { day: 'numeric', month: 'numeric', year: 'numeric' })}`;
  }
  return '';
}

/**
 * Позволяет для данного объекта Date получить его строковое представление в формате hh:mm:ss.
 *
 * @param {Date} date - объект Date для отображения в виде строки
 * @returns строковое представление заданного объекта Date
 */
 export function getLocaleTimeString(date) {
  if (date instanceof Date) {
    return `${date.toLocaleTimeString('ru', { hour: 'numeric', minute: 'numeric' })}`;
  }
  return '';
}

/**
 * Позволяет для данного объекта Date получить его строковое представление в формате dd.mm.yyyy hh:mm
 * либо формате dd.mm.yyyy hh:mm:ss.
 *
 * @param {Date} date - объект Date для отображения в виде строки
 * @param {boolean} showSeconds - true - показывать секунды, false - не показывать
 * @returns строковое представление заданного объекта Date
 */
export function getLocaleDateTimeString(date, showSeconds) {
  if (date instanceof Date) {
    const timeFormattingObject = { hour: 'numeric', minute: 'numeric' };
    if (showSeconds) {
      timeFormattingObject.second = 'numeric';
    }
    return `${date.toLocaleDateString('ru', { day: 'numeric', month: 'numeric', year: 'numeric' })} ` +
           `${date.toLocaleTimeString('ru', timeFormattingObject)}`;
  }
  return '';
}

/**
 * Позволяет для данного объекта timeSpan получить его строковое представление в зависимости от
 * типа соответствующего распоряжения.
 *
 * @param {String} orderType - тип распоряжения
 * @param {Object} timeSpan - объект с полями start, end, tillCancellation
 * @param {boolean} isECD - true (строку необходимо сформировать для ЭЦД) или
 * false (строку необходимо сформировать не для ЭЦД)
 * @param {Array} specialOrderCategories - массив строк, определяющих особые отметки распоряжения
 * @returns строковое представление объекта timeSpan
 */
export function getTimeSpanString(orderType, timeSpan, isECD, specialOrderCategories = null) {
  if (!timeSpan || !timeSpan.start) {
    return '';
  }
  const startDateString = getLocaleDateTimeString(timeSpan.start, false);
  const endDateString = getLocaleDateTimeString(timeSpan.end, false);
  if ((timeSpan.start && timeSpan.end && startDateString === endDateString) ||
    ([ORDER_PATTERN_TYPES.REQUEST, ORDER_PATTERN_TYPES.NOTIFICATION, ORDER_PATTERN_TYPES.ECD_NOTIFICATION].includes(orderType)) ||
    (specialOrderCategories && specialOrderCategories.includes(SPECIAL_ORDER_DSP_TAKE_DUTY_SIGN))) {
    return startDateString;
  }
  const startString = `с ${startDateString}`;
  const endString = timeSpan.end ? ` по ${endDateString}` : (!isECD ? ' до отмены' : ' до уведомления');
  return startString + endString;
}
