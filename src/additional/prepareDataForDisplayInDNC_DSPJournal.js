import { store } from '@/store';
import { getLocaleDateString, getLocaleTimeString } from '@/additional/dateTimeConvertions';
import {
  getOrderTextElementTypedValue,
  sendOriginal,
  formOrderText,
  formAcceptorsStrings,
  getExtendedOrderTitle,
} from '@/additional/formOrderText';
import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';


const orderDispatchedOnThisWorkPoligon = (order) => {
  const userWorkPoligon = store.getters.getUserWorkPoligon;
  return order && order.workPoligon && userWorkPoligon &&
    order.workPoligon.type === userWorkPoligon.type &&
    String(order.workPoligon.id) === String(userWorkPoligon.code);
};

/**
 * Позволяет сформировать массив данных для отображения в журнале ДНЦ/ДСП.
 */
export default function prepareDataForDisplayInDNC_DSPJournal(responseData, getOrderSeqNumberFunction) {
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
      // дата-время утверждения распоряжения
      assertDateTime: order.assertDateTime ? `${getLocaleDateString(new Date(order.assertDateTime))}<br/>${getLocaleTimeString(new Date(order.assertDateTime))}` : '',
      number: order.number,
      orderContent: getExtendedOrderTitle(order) + '<br/>' +
        formOrderText({
          orderTextArray: order.orderText.orderText,
          dncToSend: order.dncToSend,
          dspToSend: order.dspToSend,
          ecdToSend: order.ecdToSend,
          otherToSend: order.otherToSend,
        }) + '<br/><b>Передал:</b> ' +
        `${order.creator.post} ${order.creator.fio} ${order.createdOnBehalfOf ? ` (от имени ${order.createdOnBehalfOf})` : ''} ${order.workPoligon.title}`,
      orderAcceptor: formAcceptorsStrings({
        dncToSend: order.dncToSend,
        dspToSend: order.dspToSend,
        ecdToSend: order.ecdToSend,
        otherToSend: order.otherToSend,
      }),
      // true - оригинал распоряжения, false - его копия; для распоряжения, изданного на данном рабочем
      // полигоне, распоряжение - всегда оригинал; для распоряжения, пришедшего из вне, необходимо
      // сделать дополнительные проверки
      sendOriginal: Boolean(
        orderDispatchedOnThisWorkPoligon(order) ||
        (
          order.workPoligon === WORK_POLIGON_TYPES.STATION &&
          order.dspToSend && userWorkPoligon &&
          order.dspToSend.find((el) =>
            String(el.id) === String(userWorkPoligon.code) &&
            sendOriginal(el.sendOriginal))
        ) ||
        (
          order.workPoligon === WORK_POLIGON_TYPES.DNC_SECTOR &&
          order.dncToSend && userWorkPoligon &&
          order.dncToSend.find((el) =>
            String(el.id) === String(userWorkPoligon.code) &&
            sendOriginal(el.sendOriginal))
        )
      ),
    }));
}
