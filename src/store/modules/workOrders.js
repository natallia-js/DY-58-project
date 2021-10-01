import axios from 'axios';
import { DY58_SERVER_ACTIONS_PATHS } from '../../constants/servers';
import { filterObj } from '../../additional/filterObject';
import { ReceiversPosts, WorkMessStates, RECENTLY } from '../../constants/orders';
import { getLocaleDateTimeString, getTimeSpanString } from '../../additional/dateTimeConvertions';

const InputMessTblColumnsTitles = Object.freeze({
  state: 'state',
  seqNum: 'seqNum',
  time: 'time', // Время издания распоряжения
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
    reportingOnOrdersDelivery: false,
    reportOnOrdersDeliveryResult: null,
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

    getWorkMessTblColumnsTitles() {
      return WorkMessTblColumnsTitles;
    },

    getWorkMessTblColumns() {
      return [
        { field: WorkMessTblColumnsTitles.expander, title: '', width: '4%', align: 'center' },
        { field: WorkMessTblColumnsTitles.state, title: '', width: '4%', align: 'center' },
        { field: WorkMessTblColumnsTitles.seqNum, title: '№ п/п', width: '4%', align: 'left' },
        { field: WorkMessTblColumnsTitles.time, title: 'Время действия', width: '10%', align: 'left' },
        { field: WorkMessTblColumnsTitles.orderNum, title: 'Номер', width: '10%', 'align': 'left' },
        { field: WorkMessTblColumnsTitles.orderTitle, title: 'Наименование', width: '44%', align: 'left' },
        { field: WorkMessTblColumnsTitles.orderReceiveStatus, title: 'Статус', width: '24%', align: 'left' },
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
            type: item.type,
            state: now - new Date(item.createDateTime) >= RECENTLY ? WorkMessStates.cameLongAgo : WorkMessStates.cameRecently,
            seqNum: index + 1,
            time: getLocaleDateTimeString(new Date(item.createDateTime), false, true),
            timeSpan: getTimeSpanString(item.timeSpan),
            orderNum: item.number,
            orderTitle: item.orderText.orderTitle,
            orderText: formOrderText(item.orderText.orderText),
            place: item.senderWorkPoligon.title,
            post: item.creator.post,
            fio: item.creator.fio,
          };
        });
    },

    /**
     * Позволяет получить количество входящих уведомлений.
     */
    getIncomingOrdersNumber(state) {
      return state.data.filter((item) => !item.confirmDateTime).length;
    },

    /**
     *
     */
    getActiveOrdersToDisplayInTreeSelect(state) {
      const orders = state.data.filter((item) => item.confirmDateTime && !item.nextRelatedOrderId);
      const groupedOrders = [{
        key: null,
        label: '-',
        data: null,
      }];
      orders.forEach((order) => {
        const typeGroup = groupedOrders.find((group) => group.key === order.type);
        const childItem = {
          key: order._id,
          label: `№ ${order.number} от ${getLocaleDateTimeString(new Date(order.createDateTime), false, false)} - ${order.orderText.orderTitle}`,
          data: order,
        };
        if (!typeGroup) {
          groupedOrders.push({
            key: order.type,
            label: order.type,
            data: order.type,
            selectable: false,
            children: [childItem],
          });
        } else {
          typeGroup.children.push(childItem);
        }
      });
      return groupedOrders;
    },

    getWorkingOrders(state) {
      const now = new Date();
      return state.data.filter((item) => item.confirmDateTime)
        .map((item, index) => {
          return {
            id: item._id,
            state: now - new Date(item.createDateTime) >= RECENTLY ? WorkMessStates.cameLongAgo : WorkMessStates.cameRecently,
            seqNum: index + 1,
            time: getTimeSpanString(item.timeSpan),
            orderNum: item.number,
            orderTitle: item.orderText.orderTitle,
            orderText: formOrderText(item.orderText.orderText),
            orderReceiveStatus: {
              notDelivered:
                (item.dspToSend ? item.dspToSend.filter((dsp) => !dsp.deliverDateTime).length : 0) +
                (item.dncToSend ? item.dncToSend.filter((dnc) => !dnc.deliverDateTime).length : 0) +
                (item.ecdToSend ? item.ecdToSend.filter((ecd) => !ecd.deliverDateTime).length : 0),
              notConfirmed:
                (item.dspToSend ? item.dspToSend.filter((dsp) => dsp.deliverDateTime && !dsp.confirmDateTime).length : 0) +
                (item.dncToSend ? item.dncToSend.filter((dnc) => dnc.deliverDateTime && !dnc.confirmDateTime).length : 0) +
                (item.ecdToSend ? item.ecdToSend.filter((ecd) => ecd.deliverDateTime && !ecd.confirmDateTime).length : 0),
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
              if (item.ecdToSend) {
                receiversArray.push(...item.ecdToSend.map((ecd) => {
                  return {
                    place: ecd.placeTitle,
                    post: ReceiversPosts.ECD,
                    fio: ecd.fio,
                    deliverDateTime: ecd.deliverDateTime,
                    confirmDateTime: ecd.confirmDateTime,
                  };
                }));
              }
              return receiversArray;
            },
          };
        });
    },

    /**
     * Позволяет получить количество распоряжений, находящихся в работе
     * (действующих распоряжений).
     */
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

    setReportingOnOrderDeliveryStatus(state, status) {
      state.reportingOnOrdersDelivery = status;
    },

    clearReportOnOrdersDeliveryResult(state) {
      state.reportOnOrdersDeliveryResult = null;
    },

    setReportOnOrdersDeliveryResult(state, { error, message }) {
      state.reportOnOrdersDeliveryResult = {
        error,
        message,
      };
    },

    /**
     * Позволяет запомнить массив "рабочих" распоряжений.
     */
    setNewWorkOrdersArray(state, newData) {
      if (!newData || !newData.length) {
        state.data = [];
        return;
      }
      if (!state.data || !state.data.length) {
        state.data = newData;
        return;
      }
      // Вначале удалим те элементы существующего массива, которых нет в новом массиве
      const delIndexes = [];
      state.data.forEach((order, index) => {
        if (!newData.find((item) => item._id === order._id)) {
          delIndexes.push(index);
        }
      });
      if (delIndexes.length) {
        state.data = state.data.filter((_item, index) => !delIndexes.includes(index));
      }
      // Затем добавим в существующий массив элементы, которых в нем нет, и отредактируем,
      // при необходимости, существующие элементы
      newData.forEach((order) => {
        const existingOrderIndex = state.data.findIndex((item) => item._id === order._id);
        if (existingOrderIndex < 0) {
          state.data.push({ ...order });
        } else if (JSON.stringify(state.data[existingOrderIndex]) !== JSON.stringify(order)) {
          state.data[existingOrderIndex] = { ...order };
        }
      });
    },

    /**
     *
     */
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
        context.dispatch('reportOnOrdersDelivery', response.data);
      } catch ({ response }) {
        context.commit('setLoadingWorkOrdersResult', { error: false, message: response.data.message });
      }
      context.commit('setLoadingWorkOrdersStatus', false);
    },

    /**
     * Для распоряжений, для которых ранее не сообщалось серверу об их доставке на клиентское
     * рабочее место, сообщает о том, что они доставлены.
     */
    async reportOnOrdersDelivery(context, orders) {
      // Сюда поместим идентификаторы тех распоряжений, о доставке которых необходимо сообщить серверу.
      const newDeliveredOrderIds = !orders ? [] :
        orders.filter((order) => !order.deliverDateTime).map((order) => order._id);
      if (!newDeliveredOrderIds.length) {
        return;
      }
      context.commit('setReportingOnOrderDeliveryStatus', true);
      context.commit('clearReportOnOrdersDeliveryResult');
      try {
        const headers = {
          'Authorization': `Bearer ${context.getters.getCurrentUserToken}`,
        };
        const deliverDateTime = new Date();
        const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.reportOnOrdersDelivery,
          {
            workPoligonType: context.getters.getUserWorkPoligon.type,
            workPoligonId: context.getters.getUserWorkPoligon.code,
            orderIds: newDeliveredOrderIds,
            deliverDateTime,
          },
          { headers }
        );
        context.commit('setReportOnOrdersDeliveryResult', { error: false, message: response.data.message });
      } catch ({ response }) {
        context.commit('setReportOnOrdersDeliveryResult', { error: true, message: response.data.message });
      }
      context.commit('setReportingOnOrderDeliveryStatus', false);
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
