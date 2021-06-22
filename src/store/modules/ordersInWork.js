export const WorkMessStatus = Object.freeze({
  confirmed: 0,
  read: 1,
  notRead: 2,
});

export const WorkMessStates = Object.freeze({
  cameRecently: 0,
  cameLongAgo: 1,
});

export const WorkMessTblColumnsTitles = Object.freeze({
  state: 'state',
  seqNum: 'seqNum',
  time: 'time',
  orderNum: 'orderNum',
  orderTitle: 'orderTitle',
  orderReceiveStatus: 'orderReceiveStatus',
});

export const WorkMessReceiversTblColumnsTitles = Object.freeze({
  place: 'place',
  post: 'post',
  fio: 'fio',
});

export const WorkMessTblColumns = [
  { field: WorkMessTblColumnsTitles.state, title: '', width: '2rem', },
  { field: WorkMessTblColumnsTitles.seqNum, title: '№', width: '3rem', },
  { field: WorkMessTblColumnsTitles.time, title: 'Время действия', width: '10%', },
  { field: WorkMessTblColumnsTitles.orderNum, title: 'Номер', width: '10%', },
  { field: WorkMessTblColumnsTitles.orderTitle, title: 'Наименование', width: '45%', },
  { field: WorkMessTblColumnsTitles.orderReceiveStatus, title: 'Статус', width: '20%', },
];

export const WorkMessReceiversTblColumns = [
  { field: WorkMessReceiversTblColumnsTitles.place, title: 'Станция/Участок', width: '33%', },
  { field: WorkMessReceiversTblColumnsTitles.post, title: 'Должность', altTitle: 'Принадлежность', width: '33%', },
  { field: WorkMessReceiversTblColumnsTitles.fio, title: 'ФИО', width: '33%', },
];


export const ordersInWork = {
  state: {
    ordersArr: [],
  },

  getters: {
    getOrdersInWork(state) {
      return state.ordersArr;
    },

    getOrdersInWorkNumber(state) {
      return state.ordersArr.length; //state.ordersArr.filter(el => el.receiverNum === 1).length;
    },
  },

  mutations: {
    setOrdersInWork(state, orders) {
      orders = [
        {
          id: 1,
          state: 1,
          seqNum: '1',
          date: '16.09.2020',
          time: 'с 10:40 до отмены',
          orderNum: '206',
          orderTitle: 'ДР Н',
          orderText: 'Текст приказа 1',
          orderReceiveStatus: function() {
            return {
              notRead: this.receivers.filter(el => el.status === WorkMessStatus.notRead).length,
              notConfirmed: this.receivers.filter(el => el.status === WorkMessStatus.read).length,
            };
          },
          receivers: [
            {
              place: 'Коханово',
              post: 'ДСП',
              fio: 'Змушко',
              status: 2,
            },
            {
              place: 'Толочин',
              post: 'ДСП',
              fio: 'Короткевич',
              status: 0,
            },
            {
              place: 'Славное',
              post: 'ДСП',
              fio: '',
              status: 1,
            },
            {
              place: 'Приямино',
              post: 'ДСП',
              fio: 'Черей',
              status: 2,
            },
            {
              place: 'Смолевичи',
              post: 'ДСП',
              fio: 'Горбачев',
              status: 2,
            },
          ],
        },
        {
          id: 2,
          state: 1,
          seqNum: '2',
          date: '16.09.2020',
          time: '11:04',
          orderNum: '350',
          orderTitle: 'О разъединении на главном пути станции',
          orderText: 'Текст приказа 2',
          orderReceiveStatus: function() {
            return {
              notRead: this.receivers.filter(el => el.status === WorkMessStatus.notRead).length,
              notConfirmed: this.receivers.filter(el => el.status === WorkMessStatus.read).length,
            };
          },
          receivers: [
            {
              place: 'Коханово',
              post: 'ДСП',
              fio: 'Змушко',
              status: 2,
            },
            {
              place: 'Толочин',
              post: 'ДСП',
              fio: 'Короткевич',
              status: 0,
            },
            {
              place: 'Колодищи',
              post: 'ДСП',
              fio: '',
              status: 1,
            },
            {
              place: 'Городище',
              post: 'ДСП',
              fio: 'Васькина',
              status: 1,
            },
            {
              place: 'Озерище',
              post: 'ДСП',
              fio: 'Прокопик',
              status: 1,
            },
          ],
        },
        {
          id: 3,
          state: 0,
          seqNum: '3',
          date: '16.09.2020',
          time: 'с 11:05 до отмены',
          orderNum: '216',
          orderTitle: 'Наименование очередного приказа',
          orderText: 'Текст приказа 3 Текст приказа 3 Текст приказа 3 Текст приказа 3 Текст приказа 3 Текст приказа 3 Текст приказа 3 Текст приказа 3',
          orderReceiveStatus: function() {
            return {
              notRead: this.receivers.filter(el => el.status === WorkMessStatus.notRead).length,
              notConfirmed: this.receivers.filter(el => el.status === WorkMessStatus.read).length,
            };
          },
          receivers: [
            {
              place: 'Коханово',
              post: 'ДСП',
              fio: 'Змушко',
              status: 2,
            },
            {
              place: 'Толочин',
              post: 'ДСП',
              fio: 'Короткевич',
              status: 0,
            },
            {
              place: 'Славное',
              post: 'ДСП',
              fio: '',
              status: 1,
            },
            {
              place: 'Приямино',
              post: 'ДСП',
              fio: 'Черей',
              status: 2,
            },
            {
              place: 'Смолевичи',
              post: 'ДСП',
              fio: 'Горбачев',
              status: 2,
            },
          ],
        },
      ];

      state.ordersArr = orders;
    },
  },
}
