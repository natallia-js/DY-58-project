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

export const FILLED_ORDER_TIME_ELEMENTS = Object.freeze({
  CURR_TIME: 'Текущее время',
});

export const FILLED_ORDER_DATE_ELEMENTS = Object.freeze({
  ORDER_DATE: 'Дата издания действующего распоряжения',
  REQUEST_DATE: 'Дата издания действующей заявки',
  NOTIFICATION_DATE: 'Дата издания действующего уведомления',
  ECD_ORDER_DATE: 'Дата издания действующего приказа',
  ECD_PROHIBITION_DATE: 'Дата издания действующего запрещения',
  CURR_DATE: 'Текущая дата',
});

export const FILLED_ORDER_DATETIME_ELEMENTS = Object.freeze({
  ORDER_DATETIME: 'Дата-время издания действующего распоряжения',
  REQUEST_DATETIME: 'Дата-время издания действующей заявки',
  NOTIFICATION_DATETIME: 'Дата-время издания действующего уведомления',
  ECD_ORDER_DATETIME: 'Дата-время издания действующего приказа',
  ECD_PROHIBITION_DATETIME: 'Дата-время издания действующего запрещения',
  PASS_DUTY_DATETIME: 'Дата-время сдачи дежурства',
  TAKE_DUTY_DATETIME: 'Дата-время принятия дежурства',
  CLOSE_BLOCK_DATETIME: 'Дата-время закрытия перегона',
  OPEN_BLOCK_DATETIME: 'Дата-время открытия перегона',
  CURR_DATETIME: 'Текущее время',
});

export const FILLED_ORDER_INPUT_ELEMENTS = Object.freeze({
  NOTE: 'Примечание',
  WORKS: 'Работы',
  WORK_PLACE: 'Место работ',
  BLOCK_TRACKS: 'Пути перегона',
  WORKS_HEADS: 'Руководители',
  OKNO_DURATION: 'Продолжительность "окна"',
});

export const FILLED_ORDER_DROPDOWN_ELEMENTS = Object.freeze({
  ORDER_NUMBER: 'Номер действующего распоряжения',
  CLOSE_BLOCK_ORDER_NUMBER: 'Номер действующего распоряжения на закрытие перегона',
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
  WORKS_HEADS: 'Руководители',
  STATION: 'Станция',
  DPT_STATION: 'Станция отправления',
  ARR_STATION: 'Станция прибытия',
  SWITCH_OFF_ON: 'Отключить, включить',
  EXACT_PLACE: 'Точное место',
  ACTIONS_ORDER: 'Порядок действий',
  PASS_DUTY: 'Дежурство сдал',
  TAKE_DUTY: 'Дежурство принял',
  WHAT_SHOULD_BE_DONE_FOR_WORK: 'Для работы должно быть',
  WORK_CATEGORIES: 'Категория работ',
  WORK_IF_THERE_ARE: 'Работать при наличии',
});

export const FILLED_ORDER_SELECT_MULTIPLE_ELEMENTS = Object.freeze({
  WORKS_OBJECT: 'Объект работ',
  WORK_DONE_FROM: 'С чего производится работа',
  STATION: 'Станция',
  BLOCK: 'Перегон',
});

export const SWITCH_OFF_ON_ITEMS = [
  'отключить', 'отключены', 'включить', 'включены',
];

export const EXACT_PLACE_ITEMS = [
  'станция', 'подстанция', 'подстанции', 'перегон', 'контактная сеть', 'ВЛ', 'КЛ',
];

export const ACTIONS_ORDER_ITEMS = [
  'вручную', 'дистанционно', 'закрыть привод на замок', 'вывесить запрещающие плакаты',
];

export const WORK_CATEGORIES_ITEMS = [
  'со снятием напряжения', 'под напряжением', 'вблизи частей, находящихся под напряжением', 'вдали от частей, находящихся под напряжением',
];

export const WHAT_SHOULD_BE_DONE_FOR_WORK_ITEMS = [
  'отключено', 'включено', 'выведено',
];

export const WORK_IF_THERE_ARE_ITEMS = [
  'переносных заземлений', 'двух шунтирующих штанг',
];

export const WORKS_OBJECT_ITEMS = [
  'контактной сети', 'ВЛ ДПР', 'ВЛ АБ', 'Волноводе', 'ВЛ освещения', 'КЛ освещения',
];

export const WORK_DONE_FROM_ITEMS = [
  'АДМ', 'лестница', 'лейтер', 'без подъема на высоту', 'лазов', 'вышки МШТС',
];

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
// исключительно данной программой для Записи о приеме/сдаче дежурства ДСП.
export const DSP_TAKE_ORDER_TEXT_ELEMENTS_REFS =  Object.freeze({
  TAKE_DUTY_FIO: 'ФИО принявшего дежурство',
  TAKE_DUTY_DATETIME: 'Дата-время принятия дежурства',
  PASS_DUTY_FIO: 'ФИО сдавшего дежурство',
  PASS_DUTY_DATETIME: 'Дата-время сдачи дежурства',
  TAKE_DUTY_PERSONAL: 'Персонал, принимающий дежурство',
  PASS_DUTY_PERSONAL: 'Персонал, сдающий дежурство',
});
