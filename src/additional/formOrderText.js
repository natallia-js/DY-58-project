import {
  getLocaleDateString,
  getLocaleTimeString,
  getLocaleDateTimeString,
} from '@/additional/dateTimeConvertions';
import { CurrShiftGetOrderStatus, ORDERS_RECEIVERS_DEFAULT_POSTS } from '@/constants/orders';
import {
  DRTrainTableColumns,
  OrderPatternElementType,
  OrderPatternElementType_Future,
  SPECIAL_TELECONTROL_ORDER_SIGN,
  SPECIAL_ORDER_DSP_TAKE_DUTY_SIGN,
  SPECIAL_ORDER_SUBPATTERN_TYPES,
} from '@/constants/orderPatterns';
import { upperCaseFirst } from '@/additional/stringFunctions';


/**
 * Строковое значение элемента шаблона созданного ранее распоряжения
 * (а оно именно в виде строки и хранится в БД)
 * преобразует в нужный тип данных (в зависимости от типа элемента шаблона) и возвращает его.
 */
export function getOrderTextElementTypedValue(element/*, parseIfNecessary*/) {
  if (!element) {
    return '';
  }
  switch (element.type) {
    case OrderPatternElementType.DATE:
    case OrderPatternElementType.TIME:
    case OrderPatternElementType.DATETIME:
      return element.value ? new Date(element.value) : '';
    case OrderPatternElementType.TIMETIME_OR_TILL_NOTICE:
      if (!element.value)
        return '';
      // строка element.value может быть как с булевым значением, так и со
      // значением даты-времени
      if (['true','false'].includes(element.value))
        return element.value === 'true' ? true : false;
      return new Date(element.value);
    case OrderPatternElementType.MULTIPLE_SELECT:
      return JSON.parse(element.value) || [];
    case OrderPatternElementType.DR_TRAIN_TABLE:
    case OrderPatternElementType_Future.OBJECT:
    case OrderPatternElementType_Future.OBJECTS_LIST:
      return JSON.parse(element.value);
    default:
      return element.value;
  }
}



// Данная функция позволяет проверить, что отправлять: оригинал или копию.
// Причем в зависимости от того, какой тип входного параметра.
// Тип входного параметра - логический, если информация из БД.
// Если распоряжение не из БД, а только создается, то значение входного параметра
// может быть одним из заданного множества возможных значений.
export const sendOriginal = (dataToCheck) => {
  return (typeof dataToCheck === 'boolean')
    ? dataToCheck
    : (dataToCheck === CurrShiftGetOrderStatus.sendOriginal);
};


/**
 * Позволяет сформировать подстроки, которые войдут в строку "Кому".
 */
