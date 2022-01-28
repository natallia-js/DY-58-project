import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';
import {
  SET_CONFIRM_ORDER_RESULT,
  SET_CONFIRM_ORDER_FOR_OTHERS_RESULT,
  CLEAR_CONFIRM_ORDER_RESULT,
  CLEAR_CONFIRM_ORDER_FOR_OTHERS_RESULT,
  SET_ORDER_BEING_CONFIRMED,
  SET_ORDER_BEING_CONFIRMED_FOR_OTHERS,
  SET_ORDER_FINISHED_BEING_CONFIRMED,
  SET_ORDER_FINISHED_BEING_CONFIRMED_FOR_OTHERS,
  SET_CONFIRM_ORDER_RESULT_SEEN_BY_USER,
  SET_CONFIRM_ORDER_FOR_OTHERS_RESULT_SEEN_BY_USER,
  CLEAR_ALL_CONFIRM_ORDERS_RESULTS_SEEN_BY_USER,
  CLEAR_ALL_CONFIRM_ORDERS_FOR_OTHERS_RESULTS_SEEN_BY_USER,
  SET_ORDER_CONFIRMED,
  SET_ORDER_CONFIRMED_FOR_OTHERS,
} from '@/store/mutation-types';
import { confirmOrderForMyself, confirmOrdersForOthers } from '@/serverRequests/orders.requests';
import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';


/**
 * Данный модуль предназначен для подтверждения входящих и рабочих распоряжений.
 */
