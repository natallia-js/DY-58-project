export const CurrSectorsShiftGetOrderStatus = Object.freeze({
  sendOriginal: 0,
  sendCopy: 1,
  doNotSend: 2,
});

export const CurrSectorsShiftTblColumnNames = Object.freeze({
  sector: 'sector',
  fio: 'fio',
  post: 'post',
  notification: 'notification',
});

export const CurrSectorsShiftTblColumns = [
  { field: CurrSectorsShiftTblColumnNames.sector, title: 'Участок', width: '20%', },
  { field: CurrSectorsShiftTblColumnNames.fio, title: 'ФИО', width: '20%', },
  { field: CurrSectorsShiftTblColumnNames.post, title: 'Должн.', width: '10%', },
  { field: CurrSectorsShiftTblColumnNames.notification, title: 'Уведомление', width: '200px', },
];


export const currSectorsShift = {
  state: {
    shiftPersonal: [],
  },

  getters: {
    getCurrSectorsShift: (state) => {
      return state.shiftPersonal;
    },
  },

  mutations: {
    setCurrSectorsShift(state, currShift) {
      currShift = [
        { id: 11, sector: 'Витебск узел', fio: 'Авдеенко В.Г.', post: 'ДНЦ', sendOriginal: CurrSectorsShiftGetOrderStatus.sendCopy, },
        { id: 12, sector: 'Могилев-Езерище', fio: 'Ковалев Е.А.', post: 'ДНЦ', sendOriginal: CurrSectorsShiftGetOrderStatus.doNotSend, },
        { id: 13, sector: 'Орша узел', fio: 'Павлов В.Г.', post: 'ДНЦ', sendOriginal: CurrSectorsShiftGetOrderStatus.sendOriginal, },
        { id: 14, sector: 'Могилев узел', fio: 'Степанов И.Д.', post: 'ДНЦ', sendOriginal: CurrSectorsShiftGetOrderStatus.doNotSend, },
      ];

      state.shiftPersonal = currShift;
    },

    /**
     * Оригинал всем
     */
    originalToAllSectorsShift(state) {
      if (state.shiftPersonal) {
        state.shiftPersonal.forEach(el => el.sendOriginal = CurrSectorsShiftGetOrderStatus.sendOriginal);
      }
    },

    /**
     * Оригинал всем оставшимся
     */
    originalToAllLeftSectorsShift(state) {
      if (state.shiftPersonal) {
        state.shiftPersonal.forEach(el => {
          if (el.sendOriginal === CurrSectorsShiftGetOrderStatus.doNotSend) {
            el.sendOriginal = CurrSectorsShiftGetOrderStatus.sendOriginal;
          }
        });
      }
    },

    /**
     * Копия всем
     */
    copyToAllSectorsShift(state) {
      if (state.shiftPersonal) {
        state.shiftPersonal.forEach(el => el.sendOriginal = CurrSectorsShiftGetOrderStatus.sendCopy);
      }
    },

    /**
     * Копия всем оставшимся
     */
    copyToAllLeftSectorsShift(state) {
      if (state.shiftPersonal) {
        state.shiftPersonal.forEach(el => {
          if (el.sendOriginal === CurrSectorsShiftGetOrderStatus.doNotSend) {
            el.sendOriginal = CurrSectorsShiftGetOrderStatus.sendCopy;
          }
        });
      }
    },

    /**
     * Не передавать всем
     */
    doNotSendToAllSectorsShift(state) {
      if (state.shiftPersonal) {
        state.shiftPersonal.forEach(el => el.sendOriginal = CurrSectorsShiftGetOrderStatus.doNotSend);
      }
    },
  },
}
