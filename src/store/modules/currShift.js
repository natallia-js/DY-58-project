export const CurrShiftGetOrderStatus = Object.freeze({
  sendOriginal: 0,
  sendCopy: 1,
  doNotSend: 2,
});

export const CurrShiftTblColumnNames = Object.freeze({
  sector: 'sector',
  station: 'station',
  fio: 'fio',
  post: 'post',
  notification: 'notification',
});

export const CurrShiftTblColumns = [
  { field: CurrShiftTblColumnNames.station, title: 'Станция', width: '20%', },
  { field: CurrShiftTblColumnNames.fio, title: 'ФИО', width: '20%', },
  { field: CurrShiftTblColumnNames.post, title: 'Должн.', width: '10%', },
  { field: CurrShiftTblColumnNames.notification, title: 'Уведомление', width: '200px', },
];


export const currShift = {
  state: {
    shiftPersonal: [],
  },

  getters: {
    getCurrShift: (state) => {
      return state.shiftPersonal;
    },
  },

  mutations: {
    setCurrShift(state, currShift) {
      currShift = [
        { id: 44, station: 'Можеевка', fio: 'Бобер В.Г.', post: 'ДСП', sector: 'Витебск - Орша-Центральная', sendOriginal: CurrShiftGetOrderStatus.sendCopy, },
        { id: 45, station: 'Орша-Центральная', fio: 'Бойко Е.А.', post: 'ДСП', sector: 'Витебск - Орша-Центральная', sendOriginal: CurrShiftGetOrderStatus.doNotSend, },
        { id: 46, station: 'Орша-Западная', fio: 'Аврамчук В.Г.', post: 'ДСП', sector: 'Орша-Центральная - Могилев 1', sendOriginal: CurrShiftGetOrderStatus.sendOriginal, },
        { id: 47, station: 'Червено', fio: 'Богдан И.Д.', post: 'ДСП', sector: 'Орша-Центральная - Могилев 1', sendOriginal: CurrShiftGetOrderStatus.doNotSend, },
        { id: 40, station: 'Витебск', fio: 'Иванов И.И.', post: 'ДСП', sector: 'Витебск - Орша-Центральная', sendOriginal: CurrShiftGetOrderStatus.sendOriginal, },
        { id: 41, station: 'Замосточье', fio: 'Петров П.П.', post: 'ДСП', sector: 'Витебск - Орша-Центральная', sendOriginal: CurrShiftGetOrderStatus.sendCopy, },
        { id: 42, station: 'Богушевская', fio: 'Сидоров С.С.', post: 'ДСП', sector: 'Витебск - Орша-Центральная', sendOriginal: CurrShiftGetOrderStatus.sendOriginal, },
        { id: 43, station: 'Стайки', fio: '', post: '', sector: 'Витебск - Орша-Центральная', sendOriginal: CurrShiftGetOrderStatus.doNotSend, },
        { id: 48, station: 'Прокшино', fio: 'Барсук М.И.', post: 'ДСП', sector: 'Орша-Центральная - Могилев 1', sendOriginal: CurrShiftGetOrderStatus.sendOriginal, },
        { id: 49, station: 'Копысь', fio: 'Буйко А.А.', post: 'ДСП', sector: 'Орша-Центральная - Могилев 1', sendOriginal: CurrShiftGetOrderStatus.sendCopy, },
        { id: 50, station: 'Шклов', fio: 'Белько А.Д.', post: 'ДСП', sector: 'Орша-Центральная - Могилев 1', sendOriginal: CurrShiftGetOrderStatus.sendCopy, },
        { id: 51, station: 'Рыжковичи', fio: 'Белько А.В.', post: 'ДСП', sector: 'Орша-Центральная - Могилев 1', sendOriginal: CurrShiftGetOrderStatus.sendOriginal, },
        { id: 52, station: 'Лотва', fio: 'Бурдан Н.Н.', post: 'ДСП', sector: 'Орша-Центральная - Могилев 1', sendOriginal: CurrShiftGetOrderStatus.doNotSend, },
        { id: 53, station: 'Могилев 1', fio: 'Антоненко А.Д.', post: 'ДСП', sector: 'Орша-Центральная - Могилев 1', sendOriginal: CurrShiftGetOrderStatus.sendOriginal, },
      ];

      state.shiftPersonal = currShift;
    },

    /**
     * Оригинал всем
     */
    originalToAll(state) {
      if (state.shiftPersonal) {
        state.shiftPersonal.forEach(el => el.sendOriginal = CurrShiftGetOrderStatus.sendOriginal);
      }
    },

    /**
     * Оригинал всем оставшимся
     */
    originalToAllLeft(state) {
      if (state.shiftPersonal) {
        state.shiftPersonal.forEach(el => {
          if (el.sendOriginal === CurrShiftGetOrderStatus.doNotSend) {
            el.sendOriginal = CurrShiftGetOrderStatus.sendOriginal;
          }
        });
      }
    },

    /**
     * Копия всем
     */
    copyToAll(state) {
      if (state.shiftPersonal) {
        state.shiftPersonal.forEach(el => el.sendOriginal = CurrShiftGetOrderStatus.sendCopy);
      }
    },

    /**
     * Копия всем оставшимся
     */
    copyToAllLeft(state) {
      if (state.shiftPersonal) {
        state.shiftPersonal.forEach(el => {
          if (el.sendOriginal === CurrShiftGetOrderStatus.doNotSend) {
            el.sendOriginal = CurrShiftGetOrderStatus.sendCopy;
          }
        });
      }
    },

    /**
     * Не передавать всем
     */
    doNotSendToAll(state) {
      if (state.shiftPersonal) {
        state.shiftPersonal.forEach(el => el.sendOriginal = CurrShiftGetOrderStatus.doNotSend);
      }
    },
  },
}
