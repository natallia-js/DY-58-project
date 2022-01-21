import {
  getLocaleDateString,
  getLocaleTimeString,
  getLocaleDateTimeString,
} from '@/additional/dateTimeConvertions';
import { CurrShiftGetOrderStatus, ORDERS_RECEIVERS_DEFAULT_POSTS } from '@/constants/orders';
import { DRTrainTableColumns } from '@/constants/orderPatterns';
import { OrderPatternElementType } from '@/constants/orderPatterns';


/**
 * Позволяет на основании массива объектов элементов текста распоряжения сформировать
 * строку, содержащую текст распоряжения.
 *
 * @param {Array} orderTextArray - массив объектов - элементов текста распоряжения
 * @param {Array} dncToSend - массив объектов - ДНЦ, которым отправляется распоряжение
 * @param {Array} dspToSend - массив объектов - ДСП, которым отправляется распоряжение
 * @param {Array} ecdToSend - массив объектов - ЭЦД, которым отправляется распоряжение
 * @param {Array} otherToSend - массив объектов - иные лица, которым отправляется распоряжение
 * @returns - строку с текстом распоряжения
 */
export function formOrderText(props) {
  const { orderTextArray, dncToSend, dspToSend, ecdToSend, otherToSend } = props;

  let orderText = orderTextArray.reduce((prevVal, currVal) => {
    let substring = '';
    switch (currVal.type) {
      case OrderPatternElementType.TEXT:
      case OrderPatternElementType.INPUT:
      case OrderPatternElementType.SELECT:
        substring = currVal.value ? currVal.value : '';
        break;
      case OrderPatternElementType.DATE:
        substring = getLocaleDateString(currVal.value);
        break;
      case OrderPatternElementType.TIME:
        substring = getLocaleTimeString(currVal.value);
        break;
      case OrderPatternElementType.DATETIME:
        substring = getLocaleDateTimeString(currVal.value, false);
        break;
      case OrderPatternElementType.DR_TRAIN_TABLE:
        substring = '<div><table style="width:100%;min-width:600px;text-align:left;border-collapse:collapse"><thead><tr>';
        DRTrainTableColumns.forEach((column) => {
          substring += `<th style="width:${column.width};font-weight:400;border:1px solid grey">${column.header}</th>`;
        });
        substring += '</tr></thead><tbody>';
        if (currVal.value instanceof Array) {
          currVal.value.forEach((row, index) => {
            substring += '<tr>';
            DRTrainTableColumns.forEach((column) => {
              if (column.field === 'orderNumber') {
                substring += `<td style="border:1px solid grey">${index + 1}</td>`;
              } else {
                substring += `<td style="border:1px solid grey">${row[column.field] || ''}</td>`;
              }
            });
            substring += '</tr>';
          });
        }
        substring += '</tbody></table></div>';
        break;
      case OrderPatternElementType.LINEBREAK:
        substring = '<br />';
        break;
    }
    return prevVal + ' ' + substring;
  }, '');

  // Строка с информацией о том, кому отправляется оригинал распоряжения
  let originalToString = '';
  // Строка с информацией о том, кому отправляется копия распоряжения
  let copyToString = '';

  const toSubstring = (array, substringFunction) => {
    if (array.length) {
      return array.reduce((accumulator, currentValue, index) =>
        accumulator + substringFunction(currentValue) + `${index === array.length - 1 ? '' : ', '}`, '');
    }
    return '';
  };

  // Данная функция позволяет проверить, что отправлять: оригинал или копию.
  // Причем в зависимости от того, какой тип входного параметра.
  // Тип входного параметра - логический, если информация из БД.
  // Если распоряжение не из БД, а только создается, то значение входного параметра
  // может быть одним из заданного множества возможных значений.
  const sendOriginal = (dataToCheck) => {
    if (typeof dataToCheck === 'boolean') {
      return dataToCheck;
    }
    if (dataToCheck === CurrShiftGetOrderStatus.sendOriginal) {
      return true;
    }
    return false;
  };

  const formToStrings = (array, substringFunction) => {
    let to = toSubstring(array.filter((el) => sendOriginal(el.sendOriginal)), substringFunction);
    if (to.length) {
      originalToString += !originalToString ? to : `, ${to}`;
    }
    to = toSubstring(array.filter((el) => !sendOriginal(el.sendOriginal)), substringFunction);
    if (to.length) {
      copyToString += !copyToString ? to : `, ${to}`;
    }
  };

  const formSubstring = (defPost) => {
    return (obj) => {
      let post;
      if (obj.post) post = ' ' + obj.post;
      else if (!obj.fio && defPost) post = defPost;
      else post = '';
      return `${obj.placeTitle} ${post}${obj.fio ? ' ' + obj.fio : ''}`;
    };
  };

  if (dncToSend && dncToSend.length) {
    formToStrings(dncToSend, formSubstring(ORDERS_RECEIVERS_DEFAULT_POSTS.DNC));
  }

  if (dspToSend && dspToSend.length) {
    formToStrings(dspToSend, formSubstring(ORDERS_RECEIVERS_DEFAULT_POSTS.DSP));
  }

  if (ecdToSend && ecdToSend.length) {
    formToStrings(ecdToSend, formSubstring(ORDERS_RECEIVERS_DEFAULT_POSTS.ECD));
  }

  if (otherToSend && otherToSend.length) {
    formToStrings(otherToSend, formSubstring(null));
  }

  if (originalToString) {
    orderText += '<br /><b>Кому:</b> ' + originalToString;
  }
  if (copyToString) {
    orderText += '<br /><b>Копия:</b> ' + copyToString;
  }

  return orderText;
}

