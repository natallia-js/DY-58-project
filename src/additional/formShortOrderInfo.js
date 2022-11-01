import { OrderPatternElementType } from '@/constants/orderPatterns';

/**
 * Позволяет сформировать краткую информацию о распоряжении (информация извлекается из текста
 * документа, изданного по шаблону).
 *   Для ДНЦ краткая информация предсталяется в виде строк, разделенных пробелами, где
 * каждая отдельная строка - значение одного из параметров, соответствующих элементу "выпадающий список"
 * со смысловым значением «Станция» / «Перегон».
 *   Для ЭЦД краткая информация предсталяется в виде строк, разделенных пробелами, где
 * каждая отдельная строка - значение одного из параметров, соответствующих элементу "выпадающий список"
 * со смысловым значением «Станция» / «Перегон» / «Наряд-допуск/заявка», либо элементу "поле ввода" со
 * смысловым значением «Номер*».
 * В строке с краткой информацией о распоряжении должны присутствовать все установленные (не пустые)
 * значения указанных выше параметров.
 * Дополнительно к указанной выше информации для ЭЦД указывается информация об "иных" адресатах. А именно:
 * место, куда отправлено распоряжение (документ).
 */

const STATION_ELEMENT_REF = 'Станция';
const SPAN_ELEMENT_REF = 'Перегон';
const NARYAD_DOPUSK_REQUEST_REF = 'Наряд-допуск/заявка';
const SPECIAL_NUMBER_REF = 'Номер*';

export function formShortOrderInfo(orderTextArray, isDNC, isECD, otherToSend) {
  if (!orderTextArray?.length || (!isDNC && !isECD))
    return '';

  let resultString = orderTextArray.reduce((prevVal, currVal) => {
    let substring = '';
    switch (currVal.type) {
      case OrderPatternElementType.INPUT:
        if (currVal.ref === SPECIAL_NUMBER_REF && currVal.value) {
          substring = currVal.value;
        }
        break;
      case OrderPatternElementType.SELECT:
        if ([STATION_ELEMENT_REF, SPAN_ELEMENT_REF, NARYAD_DOPUSK_REQUEST_REF].includes(currVal.ref) && currVal.value) {
          substring = currVal.value;
        }
        break;
      case OrderPatternElementType.MULTIPLE_SELECT:
        if ([STATION_ELEMENT_REF, SPAN_ELEMENT_REF].includes(currVal.ref) && currVal.value) {
          substring = currVal.value;
        }
        break;
    }
    return prevVal + ' ' + substring;
  }, '');

  if (otherToSend?.length) {
    resultString += otherToSend.map(val => val.placeTitle).join(', ');
  }

  return resultString;
}
