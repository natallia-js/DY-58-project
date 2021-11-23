import { tablesColumns } from './tablesColumns';
import { getWorkOrders } from './getWorkOrders';
import { reportOnOrdersDelivery } from './reportOnOrdersDelivery';
import { confirmOrder } from './confirmOrder';
import { incomingOrdersPerShift } from './incomingOrdersPerShift';
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

    incomingOrdersPerShift: null,
    gettingIncomingOrdersPerShift: false,
    gettingIncomingOrdersPerShiftResult: null,
  },

  getters: {
    ...getWorkOrders.getters,
    ...tablesColumns.getters,
    ...incomingOrders.getters,
    ...activeOrders.getters,
    ...incomingOrdersPerShift.getters,
  },

  mutations: {
    ...reportOnOrdersDelivery.mutations,
    ...getWorkOrders.mutations,
    ...confirmOrder.mutations,
    ...incomingOrdersPerShift.mutations,
  },

  actions: {
    ...getWorkOrders.actions,
    ...reportOnOrdersDelivery.actions,
    ...confirmOrder.actions,
    ...incomingOrdersPerShift.actions,
  },
};
