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
  SET_ORDER_CONFIRMED_FOR_OTHER_RECEIVERS,
  SET_ORDER_ASSERT_DATE_TIME,
  SET_SYSTEM_MESSAGE,
} from '@/store/mutation-types';
import {
  CONFIRM_ORDER_ACTION,
  CONFIRM_ORDER_FOR_OTHERS_ACTION,
  CONFIRM_ORDER_FOR_OTHER_RECEIVERS_ACTION,
} from '@/store/action-types';
import {
  confirmOrderForMyself,
  confirmOrdersForOthers,
  confirmOrderForOtherReceivers,
} from '@/serverRequests/orders.requests';
import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';
import { getWorkOrderTimeSpanInfo } from '@/store/modules/workOrders/getWorkOrderObject';


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
        state.confirmOrdersResults = state.confirmOrdersResults.map((item) => {
          if (item.orderId === orderId) {
            return { ...item, error, message, wasShownToUser: false };
          }
          return item;
        });
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
        state.confirmOrdersForOthersResults = state.confirmOrdersForOthersResults.map((item) => {
          if (item.orderId === orderId) {
            return { ...item, error, message, wasShownToUser: false };
          }
          return item;
        });
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
      if (!orderIds || !orderIds.length) {
        return;
      }
      state.confirmOrdersResults = state.confirmOrdersResults.map((item) => {
        if (orderIds.includes(item.orderId)) {
          return { ...item, wasShownToUser: true };
        }
        return item;
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
      state.confirmOrdersForOthersResults = state.confirmOrdersForOthersResults.map((item) => {
        if (orderIds.includes(item.orderId)) {
          return { ...item, wasShownToUser: true };
        }
        return item;
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
     * Для заданного распоряжения позволяет установить дату его подтверждения (данное распоряжение
     * находится в списке входящих уведомлений и после подтверждения должно перейти в список
     * распоряжений, находящихся в работе).
     * Выставить дату подтверждения необходимо в 1-3 местах:
     * 1) если подтверждение происходит на станции самим ДСП, то подтверждать необходимо в 3 местах:
     *    само рабочее распоряжение (для перемещения его в распоряжения в работе), секция "Кому" распоряжения
     *    (если ДСП там есть в адресатах: его может там не быть, если распоряжение создано Оператором
     *    при ДСП этой же станции) и список адресатов на станции
     * 2) если подтверждает распоряжение Оператор при ДСП, то подтверждать необходимо в 2 местах:
     *    само рабочее распоряжение, список адресатов на станции
     * 3) для ДНЦ и ЭЦД подтверждать необходимо в 2 местах: само рабочее распоряжение, секция "Кому" распоряжения
     */
    [SET_ORDER_CONFIRMED] (state, props) {
      const { orderId, orderTimeSpan, confirmDateTime, userPost, userFIO, userWorkPoligon } = props;

      const order = state.data.find((el) => el._id === orderId);
      if (!order || !confirmDateTime || !userWorkPoligon) {
        return;
      }
      // подтверждаем само распоряжение (переносим его в рабочие распоряжения)
      order.confirmDateTime = confirmDateTime;
      order.timeSpan = orderTimeSpan;

      // сюда поместим ссылку на массив, в котором будем искать элемент для установки даты подтверждения
      // (из секции "Кому" распоряжения)
      let sectorsToFindData;

      switch (userWorkPoligon.type) {
        case WORK_POLIGON_TYPES.STATION:
          // секция "Кому"
          if (!userWorkPoligon.subCode) {
            sectorsToFindData = order.dspToSend;
          }
          // список адресатов на станции
          if (order.stationWorkPlacesToSend) {
            const index = order.stationWorkPlacesToSend.findIndex((el) =>
              el.type === userWorkPoligon.type &&
              String(el.id) === String(userWorkPoligon.code) &&
              (
                (!el.workPlaceId && !userWorkPoligon.subCode) ||
                (el.workPlaceId && userWorkPoligon.subCode && String(el.workPlaceId) === String(userWorkPoligon.subCode))
              )
            );
            if (index >= 0) {
              order.stationWorkPlacesToSend.splice(index, 1, {
                ...order.stationWorkPlacesToSend[index],
                confirmDateTime,
                post: userPost || null,
                fio: userFIO || null,
              });
            }
          }
          break;
        case WORK_POLIGON_TYPES.DNC_SECTOR:
          // секция "Кому"
          sectorsToFindData = order.dncToSend;
          break;
        case WORK_POLIGON_TYPES.ECD_SECTOR:
          // секция "Кому"
          sectorsToFindData = order.ecdToSend;
          break;
      }
      if (sectorsToFindData) {
        const index = sectorsToFindData.findIndex((el) =>
          el.type === userWorkPoligon.type &&
          String(el.id) === String(userWorkPoligon.code)
        );
        if (index >= 0) {
          sectorsToFindData.splice(index, 1, {
            ...sectorsToFindData[index],
            confirmDateTime,
            post: userPost || null,
            fio: userFIO || null,
          });
        }
      }
    },

    /**
     * Для заданного распоряжения позволяет установить информацию о его подтверждении
     * за другие полигоны управления. При этом на данных полигонах управления подтвержденные
     * распоряжения автоматически перейдут из секции входящих уведомлений в секцию рабочих распоряжений.
     */
    [SET_ORDER_CONFIRMED_FOR_OTHERS] (state, props) {
      const {
        orderId,
        orderTimeSpan,
        actualGlobalConfirmWorkPoligonsInfo,
        actualLocalConfirmWorkPoligonsInfo,
      } = props;

      const order = state.data.find((el) => el._id === orderId);
      if (!order) {
        return;
      }
      order.timeSpan = orderTimeSpan;

      // подтверждение в секции "Кому" распоряжения
      if (actualGlobalConfirmWorkPoligonsInfo) {
        actualGlobalConfirmWorkPoligonsInfo.forEach((poligon) => {
          let foundPoligon;
          switch (poligon.workPoligonType) {
            case WORK_POLIGON_TYPES.STATION:
              foundPoligon = order.dspToSend ? order.dspToSend.find((dsp) => String(dsp.id) === String(poligon.workPoligonId)) : null;
              break;
            case WORK_POLIGON_TYPES.DNC_SECTOR:
              foundPoligon = order.dncToSend ? order.dncToSend.find((dnc) => String(dnc.id) === String(poligon.workPoligonId)) : null;
              break;
            case WORK_POLIGON_TYPES.ECD_SECTOR:
              foundPoligon = order.ecdToSend ? order.ecdToSend.find((ecd) => String(ecd.id) === String(poligon.workPoligonId)) : null;
              break;
          }
          if (foundPoligon) {
            foundPoligon.confirmDateTime = poligon.confirmDateTime;
            foundPoligon.post = poligon.post;
            foundPoligon.fio = poligon.fio;
            foundPoligon.confirmForPostFIO = poligon.confirmForPostFIO;
          }
        });
      }
      // подтверждение на станции
      if (actualLocalConfirmWorkPoligonsInfo && order.stationWorkPlacesToSend) {
        actualLocalConfirmWorkPoligonsInfo.forEach((poligon) => {
          const foundWorkPlace = order.stationWorkPlacesToSend.find((swp) =>
            String(swp.id) === String(poligon.workPoligonId) &&
            (
              (!swp.workPlaceId && !poligon.workPlaceId) ||
              (swp.workPlaceId && poligon.workPlaceId && String(swp.workPlaceId) === String(poligon.workPlaceId))
            )
          );
          if (foundWorkPlace) {
            foundWorkPlace.confirmDateTime = poligon.confirmDateTime;
            foundWorkPlace.post = poligon.post;
            foundWorkPlace.fio = poligon.fio;
          }
        });
      }
    },

    /**
     * Для заданного распоряжения позволяет установить информацию о его подтверждении
     * за "иные" полигоны управления.
     */
    [SET_ORDER_CONFIRMED_FOR_OTHER_RECEIVERS] (state, { orderId, orderTimeSpan, confirmDateTime }) {
      const order = state.data.find((el) => el._id === orderId);
      if (!order || !order.otherToSend || !order.otherToSend.length) {
        return;
      }
      order.timeSpan = orderTimeSpan;
      order.otherToSend.forEach((el) => {
        el.confirmDateTime = confirmDateTime;
      });
    },

    /**
     * Для заданного распоряжения позволяет установить дату-время его утверждения.
     */
    [SET_ORDER_ASSERT_DATE_TIME] (state, { orderId, assertDateTime }) {
      const order = state.data.find((el) => el._id === orderId);
      if (order) {
        order.assertDateTime = assertDateTime;
      }
    },
  },

  actions: {
    /**
     * Позволяет для данного входящего уведомления выставить статус "подтверждено" на сервере.
     */
    async [CONFIRM_ORDER_ACTION] (context, { orderId }) {
      if (!context.getters.canUserConfirmOrder) {
        const errMessage = 'У вас нат прав на подтверждение распоряжения';
        context.commit(SET_CONFIRM_ORDER_RESULT, { orderId, error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }
      if (context.getters.isOrderBeingConfirmed(orderId)) {
        const errMessage = 'Распоряжение уже проходит процедуру подтверждения';
        context.commit(SET_CONFIRM_ORDER_RESULT, { orderId, error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }
      context.commit(CLEAR_CONFIRM_ORDER_RESULT, orderId);
      context.commit(SET_ORDER_BEING_CONFIRMED, orderId);
      const confirmDateTime = new Date();
      try {
        const responseData = await confirmOrderForMyself({ id: orderId, confirmDateTime });
        context.commit(SET_CONFIRM_ORDER_RESULT, { orderId, error: false, message: responseData.message });
        context.commit(SET_SYSTEM_MESSAGE, { error: false, datetime: new Date(), message: responseData.message });
        context.commit(SET_ORDER_CONFIRMED, {
          orderId: responseData.id,
          orderTimeSpan: getWorkOrderTimeSpanInfo(responseData.timeSpan),
          confirmDateTime: new Date(responseData.confirmDateTime),
          userPost: responseData.userPost,
          userFIO: responseData.userFIO,
          userWorkPoligon: context.getters.getUserWorkPoligon,
        });
        context.commit(SET_ORDER_ASSERT_DATE_TIME, {
          orderId,
          assertDateTime: responseData.assertDateTime ? new Date(responseData.assertDateTime) : null,
        });

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка подтверждения распоряжения');
        context.commit(SET_CONFIRM_ORDER_RESULT, { orderId, error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });

      } finally {
        context.commit(SET_ORDER_FINISHED_BEING_CONFIRMED, orderId);
      }
    },

    /**
     * Позволяет для данного рабочего распоряжения выставить статус "подтверждено" на сервере
     * за ряд рабочих полигонов.
     */
    async [CONFIRM_ORDER_FOR_OTHERS_ACTION] (context, { orderId, confirmWorkPoligons }) {
      if (!orderId) {
        return;
      }
      if (!context.getters.canUserConfirmOrderForOthers) {
        const errMessage = 'У вас нет права подтверждать распоряжение за других';
        context.commit(SET_CONFIRM_ORDER_FOR_OTHERS_RESULT, { orderId, error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }
      if (context.getters.isOrderBeingConfirmedForOthers(orderId)) {
        const errMessage = 'Распоряжение уже проходит процедуру подтверждения';
        context.commit(SET_CONFIRM_ORDER_FOR_OTHERS_RESULT, { orderId, error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }
      if (!confirmWorkPoligons || !confirmWorkPoligons.length) {
        const errMessage = 'Не определены рабочие полигоны для подтверждения распоряжения';
        context.commit(SET_CONFIRM_ORDER_FOR_OTHERS_RESULT, { orderId, error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }
      context.commit(CLEAR_CONFIRM_ORDER_FOR_OTHERS_RESULT, orderId);
      context.commit(SET_ORDER_BEING_CONFIRMED_FOR_OTHERS, orderId);
      const confirmDateTime = new Date();
      try {
        const responseData = await confirmOrdersForOthers({
          confirmWorkPoligons,
          orderId,
          confirmDateTime,
        });
        context.commit(SET_CONFIRM_ORDER_FOR_OTHERS_RESULT, { orderId, error: false, message: responseData.message });
        context.commit(SET_SYSTEM_MESSAGE, { error: false, datetime: new Date(), message: responseData.message });
        context.commit(SET_ORDER_CONFIRMED_FOR_OTHERS, {
          orderId: responseData.orderId,
          orderTimeSpan: getWorkOrderTimeSpanInfo(responseData.timeSpan),
          // полигоны, за которые подтверждение прошло в секции "Кому" распоряжения
          actualGlobalConfirmWorkPoligonsInfo: responseData.actualGlobalConfirmWorkPoligonsInfo ?
            responseData.actualGlobalConfirmWorkPoligonsInfo.map((el) => ({
              ...el,
              confirmDateTime: el.confirmDateTime ? new Date(el.confirmDateTime) : null,
            })) : null,
          // рабочие места на станции, за которые прошло подтверждение
          actualLocalConfirmWorkPoligonsInfo: responseData.actualLocalConfirmWorkPoligonsInfo ?
            responseData.actualLocalConfirmWorkPoligonsInfo.map((el) => ({
              ...el,
              confirmDateTime: el.confirmDateTime ? new Date(el.confirmDateTime) : null,
            })) : null,
        });
        context.commit(SET_ORDER_ASSERT_DATE_TIME, {
          orderId,
          assertDateTime: responseData.assertDateTime ? new Date(responseData.assertDateTime) : null,
        });

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка подтверждения распоряжения');
        context.commit(SET_CONFIRM_ORDER_FOR_OTHERS_RESULT, { orderId, error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });

      } finally {
        context.commit(SET_ORDER_FINISHED_BEING_CONFIRMED_FOR_OTHERS, orderId);
      }
    },

    /**
     * Позволяет для данного рабочего распоряжения выставить статус "подтверждено" на сервере
     * за все "иные" рабочие полигоны.
     */
    async [CONFIRM_ORDER_FOR_OTHER_RECEIVERS_ACTION] (context, orderId) {
      if (!orderId) {
        return;
      }
      if (!context.getters.canUserConfirmOrderForOthers) {
        const errMessage = 'У вас нет права подтверждать распоряжение за других';
        context.commit(SET_CONFIRM_ORDER_FOR_OTHERS_RESULT, { orderId, error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }
      if (context.getters.isOrderBeingConfirmedForOthers(orderId)) {
        const errMessage = 'Распоряжение уже проходит процедуру подтверждения';
        context.commit(SET_CONFIRM_ORDER_FOR_OTHERS_RESULT, { orderId, error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }
      context.commit(CLEAR_CONFIRM_ORDER_FOR_OTHERS_RESULT, orderId);
      context.commit(SET_ORDER_BEING_CONFIRMED_FOR_OTHERS, orderId);
      const confirmDateTime = new Date();
      try {
        const responseData = await confirmOrderForOtherReceivers({ orderId, confirmDateTime });
        context.commit(SET_CONFIRM_ORDER_FOR_OTHERS_RESULT, { orderId, error: false, message: responseData.message });
        context.commit(SET_SYSTEM_MESSAGE, { error: false, datetime: new Date(), message: responseData.message });
        context.commit(SET_ORDER_CONFIRMED_FOR_OTHER_RECEIVERS, {
          orderId: responseData.orderId,
          orderTimeSpan: getWorkOrderTimeSpanInfo(responseData.timeSpan),
          confirmDateTime,
        });
        context.commit(SET_ORDER_ASSERT_DATE_TIME, {
          orderId,
          assertDateTime: responseData.assertDateTime ? new Date(responseData.assertDateTime) : null,
        });

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка подтверждения распоряжения');
        context.commit(SET_CONFIRM_ORDER_FOR_OTHERS_RESULT, { orderId, error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });

      } finally {
        context.commit(SET_ORDER_FINISHED_BEING_CONFIRMED_FOR_OTHERS, orderId);
      }
    },
  },
};
