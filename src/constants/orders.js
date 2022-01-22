export const CurrShiftGetOrderStatus = Object.freeze({
  sendOriginal: 0,
  sendCopy: 1,
  doNotSend: 2,
});

// 5 минут
export const RECENTLY = 300000;

export const WorkMessStates = Object.freeze({
  cameRecently: 0,
  cameLongAgo: 1,
});

export const ORDER_TEXT_SOURCE = Object.freeze({
  pattern: 'pattern',
  nopattern: 'nopattern',
});

export const ORDER_PLACE_VALUES = Object.freeze({
  station: 'station',
  span: 'span',
});

// Смысловые значения элементов шаблонов распоряжений, которые разрешается не заполнять при издании распоряжения
export const ORDER_ELEMENTS_CAN_BE_EMPTY = [
  'Примечание',
];

export const FILLED_ORDER_DATE_ELEMENTS = Object.freeze({
  ORDER_DATE: 'Дата издания действующего распоряжения',
  REQUEST_DATE: 'Дата издания действующей заявки',
  NOTIFICATION_DATE: 'Дата издания действующего уведомления',
  ECD_ORDER_DATE: 'Дата издания действующего приказа',
  ECD_PROHIBITION_DATE: 'Дата издания действующего запрещения',
});

export const FILLED_ORDER_DATETIME_ELEMENTS = Object.freeze({
  ORDER_DATETIME: 'Дата-время издания действующего распоряжения',
  REQUEST_DATETIME: 'Дата-время издания действующей заявки',
  NOTIFICATION_DATETIME: 'Дата-время издания действующего уведомления',
  ECD_ORDER_DATETIME: 'Дата-время издания действующего приказа',
  ECD_PROHIBITION_DATETIME: 'Дата-время издания действующего запрещения',
});

export const FILLED_ORDER_DROPDOWN_ELEMENTS = Object.freeze({
  ORDER_NUMBER: 'Номер действующего распоряжения',
  REQUEST_NUMBER: 'Номер действующей заявки',
  NOTIFICATION_NUMBER: 'Номер действующего уведомления',
  ECD_ORDER_NUMBER: 'Номер действующего приказа',
  ECD_PROHIBITION_NUMBER: 'Номер действующего запрещения',
  BLOCK: 'Перегон',
  DPT_STATION_BLOCK: 'Перегон станции отправления',
  BLOCK_TRACK: 'Путь перегона',
  DPT_STATION_BLOCK_TRACK: 'Путь перегона станции отправления',
  STATION_TRACK: 'Путь станции',
  DPT_STATION_TRACK: 'Путь станции отправления',
  ARR_STATION_TRACK: 'Путь станции прибытия',
  STATION: 'Станция',
  DPT_STATION: 'Станция отправления',
  ARR_STATION: 'Станция прибытия',
});

export const FILLED_ORDER_INPUT_ELEMENTS = Object.freeze({
  NOTE: 'Примечание',
});

export const GID_EVENT_TYPE = Object.freeze({
  ARRIVAL: 1,
  FOLLOWING: 2,
  DEPARURE: 3,
});

export const ORDERS_RECEIVERS_DEFAULT_POSTS = Object.freeze({
  DNC: 'ДНЦ',
  DSP: 'ДСП',
  ECD: 'ЭЦД',
});

// Смысловые значения элементов шаблона распоряжения о принятии дежурства ДСП.
// Данные смысловые значения вынесены отдельно, т.к. их нет в общем списке, и они используются
// исключительно данной программой.
export const DSP_TAKE_ORDER_TEXT_ELEMENTS_REFS =  Object.freeze({
  TAKE_DUTY_FIO: 'ФИО принявшего дежурство',
  TAKE_DUTY_DATETIME: 'Дата-время принятия дежурства',
  PASS_DUTY_FIO: 'ФИО сдавшего дежурство',
  PASS_DUTY_DATETIME: 'Дата-время сдачи дежурства',
  TAKE_DUTY_PERSONAL: 'Персонал, принимающий дежурство',
});
