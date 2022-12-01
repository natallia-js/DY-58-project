import { store } from '@/store';
import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';
import { getOrderTextElementTypedValue } from '@/additional/formOrderText';


export function getWorkOrderTimeSpanInfo(timeSpan) {
  return timeSpan ? {
    start: timeSpan.start ? new Date(timeSpan.start) : null,
    end: timeSpan.end ? new Date(timeSpan.end) : null,
    tillCancellation: Boolean(timeSpan.tillCancellation),
  } : null;
}

export function getWorkOrderGeneralInfoObject(order) {
  return {
    _id: order._id,
    hidden: order.hidden,
    createDateTime: order.createDateTime ? new Date(order.createDateTime) : null,
    creator: order.creator,
    createdOnBehalfOf: order.createdOnBehalfOf,
    dncToSend: order.dncToSend.map((item) => {
      return {
        confirmDateTime: item.confirmDateTime ? new Date(item.confirmDateTime) : null,
        deliverDateTime: item.deliverDateTime ? new Date(item.deliverDateTime) : null,
        confirmForPostFIO: item.confirmForPostFIO,
        post: item.post,
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
        confirmForPostFIO: item.confirmForPostFIO,
        post: item.post,
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
        confirmForPostFIO: item.confirmForPostFIO,
        post: item.post,
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
        additionalId: item.additionalId ? +item.additionalId : null,
        post: item.post,
        fio: item.fio,
        placeTitle: item.placeTitle,
        position: item.position ? +item.position : null,
        existingStructuralDivision: Boolean(item.existingStructuralDivision),
        sendOriginal: Boolean(item.sendOriginal),
        confirmDateTime: item.confirmDateTime ? new Date(item.confirmDateTime) : null,
      };
    }),
    // Если текущий рабочий полигон - не станция, то это поле останется пустым.
    // В противном случае заполняем данное поле информацией, отсеивая информацию не по текущей станции.
    stationWorkPlacesToSend: order.stationWorkPlacesToSend
      .filter((item) =>
        store.getters.getUserWorkPoligon &&
        store.getters.getUserWorkPoligon.type === WORK_POLIGON_TYPES.STATION &&
        String(item.id) === String(store.getters.getUserWorkPoligon.code)
      )
      .map((item) => {
        return {
          confirmDateTime: item.confirmDateTime ? new Date(item.confirmDateTime) : null,
          deliverDateTime: item.deliverDateTime ? new Date(item.deliverDateTime) : null,
          post: item.post,
          fio: item.fio,
          id: +item.id,
          workPlaceId: item.workPlaceId ? +item.workPlaceId : null,
          placeTitle: item.placeTitle,
          sendOriginal: Boolean(item.sendOriginal),
          type: item.type,
          _id: item._id,
        };
      }),
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
    timeSpan: getWorkOrderTimeSpanInfo(order.timeSpan),
    type: order.type,
    workPoligon: order.workPoligon ? {
      id: order.workPoligon.id,
      workPlaceId: order.workPoligon.workPlaceId,
      type: order.workPoligon.type,
    } : null,
    orderChainId: order.orderChain.chainId,
    specialTrainCategories: order.specialTrainCategories,
    assertDateTime: order.assertDateTime ? new Date(order.assertDateTime) : null,
    dispatchedOnOrder: order.dispatchedOnOrder,
    invalid: order.invalid,
  };
}

export function getWorkOrderObject(order) {
  return {
    ...getWorkOrderGeneralInfoObject(order),
    deliverDateTime: order.deliverDateTime ? new Date(order.deliverDateTime) : null,
    confirmDateTime: order.confirmDateTime ? new Date(order.confirmDateTime) : null,
    senderWorkPoligon: order.senderWorkPoligon ? {
      id: order.senderWorkPoligon.id,
      workPlaceId: order.senderWorkPoligon.workPlaceId,
      type: order.senderWorkPoligon.type,
      title: order.senderWorkPoligon.title,
    } : null,
    sendOriginal: Boolean(order.sendOriginal),
  };
}
