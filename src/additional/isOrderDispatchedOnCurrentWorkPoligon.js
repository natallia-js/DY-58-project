import { store } from '@/store';

/**
 * Возвращает true, если распоряжение были издано на текущем рабочем полигоне, false - в противном случае.
 */
const isOrderDispatchedOnCurrentWorkPoligon = (orderSenderWorkPoligon, considerWorkPlace = false) => {
  const currentUserWorkPoligon = store.getters.getUserWorkPoligon;

  return currentUserWorkPoligon && orderSenderWorkPoligon &&
    currentUserWorkPoligon.type === orderSenderWorkPoligon.type &&
    String(currentUserWorkPoligon.code) === String(orderSenderWorkPoligon.id) &&
    (
      !considerWorkPlace ||
      (!currentUserWorkPoligon.subCode && !orderSenderWorkPoligon.workPlaceId) ||
      (String(currentUserWorkPoligon.subCode) === String(orderSenderWorkPoligon.workPlaceId))
    )
};

export default isOrderDispatchedOnCurrentWorkPoligon;
