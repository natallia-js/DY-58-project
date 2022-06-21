import {
  OrderPatternElementType,
  OrderPatternElementType_Future,
} from '@/constants/orderPatterns';

/**
 * Извлеченное из БД значение элемента черновика шаблона распоряжения
 * (а оно сохраняется в БД "как есть")
 * преобразует в нужный тип данных (в зависимости от типа элемента шаблона) и возвращает его.
 */
function getOrderDraftElementValue(element) {
  if (!element) {
    return null;
  }
  switch (element.type) {
    // Эти данные при записи в БД сериализуются в строку
    case OrderPatternElementType.DATE:
    case OrderPatternElementType.TIME:
    case OrderPatternElementType.DATETIME:
      return element.value ? new Date(element.value) : null;
    case OrderPatternElementType.TIMETIME_OR_TILL_NOTICE:
      if (!element.value)
        return null;
      if (typeof element.value === 'boolean')
        return element.value;
      return new Date(element.value);
    case OrderPatternElementType.MULTIPLE_SELECT:
      return element.value || [];
    case OrderPatternElementType.DR_TRAIN_TABLE:
    case OrderPatternElementType_Future.OBJECT:
    case OrderPatternElementType_Future.OBJECTS_LIST:
      return JSON.parse(element.value);
    default:
      return element.value;
  }
}

export default getOrderDraftElementValue;
