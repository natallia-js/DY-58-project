import {
  getLocaleDateString,
  getLocaleTimeString,
  getLocaleDateTimeString,
} from '@/additional/dateTimeConvertions';
import { CurrShiftGetOrderStatus, ORDERS_RECEIVERS_DEFAULT_POSTS } from '@/constants/orders';
import { DRTrainTableColumns } from '@/constants/orderPatterns';
import { OrderPatternElementType, OrderPatternElementType_Future } from '@/constants/orderPatterns';


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


const toSubstring = (array, substringFunction) => {
  if (array.length) {
    return array.reduce((accumulator, currentValue, index) =>
      accumulator + substringFunction(currentValue) + `${index === array.length - 1 ? '' : ', '}`, '');
  }
  return '';
};


/**
 * Позволяет на основании массива объектов элементов текста распоряжения сформировать
 * строку, содержащую текст распоряжения.
 *
 * @param {Array} orderTextArray - массив объектов - элементов текста распоряжения
 * @param {Array} dncToSend - массив объектов - ДНЦ, которым отправляется распоряжение
 * @param {Array} dspToSend - массив объектов - ДСП, которым отправляется распоряжение
 * @param {Array} ecdToSend - массив объектов - ЭЦД, которым отправляется распоряжение
 * @param {Array} otherToSend - массив объектов - иные лица, которым отправляется распоряжение
 * @param {Boolean} asString - если true, то функция возвращает html-отформатированную строку,
 *                             если false, то функция возвращает объект с 3 строковыми полями:
 *                             1) text: непосредственно текст распоряжения,
 *                             2) toWhom: строка "Кому" (подстроки с местом, должностью, ФИО через запятую),
 *                             3) toWhomCopy: строка "Копия" (подстроки с местом, должностью, ФИО через запятую)
 * @param {Boolean} includeFIO - если true, то в строки "Кому" и "Копия" включается информация о ФИО адресатов,
 *                               в противном случае не включается
 * @returns - строку с полным текстом распоряжения либо массив отдельных строк, каждая из которых
 *            включает определенную информацию из полного текста распоряжения
 */
export function formOrderText(props) {
  const {
    orderTextArray,
    dncToSend,
    dspToSend,
    ecdToSend,
    otherToSend,
    asString = true,
    includeFIO = true,
  } = props;

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
      case OrderPatternElementType_Future.OBJECT:
        if (currVal.value) {
          substring = currVal.value.value;
        }
        break;
      case OrderPatternElementType_Future.OBJECTS_LIST:
        if (currVal.value instanceof Array) {
          substring = currVal.value.map((el) => el.value).join(', ');
        }
        break;
    }
    return prevVal + ' ' + substring;
  }, '');

  // Строка с информацией о том, кому отправляется оригинал распоряжения
  let originalToString = '';
  // Строка с информацией о том, кому отправляется копия распоряжения
  let copyToString = '';

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
      return `${obj.placeTitle} ${post}${includeFIO && obj.fio ? ' ' + obj.fio : ''}`;
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

  if (asString) {
    if (originalToString) {
      orderText += '<br /><b>Кому:</b> ' + originalToString;
    }
    if (copyToString) {
      orderText += '<br /><b>Копия:</b> ' + copyToString;
    }
    return orderText;
  }

  return {
    text: orderText,
    toWhom: originalToString || '',
    toWhomCopy: copyToString ? `Копия: ${copyToString}` : '',
  };
}


/**
 * Формирует и возвращает строку с должностями и ФИО лиц, которые получили и подтвердили
 * оригинал распоряжения.
 * @param {Array} dncToSend - массив объектов - ДНЦ, которым отправлялось распоряжение
 * @param {Array} dspToSend - массив объектов - ДСП, которым отправлялось распоряжение
 * @param {Array} ecdToSend - массив объектов - ЭЦД, которым отправлялось распоряжение
 * @param {Array} otherToSend - массив объектов - иные лица, которым отправлялось распоряжение
 */
export function formAcceptorsStrings(props) {
  const { dncToSend, dspToSend, ecdToSend, otherToSend } = props;

  let originalToString = '';

  const formAcceptorStrings = (array, substringFunction) => {
    const to = toSubstring(array.filter((el) => sendOriginal(el.sendOriginal) && el.confirmDateTime), substringFunction);
    if (to.length) {
      originalToString += !originalToString ? to : `, ${to}`;
    }
  };

  const formSubstring = (defPost) => {
    return (obj) => {
      let post;
      if (obj.post) post = ' ' + obj.post;
      else if (!obj.fio && defPost) post = defPost;
      else post = '';
      return `${post}${obj.fio ? ' ' + obj.fio : ''}`;
    };
  };

  if (dncToSend && dncToSend.length) {
    formAcceptorStrings(dncToSend, formSubstring(ORDERS_RECEIVERS_DEFAULT_POSTS.DNC));
  }

  if (dspToSend && dspToSend.length) {
    formAcceptorStrings(dspToSend, formSubstring(ORDERS_RECEIVERS_DEFAULT_POSTS.DSP));
  }

  if (ecdToSend && ecdToSend.length) {
    formAcceptorStrings(ecdToSend, formSubstring(ORDERS_RECEIVERS_DEFAULT_POSTS.ECD));
  }

  if (otherToSend && otherToSend.length) {
    formAcceptorStrings(otherToSend, formSubstring(null));
  }

  return originalToString;
}


/**
 * Определяет дату-время утверждения распоряжения.
 * Распоряжение считается утвержденным, если все адресаты его оригинала подтвердили данное распоряжение.
 * При этом дата утверждения - максимальная из всех дат подтверждения.
 * @param {Array} dncToSend - массив объектов - ДНЦ, которым отправлялось распоряжение
 * @param {Array} dspToSend - массив объектов - ДСП, которым отправлялось распоряжение
 * @param {Array} ecdToSend - массив объектов - ЭЦД, которым отправлялось распоряжение
 */
export function getAssertOrderDateTime(props) {
  const { dncToSend, dspToSend, ecdToSend } = props;
  let assertDateTime = null;
  if (dncToSend && dncToSend.length) {
    for (let el of dncToSend) {
      if (sendOriginal(el.sendOriginal) && !el.confirmDateTime) {
        return null;
      }
      if (!assertDateTime || assertDateTime < el.confirmDateTime) {
        assertDateTime = el.confirmDateTime;
      }
    }
  }
  if (dspToSend && dspToSend.length) {
    for (let el of dspToSend) {
      if (sendOriginal(el.sendOriginal) && !el.confirmDateTime) {
        return null;
      }
      if (!assertDateTime || assertDateTime < el.confirmDateTime) {
        assertDateTime = el.confirmDateTime;
      }
    }
  }
  if (ecdToSend && ecdToSend.length) {
    for (let el of ecdToSend) {
      if (sendOriginal(el.sendOriginal) && !el.confirmDateTime) {
        return null;
      }
      if (!assertDateTime || assertDateTime < el.confirmDateTime) {
        assertDateTime = el.confirmDateTime;
      }
    }
  }
  return assertDateTime;
}
