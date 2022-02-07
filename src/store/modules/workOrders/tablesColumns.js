import { filterObj } from '@/additional/filterObject';

// Условные наименования столбцов таблицы входящих уведомлений (названия столбцов должны
// соответствовать названию полей массива данных для корректного отображения информации)
const InputMessTblColumnsTitles = Object.freeze({
  state: 'state',
  seqNum: 'seqNum',
  time: 'time', // Время издания распоряжения
  orderNum: 'orderNum',
  extendedOrderTitle: 'extendedOrderTitle',
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
  timeSpan: 'timeSpan', // время действия распоряжения
  orderNum: 'orderNum',
  extendedOrderTitle: 'extendedOrderTitle',
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

// Условные наименования столбцов таблицы рабочих мест-приемников рабочих распоряжений на станции
// (названия столбцов должны соответствовать названию полей массива данных для корректного
// отображения информации)
const WorkMessStationReceiversTblColumnsTitles = Object.freeze({
  place: 'place',
  post: 'post',
  fio: 'fio',
  confirmDateTime: 'confirmDateTime',
});

// Условные наименования столбцов таблицы журнала ЭЦД
// (названия столбцов должны соответствовать названию полей массива данных для корректного
// отображения информации)
const ECDJournalTblColumnsTitles = Object.freeze({
  seqNum: 'seqNum',
  toWhom: 'toWhom',
  orderAssertDateTime: 'orderAssertDateTime', // дата, время утверждения
  orderNum: 'orderNum',
  orderContent: 'orderContent',
  orderAcceptor: 'orderAcceptor',
  orderSender: 'orderSender',
  orderNotificationDateTime: 'orderNotificationDateTime', // время уведомления (на приказ/запрещение)
  notificationNumber: 'notificationNumber', // номер уведомления
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
      if (rootGetters.isDSP_or_DSPoperator) {
        return InputMessTblColumnsTitles;
      }
      return filterObj(InputMessTblColumnsTitles, (key) => key !== 'title');
    },

    /**
     * Возвращает информацию о столбцах таблицы входящих уведомлений.
     */
    getInputMessTblColumns(_state, _getters, _rootState, rootGetters) {
      const isDSP_or_DSPoperator = rootGetters.isDSP_or_DSPoperator;
      const tblCols = [
        { field: InputMessTblColumnsTitles.state, title: '', width: isDSP_or_DSPoperator ? '3%' : '3%', maxWidth: isDSP_or_DSPoperator ? '3%' : '3%', align: 'center' },
        { field: InputMessTblColumnsTitles.seqNum, title: '№ п/п', width: isDSP_or_DSPoperator ? '4%' : '4%', maxWidth: isDSP_or_DSPoperator ? '4%' : '4%', align: 'left' },
        { field: InputMessTblColumnsTitles.time, title: 'Время издания', width: isDSP_or_DSPoperator ? '7%': '11%', maxWidth: isDSP_or_DSPoperator ? '7%': '11%', align: 'left' },
        { field: InputMessTblColumnsTitles.orderNum, title: 'Номер', width: isDSP_or_DSPoperator ? '5%' : '7%', maxWidth: isDSP_or_DSPoperator ? '5%' : '7%', align: 'left' },
        { field: InputMessTblColumnsTitles.extendedOrderTitle, title: 'Наименование', width: isDSP_or_DSPoperator ? '15%' : '30%', maxWidth: isDSP_or_DSPoperator ? '15%' : '30%', align: 'left' },
      ];
      if (isDSP_or_DSPoperator) {
        tblCols.push({ field: InputMessTblColumnsTitles.orderText, title: 'Текст приказа', width: '40%', maxWidth: '40%', align: 'left' });
      }
      tblCols.push(
        { field: InputMessTblColumnsTitles.place, title: 'Станция/Участок', width: isDSP_or_DSPoperator ? '8%' : '20%', maxWidth: isDSP_or_DSPoperator ? '8%' : '20%', align: 'left' },
        { field: InputMessTblColumnsTitles.post, title: 'Должность', width: isDSP_or_DSPoperator ? '8%' : '11%', maxWidth: isDSP_or_DSPoperator ? '8%' : '11%', align: 'left' },
        { field: InputMessTblColumnsTitles.fio, title: 'ФИО', width: isDSP_or_DSPoperator ? '10%' : '14%', maxWidth: isDSP_or_DSPoperator ? '6%' : '14%', align: 'left' }
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
     * Возвращает информацию об условных наименованиях столбцов таблицы рабочих мест-приемников
     * рабочих распоряжений на станции.
     */
    getWorkMessStationReceiversTblColumnsTitles() {
      return WorkMessStationReceiversTblColumnsTitles;
    },

    /**
     * Возвращает информацию об условных наименованиях столбцов таблицы журнала ЭЦД.
     */
    getECDJournalTblColumnsTitles() {
      return ECDJournalTblColumnsTitles;
    },

    /**
     * Возвращает информацию о столбцах таблицы рабочих распоряжений.
     */
    getWorkMessTblColumns() {
      return [
        { field: WorkMessTblColumnsTitles.expander, title: '', width: '5%', align: 'center' },
        { field: WorkMessTblColumnsTitles.seqNum, title: '№ п/п', width: '4%', align: 'left' },
        { field: WorkMessTblColumnsTitles.state, title: 'Действия', width: '4%', align: 'center' },
        { field: WorkMessTblColumnsTitles.orderNum, title: 'Номер', width: '5%', 'align': 'left' },
        { field: WorkMessTblColumnsTitles.timeSpan, title: 'Время действия', width: '15%', align: 'left' },
        { field: WorkMessTblColumnsTitles.extendedOrderTitle, title: 'Наименование', width: '44%', align: 'left' },
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

    /**
     * Возвращает информацию о столбцах таблицы рабочих мест-приемников рабочих распоряжений на станции.
     */
    getWorkMessStationReceiversTblColumns() {
      return [
        { field: WorkMessStationReceiversTblColumnsTitles.place, title: 'Рабочее место', width: '25%', },
        { field: WorkMessStationReceiversTblColumnsTitles.post, title: 'Должность', width: '25%', },
        { field: WorkMessStationReceiversTblColumnsTitles.fio, title: 'ФИО', width: '25%', },
        { field: WorkMessStationReceiversTblColumnsTitles.confirmDateTime, title: 'Подтверждение', width: '25%', },
      ];
    },

    /**
     * Возвращает информацию об столбцах таблицы журнала ЭЦД.
     */
    getECDJournalTblColumns() {
      return [
        { field: ECDJournalTblColumnsTitles.seqNum, title: '№ п/п', width: '4%', align: 'left', },
        { field: ECDJournalTblColumnsTitles.toWhom, title: 'Кому', width: '18%', align: 'left', },
        { field: ECDJournalTblColumnsTitles.orderAssertDateTime, title: 'Время утверждения приказа', width: '10%', align: 'left', },
        { field: ECDJournalTblColumnsTitles.orderNum, title: 'Номер приказа', width: '4%', align: 'left', },
        { field: ECDJournalTblColumnsTitles.orderContent, title: 'Содержание приказа', width: '22%', align: 'left', },
        { field: ECDJournalTblColumnsTitles.orderAcceptor, title: 'Кто принял Фамилия И.О.', width: '18%', align: 'left', },
        { field: ECDJournalTblColumnsTitles.orderSender, title: 'Кто передал Фамилия И.О.', width: '10%', align: 'left', },
        { field: ECDJournalTblColumnsTitles.orderNotificationDateTime, title: 'Время уведомления', width: '10%', align: 'left', },
        { field: ECDJournalTblColumnsTitles.notificationNumber, title: 'Номер уведомления', width: '4%', align: 'left', },
      ];
    },
  },
};
