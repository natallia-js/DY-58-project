export const CurrSectorsShiftTblColumnNames = Object.freeze({
  sector: 'sector',
  fio: 'fio',
  notification: 'notification',
});

export const CurrSectorsShiftTblColumns = [
  { field: CurrSectorsShiftTblColumnNames.sector, title: 'Участок', width: '30%', },
  { field: CurrSectorsShiftTblColumnNames.fio, title: 'ФИО', width: '30%', },
  { field: CurrSectorsShiftTblColumnNames.notification, title: 'Уведомление', width: '200px', },
];

export const CurrStationsShiftTblColumnNames = Object.freeze({
  sector: 'sector',
  station: 'station',
  post: 'post',
  fio: 'fio',
  notification: 'notification',
});

export const CurrStationsShiftTblColumns = [
  { field: CurrStationsShiftTblColumnNames.station, title: 'Станция', width: '30%', },
  { field: CurrStationsShiftTblColumnNames.post, title: 'Должность', width: '15%', },
  { field: CurrStationsShiftTblColumnNames.fio, title: 'ФИО', width: '30%', },
  { field: CurrStationsShiftTblColumnNames.notification, title: 'Уведомление', width: '200px', },
];

export const OtherShiftTblColumnNames = Object.freeze({
  placeTitle: 'placeTitle',
  post: 'post',
  fio: 'fio',
  notification: 'notification',
});

export const OtherShiftTblColumns = [
  { field: OtherShiftTblColumnNames.placeTitle, title: 'Место', width: '25%', },
  { field: OtherShiftTblColumnNames.post, title: 'Должность', width: '25%', },
  { field: OtherShiftTblColumnNames.fio, title: 'ФИО', width: '25%', },
  { field: OtherShiftTblColumnNames.notification, title: 'Уведомление', width: '200px', },
];
