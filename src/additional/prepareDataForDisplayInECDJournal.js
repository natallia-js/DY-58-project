import { store } from '@/store';
import { getLocaleDateTimeString } from '@/additional/dateTimeConvertions';
import {
  getOrderTextElementTypedValue,
  sendOriginal,
  formOrderText,
  formAcceptorsStrings,
  getExtendedOrderTitle,
} from '@/additional/formOrderText';
import { SPECIAL_TELECONTROL_ORDER_SIGN } from '@/constants/orderPatterns';
import { ORDER_PATTERN_TYPES } from '@/constants/orderPatterns';
import orderDispatchedOnThisWorkPoligon from '@/additional/orderDispatchedOnThisWorkPoligon';


/**
 * Позволяет сформировать массив данных для отображения в журнале ЭЦД.
 */
export default function prepareDataForDisplayInECDJournal(responseData, getOrderSeqNumberFunction) {
  if (!responseData || !responseData.length) {
    return [];
  }
  const userWorkPoligon = store.getters.getUserWorkPoligon;
  return responseData
    .map((order) => ({
      ...order,
      dncToSend: !order.dncToSend ? [] :
        order.dncToSend.map((el) => ({ ...el, confirmDateTime: !el.confirmDateTime ? null : new Date(el.confirmDateTime) })),
      dspToSend: !order.dspToSend ? [] :
        order.dspToSend.map((el) => ({ ...el, confirmDateTime: !el.confirmDateTime ? null : new Date(el.confirmDateTime) })),
      ecdToSend: !order.ecdToSend ? [] :
        order.ecdToSend.map((el) => ({ ...el, confirmDateTime: !el.confirmDateTime ? null : new Date(el.confirmDateTime) })),
      otherToSend: !order.otherToSend ? [] :
        order.otherToSend.map((el) => ({ ...el, confirmDateTime: !el.confirmDateTime ? null : new Date(el.confirmDateTime) })),
      // Исключаем главных ДСП (они будут в списке dspToSend)
      stationWorkPlacesToSend: !order.stationWorkPlacesToSend ? [] :
        order.stationWorkPlacesToSend.filter((el) => el.workPlaceId)
          .map((el) => ({ ...el, confirmDateTime: !el.confirmDateTime ? null : new Date(el.confirmDateTime)})),
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
      notificationOrderText: !order?.connectedOrder?.orderText ? null : {
        ...order.connectedOrder.orderText,
        orderText: !order.connectedOrder.orderText ? null :
          order.connectedOrder.orderText.map((el) => {
            return {
              ...el,
              value: getOrderTextElementTypedValue(el),
            };
          })
      },
    }))
    .map((order, index) => {
      const orderTextData = formOrderText({
        orderTextArray: order.orderText.orderText,
        dncToSend: order.dncToSend,
        dspToSend: order.dspToSend,
        ecdToSend: order.ecdToSend,
        otherToSend: order.otherToSend,
        insertEmptyLineBeforeText: true,
        asString: false,
        includeFIO: false,
      });

      let toWhomString = orderTextData.toWhom;
      if (orderTextData.toWhomCopy) {
        if (toWhomString) {
          toWhomString += '<br/><br/>';
        }
        toWhomString += orderTextData.toWhomCopy;
      }

      // Создатель документа
      let orderSender = `${order.creator.post} ${order.creator.fio}`;
      // Если на приказ / запрещение есть уведомление и его создатель отличен от создателя
      // приказа / запрещения, то информация о создателе уведомления включается в orderSender
      if (order.connectedOrder && order.connectedOrder.creator.id !== order.creator.id) {
        orderSender += `<br/>${order.connectedOrder.creator.post} ${order.connectedOrder.creator.fio}`;
      }

      const orderWasCreatedOnThisWorkPoligon = orderDispatchedOnThisWorkPoligon(order);

      return {
        // dataKey в таблице
        id: order._id,
        type: order.type,
        seqNum: getOrderSeqNumberFunction(index),
        // кому адресовано распоряжение (соответствующие строки "Кому" и "Копия")
        toWhom: toWhomString,
        // дата-время утверждения распоряжения
        assertDateTime: order.assertDateTime ? getLocaleDateTimeString(new Date(order.assertDateTime), false) : '',
        number: order.type !== ORDER_PATTERN_TYPES.CONTROL ? order.number : '',
        orderContent: `${getExtendedOrderTitle(order)}<br/>${orderTextData.text}`,
        orderAcceptor: formAcceptorsStrings({
          // ЭЦД в случае ВХОДЯЩЕГО документа нужна информация только по тому лицу в рамках своего участка ЭЦД,
          // который подтвердил этот документ
          dncToSend: orderWasCreatedOnThisWorkPoligon ? order.dncToSend : [],
          dspToSend: orderWasCreatedOnThisWorkPoligon ? order.dspToSend : [],
          ecdToSend: orderWasCreatedOnThisWorkPoligon
            ? order.ecdToSend
            : order.ecdToSend.filter((el) => el.type === userWorkPoligon.type && el.id === userWorkPoligon.code),
          otherToSend: orderWasCreatedOnThisWorkPoligon ? order.otherToSend : [],
          stationWorkPlacesToSend: orderWasCreatedOnThisWorkPoligon ? order.stationWorkPlacesToSend : [],
          // для ряда приказов ЭЦД указывается особая отметка ТУ (для приказов, формируемых на
          // отключение/включение коммутационного аппарата по телеуправлению); эту отметку необходимо
          // отобразить в журнале в графе "Кто принял"
          isTYOrder: order.specialTrainCategories && order.specialTrainCategories.includes(SPECIAL_TELECONTROL_ORDER_SIGN),
        }),
        orderSender,
        // время уведомления (на приказ/запрещение) - из связанного распоряжения
        orderNotificationDateTime: order.connectedOrder ? getLocaleDateTimeString(new Date(order.connectedOrder.startDate), false) : '',
        // номер уведомления - из связанного распоряжения
        notificationNumber: order?.connectedOrder?.number ?? '',
        // текст уведомления - из связанного распоряжения
        notificationText: !order.notificationOrderText? '' :
          formOrderText({
            orderTextArray: order.notificationOrderText.orderText,
            dncToSend: [],
            dspToSend: [],
            ecdToSend: [],
            otherToSend: [],
            insertEmptyLineBeforeText: true,
            asString: false,
            includeFIO: false,
          }).text,
        // для работы с издателем распоряжения (см. формирование sendOriginal)
        workPoligon: order.workPoligon,
        // true - оригинал распоряжения, false - его копия; для распоряжения, изданного на данном рабочем
        // полигоне, экземпляр этого распоряжения - всегда оригинал; для распоряжения, пришедшего из вне,
        // необходимо сделать дополнительные проверки (это распоряжение должно быть адресовано данному
        // рабочему полигону, оттуда и берем признак "оригинал"/"копия")
        sendOriginal: Boolean(
          orderDispatchedOnThisWorkPoligon(order) ||
          (
            order.ecdToSend && userWorkPoligon &&
            order.ecdToSend.find((el) =>
              String(el.id) === String(userWorkPoligon.code) &&
              sendOriginal(el.sendOriginal))
          )
        ),
      };
    });
}
