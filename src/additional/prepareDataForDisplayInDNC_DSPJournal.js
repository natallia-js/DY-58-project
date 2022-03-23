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
import { ORDER_PATTERN_TYPES } from '@/constants/orderPatterns';


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
  const orderCreateAssertDateTimeString = (order) => {
    let displayString = '';
    const orderCreateDateString = order.createDateTime ? getLocaleDateString(order.createDateTime) : '';
    const orderCreateTimeString = order.createDateTime ? getLocaleTimeString(order.createDateTime) : '';
    const orderAssertDateString = order.assertDateTime ? getLocaleDateString(order.assertDateTime) : '';
    const orderAssertTimeString = order.assertDateTime ? getLocaleTimeString(order.assertDateTime) : '';
    if (orderCreateDateString === orderAssertDateString) {
      displayString = `${orderCreateDateString}<br/>${orderCreateTimeString}<br/>${orderAssertTimeString}`;
    } else {
      displayString = `${orderCreateDateString}<br/>${orderCreateTimeString}<br/>${orderAssertDateString}<br/>${orderAssertTimeString}`;
    }
    return displayString;
  };
  const isDSP_or_DSPoperator = store.getters.isDSP_or_DSPoperator;
  return responseData
    .map((order) => ({
      ...order,
      createDateTime: order.createDateTime ? new Date(order.createDateTime) : null,
      assertDateTime: order.assertDateTime ? new Date(order.assertDateTime) : null,
      dncToSend: !order.dncToSend ? [] :
        order.dncToSend.map((el) => ({ ...el, confirmDateTime: !el.confirmDateTime ? null : new Date(el.confirmDateTime)})),
      dspToSend: !order.dspToSend ? [] :
        order.dspToSend.map((el) => ({ ...el, confirmDateTime: !el.confirmDateTime ? null : new Date(el.confirmDateTime)})),
      ecdToSend: !order.ecdToSend ? [] :
        order.ecdToSend.map((el) => ({ ...el, confirmDateTime: !el.confirmDateTime ? null : new Date(el.confirmDateTime)})),
      otherToSend: !order.otherToSend ? [] :
        order.otherToSend.map((el) => ({ ...el, confirmDateTime: !el.confirmDateTime ? null : new Date(el.confirmDateTime)})),
      // Информация по станции (своей) нужна только ДСП
      stationWorkPlacesToSend: !isDSP_or_DSPoperator ? [] :
        !order.stationWorkPlacesToSend ? [] :
        // выбираем только работников текущей станции
        order.stationWorkPlacesToSend.filter((el) => el.id === userWorkPoligon.code)
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
      // дата-время создания и утверждения распоряжения
      assertDateTime: order.type === ORDER_PATTERN_TYPES.ORDER ? orderCreateAssertDateTimeString(order) :
        order.assertDateTime ? `${getLocaleDateString(order.assertDateTime)}<br/>${getLocaleTimeString(order.assertDateTime)}` : '',
      number: order.number,
      orderContent: getExtendedOrderTitle(order) + '<br/>' +
        formOrderText({
          orderTextArray: order.orderText.orderText,
          dncToSend: order.dncToSend,
          dspToSend: order.dspToSend,
          ecdToSend: order.ecdToSend,
          otherToSend: order.otherToSend,
          insertEmptyLineBeforeText: true,
        }) + '<br/><b>Передал:</b> ' +
        `${order.creator.post} ${order.creator.fio} ${order.createdOnBehalfOf ? ` (от имени ${order.createdOnBehalfOf})` : ''} ${order.workPoligon.title}`,
      orderAcceptor: formAcceptorsStrings({
        // ДСП нужна информация только по своей станции
        dncToSend: isDSP_or_DSPoperator ? [] : order.dncToSend,
        dspToSend: isDSP_or_DSPoperator ? [] : order.dspToSend,
        ecdToSend: isDSP_or_DSPoperator ? [] : order.ecdToSend,
        otherToSend: isDSP_or_DSPoperator ? [] : order.otherToSend,
        stationWorkPlacesToSend: order.stationWorkPlacesToSend,
      }),
      // true - оригинал распоряжения, false - его копия; для распоряжения, изданного на данном рабочем
      // полигоне, экземпляр этого распоряжения - всегда оригинал; для распоряжения, пришедшего из вне,
      // необходимо сделать дополнительные проверки (это распоряжение должно быть адресовано данному
      // рабочему полигону, оттуда и берем признак "оригинал"/"копия")
      sendOriginal: Boolean(
        orderDispatchedOnThisWorkPoligon(order) ||
        (
          order.workPoligon === WORK_POLIGON_TYPES.STATION && order.dspToSend && userWorkPoligon &&
          order.dspToSend.find((el) =>
            String(el.id) === String(userWorkPoligon.code) &&
            sendOriginal(el.sendOriginal))
        ) ||
        (
          order.workPoligon === WORK_POLIGON_TYPES.DNC_SECTOR && order.dncToSend && userWorkPoligon &&
          order.dncToSend.find((el) =>
            String(el.id) === String(userWorkPoligon.code) &&
            sendOriginal(el.sendOriginal))
        )
      ),
    }));
}
