import { createStore } from 'vuex';
import { mainMenuItems } from './modules/mainMenuItems';
import { leftMenuItems } from './modules/leftMenuItems';
import { orderPatterns } from './modules/orderPatterns';
import { currUser } from './modules/currUser';
import { personal } from './modules/personal/index';
import { currDateTime } from './modules/currDateTime';
import { currWorkPoligonStructure } from './modules/currWorkPoligonStructure';
import { webSocket } from './modules/webSocket';
import { lastOrdersParams } from './modules/lastOrdersParams';
import { workOrders } from './modules/workOrders/index';
import { orderPatternsElementsRefs } from './modules/orderPatternsElementsRefs';
import { checkUserAuthority } from './modules/checkUserAuthority';
import { sounds } from './modules/sounds';
import { common } from './modules/common';
import { orderDrafts } from './modules/orderDrafts';

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
    workOrders,
    orderPatternsElementsRefs,
    checkUserAuthority,
    sounds,
    common,
    orderDrafts,
  },
});
