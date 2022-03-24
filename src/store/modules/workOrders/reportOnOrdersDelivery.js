import {
  SET_ORDERS_DELIVERED,
  CLEAR_REPORT_ON_ORDERS_DELIVERY_RESULT,
  SET_REPORT_ON_ORDERS_DELIVERY_RESULT,
  SET_REPORTING_ON_ORDER_DELIVERY_STATUS,
  SET_SYSTEM_MESSAGE,
} from '@/store/mutation-types';
import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';
import { reportServerOnOrdersDelivery } from '@/serverRequests/orders.requests';
import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';


/**
 * Данный модуль предназначен для сообщения серверу о доставке распоряжений на рабочий полигон.
 */
export const reportOnOrdersDelivery = {
  getters: {
    /**
     * Возвращает результат сообщения серверу о доставке новых распоряжений
     * на данный полигон управления.
     */
    getReportOnOrdersDeliveryResult(state) {
      return state.reportOnOrdersDeliveryResult;
    },
  },

  mutations: {
    /**
     * "Чистит" текущий результат сообщения серверу о доставке новых распоряжений
     * на данный полигон управления.
     */
    [CLEAR_REPORT_ON_ORDERS_DELIVERY_RESULT] (state) {
      if (state.reportOnOrdersDeliveryResult) {
        state.reportOnOrdersDeliveryResult = null;
      }
    },

    /**
     * Устанавливает результат сообщения серверу о доставке новых распоряжений
     * на данный полигон управления.
     */
    [SET_REPORT_ON_ORDERS_DELIVERY_RESULT] (state, { error, message }) {
      state.reportOnOrdersDeliveryResult = {
        error,
        message,
      };
    },

    /**
     * Устанавливает статус процесса (идет процесс / не идет процесс) сообщения серверу
     * о доставке новых распоряжений на данный полигон управления.
     */
    [SET_REPORTING_ON_ORDER_DELIVERY_STATUS] (state, status) {
      if (state.reportingOnOrdersDelivery !== status) {
        state.reportingOnOrdersDelivery = status;
      }
    },

    /**
     * Для заданного распоряжения позволяет установить дату его доставки на рабочее место.
     * Выставить дату доставки необходимо в 1-3 местах:
     * 1) если подтверждение доставки происходит на станции (рабочее место ДСП), то подтверждать
     *    необходимо в 3 местах:
     *    само рабочее распоряжение, секция "Кому" распоряжения (если ДСП там есть в адресатах:
     *    его может там не быть, если распоряжение создано Оператором при ДСП этой же станции)
     *    и список адресатов на станции
     * 2) если подтверждает доставку распоряжения Оператор при ДСП, то подтверждать необходимо в 2 местах:
     *    само рабочее распоряжение, список адресатов на станции
     * 3) для ДНЦ и ЭЦД подтверждать доставку необходимо в 2 местах: само рабочее распоряжение,
     *    секция "Кому" распоряжения
     */
    [SET_ORDERS_DELIVERED] (state, { orderIds, deliverDateTime, userWorkPoligon }) {
      if (!orderIds || !deliverDateTime || !userWorkPoligon) {
        return;
      }
      for (let orderId of orderIds) {
        const order = state.data.find((el) => el._id === orderId);
        if (!order) {
          continue;
        }
        // подтверждаем доставку самого рабочего распоряжения
        order.deliverDateTime = deliverDateTime;

        // сюда поместим ссылку на массив, в котором будем искать элемент для установки даты подтверждения
        // доставки (из секции "Кому" распоряжения)
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
                  deliverDateTime,
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
              deliverDateTime,
            });
          }
        }
      }
    },
  },

  actions: {
    /**
     * Для распоряжений, для которых ранее не сообщалось серверу об их доставке на данный
     * полигон управления, сообщает о том, что они доставлены.
     */
    async reportOnOrdersDelivery(context, orders) {
      if (!context.getters.canUserReportOnOrdersDelivery) {
        const errMessage = 'Для работы с документами необходимо быть на дежурстве и обладать соответствующими правами';
        context.commit(SET_REPORT_ON_ORDERS_DELIVERY_RESULT, { error: true, message: errMessage });
        return;
      }
      context.commit(CLEAR_REPORT_ON_ORDERS_DELIVERY_RESULT);

      // Сюда поместим идентификаторы тех распоряжений, о доставке которых необходимо сообщить серверу.
      const newDeliveredOrderIds = !orders ? [] :
        orders.filter((order) => !order.deliverDateTime).map((order) => order._id);
      if (!newDeliveredOrderIds.length) {
        return;
      }
      context.commit(SET_REPORTING_ON_ORDER_DELIVERY_STATUS, true);

      try {
        const responseData = await reportServerOnOrdersDelivery({
          orderIds: newDeliveredOrderIds,
          deliverDateTime: new Date(),
        });
        context.commit(SET_REPORT_ON_ORDERS_DELIVERY_RESULT, { error: false, message: responseData.message });
        context.commit(SET_SYSTEM_MESSAGE, { error: false, datetime: new Date(), message: responseData.message });
        context.commit(SET_ORDERS_DELIVERED, {
          orderIds: responseData.orderIds,
          deliverDateTime: new Date(responseData.deliverDateTime),
          userWorkPoligon: context.getters.getUserWorkPoligon,
        });

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка при сообщении серверу о доставке входящих распоряжений');
        context.commit(SET_REPORT_ON_ORDERS_DELIVERY_RESULT, { error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });

      } finally {
        context.commit(SET_REPORTING_ON_ORDER_DELIVERY_STATUS, false);
      }
    },
  },
};
