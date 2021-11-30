import { filterObj } from '../../../additional/filterObject';

// Условные наименования столбцов таблицы входящих уведомлений (названия столбцов должны
// соответствовать названию полей массива данных для корректного отображения информации)
const InputMessTblColumnsTitles = Object.freeze({
  state: 'state',
  seqNum: 'seqNum',
  time: 'time', // Время издания распоряжения
  orderNum: 'orderNum',
  orderTitle: 'orderTitle',
  orderText: 'shortOrderText', // Только для ДСП
  place: 'place',
  post: 'post',
  fio: 'fio',
});

// Условные наименования столбцов таблицы рабочих распоряжений (названия столбцов должны
// соответствовать названию полей массива данных для корректного отображения информации)
const WorkMessTblColumnsTitles = Object.freeze({
  expander: 'expander',
  state: 'state',
  seqNum: 'seqNum',
  time: 'time',
  orderNum: 'orderNum',
  orderTitle: 'orderTitle',
  orderReceiveStatus: 'orderReceiveStatus',
});

// Условные наименования столбцов таблицы полигонов-приемников рабочих распоряжений
// (названия столбцов должны соответствовать названию полей массива данных для корректного
// отображения информации)
const WorkMessReceiversTblColumnsTitles = Object.freeze({
  place: 'place',
  post: 'post',
  fio: 'fio',
  confirmDateTime: 'confirmDateTime',
});


/**
 * Данный модуль предназначен для работы с данными о столбцах таблиц в зависимости от должности
 * человека, вошедшего в систему.
 */
export const tablesColumns = {
  getters: {
    /**
     * Возвращает информацию об условных наименованиях столбцов таблицы входящих уведомлений.
     */
     getInputMessTblColumnsTitles(_state, _getters, _rootState, rootGetters) {
      if (rootGetters.isDSP) {
        return InputMessTblColumnsTitles;
      }
      return filterObj(InputMessTblColumnsTitles, (key) => key !== 'title');
    },

    /**
     * Возвращает информацию о столбцах таблицы входящих уведомлений.
     */
    getInputMessTblColumns(_state, _getters, _rootState, rootGetters) {
      const isDSP = rootGetters.isDSP;
      const tblCols = [
        { field: InputMessTblColumnsTitles.state, title: '', width: isDSP ? '3%' : '3%', maxWidth: isDSP ? '3%' : '3%', align: 'center' },
        { field: InputMessTblColumnsTitles.seqNum, title: '№ п/п', width: isDSP ? '4%' : '4%', maxWidth: isDSP ? '4%' : '4%', align: 'left' },
        { field: InputMessTblColumnsTitles.time, title: 'Время издания', width: isDSP ? '7%': '11%', maxWidth: isDSP ? '7%': '11%', align: 'left' },
        { field: InputMessTblColumnsTitles.orderNum, title: 'Номер', width: isDSP ? '5%' : '7%', maxWidth: isDSP ? '5%' : '7%', align: 'left' },
        { field: InputMessTblColumnsTitles.orderTitle, title: 'Наименование', width: isDSP ? '15%' : '30%', maxWidth: isDSP ? '15%' : '30%', align: 'left' },
      ];
      if (isDSP) {
        tblCols.push({ field: InputMessTblColumnsTitles.orderText, title: 'Текст приказа', width: '40%', maxWidth: '40%', align: 'left' });
      }
      tblCols.push(
        { field: InputMessTblColumnsTitles.place, title: 'Станция/Участок', width: isDSP ? '8%' : '20%', maxWidth: isDSP ? '8%' : '20%', align: 'left' },
        { field: InputMessTblColumnsTitles.post, title: 'Должность', width: isDSP ? '8%' : '11%', maxWidth: isDSP ? '8%' : '11%', align: 'left' },
        { field: InputMessTblColumnsTitles.fio, title: 'ФИО', width: isDSP ? '10%' : '14%', maxWidth: isDSP ? '6%' : '14%', align: 'left' }
      );
      return tblCols;
    },

    /**
     * Возвращает информацию об условных наименованиях столбцов таблицы рабочих распоряжений.
     */
    getWorkMessTblColumnsTitles() {
      return WorkMessTblColumnsTitles;
    },

    /**
     * Возвращает информацию об условных наименованиях столбцов таблицы полигонов-приемников
     * рабочих распоряжений.
     */
    getWorkMessReceiversTblColumnsTitles() {
      return WorkMessReceiversTblColumnsTitles;
    },

    /**
     * Возвращает информацию о столбцах таблицы рабочих распоряжений.
     */
    getWorkMessTblColumns() {
      return [
        { field: WorkMessTblColumnsTitles.expander, title: '', width: '5%', align: 'center' },
        { field: WorkMessTblColumnsTitles.state, title: '', width: '4%', align: 'center' },
        { field: WorkMessTblColumnsTitles.seqNum, title: '№ п/п', width: '4%', align: 'left' },
        { field: WorkMessTblColumnsTitles.time, title: 'Время действия', width: '10%', align: 'left' },
        { field: WorkMessTblColumnsTitles.orderNum, title: 'Номер', width: '10%', 'align': 'left' },
        { field: WorkMessTblColumnsTitles.orderTitle, title: 'Наименование', width: '44%', align: 'left' },
        { field: WorkMessTblColumnsTitles.orderReceiveStatus, title: 'Статус', width: '23%', align: 'left' },
      ];
    },

    /**
     * Возвращает информацию о столбцах таблицы полигонов-приемников рабочих распоряжений.
     */
     getWorkMessReceiversTblColumns(_state, _getters, _rootState, rootGetters) {
      let tblCols = [
        { field: WorkMessReceiversTblColumnsTitles.place, title: 'Станция/Участок', width: '25%', },
        { field: WorkMessReceiversTblColumnsTitles.post, title: 'Должность', altTitle: 'Принадлежность', width: '25%', },
        { field: WorkMessReceiversTblColumnsTitles.fio, title: 'ФИО', width: '25%', },
        { field: WorkMessReceiversTblColumnsTitles.confirmDateTime, title: 'Подтверждение', width: '25%', },
      ];
      if (!rootGetters.isECD) {
        return tblCols;
      }
      return tblCols.map((col) => {
        if (col.field === WorkMessReceiversTblColumnsTitles.post) {
          return { field: col.field, title: col.altTitle, width: col.width };
        }
        return col;
      });
    },
  },
};
