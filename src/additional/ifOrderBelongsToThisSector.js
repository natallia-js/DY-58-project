import { store } from '@/store';
import orderDispatchedOnThisWorkPoligon from '@/additional/orderDispatchedOnThisWorkPoligon';
import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';

/**
 *
 */
function ifOrderBelongsToThisSector(order) {
  const userWorkPoligon = store.getters.getUserWorkPoligon;
  if (!order || !userWorkPoligon)
    return false;
  // проверяем, был ли документ издан на данном рабочем полигоне
  if (orderDispatchedOnThisWorkPoligon(order)) {
    return true;}
  // проверяем, был ли документ адресован данному рабочему полигону
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
