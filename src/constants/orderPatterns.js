export const DateFormat = 'DD.MM.YYYY';

export const ORDER_PATTERN_TYPES = Object.freeze({
  ORDER: 'распоряжение',
  REQUEST: 'заявка',
  NOTIFICATION: 'уведомление',
});

export const OrderPatternsNodeType = Object.freeze({
  SERVICE: 'service',
  ORDER_TYPE: 'orderType',
  ORDER_CATEGORY: 'orderCategory',
  ORDER_PATTERN: 'orderPattern',
});

export const ElementSizesCorrespondence = Object.freeze({
  SMALL: '5rem',
  MEDIUM: '10rem',
  LARGE: '15rem',
  AUTO: 'auto',
});

export const OrderPatternElementType = Object.freeze({
  TEXT: 'text',
  INPUT: 'input',
  SELECT: 'select',
  DATE: 'date',
  TIME: 'time',
  DATETIME: 'datetime',
  LINEBREAK: 'linebreak',
});

export const OrderPatternElementTypeNames = Object.freeze({
  TEXT: 'Текст',
  INPUT: 'Поле ввода',
  SELECT: 'Выпадающий список',
  DATE: 'Дата',
  TIME: 'Время',
  DATETIME: 'Дата-время',
  LINEBREAK: 'Перенос строки',
});

export const PossibleElementSizes = Object.freeze({
  SMALL: 'SMALL',
  MEDIUM: 'MEDIUM',
  LARGE: 'LARGE',
  AUTO: 'AUTO',
});
