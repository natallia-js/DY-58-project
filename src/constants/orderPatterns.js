export const ORDER_PATTERN_TYPES = Object.freeze({
  ORDER: 'распоряжение',
  REQUEST: 'заявка',
  NOTIFICATION: 'уведомление',
  ECD_ORDER: 'приказ',
  ECD_PROHIBITION: 'запрещение',
  ECD_NOTIFICATION: 'уведомление/отмена запрещения',
  CONTROL: 'контроль',
});

// У ЭЦД в журнале присутствует сквозная нумерация распоряжений (т.е. нет нумерации распоряжений по типам).
// С этой целью для хранения номера последнего изданного распоряжения используется этот "тип документа".
export const ALL_ORDERS_TYPE_ECD = 'all';

export const SPECIAL_ORDER_SUBPATTERN_TYPES = Object.freeze({
  RECORD: 'запись',
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
  TEXT_AREA: 'textArea',
  SELECT: 'select',
  MULTIPLE_SELECT: 'multipleSelect',
  DATE: 'date',
  TIME: 'time',
  TIMETIME_OR_TILL_NOTICE: 'timeOrTillNotice',
  CHECKBOX_AND_INPUT_OR_NOTHING: 'checkboxAndInputOrNothing',
  CHECKBOX: 'checkbox',
  DATETIME: 'datetime',
  DR_TRAIN_TABLE: 'drTrainTable',
  LINEBREAK: 'linebreak',
});

// Типы элементов шаблонов распоряжений, которые не могут использоваться (пока) пользователями для
// создания новых шаблонов. Данные типы элементов используются самим ДУ-58 для формирования распоряжений
// определенных видов.
export const OrderPatternElementType_Future = Object.freeze({
  // данные типы элементов шаблонов распоряжений необходимы лишь при формировании распоряжения ДСП о приеме дежурства
  OBJECT: 'object',
  OBJECTS_LIST: 'objectsList',
});

export const OrderPatternElementTypeNames = Object.freeze({
  TEXT: 'Текст',
  INPUT: 'Поле ввода',
  TEXT_AREA: 'Текстовая область',
  SELECT: 'Нередактируемый список одиночного выбора',
  MULTIPLE_SELECT: 'Редактируемый список множественного выбора',
  DATE: 'Дата',
  TIME: 'Время',
  TIMETIME_OR_TILL_NOTICE: 'Время / до уведомления',
  CHECKBOX_AND_INPUT_OR_NOTHING: 'Выдано запрещение ДСП',
  CHECKBOX: 'Выдано запрещение ДСП',
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
  { field: 'station', header: 'Станция', width: '50%' },
  { field: 'arrivalTime', header: 'Время прибытия', width: '25%' },
  { field: 'departureTime', header: 'Время отправления', width: '25%' },
];

// отметка особой категории распоряжений ЭЦД об отключении/включении коммутационного аппарата по телеуправлению
export const SPECIAL_TELECONTROL_ORDER_SIGN = 'ТУ';

// отметка особой категории распоряжений ДНЦ о закрытии перегона
export const SPECIAL_CLOSE_BLOCK_ORDER_SIGN = 'ЗП';
// отметка особой категории распоряжений ДНЦ об открытии перегона
export const SPECIAL_OPEN_BLOCK_ORDER_SIGN = 'ОП';

// отметка особой категории распоряжений ДНЦ/ЭЦД "Циркулярное распоряжение"
export const SPECIAL_CIRCULAR_ORDER_SIGN = 'ЦР';

// отметка особой категории распоряжений ДНЦ о поезде, идущем ДР (диспетчерским расписанием)
export const SPECIAL_DR_ORDER_SIGN = 'ДР';

// отметка особой категории распоряжений ДНЦ о поезде со взрывчатыми материалами
export const SPECIAL_VM_ORDER_SIGN = 'ВМ';
// отметка особой категории распоряжений ДНЦ о негабаритном поезде
export const SPECIAL_N_ORDER_SIGN = 'Н';
// отметка особой категории распоряжений ДНЦ о поезде повышенного веса
export const SPECIAL_PV_ORDER_SIGN = 'ПВ';
// отметка особой категории распоряжений ДНЦ о поезде повышенной длины
export const SPECIAL_PD_ORDER_SIGN = 'ПД';
// отметка особой категории распоряжений ДНЦ о поезде повышенного веса и повышенной длины
export const SPECIAL_PVPD_ORDER_SIGN = 'ПВПД';
//
export const SPECIAL_SP_ORDER_SIGN = 'СП';
// отметка особой категории приказов ЭЦД об отключении/включении коммутационного аппарата по телеуправлению
export const SPECIAL_TY_ORDER_SIGN = 'ТУ';


// Поначалу данное поле нужно было для обозначения особых категорий поездов, к которым
// имеет отношение распоряжение. Но в дальнейшем значение данного поля стало шире, и
// теперь оно применяется для проставления отметок об особых видах распоряжений.
// Все отметки, кроме ТУ, ЗП, ОП, ЦР, имеют отношение к поездам.
export const SPECIAL_TRAIN_CATEGORIES = [
  SPECIAL_VM_ORDER_SIGN,
  'Д',
  SPECIAL_DR_ORDER_SIGN,
  SPECIAL_CLOSE_BLOCK_ORDER_SIGN,
  SPECIAL_N_ORDER_SIGN,
  SPECIAL_OPEN_BLOCK_ORDER_SIGN,
  SPECIAL_PV_ORDER_SIGN,
  SPECIAL_PVPD_ORDER_SIGN,
  SPECIAL_PD_ORDER_SIGN,
  SPECIAL_SP_ORDER_SIGN,
  'Т',
  'ТД',
  SPECIAL_TELECONTROL_ORDER_SIGN,
  SPECIAL_CIRCULAR_ORDER_SIGN,
];

// отметка особой категории распоряжений о принятии дежурства ДСП
export const SPECIAL_ORDER_DSP_TAKE_DUTY_SIGN = 'ДСП_ПД';
// наименование распоряжения о принятии дежурства ДСП
export const SPECIAL_ORDER_DSP_TAKE_DUTY_TITLE = 'О приеме/сдаче дежурства';
// наименование записи ревизора в Журналах
export const SPECIAL_REVISOR_RECORD_TITLE = 'О проверке';
