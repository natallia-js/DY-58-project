export const APP_CODE_NAME = 'DY-58';
export const DY58_CREDENTIALS_GROUP_NAME = 'DY-58';

export const LOCAL_STORAGE_KEY = 'dy58-user';

export const APP_CREDENTIALS = Object.freeze({
  DNC_FULL: 'DNC_FULL',
  DSP_FULL: 'DSP_FULL',
  DSP_Operator: 'DSP_Operator',
  ECD_FULL: 'ECD_FULL',
  REVISOR: 'REVISOR',
  STATION_WORKS_MANAGER: 'STATION_WORKS_MANAGER',
  VIEWER: 'VIEWER',
});

export const APP_CREDENTIALS_TRANSLATIONS = Object.freeze({
  [APP_CREDENTIALS.DNC_FULL]: 'ДНЦ',
  [APP_CREDENTIALS.DSP_FULL]: 'Ответственный на станции за ДУ-58',
  [APP_CREDENTIALS.DSP_Operator]: 'Дополнительный пользователь на станции',
  [APP_CREDENTIALS.ECD_FULL]: 'ЭЦД',
  [APP_CREDENTIALS.REVISOR]: 'Ревизор',
  [APP_CREDENTIALS.STATION_WORKS_MANAGER]: 'Руководитель работ',
  [APP_CREDENTIALS.VIEWER]: 'Пользователь с правом просмотра информации',
});

export const WORK_POLIGON_TYPES = Object.freeze({
  STATION: 'станция',
  DNC_SECTOR: 'участок ДНЦ',
  ECD_SECTOR: 'участок ЭЦД',
});

export const STATION_WORKPLACE_TYPES = Object.freeze({
  OPERATOR: 'o',
  WORKS_MANAGER: 'w',
});
