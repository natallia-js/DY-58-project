export const APP_CODE_NAME = 'DY-58';

export const APP_CREDENTIALS = Object.freeze({
  DNC_FULL: 'DNC_FULL',
  DSP_FULL: 'DSP_FULL',
  DSP_Operator: 'DSP_Operator',
  ECD_FULL: 'ECD_FULL',
  REVISOR: 'REVISOR',
});

export const APP_CREDENTIALS_TRANSLATIONS = Object.freeze({
  [APP_CREDENTIALS.DNC_FULL]: 'ДНЦ',
  [APP_CREDENTIALS.DSP_FULL]: 'ДСП',
  [APP_CREDENTIALS.DSP_Operator]: 'Оператор ДСП',
  [APP_CREDENTIALS.ECD_FULL]: 'ЭЦД',
  [APP_CREDENTIALS.REVISOR]: 'Ревизор',
});

export const USER_CREDENTIALS_LOCAL_STORAGE_NAME = 'dy58-user';

export const WORK_POLIGON_TYPES = Object.freeze({
  STATION: 'станция',
  DNC_SECTOR: 'участок ДНЦ',
  ECD_SECTOR: 'участок ЭЦД',
});
