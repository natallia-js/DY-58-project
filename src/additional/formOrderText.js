import { OrderPatternElementType } from '../constants/orderPatterns';
import {
  getLocaleDateString,
  getLocaleTimeString,
  getLocaleDateTimeString,
} from './dateTimeConvertions';

/**
 * Позволяет на основании массива объектов элементов текста распоряжения сформировать
 * строку, содержащую текст распоряжения.
 *
 * @param {Array} orderTextArray - массив объектов - элементов текста распоряжения
 * @returns - строку с текстом распоряжения
 */
export function formOrderText(orderTextArray) {
  return orderTextArray.reduce((prevVal, currVal) => {
    let substring = '';
    switch (currVal.type) {
      case OrderPatternElementType.TEXT:
      case OrderPatternElementType.INPUT:
        substring = currVal.value;
        break;
      case OrderPatternElementType.SELECT:
        break;
      case OrderPatternElementType.DATE:
        substring = getLocaleDateString(new Date(currVal.value));
        break;
      case OrderPatternElementType.TIME:
        substring = getLocaleTimeString(new Date(currVal.value));
        break;
      case OrderPatternElementType.DATETIME:
        substring = getLocaleDateTimeString(new Date(currVal.value), false);
        break;
      case OrderPatternElementType.DR_TRAIN_TABLE:
        break;
      case OrderPatternElementType.LINEBREAK:
        substring = '<br />';
        break;
    }
    return prevVal + ' ' + substring;
  }, '');
}

