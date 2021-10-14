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
        substring = currVal.value ? currVal.value : '';
        break;
      case OrderPatternElementType.SELECT:
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
        break;
      case OrderPatternElementType.LINEBREAK:
        substring = '<br />';
        break;
    }
    return prevVal + ' ' + substring;
  }, '');

  let originalToString = '';
  let copyToString = '';

  const toSubstring = (array, substringFunction) => {
    if (array.length) {
      return array.reduce((accumulator, currentValue, index) =>
        accumulator + substringFunction(currentValue) + `${index === array.length - 1 ? '' : ', '}`, '');
    }
    return '';
  };

  const formToStrings = (array, substringFunction) => {
    let to = toSubstring(array.filter((el) => el.sendOriginal), substringFunction);
    originalToString += !originalToString ? to : `, ${to}`;
    to = toSubstring(array.filter((el) => !el.sendOriginal), substringFunction);
    copyToString += !copyToString ? to : `, ${to}`;
  };

  if (dncToSend && dncToSend.length) {
    const substring = (obj) => {
      return `${obj.placeTitle} ДНЦ${obj.fio ? ' ' + obj.fio : ''}`;
    };
    formToStrings(dncToSend, substring);
  }

  if (dspToSend && dspToSend.length) {
    const substring = (obj) => {
      return `${obj.placeTitle} ДСП${obj.fio ? ' ' + obj.fio : ''}`;
    };
    formToStrings(dspToSend, substring);
  }

  if (ecdToSend && ecdToSend.length) {
    const substring = (obj) => {
      return `${obj.placeTitle} ЭЦД${obj.fio ? ' ' + obj.fio : ''}`;
    };
    formToStrings(ecdToSend, substring);
  }

  if (otherToSend && otherToSend.length) {
    const substring = (obj) => {
      return `${obj.placeTitle} ${obj.post}${!obj.fio ? '' : ' ' + obj.fio}`;
    };
    formToStrings(otherToSend, substring);
  }

  if (originalToString) {
    orderText += '<br /><b>Кому:</b> ' + originalToString;
  }
  if (copyToString) {
    orderText += '<br /><b>Копия:</b> ' + copyToString;
  }

  return orderText;
}

