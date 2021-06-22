export const IncomingNotificationsStates = Object.freeze({
  cameRecently: 0,
  cameLongAgo: 1,
});

export const InputMessTblColumnsTitles = Object.freeze({
  state: 'state',
  seqNum: 'seqNum',
  time: 'time',
  orderNum: 'orderNum',
  orderTitle: 'orderTitle',
  orderText: 'orderText', // Только для ДСП
  place: 'place',
  post: 'post',
  fio: 'fio',
});

export const InputMessTblColumns = [
  { field: InputMessTblColumnsTitles.state, title: '', width: '3%', },
  { field: InputMessTblColumnsTitles.seqNum, title: '№', width: '4%', },
  { field: InputMessTblColumnsTitles.time, title: 'Время', width: '7%', },
  { field: InputMessTblColumnsTitles.orderNum, title: 'Номер', width: '7%', },
  { field: InputMessTblColumnsTitles.orderTitle, title: 'Наименование', width: '40%', },
  { field: InputMessTblColumnsTitles.orderText, title: 'Текст приказа', width: '60%', }, // Только для ДСП
  { field: InputMessTblColumnsTitles.place, title: 'Станция/Участок', width: '13%', },
  { field: InputMessTblColumnsTitles.post, title: 'Должность', width: '10%', },
  { field: InputMessTblColumnsTitles.fio, title: 'ФИО', width: '15%', },
];


export const incomingNotifications = {
  state: {
    notificationsArr: [],
  },

  getters: {
    getIncomingNotifications(state) {
      return state.notificationsArr;
    },

    getIncomingNotificationsNumber(state) {
      return state.notificationsArr.length;
    },
  },

  mutations: {
    setIncomingNotifications(state, notifications) {
      notifications = [
        {
          id: 0,
          state: 0,
          seqNum: '1',
          date: '16.09.2020',
          time: '11:04',
          orderNum: '350',
          orderTitle: 'О разъединении на главном пути станции',
          orderText: 'Текст входящего документа Текст входящего документа Текст входящего документа Текст входящего документа Текст входящего документа',
          place: 'Витебск узел',
          post: 'ДНЦ',
          fio: 'Авдеенко Д.И.',
        },
        {
          id: 1,
          state: 0,
          seqNum: '2',
          date: '16.09.2020',
          time: '11:10',
          orderNum: '346',
          orderTitle: 'Об оставлении поезда на станции',
          orderText: 'Текст входящего документа Текст входящего документа Текст входящего документа Текст входящего документа Текст входящего документа',
          place: 'Орша узел',
          post: 'ДНЦ',
          fio: 'Бойко Е.А.',
        },
        {
          id: 2,
          state: 1,
          seqNum: '3',
          date: '16.09.2020',
          time: '11:04',
          orderNum: '350',
          orderTitle: 'О разъединении на главном пути станции',
          orderText: 'Текст входящего документа Текст входящего документа Текст входящего документа Текст входящего документа Текст входящего документа',
          place: 'Витебск узел',
          post: 'ДНЦ',
          fio: 'Авдеенко Д.И.',
        },
        {
          id: 3,
          state: 0,
          seqNum: '4',
          date: '16.09.2020',
          time: '11:04',
          orderNum: '350',
          orderTitle: 'О разъединении на главном пути станции',
          orderText: 'Текст входящего документа Текст входящего документа Текст входящего документа Текст входящего документа Текст входящего документа',
          place: 'Витебскыврыоврфлыоврфлыоар узел',
          post: 'ДНЦ',
          fio: 'Авдеенко Д.И.',
        },
        {
          id: 4,
          state: 1,
          seqNum: '5',
          date: '16.09.2020',
          time: '11:04',
          orderNum: '350',
          orderTitle: 'О разъединении на главном пути станции',
          orderText: 'Текст входящего документа Текст входящего документа Текст входящего документа Текст входящего документа Текст входящего документа',
          place: 'Витебск узел',
          post: 'ДНЦ',
          fio: 'Авдеенко Д.И.',
        },
        {
          id: 5,
          state: 0,
          seqNum: '6',
          date: '16.09.2020',
          time: '11:04',
          orderNum: '350',
          orderTitle: 'О разъединении на главном пути станции',
          orderText: 'Текст входящего документа Текст входящего документа Текст входящего документа Текст входящего документа Текст входящего документа',
          place: 'Витебск узел',
          post: 'ДНЦ',
          fio: 'Авдеенко Д.И.',
        },
      ];

      state.notificationsArr = notifications;
    },
  },
}