const toSubstring = (array, substringFunction, separateRows = false) => {
  if (array.length) {
    const divider = separateRows ? ',<br/>' : ', ';
    return array.reduce((accumulator, currentValue, index) =>
      accumulator + substringFunction(currentValue) + `${index === array.length - 1 ? '' : divider}`, '');
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
 * @param {Boolean} insertEmptyLineBeforeText - если true, то текст документа предваряется пробельной строкой
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
    insertEmptyLineBeforeText = false,
  } = props;

  let orderText = orderTextArray.reduce((prevVal, currVal) => {
    let substring = '';
    switch (currVal.type) {
      case OrderPatternElementType.TEXT:
      case OrderPatternElementType.INPUT:
      case OrderPatternElementType.TEXT_AREA:
      case OrderPatternElementType.SELECT:
      case OrderPatternElementType.MULTIPLE_SELECT:
      case OrderPatternElementType.CHECKBOX_AND_INPUT_OR_NOTHING:
        substring = currVal.value || '';
        break;
      case OrderPatternElementType.DATE:
        substring = getLocaleDateString(currVal.value);
        break;
      case OrderPatternElementType.TIME:
        substring = getLocaleTimeString(currVal.value);
        break;
      case OrderPatternElementType.TIMETIME_OR_TILL_NOTICE:
        if (!currVal.value)
          substring = '';
        else if (currVal.value instanceof Date)
          substring = getLocaleTimeString(currVal.value);
        else
          substring = 'уведомления';
        break;
      case OrderPatternElementType.DATETIME:
        substring = getLocaleDateTimeString(currVal.value, false);
        break;
      case OrderPatternElementType.DR_TRAIN_TABLE:
        substring = '<div><table style="width:100%;text-align:left;border-collapse:collapse;"><thead><tr>';
        DRTrainTableColumns.forEach((column) => {
          substring += `<th style="width:${column.width};border:1px solid grey;padding:0 2px;">${column.header}</th>`;
        });
        substring += '</tr></thead><tbody>';
        if (currVal.value instanceof Array) {
          currVal.value.forEach((row, index) => {
            substring += '<tr>';
            DRTrainTableColumns.forEach((column) => {
              if (column.field === 'orderNumber') {
                substring += `<td style="border:1px solid grey;padding:0 2px;">${index + 1}</td>`;
              } else {
                substring += `<td style="border:1px solid grey;padding:0 2px;">${row[column.field] || ''}</td>`;
              }
            });
            substring += '</tr>';
          });
        }
        substring += '</tbody></table></div>';
        break;
      case OrderPatternElementType.LINEBREAK:
        substring = '<br/>';
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
      const post = obj.post ? obj.post : (!obj.fio && defPost) ? defPost : '';
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

  const emptyLineBeforeText = insertEmptyLineBeforeText ? '<p style="line-height:50%"><br/></p>' : '';
  const finalOrderTextString = `${emptyLineBeforeText}<div style="text-align:justify;font-weight:bold">${orderText}</div>`;

  if (asString) {
    let addresses = originalToString ? `Кому: ${originalToString}<br/>` : '';
    if (copyToString) {
      addresses += `Копия: ${copyToString}<br/>`;
    }
    return `${addresses}${finalOrderTextString}`;
  }

  return {
    text: finalOrderTextString,
    toWhom: originalToString || '',
    toWhomCopy: copyToString ? `Копия: ${copyToString}` : '',
  };
}


/**
 * Формирует и возвращает строку с должностями и ФИО лиц, которые получили и подтвердили
 * распоряжение. Рассматривается подтверждение как оригиналов, так и копий распоряжения.
 * Напротив каждой ФИО указывается дата подтверждения.
 * Если информации о ФИО нет, то указывается место, где распоряжение принято (место, куда оно направлялось).
 * Данные по станциям группируются, т.е. для каждой записи из dspToSend ищутся соответствующие записи в
 * stationWorkPlacesToSend и отображаются все рядом.
 * @param {Array} dncToSend - массив объектов - ДНЦ, которым отправлялось распоряжение
 * @param {Array} dspToSend - массив объектов - ДСП, которым отправлялось распоряжение
 * @param {Array} ecdToSend - массив объектов - ЭЦД, которым отправлялось распоряжение
 * @param {Array} otherToSend - массив объектов - иные лица, которым отправлялось распоряжение
 * @param {Array} stationWorkPlacesToSend - массив объектов - работники станций (ДСП + Операторы при ДСП)
 * @param {Boolean} isTYOrder - если true, то в итоговой строке необходима особая отметка по телеуправлению
 */
export function formAcceptorsStrings(props) {
  const { dncToSend, dspToSend, ecdToSend, otherToSend, stationWorkPlacesToSend, isTYOrder } = props;

  let originalToString = '';
  let copyToString = '';

  const formAcceptorStrings = (array, substringFunction) => {
    const to = toSubstring(array.filter((el) => sendOriginal(el.sendOriginal) && el.confirmDateTime), substringFunction, true);
    if (to.length) {
      originalToString += !originalToString ? to : `,<br/>${to}`;
    }
    const copyTo = toSubstring(array.filter((el) => !sendOriginal(el.sendOriginal) && el.confirmDateTime), substringFunction, true);
    if (copyTo.length) {
      copyToString += !copyToString ? copyTo : `,<br/>${copyTo}`;
    }
  };

  const formSubstring = (defPost) => {
    return (obj) => {
      const post = obj.post ? obj.post : (!obj.fio && defPost) ? defPost : '';
      const fioOrPlace = obj.fio || obj.placeTitle;
      const img = require('@/assets/img/telephone.png');
      const imgString = `<img src=${img} alt="*" style="width:1.2rem;height:auto" />`;
      return `${obj.confirmForPostFIO ? imgString : ''} ${post}${fioOrPlace ? ' ' + fioOrPlace : ''} (${getLocaleDateTimeString(obj.confirmDateTime, false)})`;
    };
  };

  if (dncToSend && dncToSend.length) {
    formAcceptorStrings(dncToSend, formSubstring(ORDERS_RECEIVERS_DEFAULT_POSTS.DNC));
  }

  // По станциям ситуация такова: адресаты здесь не только те ДСП, которых указывают при создании документа, но и
  // работники всех рабочих мест станций, которым адресуется документ (Операторы при ДСП). Поэтому логика такова:
  // объединяем оба массива, сортируем по id станции (чтобы данные по одной станции были рядом); если один из
  // массивов пуст, то используем другой для формирования результирующей подстроки.
  const stationsReceivers = (dspToSend && stationWorkPlacesToSend)
    ? dspToSend.concat(stationWorkPlacesToSend)
    : dspToSend || stationWorkPlacesToSend || [];
  stationsReceivers.sort((a, b) => a.id - b.id);
  if (stationsReceivers.length) {
    formAcceptorStrings(stationsReceivers, formSubstring(ORDERS_RECEIVERS_DEFAULT_POSTS.DSP));
  }

  if (ecdToSend && ecdToSend.length) {
    formAcceptorStrings(ecdToSend, formSubstring(ORDERS_RECEIVERS_DEFAULT_POSTS.ECD));
  }

  if (otherToSend && otherToSend.length) {
    formAcceptorStrings(otherToSend, formSubstring(null));
  }

  let res = isTYOrder ? SPECIAL_TELECONTROL_ORDER_SIGN : '';
  if (originalToString.length > 0) {
    if (res.length > 0) {
      res += '<br/>';
    }
    res += originalToString;
  }
  if (copyToString.length > 0) {
    if (res.length > 0) {
      res += '<br/>';
    }
    res += `Копия:<br/>${copyToString}`;
  }
  return res;
}


/**
 * Позволяет получить "расширенное" наименование распоряжения в виде: <Тип распоряжения>. <Наименование распоряжения>
 */
export function getExtendedOrderTitle(order) {
  if (!order || !order.orderText || !order.type) {
    return '';
  }
  return order.specialTrainCategories?.includes(SPECIAL_ORDER_DSP_TAKE_DUTY_SIGN) ?
  `${upperCaseFirst(SPECIAL_ORDER_SUBPATTERN_TYPES.RECORD)}. ${order.orderText.orderTitle}` :
  `${upperCaseFirst(order.type)}. ${order.orderText.orderTitle}`;
}
