import { store } from '@/store';

function orderDispatchedOnThisWorkPoligon(order) {
  const userWorkPoligon = store.getters.getUserWorkPoligon;
  return order && order.workPoligon && userWorkPoligon &&
    order.workPoligon.type === userWorkPoligon.type &&
    String(order.workPoligon.id) === String(userWorkPoligon.code);
}

export default orderDispatchedOnThisWorkPoligon;