export const confirmOrder = {
  getters: {
    /**
     * Возвращает true, если входящее распоряжение с заданным id в данный момент времени проходит
     * процедуру подтверждения, false - в противном случае.
     */
    isOrderBeingConfirmed(state) {
      return (orderId) => state.ordersBeingConfirmed.includes(orderId);
    },

    /**
     * Возвращает true, если рабочее распоряжение с заданным id в данный момент времени проходит
     * процедуру подтверждения за другие полигоны управления (получатели данного распоряжения),
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
     * Возвращает количество тех результатов подтверждения распоряжений (входящих уведомлений),
     * которые не были отображены пользователю.
     */
    getConfirmOrdersResultsUnseenByUserNumber(_state, getters) {
      return getters.getConfirmOrdersResultsUnseenByUser.length;
    },

    /**
     * Возвращает те результаты подтверждения распоряжений (за другие полигоны),
     * которые не были отображены пользователю.
     */
    getConfirmOrdersForOthersResultsUnseenByUser(state) {
      return state.confirmOrdersForOthersResults.filter((res) => !res.wasShownToUser);
    },

    /**
     * Возвращает количество тех результатов подтверждения распоряжений (за другие полигоны),
     * которые не были отображены пользователю.
     */
     getConfirmOrdersForOthersResultsUnseenByUserNumber(_state, getters) {
      return getters.getConfirmOrdersForOthersResultsUnseenByUser.length;
    },
  },

  mutations: {
    /**
     * Позволяет сохранить результат подтверждения распоряжения (входящего уведомления).
     */
    [SET_CONFIRM_ORDER_RESULT] (state, { orderId, error, message }) {
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
    [SET_CONFIRM_ORDER_FOR_OTHERS_RESULT] (state, { orderId, error, message }) {
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
    [CLEAR_CONFIRM_ORDER_RESULT] (state, orderId) {
      state.confirmOrdersResults = state.confirmOrdersResults.filter((item) => item.orderId !== orderId);
    },

    /**
     * Удаляет результат подтверждения распоряжения с заданным id за другие полигоны.
     */
    [CLEAR_CONFIRM_ORDER_FOR_OTHERS_RESULT] (state, orderId) {
      state.confirmOrdersForOthersResults = state.confirmOrdersForOthersResults.filter((item) =>
        item.orderId !== orderId);
    },

    /**
     * Сохраняет id распоряжения (входящего уведомления), за которое идет подтверждение.
     */
    [SET_ORDER_BEING_CONFIRMED] (state, orderId) {
      if (!state.ordersBeingConfirmed.includes(orderId)) {
        state.ordersBeingConfirmed.push(orderId);
      }
    },

    /**
     * Сохраняет id распоряжения, за полигон(ы)-приемник(и) которого идет подтверждение.
     */
    [SET_ORDER_BEING_CONFIRMED_FOR_OTHERS] (state, orderId) {
      if (!state.ordersBeingConfirmedForOthers.includes(orderId)) {
        state.ordersBeingConfirmedForOthers.push(orderId);
      }
    },

    /**
     * Удаляет сохраненный id распоряжения, операция подтверждения которого была завершена.
     */
    [SET_ORDER_FINISHED_BEING_CONFIRMED] (state, orderId) {
      state.ordersBeingConfirmed = state.ordersBeingConfirmed.filter((item) => item !== orderId);
    },

    /**
     * Удаляет сохраненный id распоряжения, операция подтверждения за полигоны-получатели
     * которого была завершена.
     */
    [SET_ORDER_FINISHED_BEING_CONFIRMED_FOR_OTHERS] (state, orderId) {
      state.ordersBeingConfirmedForOthers = state.ordersBeingConfirmedForOthers.filter((item) => item !== orderId);
    },

    /**
     * Для данных id распоряжений (входящих уведомлений) устанавливает флаг просмотра
     * пользователем информации об их подтверждении.
     */
    [SET_CONFIRM_ORDER_RESULT_SEEN_BY_USER] (state, orderIds) {
      if (!orderIds) {
        return;
      }
      orderIds.forEach((orderId) => {
        const orderInfo = state.confirmOrdersResults.find((item) => item.orderId === orderId);
        if (orderInfo) {
          orderInfo.wasShownToUser = true;
        }
      });
    },

    /**
     * Для данных id распоряжений устанавливает флаг просмотра пользователем информации об их
     * подтверждении за другие полигоны управления.
     */
    [SET_CONFIRM_ORDER_FOR_OTHERS_RESULT_SEEN_BY_USER] (state, orderIds) {
      if (!orderIds) {
        return;
      }
      orderIds.forEach((orderId) => {
        const orderInfo = state.confirmOrdersForOthersResults.find((item) => item.orderId === orderId);
        if (orderInfo) {
          orderInfo.wasShownToUser = true;
        }
      });
    },

    /**
     * Удаляет все результаты подтверждения распоряжений (входящих уведомлений), просмотренные пользователем.
     */
    [CLEAR_ALL_CONFIRM_ORDERS_RESULTS_SEEN_BY_USER] (state) {
      state.confirmOrdersResults = state.confirmOrdersResults.filter((item) => !item.wasShownToUser);
    },

    /**
     * Удаляет все результаты подтверждения распоряжений (за другие полигоны управления), просмотренные пользователем.
     */
    [CLEAR_ALL_CONFIRM_ORDERS_FOR_OTHERS_RESULTS_SEEN_BY_USER] (state) {
      state.confirmOrdersForOthersResults = state.confirmOrdersForOthersResults.filter((item) => !item.wasShownToUser);
    },

    /**
     * Для заданного распоряжения позволяет установить дату его подтверждения (когда данное распоряжение
     * находится в списке входящих уведомлений).
     */
    [SET_ORDER_CONFIRMED] (state, { orderId, confirmDateTime }) {
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
     * Для заданного распоряжения позволяет установить информацию о его подтверждении
     * за другие полигоны управления.
     */
    [SET_ORDER_CONFIRMED_FOR_OTHERS] (state, { orderId, workPoligons }) {
      if (!orderId || !workPoligons || !workPoligons.length) {
        return;
      }
      const order = state.data.find((el) => el._id === orderId);
      if (!order) {
        return;
      }
      workPoligons.forEach((poligon) => {
        let foundPoligon;
        let foundWorkPlace;
        switch (poligon.workPoligonType) {
          case WORK_POLIGON_TYPES.STATION:
            foundPoligon = order.dspToSend.find((dsp) => String(dsp.id) === String(poligon.workPoligonId) && !dsp.confirmDateTime);
            foundWorkPlace = order.stationWorkPlacesToSend.find((swp) =>
              String(swp.id) === String(poligon.workPoligonId) && String(swp.workPlaceId) === String(poligon.workPlaceId) && !swp.confirmDateTime);
            break;
          case WORK_POLIGON_TYPES.DNC_SECTOR:
            foundPoligon = order.dncToSend.find((dnc) => String(dnc.id) === String(poligon.workPoligonId) && !dnc.confirmDateTime);
            break;
          case WORK_POLIGON_TYPES.ECD_SECTOR:
            foundPoligon = order.ecdToSend.find((ecd) => String(ecd.id) === String(poligon.workPoligonId) && !ecd.confirmDateTime);
            break;
        }
        if (foundPoligon) {
          foundPoligon.confirmDateTime = poligon.confirmDateTime ? new Date(poligon.confirmDateTime) : null,
          foundPoligon.post = poligon.post;
          foundPoligon.fio = poligon.fio;
        }
        if (foundWorkPlace) {
          foundWorkPlace.confirmDateTime = poligon.confirmDateTime ? new Date(poligon.confirmDateTime) : null,
          foundWorkPlace.post = poligon.post;
          foundWorkPlace.fio = poligon.fio;
        }
      });
    },
  },

  actions: {
    /**
     * Позволяет для данного входящего уведомления выставить статус "подтверждено" на сервере.
     */
    async confirmOrder(context, { orderId }) {
      if (!context.getters.canUserConfirmOrder) {
        context.commit(SET_CONFIRM_ORDER_RESULT, { orderId, error: true, message: 'У вас нат прав на подтверждение распоряжения' });
        return;
      }
      if (context.getters.isOrderBeingConfirmed(orderId)) {
        context.commit(SET_CONFIRM_ORDER_RESULT, { orderId, error: true, message: 'Распоряжение уже проходит процедуру подтверждения' });
        return;
      }
      context.commit(CLEAR_CONFIRM_ORDER_RESULT, orderId);
      context.commit(SET_ORDER_BEING_CONFIRMED, orderId);
      const confirmDateTime = new Date();
      try {
        const responseData = await confirmOrderForMyself({ id: orderId, confirmDateTime });
        context.commit(SET_CONFIRM_ORDER_RESULT, { orderId, error: false, message: responseData.message });
        context.commit(SET_ORDER_CONFIRMED, { orderId: responseData.id, confirmDateTime: responseData.confirmDateTime });

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка подтверждения распоряжения');
        context.commit(SET_CONFIRM_ORDER_RESULT, { orderId, error: true, message: errMessage });

      } finally {
        context.commit(SET_ORDER_FINISHED_BEING_CONFIRMED, orderId);
      }
    },

    /**
     * Позволяет для данного рабочего распоряжения выставить статус "подтверждено" на сервере
     * за ряд рабочих полигонов.
     */
    async confirmOrderForOthers(context, { orderId, confirmWorkPoligons }) {
      if (!orderId) {
        return;
      }
      if (!context.getters.canUserConfirmOrderForOthers) {
        context.commit(SET_CONFIRM_ORDER_FOR_OTHERS_RESULT, { orderId, error: true, message: 'У вас нет права подтверждать распоряжение за других' });
        return;
      }
      if (!confirmWorkPoligons || !confirmWorkPoligons.length) {
        context.commit(SET_CONFIRM_ORDER_FOR_OTHERS_RESULT, { orderId, error: true, message: 'Не определены рабочие полигоны для подтверждения распоряжения' });
        return;
      }
      context.commit(CLEAR_CONFIRM_ORDER_FOR_OTHERS_RESULT, orderId);
      context.commit(SET_ORDER_BEING_CONFIRMED_FOR_OTHERS, orderId);
      const confirmDateTime = new Date();console.log('confirmWorkPoligons',confirmWorkPoligons)
      try {
        const responseData = await confirmOrdersForOthers({
          confirmWorkPoligons,
          orderId,
          confirmDateTime,
        });console.log('responseData.confirmWorkPoligons',responseData.confirmWorkPoligons)
        context.commit(SET_CONFIRM_ORDER_FOR_OTHERS_RESULT, { orderId, error: false, message: responseData.message });
        context.commit(SET_ORDER_CONFIRMED_FOR_OTHERS, { orderId: responseData.orderId, workPoligons: responseData.confirmWorkPoligons });

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка подтверждения распоряжения');
        context.commit(SET_CONFIRM_ORDER_FOR_OTHERS_RESULT, { orderId, error: true, message: errMessage });

      } finally {
        context.commit(SET_ORDER_FINISHED_BEING_CONFIRMED_FOR_OTHERS, orderId);
      }
    },
  },
};
