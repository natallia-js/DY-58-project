import axios from 'axios';
import { DY58_SERVER_ACTIONS_PATHS } from '../../constants/servers';
import { filterObj } from '../../additional/filterObject';
import { ReceiversPosts, WorkMessStates, RECENTLY } from '../../constants/orders';

const InputMessTblColumnsTitles = Object.freeze({
  state: 'state',
  seqNum: 'seqNum',
  time: 'time', // Время действия распоряжения (с ... по ...)
  orderNum: 'orderNum',
  orderTitle: 'orderTitle',
  orderText: 'orderText', // Только для ДСП
  place: 'place',
  post: 'post',
  fio: 'fio',
});

const WorkMessTblColumnsTitles = Object.freeze({
  expander: 'expander',
  state: 'state',
  seqNum: 'seqNum',
  time: 'time',
  orderNum: 'orderNum',
  orderTitle: 'orderTitle',
  orderReceiveStatus: 'orderReceiveStatus',
});

const WorkMessReceiversTblColumnsTitles = Object.freeze({
  place: 'place',
  post: 'post',
  fio: 'fio',
});

export function formOrderText(orderTextArray) {
  return orderTextArray.reduce((prevVal, currVal) => {
    return prevVal + (currVal.value || ' ');
  }, '');
}

export const workOrders = {
  state: {
    data: [],
    loadingWorkOrders: false,
    loadingWorkOrdersResult: null,
    confirmingOrder: false,
    orderConfirmResult: null,
  },

  getters: {
    getInputMessTblColumnsTitles(_state, _getters, _rootState, rootGetters) {
      if (rootGetters.isDSP) {
        return InputMessTblColumnsTitles;
      }
      return filterObj(InputMessTblColumnsTitles, (key) => key !== 'title');
    },

    getInputMessTblColumns(_state, _getters, _rootState, rootGetters) {
      const isDSP = rootGetters.isDSP;
      const tblCols = [
        { field: InputMessTblColumnsTitles.state, title: '', width: isDSP ? '3%' : '3%', align: 'center' },
        { field: InputMessTblColumnsTitles.seqNum, title: '№', width: isDSP ? '4%' : '4%', align: 'left' },
        { field: InputMessTblColumnsTitles.time, title: 'Время', width: isDSP ? '7%': '10%', align: 'left' },
        { field: InputMessTblColumnsTitles.orderNum, title: 'Номер', width: isDSP ? '5%' : '7%', align: 'left' },
        { field: InputMessTblColumnsTitles.orderTitle, title: 'Наименование', width: isDSP ? '15%' : '30%', align: 'left' },
      ];
      if (isDSP) {
        tblCols.push({ field: InputMessTblColumnsTitles.orderText, title: 'Текст приказа', width: '40%', align: 'left' });
      }
      tblCols.push(
        { field: InputMessTblColumnsTitles.place, title: 'Станция/Участок', width: isDSP ? '8%' : '19%', align: 'left' },
        { field: InputMessTblColumnsTitles.post, title: 'Должность', width: isDSP ? '8%' : '10%', align: 'left' },
        { field: InputMessTblColumnsTitles.fio, title: 'ФИО', width: isDSP ? '6%' : '13%', align: 'left' }
      );
      return tblCols;
    },

    getWorkMessTblColumnsTitles() {
      return WorkMessTblColumnsTitles;
    },

    getWorkMessTblColumns() {
      return [
        { field: WorkMessTblColumnsTitles.expander, title: '', width: '5%', align: 'center' },
        { field: WorkMessTblColumnsTitles.state, title: '', width: '5%', align: 'center' },
        { field: WorkMessTblColumnsTitles.seqNum, title: '№', width: '7%', align: 'left' },
        { field: WorkMessTblColumnsTitles.time, title: 'Время действия', width: '10%', align: 'left' },
        { field: WorkMessTblColumnsTitles.orderNum, title: 'Номер', width: '10%', 'align': 'left' },
        { field: WorkMessTblColumnsTitles.orderTitle, title: 'Наименование', width: '40%', align: 'left' },
        { field: WorkMessTblColumnsTitles.orderReceiveStatus, title: 'Статус', width: '20%', align: 'left' },
      ];
    },

    getWorkMessReceiversTblColumns(_state, _getters, _rootState, rootGetters) {
      let tblCols = [
        { field: WorkMessReceiversTblColumnsTitles.place, title: 'Станция/Участок', width: '33%', },
        { field: WorkMessReceiversTblColumnsTitles.post, title: 'Должность', altTitle: 'Принадлежность', width: '33%', },
        { field: WorkMessReceiversTblColumnsTitles.fio, title: 'ФИО', width: '33%', },
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

    getIncomingOrders(state) {
      const now = new Date();
      return state.data
        .filter((item) => !item.confirmDateTime)
        .map((item, index) => {
          return {
            id: item._id,
            state: now - new Date(item.createDateTime) >= RECENTLY ? WorkMessStates.cameLongAgo : WorkMessStates.cameRecently,
            seqNum: index + 1,
            time: `${new Date(item.createDateTime).toLocaleDateString('ru', { day: 'numeric', month: 'numeric', year: 'numeric' })}\r\n` +
                  `${new Date(item.createDateTime).toLocaleTimeString('ru', { hour: 'numeric', minute: 'numeric', second: 'numeric' })}`,
            orderNum: item.number,
            orderTitle: item.orderText.orderTitle,
            orderText: formOrderText(item.orderText.orderText),
            place: item.senderWorkPoligon.title,
            post: item.creator.post,
            fio: item.creator.fio,
          };
        });
    },

    getIncomingOrdersNumber(state) {
      return state.data.filter((item) => !item.confirmDateTime).length;
    },

    getWorkingOrders(state) {
      const now = new Date();
      return state.data.filter((item) => item.confirmDateTime)
        .map((item, index) => {
          return {
            id: item._id,
            state: now - new Date(item.createDateTime) >= RECENTLY ? WorkMessStates.cameLongAgo : WorkMessStates.cameRecently,
            seqNum: index + 1,
            time: `${new Date(item.createDateTime).toLocaleDateString('ru', { day: 'numeric', month: 'numeric', year: 'numeric' })}\r\n` +
                  `${new Date(item.createDateTime).toLocaleTimeString('ru', { hour: 'numeric', minute: 'numeric', second: 'numeric' })}`,
            orderNum: item.number,
            orderTitle: item.orderText.orderTitle,
            orderText: formOrderText(item.orderText.orderText),
            orderReceiveStatus: function() {
              return {
                notDelivered:
                  item.dspToSend ? item.dspToSend.filter((dsp) => !dsp.deliverDateTime).length : 0 +
                  item.dncToSend ? item.dncToSend.filter((dnc) => !dnc.deliverDateTime).length : 0,
                notConfirmed:
                  item.dspToSend ? item.dspToSend.filter((dsp) => dsp.deliverDateTime && !dsp.confirmDateTime).length : 0 +
                  item.dncToSend ? item.dncToSend.filter((dnc) => dnc.deliverDateTime && !dnc.confirmDateTime).length : 0,
              };
            },
            receivers: function() {
              const receiversArray = [];
              if (item.dspToSend) {
                receiversArray.push(...item.dspToSend.map((dsp) => {
                  return {
                    place: dsp.placeTitle,
                    post: ReceiversPosts.DSP,
                    fio: dsp.fio,
                    deliverDateTime: dsp.deliverDateTime,
                    confirmDateTime: dsp.confirmDateTime,
                  };
                }));
              }
              if (item.dncToSend) {
                receiversArray.push(...item.dncToSend.map((dnc) => {
                  return {
                    place: dnc.placeTitle,
                    post: ReceiversPosts.DNC,
                    fio: dnc.fio,
                    deliverDateTime: dnc.deliverDateTime,
                    confirmDateTime: dnc.confirmDateTime,
                  };
                }));
              }
              return receiversArray;
            },
          };
        });
    },

    getWorkingOrdersNumber(state) {
      return state.data.filter((item) => item.confirmDateTime).length;
    },

    getIncomingOrder(state) {
      return (id) => {
        return state.data.find((item) => item._id === id);
      };
    },
  },

  mutations: {
    clearLoadingWorkOrdersResult(state) {
      state.loadingWorkOrdersResult = null;
    },

    setLoadingWorkOrdersResult(state, { error, message }) {
      state.loadingWorkOrdersResult = {
        error,
        message,
      };
    },

    setLoadingWorkOrdersStatus(state, status) {
      state.loadingWorkOrders = status;
    },

    setConfirmOrderResult(state, { error, message }) {
      state.orderConfirmResult = {
        error,
        message,
      };
    },

    clearConfirmOrderResult(state) {
      state.orderConfirmResult = null;
    },

    setConfirmingOrderStatus(state, status) {
      state.confirmingOrder = status;
    },

    setNewWorkOrdersArray(state, newData) {
      state.data = newData || [];
    },

    setOrderConfirmed(state, { orderId, confirmDateTime }) {
      state.data = state.data.map((el) => {
        if (el._id === orderId) {
          return {
            ...el,
            confirmDateTime,
          };
        }
        return el;
      });
    },
  },

  actions: {
    /**
     *
     */
    async loadWorkOrders(context) {
      context.commit('clearLoadingWorkOrdersResult');
      context.commit('setLoadingWorkOrdersStatus', true);
      try {
        const headers = {
          'Authorization': `Bearer ${context.getters.getCurrentUserToken}`,
        };
        const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.getWorkOrders,
          {
            workPoligonType: context.getters.getUserWorkPoligon.type,
            workPoligonId: context.getters.getUserWorkPoligon.code,
          },
          { headers }
        );
        context.commit('setLoadingWorkOrdersResult', { error: false, message: null });
        context.commit('setNewWorkOrdersArray', response.data);

      } catch ({ response }) {
        context.commit('setLoadingWorkOrdersResult', { error: false, message: response.data.message });
      }
      context.commit('setLoadingWorkOrdersStatus', false);
    },

    /**
     *
     */
    async confirmOrder(context, { orderId }) {
      context.commit('setConfirmingOrderStatus', true);
      context.commit('clearConfirmOrderResult');
      try {
        const headers = {
          'Authorization': `Bearer ${context.getters.getCurrentUserToken}`,
        };
        const confirmDateTime = new Date();
        const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.confirmOrder,
          {
            workPoligonType: context.getters.getUserWorkPoligon.type,
            workPoligonId: context.getters.getUserWorkPoligon.code,
            id: orderId,
            confirmDateTime,
          },
          { headers }
        );
        context.commit('setConfirmOrderResult', { error: false, message: response.data.message });
        context.commit('setOrderConfirmed', { orderId: response.data.id, confirmDateTime });

      } catch ({ response }) {
        context.commit('setConfirmOrderResult', { error: true, message: response.data.message });
      }
      context.commit('setConfirmingOrderStatus', false);
    },
  },
};
