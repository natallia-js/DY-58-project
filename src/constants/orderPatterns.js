export const ORDER_PATTERN_TYPES = Object.freeze({
  ORDER: 'распоряжение',
  REQUEST: 'заявка',
  NOTIFICATION: 'уведомление',
  ECD_ORDER: 'распоряжение/запрещение',
  ECD_NOTIFICATION: 'уведомление/отмена запрещения',
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
  DR_TRAIN_TABLE: 'drTrainTable',
  LINEBREAK: 'linebreak',
});

export const OrderPatternElementTypeNames = Object.freeze({
  TEXT: 'Текст',
  INPUT: 'Поле ввода',
  SELECT: 'Выпадающий список',
  DATE: 'Дата',
  TIME: 'Время',
  DATETIME: 'Дата-время',
  DR_TRAIN_TABLE: 'Таблица "Поезд ДР"',
  LINEBREAK: 'Перенос строки',
});

export const PossibleElementSizes = Object.freeze({
  SMALL: 'SMALL',
  MEDIUM: 'MEDIUM',
  LARGE: 'LARGE',
  AUTO: 'AUTO',
});

export const DRTrainTableColumns = [
  { field: 'OrderNumber', header: '№ п/п' },
  { field: 'Station', header: 'Станция' },
  { field: 'DepartureTime', header: 'Время отправления' },
  { field: 'ArrivalTime', header: 'Время прибытия' },
];
