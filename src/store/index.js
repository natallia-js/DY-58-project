import { createStore } from 'vuex';
import { mainMenuItems } from './modules/mainMenuItems';
import { leftMenuItems } from './modules/leftMenuItems';
import { orderPatterns } from './modules/orderPatterns';
import { currUser } from './modules/currUser';
import { currShift1 } from './modules/currShift1';
import { currShift } from './modules/currShift';
import { currDateTime } from './modules/currDateTime';
import { currWorkPoligonStructure } from './modules/currWorkPoligonStructure';
import { incomingNotifications } from './modules/incomingNotifications';
import { ordersInWork } from './modules/ordersInWork';
import { webSocket } from './modules/webSocket';

export const store = createStore({
  modules: {
    mainMenuItems,
    leftMenuItems,
    orderPatterns,
    currUser,
    currShift,
    currShift1,
    currDateTime,
    currWorkPoligonStructure,
    incomingNotifications,
    ordersInWork,
    webSocket,
  },
});
