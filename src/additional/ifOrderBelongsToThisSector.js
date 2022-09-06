import { store } from '@/store';
import orderDispatchedOnThisWorkPoligon from '@/additional/orderDispatchedOnThisWorkPoligon';
import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';

/**
 *
 */
function ifOrderBelongsToThisSector(order) {
  if (!order)
    return false;
  // проверяем, было ли распоряжение издано на данном рабочем полигоне
  if (orderDispatchedOnThisWorkPoligon(order)) {
    return true;}
  // проверяем, было ли распоряжение адресовано данному рабочему полигону
  const userWorkPoligon = store.getters.getUserWorkPoligon;
  switch (userWorkPoligon.type) {
    case WORK_POLIGON_TYPES.STATION:
      if (order.dspToSend) {
        return order.dspToSend.find((el) => el.id === userWorkPoligon.code) ? true : false;
      }
      break;
    case WORK_POLIGON_TYPES.DNC_SECTOR:
      if (order.dncToSend) {
        return order.dncToSend.find((el) => el.id === userWorkPoligon.code) ? true : false;
      }
      break;
    case WORK_POLIGON_TYPES.ECD_SECTOR:
      if (order.ecdToSend) {
        return order.ecdToSend.find((el) => el.id === userWorkPoligon.code) ? true : false;
      }
      break;
  }
  return false;
}

export default ifOrderBelongsToThisSector;
