import { createStore } from 'vuex';
import { mainMenuItems } from './modules/mainMenuItems';
import { leftMenuItems } from './modules/leftMenuItems';
import { orderPatterns } from './modules/orderPatterns';
import { currUser } from './modules/currUser';
import { currShift } from './modules/currShift';
import { currDateTime } from './modules/currDateTime';
import { currWorkPoligonStructure } from './modules/currWorkPoligonStructure';
import { webSocket } from './modules/webSocket';
import { lastOrdersParams } from './modules/lastOrdersParams';
import { orders } from './modules/orders';
import { workOrders } from './modules/workOrders';

export const store = createStore({
  modules: {
    mainMenuItems,
    leftMenuItems,
    orderPatterns,
    currUser,
    currShift,
    currDateTime,
    currWorkPoligonStructure,
    webSocket,
    lastOrdersParams,
    orders,
    workOrders,
  },
});
