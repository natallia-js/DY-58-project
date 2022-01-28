import { tablesColumns } from './tablesColumns';
import { getWorkOrders } from './getWorkOrders';
import { reportOnOrdersDelivery } from './reportOnOrdersDelivery';
import { confirmOrder } from './confirmOrder';
import { incomingOrdersPerShift } from './incomingOrdersPerShift';
import { incomingOrders } from './incomingOrders';
import { activeOrders } from './activeOrders';
import { dispatchOrder } from './dispatchOrder';
import { editOrder } from './editOrder';
import { delWorkOrdersChains } from './delWorkOrdersChains';
import { contextMenus } from './contextMenus';
import { checkIfOrderActionCanBePerformed } from './checkIfOrderActionCanBePerformed';


export const workOrders = {
  state: {
    data: [],

    newIncomingOrders: false,

    startDateToGetData: new Date(),
    loadingWorkOrders: false,
    loadingWorkOrdersResult: null,

    reportingOnOrdersDelivery: false,
    reportOnOrdersDeliveryResult: null,

    incomingOrdersPerShift: null,
    gettingIncomingOrdersPerShift: false,
    gettingIncomingOrdersPerShiftResult: null,

    // массив id удаляемых цепочек распоряжений (по которым идет процесс удаления)
    ordersChainsBeingDeleted: [],
    // массив результатов удаления цепочек распоряжений (с привязкой к id цепочек распоряжений)
    deleteOrdersChainsResults: [],

    // массив id распоряжений, для которых идет процесс подтверждения (входящие уведомления)
    ordersBeingConfirmed: [],
    // массив результатов подтверждения распоряжений (входящих уведомлений)
    confirmOrdersResults: [],

    // массив id распоряжений, для которых идет процесс подтверждения (за другие полигоны управления)
    ordersBeingConfirmedForOthers: [],
    // массив результатов подтверждения распоряжений за другие полигоны (с привязкой к id распоряжений)
    confirmOrdersForOthersResults: [],

    dispatchOrderResult: null,
    dispatchOrdersBeingProcessed: 0,

    editDispatchedOrderResult: null,
    editDispatchedOrdersBeingProcessed: 0,

    // массив id распоряжений, для которых идет процесс удаления получателей распоряжений на рабочих местах станций
    ordersBeingDeletedStationWorkPlaceReceivers: [],
    // массив результатов удаления получателей распоряжений на рабочих местах станций (привязан к id распоряжений)
    delStationWorkPlaceReceiverResults: [],
  },

  getters: {
    ...reportOnOrdersDelivery.getters,
    ...getWorkOrders.getters,
    ...tablesColumns.getters,
    ...incomingOrders.getters,
    ...activeOrders.getters,
    ...incomingOrdersPerShift.getters,
    ...delWorkOrdersChains.getters,
    ...confirmOrder.getters,
    ...contextMenus.getters,
    ...dispatchOrder.getters,
    ...editOrder.getters,
    ...checkIfOrderActionCanBePerformed.getters,
  },

  mutations: {
    ...reportOnOrdersDelivery.mutations,
    ...getWorkOrders.mutations,
    ...confirmOrder.mutations,
    ...incomingOrders.mutations,
    ...incomingOrdersPerShift.mutations,
    ...delWorkOrdersChains.mutations,
    ...dispatchOrder.mutations,
    ...editOrder.mutations,
  },

  actions: {
    ...getWorkOrders.actions,
    ...reportOnOrdersDelivery.actions,
    ...confirmOrder.actions,
    ...incomingOrdersPerShift.actions,
    ...delWorkOrdersChains.actions,
    ...dispatchOrder.actions,
    ...editOrder.actions,
  },
};
