import { filterObj } from '@/additional/filterObject';

// Условные наименования столбцов таблицы входящих документов (названия столбцов должны
// соответствовать названию полей массива данных для корректного отображения информации)
const InputMessTblColumnsTitles = Object.freeze({
  state: 'state',
  seqNum: 'seqNum',
  time: 'time', // Время создания документа
  orderNum: 'orderNum',
  extendedOrderTitle: 'extendedOrderTitle',
  orderText: 'shortOrderText', // Только для ДСП
  place: 'place',
  post: 'post',
  fio: 'fio',
});

// Условные наименования столбцов таблицы рабочих документов (названия столбцов должны
// соответствовать названию полей массива данных для корректного отображения информации)
const WorkMessTblColumnsTitles = Object.freeze({
  expander: 'expander',
  state: 'state',
  timeSpan: 'timeSpan', // время действия документа
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
// отображения информации; кроме того, они должны совпадать с наименованиями соответствующих полей в БД,
// т.к. по ним идут запросы на сортировку и фильтрацию данных в таблице)
const ECDJournalTblColumnsTitles = Object.freeze({
  toWhom: 'toWhom',
  assertDateTime: 'assertDateTime', // дата, время утверждения
  number: 'number',
  orderContent: 'orderContent',
  orderAcceptor: 'orderAcceptor',
  orderSender: 'orderSender',
  orderNotificationDateTime: 'orderNotificationDateTime', // время уведомления (на приказ/запрещение)
  notificationNumber: 'notificationNumber', // номер уведомления
});

// Условные наименования столбцов таблицы журнала ДНЦ/ДСП
// (названия столбцов должны соответствовать названию полей массива данных для корректного
// отображения информации; кроме того, они должны совпадать с наименованиями соответствующих полей в БД,
// т.к. по ним идут запросы на сортировку и фильтрацию данных в таблице)
const DNC_DSPJournalTblColumnsTitles = Object.freeze({
  assertDateTime: 'assertDateTime', // дата, время утверждения
  number: 'number',
  orderContent: 'orderContent',
  orderAcceptor: 'orderAcceptor',
});

// Условные наименования столбцов таблицы информации об "окнах"
// (названия столбцов должны соответствовать названию полей массива данных для корректного
// отображения информации)
const OknaTblColumnsTitles = Object.freeze({
  fullNumDoc: 'fullNumDoc', // № документа
  performer: 'performer', // исполнитель
  datetime: 'datetime',
  placeWorkPlan: 'placeWorkPlan', // место работ, указанное в суточном плане
  typeWork: 'typeWork', // вид работ
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
        { field: InputMessTblColumnsTitles.time, title: 'Время создания', width: isDSP_or_DSPoperator ? '7%': '11%', maxWidth: isDSP_or_DSPoperator ? '7%': '11%', align: 'left' },
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
     * Возвращает информацию об условных наименованиях столбцов таблицы журнала ДНЦ/ДСП.
     */
    getDNC_DSPJournalTblColumnsTitles() {
      return DNC_DSPJournalTblColumnsTitles;
    },

    /**
     * Возвращает информацию об условных наименованиях столбцов таблицы окон.
     */
    getOknaTblColumnsTitles() {
      return OknaTblColumnsTitles;
    },

    /**
     * Возвращает информацию о столбцах таблицы рабочих распоряжений.
     */
    getWorkMessTblColumns() {
      return [
        { field: WorkMessTblColumnsTitles.expander, title: '', width: '5%', align: 'center' },
        { field: WorkMessTblColumnsTitles.state, title: 'Действия', width: '5%', align: 'center' },
        { field: WorkMessTblColumnsTitles.orderNum, title: 'Номер', width: '5%', 'align': 'left' },
        { field: WorkMessTblColumnsTitles.timeSpan, title: 'Время действия в системе', width: '19%', align: 'left' },
        { field: WorkMessTblColumnsTitles.extendedOrderTitle, title: 'Наименование', width: '44%', align: 'left' },
        { field: WorkMessTblColumnsTitles.orderReceiveStatus, title: 'Статус', width: '22%', align: 'left' },
      ];
    },

    /**
     * Возвращает информацию о столбцах таблицы полигонов-приемников рабочих распоряжений.
     */
    getWorkMessReceiversTblColumns(_state, _getters, _rootState, rootGetters) {
      let tblCols = [
        { field: WorkMessReceiversTblColumnsTitles.place, title: 'Станция/Участок', width: '25%', },
        { field: WorkMessReceiversTblColumnsTitles.post, title: 'Должность', altTitle: 'Принадлежность', width: '18%', },
        { field: WorkMessReceiversTblColumnsTitles.fio, title: 'ФИО', width: '20%', },
        { field: WorkMessReceiversTblColumnsTitles.confirmDateTime, title: 'Подтверждение', width: '37%', },
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
     * Возвращает информацию о столбцах таблицы журнала ЭЦД.
     */
    getECDJournalTblColumns() {
      return [
        { field: ECDJournalTblColumnsTitles.toWhom, title: 'Кому', width: '15%', align: 'left', },
        { field: ECDJournalTblColumnsTitles.assertDateTime, title: 'Время утверждения приказа', width: '8%', align: 'left', },
        { field: ECDJournalTblColumnsTitles.number, title: 'Номер приказа', width: '5%', align: 'left', },
        { field: ECDJournalTblColumnsTitles.orderContent, title: 'Содержание приказа', width: '33%', align: 'left', },
        { field: ECDJournalTblColumnsTitles.orderAcceptor, title: 'Кто принял Фамилия И.О., время подтверждения', width: '15%', align: 'left', },
        { field: ECDJournalTblColumnsTitles.orderSender, title: 'Кто передал Фамилия И.О.', width: '9%', align: 'left', },
        { field: ECDJournalTblColumnsTitles.orderNotificationDateTime, title: 'Время уведомления', width: '9%', align: 'left', },
        { field: ECDJournalTblColumnsTitles.notificationNumber, title: 'Номер уведомления', width: '6%', align: 'left', },
      ];
    },

    /**
     * Возвращает информацию о столбцах таблицы журнала ДНЦ/ДСП.
     */
    getDNC_DSPJournalTblColumns() {
      return [
        { field: DNC_DSPJournalTblColumnsTitles.assertDateTime, title: 'Время создания/утверждения распоряжения', width: '10%', align: 'left', },
        { field: DNC_DSPJournalTblColumnsTitles.number, title: '№ распоряжения', width: '5%', align: 'left', },
        { field: DNC_DSPJournalTblColumnsTitles.orderContent, title: 'Содержание распоряжения', width: '55%', align: 'left', },
        { field: DNC_DSPJournalTblColumnsTitles.orderAcceptor, title: 'Кто принял Фамилия И.О., время подтверждения', width: '30%', align: 'left', },
      ];
    },

    /**
     * Возвращает информацию о столбцах таблицы окон.
     */
    getOknaTblColumns() {
      return [
        { field: OknaTblColumnsTitles.fullNumDoc, title: '№ Документа', width: '14%', align: 'left' },
        { field: OknaTblColumnsTitles.performer, title: 'Исполнитель', width: '13%', align: 'left' },
        { field: OknaTblColumnsTitles.datetime, title: 'Дата/Время', width: '13%', align: 'left' },
        { field: OknaTblColumnsTitles.placeWorkPlan, title: 'Место работ', width: '30%', align: 'left' },
        { field: OknaTblColumnsTitles.typeWork, title: 'Вид работ', width: '30%', align: 'left' },
      ];
    },
  },
};
