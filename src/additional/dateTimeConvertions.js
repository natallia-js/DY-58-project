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
 * Позволяет для данного объекта timeSpan получить его строковое представление.
 *
 * @param {Object} timeSpan - объект с полями start, end, tillCancellation
 * @param {boolean} isECD - true (строку необходимо сформировать для ЭЦД) или
 * false (строку необходимо сформировать не для ЭЦД)
 * @returns строковое представление объекта timeSpan
 */
export function getTimeSpanString(timeSpan, isECD) {
  if (!timeSpan || !timeSpan.start) {
    return '';
  }
  if (timeSpan.start && timeSpan.end && getLocaleDateTimeString(timeSpan.start, false) === getLocaleDateTimeString(timeSpan.end, false)) {
    return getLocaleDateTimeString(timeSpan.start, false);
  }
  const startString = `с ${getLocaleDateTimeString(timeSpan.start, false)}`;
  const endString = timeSpan.end ? ` по ${getLocaleDateTimeString(timeSpan.end, false)}` : (!isECD ? ' до отмены' : ' до уведомления');
  return startString + endString;
}
