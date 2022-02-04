import { store } from '@/store';
import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';
import {
  OrderPatternElementType,
  OrderPatternElementType_Future,
} from '@/constants/orderPatterns';


function getOrderTextElementTypedValue(element) {
  if (!element) {
    return;
  }
  switch (element.type) {
    case OrderPatternElementType.DATE:
    case OrderPatternElementType.TIME:
    case OrderPatternElementType.DATETIME:
      return new Date(element.value);
    case OrderPatternElementType.DR_TRAIN_TABLE:
    case OrderPatternElementType_Future.OBJECT:
    case OrderPatternElementType_Future.OBJECTS_LIST:
      return JSON.parse(element.value);
    default:
      return element.value;
  }
}

export function getWorkOrderGeneralInfoObject(order) {
  return {
    _id: order._id,
    createDateTime: order.createDateTime ? new Date(order.createDateTime) : null,
    creator: order.creator,
    createdOnBehalfOf: order.createdOnBehalfOf,
    dncToSend: order.dncToSend.map((item) => {
      return {
        confirmDateTime: item.confirmDateTime ? new Date(item.confirmDateTime) : null,
        deliverDateTime: item.deliverDateTime ? new Date(item.deliverDateTime) : null,
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
        post: item.post,
        fio: item.fio,
        placeTitle: item.placeTitle,
        sendOriginal: Boolean(item.sendOriginal),
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
    timeSpan: order.timeSpan ? {
      start: order.timeSpan.start ? new Date(order.timeSpan.start) : null,
      end: order.timeSpan.end ? new Date(order.timeSpan.end) : null,
      tillCancellation: Boolean(order.timeSpan.tillCancellation),
    } : null,
    type: order.type,
    workPoligon: order.workPoligon ? {
      id: order.workPoligon.id,
      workPlaceId: order.workPoligon.workPlaceId,
      type: order.workPoligon.type,
    } : null,
    orderChainId: order.orderChain.chainId,
    specialTrainCategories: order.specialTrainCategories,
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
    sendOriginal: order.sendOriginal,
  };
}
