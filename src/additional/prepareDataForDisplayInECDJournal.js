import { store } from '@/store';
import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';
import { getLocaleDateTimeString } from '@/additional/dateTimeConvertions';
import {
  getOrderTextElementTypedValue,
  sendOriginal,
  formOrderText,
  formAcceptorsStrings,
  getExtendedOrderTitle,
} from '@/additional/formOrderText';
import { SPECIAL_TELECONTROL_ORDER_SIGN } from '@/constants/orderPatterns';


const formToWhomString = (order) => {
  // Смотрим, на какого типа полигоне издано распоряжение.
  // Если не на участке ЭЦД, то не формируем строку "Кому".
  if (order.workPoligon.type !== WORK_POLIGON_TYPES.ECD_SECTOR) {
    return '';
  }
  const otherReceivers = order.otherToSend;
  if (!otherReceivers || !otherReceivers.length) {
    return '';
  }
  let toWhom = '';
  let toWhomCopy = '';
  const getToWhomData = (el) => {
    return `${el.placeTitle}${el.post ? ' ' + el.post : ''}`;
  };
  otherReceivers.forEach((el) => {
    const subString = getToWhomData(el);
    if (!subString || !subString.length) {
      return;
    }
    if (sendOriginal(el.sendOriginal)) {
      toWhom += toWhom.length > 0 ? `,<br/>${subString}` : subString;
    } else {
      toWhomCopy += toWhomCopy.length > 0 ? `,<br/>${subString}` : subString;
    }
  });
  let res = toWhom.length > 0 ? toWhom : '';
  if (toWhomCopy.length > 0) {
    if (res.length > 0) {
      res += '<br/>';
    }
    res += `<b>Копия:</b><br/>${toWhomCopy}`;
  }
  return res;
};

const orderDispatchedOnThisWorkPoligon = (order) => {
  const userWorkPoligon = store.getters.getUserWorkPoligon;
  return order && order.workPoligon && userWorkPoligon &&
    order.workPoligon.type === userWorkPoligon.type &&
    String(order.workPoligon.id) === String(userWorkPoligon.code);
};

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
        order.dncToSend.map((el) => ({ ...el, confirmDateTime: !el.confirmDateTime ? null : new Date(el.confirmDateTime)})),
      dspToSend: !order.dspToSend ? [] :
        order.dspToSend.map((el) => ({ ...el, confirmDateTime: !el.confirmDateTime ? null : new Date(el.confirmDateTime)})),
      ecdToSend: !order.ecdToSend ? [] :
        order.ecdToSend.map((el) => ({ ...el, confirmDateTime: !el.confirmDateTime ? null : new Date(el.confirmDateTime)})),
      otherToSend: !order.otherToSend ? [] :
        order.otherToSend.map((el) => ({ ...el, confirmDateTime: !el.confirmDateTime ? null : new Date(el.confirmDateTime)})),
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
    }))
    .map((order, index) => ({
      // dataKey в таблице
      id: order._id,
      type: order.type,
      seqNum: getOrderSeqNumberFunction(index),
      // кому адресовано распоряжение (соответствующие строки "Кому" и "Копия" формируем на
      // основании сведений, содержащихся в "Иных" адресатах - только для документов, изданных ЭЦД!
      // для документов, изданных не-ЭЦД, данное поле будет оставаться пустым)
      toWhom: formToWhomString(order),
      // дата-время утверждения распоряжения
      assertDateTime: order.assertDateTime ? getLocaleDateTimeString(new Date(order.assertDateTime), false) : '',
      number: order.number,
      orderContent: getExtendedOrderTitle(order) + '<br/>' +
        formOrderText({
          orderTextArray: order.orderText.orderText,
          dncToSend: order.dncToSend,
          dspToSend: order.dspToSend,
          ecdToSend: order.ecdToSend,
          otherToSend: order.otherToSend,
          insertEmptyLineBeforeText: true,
        }),
      orderAcceptor: formAcceptorsStrings({
        dncToSend: order.dncToSend,
        dspToSend: order.dspToSend,
        ecdToSend: order.ecdToSend,
        otherToSend: order.otherToSend,
        stationWorkPlacesToSend: order.stationWorkPlacesToSend,
        // для ряда приказов ЭЦД указывается особая отметка ТУ (для приказов, формируемых на
        // отключение/включение коммутационного аппарата по телеуправлению); эту отметку необходимо
        // отобразить в журнале в графе "Кто принял"
        isTYOrder: order.specialTrainCategories && order.specialTrainCategories.includes(SPECIAL_TELECONTROL_ORDER_SIGN),
      }),
      orderSender: `${order.creator.post} ${order.creator.fio}`,
      // время уведомления (на приказ/запрещение) - из связанного распоряжения
      orderNotificationDateTime: order.connectedOrder ? getLocaleDateTimeString(new Date(order.connectedOrder.startDate), false) : '',
      // номер уведомления - из связанного распоряжения
      notificationNumber: order.connectedOrder ? order.connectedOrder.number : '',
      // для работы с издателем распоряжения
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
    }));
}
