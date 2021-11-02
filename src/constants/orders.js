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

export const ReceiversPosts = Object.freeze({
  DNC: 'ДНЦ',
  DSP: 'ДСП',
  ECD: 'ЭЦД',
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

export const FILLED_ORDER_DROPDOWN_ELEMENTS = Object.freeze({
  ORDER_NUMBER: 'Номер действующего распоряжения',
  REQUEST_NUMBER: 'Номер действующей заявки',
  NOTIFICATION_NUMBER: 'Номер действующего уведомления',
  ECD_ORDER_NUMBER: 'Номер действующего распоряжения/запрещения',
  BLOCK: 'Перегон',
  DPT_STATION_BLOCK: 'Перегон станции отправления',
  BLOCK_TRACK: 'Путь перегона',
  STATION_TRACK: 'Путь станции',
  DPT_STATION_TRACK: 'Путь станции отправления',
  ARR_STATION_TRACK: 'Путь станции прибытия',
  STATION: 'Станция',
  DPT_STATION: 'Станция отправления',
  ARR_STATION: 'Станция прибытия',
});
