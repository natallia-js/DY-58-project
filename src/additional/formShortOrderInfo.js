import { OrderPatternElementType } from '@/constants/orderPatterns';
import {
  FILLED_ORDER_INPUT_ELEMENTS,
  FILLED_ORDER_DROPDOWN_ELEMENTS,
  FILLED_ORDER_SELECT_MULTIPLE_ELEMENTS,
} from '@/constants/orders';

function elementValueIsNotEmpty(value) {
  return value && (
         (typeof value === 'string' && value !== '') ||
         (value instanceof Array && value.length > 0)
  );
}

/**
 * Позволяет сформировать краткую информацию о документе (информация извлекается из текста
 * документа, изданного по шаблону).
 *   Для ДНЦ краткая информация предсталяется в виде строк, разделенных пробелами, где
 * каждая отдельная строка - значение одного из параметров, соответствующих элементу "выпадающий список"
 * со смысловым значением «Станция» / «Перегон».
 *   Для ЭЦД краткая информация предсталяется в виде строк, разделенных пробелами, где
 * каждая отдельная строка - значение одного из параметров, соответствующих элементу "выпадающий список"
 * со смысловым значением «Станция» / «Перегон» / «Наряд-допуск/заявка», либо элементу "поле ввода" со
 * смысловым значением «Номер*» / "Путь".
 * В строке с краткой информацией о документе должны присутствовать все установленные (не пустые)
 * значения указанных выше параметров.
 * Дополнительно к указанной выше информации для ЭЦД указывается информация об "иных" адресатах. А именно:
 * место, куда отправлен документ.
 */
export function formShortOrderInfo(orderTextArray, isDNC, isECD, otherToSend) {
  if (!orderTextArray?.length || (!isDNC && !isECD))
    return '';

  const additionalInfoArray = [];
  orderTextArray.forEach((el) => {
    if (!elementValueIsNotEmpty(el.value))
      return;
    switch (el.type) {
      case OrderPatternElementType.INPUT:
        if (el.ref === FILLED_ORDER_INPUT_ELEMENTS.SPECIAL_NUMBER_REF) {
          additionalInfoArray.push(el.value);
        }
        if (el.ref === FILLED_ORDER_INPUT_ELEMENTS.TRACK && el.value) {
          additionalInfoArray.push('Путь ' + el.value);
        }
        break;
      case OrderPatternElementType.SELECT:
        if ([FILLED_ORDER_DROPDOWN_ELEMENTS.STATION, FILLED_ORDER_DROPDOWN_ELEMENTS.BLOCK,
             FILLED_ORDER_DROPDOWN_ELEMENTS.NARYAD_DOPUSK_REQUEST_REF].includes(el.ref) && el.value) {
          additionalInfoArray.push(el.value);
        }
        break;
      case OrderPatternElementType.MULTIPLE_SELECT:
        if ([FILLED_ORDER_SELECT_MULTIPLE_ELEMENTS.STATION, FILLED_ORDER_SELECT_MULTIPLE_ELEMENTS.BLOCK].includes(el.ref)
             && el.value) {
          additionalInfoArray.push(el.value);
        }
        break;
    }
  });

  if (otherToSend?.length) {
    additionalInfoArray.push(otherToSend.map(val => val.placeTitle).join(', '));
  }

  return additionalInfoArray.join(' / ');
}
