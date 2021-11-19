import { createStore } from 'vuex';
import { mainMenuItems } from './modules/mainMenuItems';
import { leftMenuItems } from './modules/leftMenuItems';
import { orderPatterns } from './modules/orderPatterns';
import { currUser } from './modules/currUser';
import { personal } from './modules/personal';
import { currDateTime } from './modules/currDateTime';
import { currWorkPoligonStructure } from './modules/currWorkPoligonStructure';
import { webSocket } from './modules/webSocket';
import { lastOrdersParams } from './modules/lastOrdersParams';
import { orders } from './modules/orders';
import { workOrders } from './modules/workOrders/index';
import { orderPatternsElementsRefs } from './modules/orderPatternsElementsRefs';

export const store = createStore({
  modules: {
    mainMenuItems,
    leftMenuItems,
    orderPatterns,
    currUser,
    personal,
    currDateTime,
    currWorkPoligonStructure,
    webSocket,
    lastOrdersParams,
    orders,
    workOrders,
    orderPatternsElementsRefs,
  },
});
