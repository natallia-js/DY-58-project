import axios from 'axios';
import { DY58_SERVER_ACTIONS_PATHS } from '../../constants/servers';
import { filterObj } from '../../additional/filterObject';
import { ReceiversPosts, WorkMessStates, RECENTLY } from '../../constants/orders';
import { getLocaleDateTimeString, getTimeSpanString } from '../../additional/dateTimeConvertions';
import { formOrderText } from '../../additional/formOrderText';
import { OrderPatternElementType } from '../../constants/orderPatterns';

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

function getOrderTextElementTypedValue(element) {
  if (!element) {
    return;
  }
  switch (element.type) {
    case OrderPatternElementType.DATE:
    case OrderPatternElementType.TIME:
    case OrderPatternElementType.DATETIME:
      return new Date(element.value);
    case OrderPatternElementType.DR_TRAIN_TABLE:
      return element.value;
    default:
      return element.value;
  }
}

function getWorkOrderObject(order) {
  return {
    _id: order._id,
    confirmDateTime: order.confirmDateTime ? new Date(order.confirmDateTime) : null,
    createDateTime: order.createDateTime ? new Date(order.createDateTime) : null,
    creator: order.creator,
    deliverDateTime: order.deliverDateTime ? new Date(order.deliverDateTime) : null,
    dncToSend: order.dncToSend.map((item) => {
      return {
        confirmDateTime: item.confirmDateTime ? new Date(item.confirmDateTime) : null,
        deliverDateTime: item.deliverDateTime ? new Date(item.deliverDateTime) : null,
        fio: item.fio,
        id: +item.id,
        placeTitle: item.placeTitle,
        sendOriginal: Boolean(item.sendOriginal),
        type: item.type,
        _id: item._id,
      };
    }),
    dspToSend: order.dspToSend.map((item) => {
      return {
        confirmDateTime: item.confirmDateTime ? new Date(item.confirmDateTime) : null,
        deliverDateTime: item.deliverDateTime ? new Date(item.deliverDateTime) : null,
        fio: item.fio,
        id: +item.id,
        placeTitle: item.placeTitle,
        sendOriginal: Boolean(item.sendOriginal),
        type: item.type,
        _id: item._id,
      };
    }),
    ecdToSend: order.ecdToSend.map((item) => {
      return {
        confirmDateTime: item.confirmDateTime ? new Date(item.confirmDateTime) : null,
        deliverDateTime: item.deliverDateTime ? new Date(item.deliverDateTime) : null,
        fio: item.fio,
        id: +item.id,
        placeTitle: item.placeTitle,
        sendOriginal: Boolean(item.sendOriginal),
        type: item.type,
        _id: item._id,
      };
    }),
    otherToSend: order.otherToSend.map((item) => {
      return {
        _id: item._id,
        post: item.post,
        fio: item.fio,
        placeTitle: item.placeTitle,
        sendOriginal: Boolean(item.sendOriginal),
      };
    }),
    nextRelatedOrderId: order.nextRelatedOrderId,
    number: order.number,
    orderText: !order.orderText ? null : {
      ...order.orderText,
      orderText: !order.orderText.orderText ? null :
        order.orderText.orderText.map((el) => {
          return {
            ...el,
            value: getOrderTextElementTypedValue(el),
          };
        })
    },
    place: order.place ? { place: order.place.place, value: +order.place.value } : null,
    senderWorkPoligon: order.senderWorkPoligon ? {
      id: order.senderWorkPoligon.id,
      type: order.senderWorkPoligon.type,
      title: order.senderWorkPoligon.title,
    } : null,
    timeSpan: order.timeSpan ? {
      start: order.timeSpan.start ? new Date(order.timeSpan.start) : null,
      end: order.timeSpan.end ? new Date(order.timeSpan.end) : null,
      tillCancellation: Boolean(order.timeSpan.tillCancellation),
    } : null,
    type: order.type,
    workPoligon: order.workPoligon ? {
      id: order.workPoligon.id,
      type: order.workPoligon.type,
    } : null,
    sendOriginal: order.sendOriginal,
  };
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
    getLoadingWorkOrdersStatus(state) {
      return state.loadingWorkOrders;
    },

    getErrorLoadingWorkOrders(state) {
      if (state.loadingWorkOrdersResult && state.loadingWorkOrdersResult.error) {
        return state.loadingWorkOrdersResult.message;
      }
      return null;
    },

    /**
     *
     */
    getInputMessTblColumnsTitles(_state, _getters, _rootState, rootGetters) {
      if (rootGetters.isDSP) {
        return InputMessTblColumnsTitles;
      }
      return filterObj(InputMessTblColumnsTitles, (key) => key !== 'title');
    },

    /**
     *
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
     *
     */
    getWorkMessTblColumnsTitles() {
      return WorkMessTblColumnsTitles;
    },

    /**
     *
     */
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

    /**
     *
     */
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

    /**
     *
     */
    getIncomingOrders(state) {
      const now = new Date();
      return state.data
        .filter((item) => !item.confirmDateTime)
        .map((item, index) => {
          return {
            id: item._id,
            sendOriginal: item.sendOriginal,
            type: item.type,
            state: (now - item.createDateTime) >= RECENTLY ? WorkMessStates.cameLongAgo : WorkMessStates.cameRecently,
            seqNum: index + 1,
            time: getLocaleDateTimeString(item.createDateTime, false),
            timeSpan: getTimeSpanString(item.timeSpan),
            orderNum: item.number,
            orderTitle: item.orderText.orderTitle,
            orderText: formOrderText({ orderTextArray: item.orderText.orderText }),
            place: item.senderWorkPoligon.title,
            post: item.creator.post,
            fio: item.creator.fio + (item.createdOnBehalfOf ? ` ( от имени ${item.createdOnBehalfOf})` : ''),
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
    getActiveOrders(state) {
      return state.data.filter((item) => item.confirmDateTime && !item.nextRelatedOrderId);
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
          label: `№ ${order.number} от ${getLocaleDateTimeString(order.createDateTime, false)} - ${order.orderText.orderTitle}`,
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
            sendOriginal: item.sendOriginal,
            state: (now - item.createDateTime) >= RECENTLY ? WorkMessStates.cameLongAgo : WorkMessStates.cameRecently,
            seqNum: index + 1,
            time: getTimeSpanString(item.timeSpan),
            orderNum: item.number,
            orderTitle: item.orderText.orderTitle,
            orderText: formOrderText({
              orderTextArray: item.orderText.orderText,
              dncToSend: item.dncToSend,
              dspToSend: item.dspToSend,
              ecdToSend: item.ecdToSend,
              otherToSend: item.otherToSend,
            }),
            place: item.senderWorkPoligon.title,
            post: item.creator.post,
            fio: item.creator.fio + (item.createdOnBehalfOf ? ` ( от имени ${item.createdOnBehalfOf})` : ''),
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

    /**
     * Позволяет получить информацию о входящем уведомлении по id этого уведомления.
     */
    getIncomingOrder(state) {
      return (id) => {
        return state.data.find((item) => item._id === id);
      };
    },

    /**
     * Позволяет получить количество экземпляров не доставленных и находящихся в работе распоряжений.
     */
    getNotDeliveredOrdersNumber(state) {
      const workingOrders = state.data.filter((item) => item.confirmDateTime);
      let notDeliveredInstances = 0;
      workingOrders.forEach((order) => {
        if (order.dspToSend) {
          notDeliveredInstances += order.dspToSend.filter((item) => !item.deliverDateTime).length;
        }
        if (order.dncToSend) {
          notDeliveredInstances += order.dncToSend.filter((item) => !item.deliverDateTime).length;
        }
        if (order.ecdToSend) {
          notDeliveredInstances += order.ecdToSend.filter((item) => !item.deliverDateTime).length;
        }
      })
      return notDeliveredInstances;
    },

    /**
     * Позволяет получить количество экземпляров не подтвержденных и находящихся в работе распоряжений.
     */
    getNotConfirmedOrdersNumber(state) {
      const workingOrders = state.data.filter((item) => item.confirmDateTime);
      let notConfirmedInstances = 0;
      workingOrders.forEach((order) => {
        if (order.dspToSend) {
          notConfirmedInstances += order.dspToSend.filter((item) => item.deliverDateTime && !item.confirmDateTime).length;
        }
        if (order.dncToSend) {
          notConfirmedInstances += order.dncToSend.filter((item) => item.deliverDateTime && !item.confirmDateTime).length;
        }
        if (order.ecdToSend) {
          notConfirmedInstances += order.ecdToSend.filter((item) => item.deliverDateTime && !item.confirmDateTime).length;
        }
      })
      return notConfirmedInstances;
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
        state.data = newData.map((order) => getWorkOrderObject(order));
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
          state.data.push(getWorkOrderObject(order));
        } else {
          const modifiedObject = getWorkOrderObject(order);
          if (JSON.stringify(state.data[existingOrderIndex]) !== JSON.stringify(modifiedObject)) {
            state.data[existingOrderIndex] = modifiedObject;
          }
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
        const defaultErrMessage = 'Произошла неизвестная ошибка при получении информации о рабочих распоряжениях';
        const errMessage = !response ? defaultErrMessage : (!response.data ? defaultErrMessage : response.data.message);
        context.commit('setLoadingWorkOrdersResult', { error: true, message: errMessage });
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
        const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.reportOnOrdersDelivery,
          {
            workPoligonType: context.getters.getUserWorkPoligon.type,
            workPoligonId: context.getters.getUserWorkPoligon.code,
            orderIds: newDeliveredOrderIds,
            deliverDateTime: new Date(),
          },
          { headers }
        );
        context.commit('setReportOnOrdersDeliveryResult', { error: false, message: response.data.message });
      } catch ({ response }) {
        const defaultErrMessage = 'Произошла неизвестная ошибка при сообщении серверу о доставке распоряжений';
        const errMessage = !response ? defaultErrMessage : (!response.data ? defaultErrMessage : response.data.message);
        context.commit('setReportOnOrdersDeliveryResult', { error: true, message: errMessage });
      }
      context.commit('setReportingOnOrderDeliveryStatus', false);
    },

    /**
     * Позволяет для данного входящего уведомления выставить статус "подтверждено" на сервере.
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
        const defaultErrMessage = 'Произошла неизвестная ошибка при попытке подтвердить распоряжение на сервере';
        const errMessage = !response ? defaultErrMessage : (!response.data ? defaultErrMessage : response.data.message);
        context.commit('setConfirmOrderResult', { error: true, message: errMessage });
      }
      context.commit('setConfirmingOrderStatus', false);
    },
  },
};
