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
import orderDispatchedOnThisWorkPoligon from '@/additional/orderDispatchedOnThisWorkPoligon';


/**
 * Позволяет сформировать массив данных для отображения в журнале ДНЦ/ДСП.
 */
export default function prepareDataForDisplayInDNC_DSPJournal(responseData, getOrderSeqNumberFunction) {
  if (!responseData || !responseData.length) {
    return [];
  }
  const userWorkPoligon = store.getters.getUserWorkPoligon;
  // формирует строку с датой-временем утверждения заданного документа
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
  const getAddresseeObject = (addressee) => ({
    ...addressee,
    confirmDateTime: !addressee.confirmDateTime ? null : new Date(addressee.confirmDateTime),
    editDateTime: !addressee.editDateTime ? null : new Date(addressee.editDateTime),
  });
  const isStationWorkPoligon = store.getters.isStationWorkPoligon;
  return responseData
    .map((order) => ({
      ...order,
      createDateTime: order.createDateTime ? new Date(order.createDateTime) : null,
      assertDateTime: order.assertDateTime ? new Date(order.assertDateTime) : null,
      dncToSend: !order.dncToSend ? [] : order.dncToSend.map((el) => getAddresseeObject(el)),
      dspToSend: !order.dspToSend ? [] : order.dspToSend.map((el) => getAddresseeObject(el)),
      ecdToSend: !order.ecdToSend ? [] : order.ecdToSend.map((el) => getAddresseeObject(el)),
      otherToSend: !order.otherToSend ? [] : order.otherToSend.map((el) => getAddresseeObject(el)),
      // ДСП нужна информация лишь по своей станции, ДНЦ - по всем станциям
      stationWorkPlacesToSend: !order.stationWorkPlacesToSend ? [] :
        !isStationWorkPoligon ?
        // Исключаем главных ДСП (они будут в списке dspToSend)
        order.stationWorkPlacesToSend.filter((el) => el.workPlaceId).map((el) => getAddresseeObject(el)) :
        // Выбираем только работников текущей станции
        order.stationWorkPlacesToSend.filter((el) => el.id === userWorkPoligon.code).map((el) => getAddresseeObject(el)),
      orderText: !order.orderText ? null : {
        ...order.orderText,
        orderText: !order.orderText.orderText ? null :
          order.orderText.orderText.map((el) => {
            return {
              ...el,
              value: getOrderTextElementTypedValue(el).view,
            };
          })
      },
      additionallyInformedPeople: order.additionallyInformedPeople,
    }))
    .map((order, index) => {
      const orderWasCreatedOnThisWorkPoligon = orderDispatchedOnThisWorkPoligon(order);
      return {
        // dataKey в таблице
        id: order._id,
        // тип документа
        type: order.type,
        // № п/п документа
        seqNum: getOrderSeqNumberFunction(index),
        // дата-время создания и утверждения документа
        assertDateTime: order.type === ORDER_PATTERN_TYPES.ORDER ? orderCreateAssertDateTimeString(order) :
          order.assertDateTime ? `${getLocaleDateString(order.assertDateTime)}<br/>${getLocaleTimeString(order.assertDateTime)}` : '',
        // номер документа
        number: order.type !== ORDER_PATTERN_TYPES.CONTROL ? order.number : '',
        // содержание документа (текст)
        orderContent: getExtendedOrderTitle(order) + '<br/>' +
          formOrderText({
            orderTextArray: order.orderText.orderText,
            dncToSend: order.dncToSend,
            dspToSend: order.dspToSend,
            ecdToSend: order.ecdToSend,
            otherToSend: order.otherToSend,
            insertEmptyLineBeforeText: true,
          }) + '<br/>Передал: ' +
          `${order.creator.post} ${order.creator.fio} ${order.createdOnBehalfOf ? ` (от имени ${order.createdOnBehalfOf})` : ''} ${order.workPoligon?.title || order.senderWorkPoligon?.title}`,
        // кто принял документ
        orderAcceptor: formAcceptorsStrings({
          // ДСП нужна информация только по адресатам в рамках своей станции в случае ВХОДЯЩЕГО документа,
          // для ИСХОДЯЩЕГО документа ДСП нужна информация по всем адресатам;
          // ДНЦ в случае ВХОДЯЩЕГО документа нужна информация только по тому лицу в рамках своего участка ДНЦ,
          // который подтвердил этот документ;
          // для ИСХОДЯЩЕГО документа ДНЦ нужна информация по всем адресатам;
          dncToSend: orderWasCreatedOnThisWorkPoligon
            ? order.dncToSend // для исходящего документа
            : isStationWorkPoligon // для входящего документа
              ? []
              : order.dncToSend.filter((el) => el.type === userWorkPoligon.type && el.id === userWorkPoligon.code),
          dspToSend: orderWasCreatedOnThisWorkPoligon
            ? order.dspToSend // для исходящего документа
            : isStationWorkPoligon // для входящего документа
              ? order.dspToSend.filter((el) => el.type === userWorkPoligon.type && el.id === userWorkPoligon.code)
              : [],
          ecdToSend: orderWasCreatedOnThisWorkPoligon
            ? order.ecdToSend // для исходящего документа
            : [], // для входящего документа
          otherToSend: orderWasCreatedOnThisWorkPoligon
            ? order.otherToSend // для исходящего документа
            : [], // для входящего документа
          stationWorkPlacesToSend: orderWasCreatedOnThisWorkPoligon
            ? order.stationWorkPlacesToSend // для исходящего документа
            : isStationWorkPoligon // для входящего документа
              ? order.stationWorkPlacesToSend.filter((el) => el.type === userWorkPoligon.type && el.id === userWorkPoligon.code)
              : [],
          additionallyInformedPeople: isStationWorkPoligon ? order.additionallyInformedPeople : null,
        }),
        // true - оригинал распоряжения, false - его копия; для распоряжения, изданного на данном рабочем
        // полигоне, экземпляр этого распоряжения - всегда оригинал; для распоряжения, пришедшего из вне,
        // необходимо сделать дополнительные проверки (это распоряжение должно быть адресовано данному
        // рабочему полигону, оттуда и берем признак "оригинал"/"копия")
        sendOriginal: Boolean(
          orderWasCreatedOnThisWorkPoligon ||
          (
            userWorkPoligon && userWorkPoligon.type === WORK_POLIGON_TYPES.STATION && order.dspToSend &&
            order.dspToSend.find((el) =>
              String(el.id) === String(userWorkPoligon.code) &&
              sendOriginal(el.sendOriginal))
          ) ||
          (
            userWorkPoligon && userWorkPoligon.type === WORK_POLIGON_TYPES.DNC_SECTOR && order.dncToSend &&
            order.dncToSend.find((el) =>
              String(el.id) === String(userWorkPoligon.code) &&
              sendOriginal(el.sendOriginal))
          )
        ),
        invalid: order.invalid,
        additionallyInformedPeople: order.additionallyInformedPeople,
      };
    });
}
