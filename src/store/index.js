import { createStore } from 'vuex';
import { mainMenuItems } from './modules/mainMenuItems';
import { leftMenuItems } from './modules/leftMenuItems';
import { orderPatterns } from './modules/orderPatterns';
import { currUser } from './modules/currUser';
import { currShift } from './modules/currShift';
import { currSectorsShift } from './modules/currSectorsShift';
import { currDateTime } from './modules/currDateTime';
import { incomingNotifications } from './modules/incomingNotifications';
import { ordersInWork } from './modules/ordersInWork';

export const store = createStore({
  modules: {
    mainMenuItems,
    leftMenuItems,
    orderPatterns,
    currUser,
    currShift,
    currSectorsShift,
    currDateTime,
    incomingNotifications,
    ordersInWork,
  },
});
