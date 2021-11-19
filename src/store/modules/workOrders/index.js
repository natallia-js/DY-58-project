import { tablesColumns } from './tablesColumns';
import { getWorkOrders } from './getWorkOrders';
import { reportOnOrdersDelivery } from './reportOnOrdersDelivery';
import { confirmOrder } from './confirmOrder';
import { numberOfIncomingOrdersPerShift } from './numberOfIncomingOrdersPerShift';
import { incomingOrders } from './incomingOrders';
import { activeOrders } from './activeOrders';


export const workOrders = {
  state: {
    data: [],

    startDateToGetData: new Date(),
    loadingWorkOrders: false,
    loadingWorkOrdersResult: null,

    reportingOnOrdersDelivery: false,
    reportOnOrdersDeliveryResult: null,

    confirmingOrder: false,
    orderConfirmResult: null,

    numberOfIncomingOrdersPerShift: null,
    gettingNumberOfIncomingOrdersPerShift: false,
    gettingNumberOfIncomingOrdersPerShiftResult: null,
  },

  getters: {
    ...getWorkOrders.getters,
    ...tablesColumns.getters,
    ...incomingOrders.getters,
    ...activeOrders.getters,
    ...numberOfIncomingOrdersPerShift.getters,
  },

  mutations: {
    ...reportOnOrdersDelivery.mutations,
    ...getWorkOrders.mutations,
    ...confirmOrder.mutations,
    ...numberOfIncomingOrdersPerShift.mutations,
  },

  actions: {
    ...getWorkOrders.actions,
    ...reportOnOrdersDelivery.actions,
    ...confirmOrder.actions,
    ...numberOfIncomingOrdersPerShift.actions,
  },
};
