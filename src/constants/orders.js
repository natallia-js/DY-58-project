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
