import axios from 'axios';
import { DY58_SERVER_ACTIONS_PATHS } from '../../../constants/servers';
import { OrderPatternElementType } from '../../../constants/orderPatterns';
import { ReceiversPosts, WorkMessStates, RECENTLY } from '../../../constants/orders';
import { getLocaleDateTimeString, getTimeSpanString } from '../../../additional/dateTimeConvertions';
import { formOrderText } from '../../../additional/formOrderText';


function getWorkOrderObject(order) {
  return {
    _id: order._id,
    confirmDateTime: order.confirmDateTime ? new Date(order.confirmDateTime) : null,
    createDateTime: order.createDateTime ? new Date(order.createDateTime) : null,
    creator: order.creator,
    createdOnBehalfOf: order.createdOnBehalfOf,
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


export const getWorkOrders = {
  getters: {
    getStartDateToGetData(state) {
      return state.startDateToGetData;
    },

    getLoadingWorkOrdersStatus(state) {
      return state.loadingWorkOrders;
    },

    getErrorLoadingWorkOrders(state) {
      if (state.loadingWorkOrdersResult && state.loadingWorkOrdersResult.error) {
        return state.loadingWorkOrdersResult.message;
      }
      return null;
    },

    getWorkingOrdersToDisplayAsTree(state, getters) {
      const workingOrders = state.data.filter((item) => item.confirmDateTime);
      const groupedWorkingOrders = [];

      const findNodeInNodesChain = (upperLevelNode, nodeId) => {
        if (!upperLevelNode) {
          return null;
        }
        if (upperLevelNode.nextRelatedOrderId === nodeId) {
          return upperLevelNode;
        }
        return findNodeInNodesChain(upperLevelNode.children && upperLevelNode.children.length ? upperLevelNode.children[0] : null, nodeId);
      };

      const findNodeReferencingNodeWithGivenKey = (nodeId) => {
        for (let group of groupedWorkingOrders) {
          const node = findNodeInNodesChain(group, nodeId);
          if (node) {
            return node;
          }
        }
        return null;
      };

      // Распоряжения в массиве рабочих распоряжений идут в хронологическом порядке.
      // Это обязательно!!!
      workingOrders.forEach((order) => {
        const parentNode = findNodeReferencingNodeWithGivenKey(order._id);

        const orderNodeData = {
          key: order._id,
          type: order.type,
          sendOriginal: order.sendOriginal,
          place: order.senderWorkPoligon.title,
          post: order.creator.post,
          fio: order.creator.fio + (order.createdOnBehalfOf ? ` (от имени ${order.createdOnBehalfOf})` : ''),
          orderNum: order.number,
          time: getLocaleDateTimeString(order.createDateTime, false),
          timeSpan: getTimeSpanString(order.timeSpan, getters.isECD),
          orderTitle: order.orderText.orderTitle,
          orderText: formOrderText({
            orderTextArray: order.orderText.orderText,
            dncToSend: order.dncToSend,
            dspToSend: order.dspToSend,
            ecdToSend: order.ecdToSend,
            otherToSend: order.otherToSend,
          }),
          nextRelatedOrderId: order.nextRelatedOrderId,
          children: [],
        };

        if (!parentNode) {
          groupedWorkingOrders.push(orderNodeData);
        } else {
          parentNode.children.push(orderNodeData);
        }
      });
      return groupedWorkingOrders;
    },

    getWorkingOrders(state, getters) {
      const now = new Date();
      return state.data.filter((item) => item.confirmDateTime)
        .map((item, index) => {
          return {
            id: item._id,
            sendOriginal: item.sendOriginal,
            state: (now - item.createDateTime) >= RECENTLY ? WorkMessStates.cameLongAgo : WorkMessStates.cameRecently,
            seqNum: index + 1,
            time: getTimeSpanString(item.timeSpan, getters.isECD),
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
            fio: item.creator.fio + (item.createdOnBehalfOf ? ` (от имени ${item.createdOnBehalfOf})` : ''),
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
    /**
     *
     */
     setStartDateToGetData(state, userLoginDateTime) {
      if (!userLoginDateTime) {
        state.startDateToGetData = new Date();
        return;
      }
      const today = new Date();
      // если функция Date вызывается в качестве конструктора с более чем одним аргументом,
      // то указанные аргументы интерпретируются как локальное время
      const checkDate1 = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 30, 0, 0);
      const checkDate2 = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 19, 30, 0, 0);
      if (checkDate1 <= userLoginDateTime && userLoginDateTime <= checkDate2) {
        state.startDateToGetData = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 0, 0, 0);
      } else {
        state.startDateToGetData = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 19, 0, 0, 0);
      }
    },

    setStartDateToGetDataNoCheck(state, date) {
      if (!(date instanceof Date)) {
        return;
      }
      state.startDateToGetData = date;
    },

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

    /**
     * Позволяет запомнить массив "рабочих" распоряжений.
     */
     setNewWorkOrdersArray(state, newData) {
      if (!newData || !newData.length) {
        if (state.data.length) {
          state.data = [];
        }
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
            startDate: context.getters.getStartDateToGetData,
          },
          { headers }
        );
        context.commit('setLoadingWorkOrdersResult', { error: false, message: null });
        context.commit('setNewWorkOrdersArray', response.data);
        context.dispatch('reportOnOrdersDelivery', response.data);
      } catch (error) {
        let errMessage;
        if (error.response) {
          // The request was made and server responded
          errMessage = 'Ошибка получения информации о рабочих распоряжениях: ' + error.response.data ? error.response.data.message : '?';
        } else if (error.request) {
          // The request was made but no response was received
          errMessage = 'Ошибка получения информации о рабочих распоряжениях: сервер не отвечает';
        } else {
          // Something happened in setting up the request that triggered an Error
          errMessage = 'Произошла неизвестная ошибка при получении информации о рабочих распоряжениях: ' + error.message || '?';
        }
        context.commit('setLoadingWorkOrdersResult', { error: true, message: errMessage });
      }
      context.commit('setLoadingWorkOrdersStatus', false);
    },
  },
}