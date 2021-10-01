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
 * Позволяет для данного объекта Date получить его строковое представление в формате dd.mm.yyyy hh:mm
 * либо формате dd.mm.yyyy hh:mm:ss.
 *
 * @param {Date} date - объект Date для отображения в виде строки
 * @param {boolean} showSeconds - true - показывать секунды, false - не показывать
 * @param {boolean} diffrLines - true - отображать дату и время на разных строках, false - отображать на одной строке
 * @returns строковое представление заданного объекта Date
 */
export function getLocaleDateTimeString(date, showSeconds, diffrLines) {
  if (date instanceof Date) {
    const rn = diffrLines ? '\r\n' : ' ';
    const timeFormattingObject = { hour: 'numeric', minute: 'numeric' };
    if (showSeconds) {
      timeFormattingObject.second = 'numeric';
    }
    return `${date.toLocaleDateString('ru', { day: 'numeric', month: 'numeric', year: 'numeric' })}${rn}` +
           `${date.toLocaleTimeString('ru', timeFormattingObject)}`;
  }
  return '';
}

/**
 * Позволяет для данного объекта timeSpan получить его строковое представление.
 *
 * @param {Object} timeSpan - объект с полями start, end, tillCancellation
 * @returns строковое представление объекта timeSpan
 */
export function getTimeSpanString(timeSpan) {
  if (!timeSpan || !timeSpan.start) {
    return '';
  }
  const startString = `с ${getLocaleDateTimeString(new Date(timeSpan.start), false)}`;
  const endString = timeSpan.end ? ` по ${getLocaleDateTimeString(new Date(timeSpan.end), false)}` : ' до отмены';
  return startString + endString;
}
