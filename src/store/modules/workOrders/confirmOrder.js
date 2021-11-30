import axios from 'axios';
import { DY58_SERVER_ACTIONS_PATHS } from '../../../constants/servers';
import { WORK_POLIGON_TYPES } from '../../../constants/appCredentials';


/**
 * Данный модуль предназначен для подтверждения входящих и рабочих распоряжений.
 */
export const confirmOrder = {
  getters: {
    /**
     * Для заданного распоряжения возвращает массив объектов рабочих полигонов, по которым
     * не было подтверждения получения данного распоряжения.
     */
    getOrderUnconfirmedWorkPoligons(state) {
      return (orderId) => {
        const order = state.data.find((el) => el._id === orderId);
        if (!order) {
          return [];
        }
        const unconfirmedWorkPoligons = [];
        const findUnconfirmedWorkPoligons = (typedPoligons) => {
          if (typedPoligons && typedPoligons.length) {
            typedPoligons.forEach((poligon) => {
              if (!poligon.confirmDateTime) {
                unconfirmedWorkPoligons.push({
                  workPoligonId: poligon.id,
                  workPoligonType: poligon.type,
                });
              }
            });
          }
        };
        findUnconfirmedWorkPoligons(order.dspToSend);
        findUnconfirmedWorkPoligons(order.dncToSend);
        findUnconfirmedWorkPoligons(order.ecdToSend);
        return unconfirmedWorkPoligons;
      };
    },

    /**
     * Возвращает id подтверждаемых распоряжений (входящих уведомлений).
     */
    getOrdersBeingConfirmed(state) {
      return state.ordersBeingConfirmed;
    },

    /**
     * Возвращает id подтверждаемых распоряжений (за полигоны-приемники которого проводится подтверждение).
     */
    getOrdersBeingConfirmedForOthers(state) {
      return state.ordersBeingConfirmedForOthers;
    },

    /**
     * Возвращает true, если входящее распоряжение с заданным id в данный момент времени проходит
     * процедуру подтверждения, false - в противном случае.
     */
    isOrderBeingConfirmed(state) {
      return (orderId) => state.ordersBeingConfirmed.includes(orderId);
    },

    /**
     * Возвращает true, если рабочее распоряжение с заданным id в данный момент времени проходит
     * процедуру подтверждения за другие полигоны управления (приемники данного распоряжения),
     * false - в противном случае.
     */
    isOrderBeingConfirmedForOthers(state) {
      return (orderId) => state.ordersBeingConfirmedForOthers.includes(orderId);
    },

    /**
     * Возвращает те результаты подтверждения распоряжений (входящих уведомлений),
     * которые не были отображены пользователю.
     */
    getConfirmOrdersResultsUnseenByUser(state) {
      return state.confirmOrdersResults.filter((res) => !res.wasShownToUser);
    },

    /**
     * Возвращает те результаты подтверждения распоряжений (за другие полигоны),
     * которые не были отображены пользователю.
     */
    getConfirmOrdersForOthersResultsUnseenByUser(state) {
      return state.confirmOrdersForOthersResults.filter((res) => !res.wasShownToUser);
    },
  },

  mutations: {
    /**
     * Позволяет сохранить результат подтверждения распоряжения (входящего уведомления).
     */
    setConfirmOrderResult(state, { orderId, error, message }) {
      const orderInfo = state.confirmOrdersResults.find((item) => item.orderId === orderId);
      if (!orderInfo) {
        state.confirmOrdersResults.push({ orderId, error, message, wasShownToUser: false });
      } else {
        orderInfo.error = error;
        orderInfo.message = message;
        orderInfo.wasShownToUser = false;
      }
    },

    /**
     * Позволяет сохранить результат подтверждения распоряжения за другие полигоны.
     */
    setConfirmOrderForOthersResult(state, { orderId, error, message }) {
      const orderInfo = state.confirmOrdersForOthersResults.find((item) => item.orderId === orderId);
      if (!orderInfo) {
        state.confirmOrdersForOthersResults.push({ orderId, error, message, wasShownToUser: false });
      } else {
        orderInfo.error = error;
        orderInfo.message = message;
        orderInfo.wasShownToUser = false;
      }
    },

    /**
     * Удаляет результат подтверждения распоряжения (входящего уведомления) с заданным id.
     */
    clearConfirmOrderResult(state, orderId) {
      state.confirmOrdersResults = state.confirmOrdersResults.filter((item) => item.orderId !== orderId);
    },

    /**
     * Удаляет результат подтверждения распоряжения с заданным id за другие полигоны.
     */
    clearConfirmOrderForOthersResult(state, orderId) {
      state.confirmOrdersForOthersResults = state.confirmOrdersForOthersResults.filter((item) =>
        item.orderId !== orderId);
    },

    /**
     * Сохраняет id распоряжения (входящего уведомления), за которое идет подтверждение.
     */
    setOrderBeingConfirmed(state, orderId) {
      if (!state.ordersBeingConfirmed.includes(orderId)) {
        state.ordersBeingConfirmed.push(orderId);
      }
    },

    /**
     * Сохраняет id распоряжения, за полигон(ы)-приемник(и) которого идет подтверждение.
     */
    setOrderBeingConfirmedForOthers(state, orderId) {
      if (!state.ordersBeingConfirmedForOthers.includes(orderId)) {
        state.ordersBeingConfirmedForOthers.push(orderId);
      }
    },

    /**
     * Удаляет сохраненный id распоряжения, операция подтверждения которого была завершена.
     */
    setOrderFinishedBeingConfirmed(state, orderId) {
      state.ordersBeingConfirmed = state.ordersBeingConfirmed.filter((item) => item !== orderId);
    },

    /**
     * Удаляет сохраненный id распоряжения, операция подтверждения за полигоны-получатели
     * которого была завершена.
     */
    setOrderFinishedBeingConfirmedForOthers(state, orderId) {
      state.ordersBeingConfirmedForOthers = state.ordersBeingConfirmedForOthers.filter((item) => item !== orderId);
    },

    /**
     * Для данного id распоряжения (входящего уведомления) устанавливает флаг просмотра
     * пользователем информации о его подтверждении.
     */
    setConfirmOrderResultSeenByUser(state, orderId) {
      const orderInfo = state.confirmOrdersResults.find((item) => item.orderId === orderId);
      if (orderInfo) {
        orderInfo.wasShownToUser = true;
      }
    },

    /**
     * Для данного id распоряжения устанавливает флаг просмотра пользователем информации о его
     * подтверждении за другие полигоны управления.
     */
    setConfirmOrderForOthersResultSeenByUser(state, orderId) {
      const orderInfo = state.confirmOrdersForOthersResults.find((item) => item.orderId === orderId);
      if (orderInfo) {
        orderInfo.wasShownToUser = true;
      }
    },

    /**
     * Удаляет все результаты подтверждения распоряжений (входящих уведомлений), просмотренные пользователем.
     */
    clearAllConfirmOrdersResultsSeenByUser(state) {
      state.confirmOrdersResults = state.confirmOrdersResults.filter((item) => !item.wasShownToUser);
    },

    /**
     * Удаляет все результаты подтверждения распоряжений (за другие полигоны управления), просмотренные пользователем.
     */
    clearAllConfirmOrdersForOthersResultsSeenByUser(state) {
      state.confirmOrdersForOthersResults = state.confirmOrdersForOthersResults.filter((item) => !item.wasShownToUser);
    },

    /**
     * Для заданного распоряжения позволяет установить дату его подтверждения (когда данное распоряжение
     * находится в списке входящих уведомлений).
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

    /**
     * Для заданного распоряжения позволяет установить дату его подтверждения за другие полигоны управления.
     */
    setOrderConfirmedForOthers(state, { orderId, workPoligons, confirmDateTime }) {
      if (!workPoligons || !workPoligons.length) {
        return;
      }
      const order = state.data.find((el) => el._id === orderId);
      if (!order) {
        return;
      }
      workPoligons.forEach((poligon) => {
        let foundPoligon;
        switch (poligon.workPoligonType) {
          case WORK_POLIGON_TYPES.STATION:
            foundPoligon = order.dspToSend.find((dsp) => dsp.id === poligon.workPoligonId);
            break;
          case WORK_POLIGON_TYPES.DNC_SECTOR:
            foundPoligon = order.dncToSend.find((dnc) => dnc.id === poligon.workPoligonId);
            break;
          case WORK_POLIGON_TYPES.ECD_SECTOR:
            foundPoligon = order.ecdToSend.find((ecd) => ecd.id === poligon.workPoligonId);
            break;
        }
        if (foundPoligon) {
          foundPoligon.confirmDateTime = confirmDateTime;
        }
      });
    },
  },

  actions: {
    /**
     * Позволяет для данного входящего уведомления выставить статус "подтверждено" на сервере.
     */
     async confirmOrder(context, { orderId }) {
      if (!context.getters.isUserOnDuty) {
        return;
      }

      context.commit('clearConfirmOrderResult', orderId);
      context.commit('setOrderBeingConfirmed', orderId);

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
        context.commit('setConfirmOrderResult', { orderId, error: false, message: response.data.message });
        context.commit('setOrderConfirmed', { orderId: response.data.id, confirmDateTime });

      } catch (error) {
        let errMessage;
        if (error.response) {
          // The request was made and server responded
          errMessage = 'Ошибка подтверждения распоряжения: ' + error.response.data ? error.response.data.message : JSON.stringify(error);
        } else if (error.request) {
          // The request was made but no response was received
          errMessage = 'Ошибка подтверждения распоряжения: сервер не отвечает';
        } else {
          // Something happened in setting up the request that triggered an Error
          errMessage = 'Произошла неизвестная ошибка при подтверждении распоряжения: ' + error.message || JSON.stringify(error);
        }
        context.commit('setConfirmOrderResult', { orderId, error: true, message: errMessage });
      }
      context.commit('setOrderFinishedBeingConfirmed', orderId);
    },

    /**
     * Позволяет для данного рабочего распоряжения выставить статус "подтверждено" на сервере
     * за ряд рабочих полигонов.
     */
    async confirmOrderForOthers(context, { orderId, confirmWorkPoligons }) {
      if (!context.getters.isUserOnDuty || !confirmWorkPoligons || !confirmWorkPoligons.length) {
        return;
      }
      context.commit('clearConfirmOrderForOthersResult', orderId);
      context.commit('setOrderBeingConfirmedForOthers', orderId);

      try {
        const headers = {
          'Authorization': `Bearer ${context.getters.getCurrentUserToken}`,
        };
        const confirmDateTime = new Date();
        const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.confirmOrdersForOthers,
          {
            workPoligonType: context.getters.getUserWorkPoligon.type,
            workPoligonId: context.getters.getUserWorkPoligon.code,
            confirmWorkPoligons,
            orderId,
            confirmDateTime,
          },
          { headers }
        );
        context.commit('setConfirmOrderForOthersResult', { orderId, error: false, message: response.data.message });
        context.commit('setOrderConfirmedForOthers', { orderId: response.data.orderId, workPoligons: response.data.confirmWorkPoligons, confirmDateTime });

      } catch (error) {
        let errMessage;
        if (error.response) {
          // The request was made and server responded
          errMessage = 'Ошибка подтверждения распоряжения: ' + error.response.data ? error.response.data.message : JSON.stringify(error);
        } else if (error.request) {
          // The request was made but no response was received
          errMessage = 'Ошибка подтверждения распоряжения: сервер не отвечает';
        } else {
          // Something happened in setting up the request that triggered an Error
          errMessage = 'Произошла неизвестная ошибка при подтверждении распоряжения: ' + error.message || JSON.stringify(error);
        }
        context.commit('setConfirmOrderForOthersResult', { orderId, error: true, message: errMessage });
      }
      context.commit('setOrderFinishedBeingConfirmedForOthers', orderId);
    },
  },
};
