export const ORDER_PATTERN_TYPES = Object.freeze({
  ORDER: 'распоряжение',
  REQUEST: 'заявка',
  NOTIFICATION: 'уведомление',
  ECD_ORDER: 'приказ',
  ECD_PROHIBITION: 'запрещение',
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

// Типы элементов шаблонов распоряжений, которые не могут использоваться (пока) пользователями для
// создания новых шаблонов. Данные типы элементов используются самим ДУ-58 для формирования распоряжений
// определенных видов.
export const OrderPatternElementType_Future = Object.freeze({
  // данные типы элементов шаблонов распоряжений необходимы лишь при формировании распоряжения ДСП о приеме дежурства
  STRINGS_LIST: 'stringsList',
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
  { field: 'orderNumber', header: '№ п/п', width: '15%' },
  { field: 'station', header: 'Станция', width: '35%' },
  { field: 'arrivalTime', header: 'Время прибытия', width: '25%' },
  { field: 'departureTime', header: 'Время отправления', width: '25%' },
];

export const SPECIAL_TRAIN_CATEGORIES = [
  'ДР', 'Н', 'ПВ', 'ПД', 'ПВПД', 'Т', 'Д', 'ТД', 'ВМ',
];

// отметка особой категории распоряжений о принятии дежурства ДСП
export const SPECIAL_ORDER_DSP_TAKE_DUTY_SIGN = 'ДСП_ПД';
// наименование распоряжения о принятии дежурства ДСП
export const SPECIAL_ORDER_DSP_TAKE_DUTY_TITLE = 'О принятии дежурства';
