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
import { checkClipboard } from './checkClipboard';
import { okna } from './okna';
import { invalidOrders } from './invalidOrders';
import { forcelyClosedOrderChains } from './forcelyClosedOrderChains';


export const workOrders = {
  state: {
    data: [],

    newIncomingOrders: false,

    startDateToGetData: new Date(),
    loadingWorkOrders: false,
    loadingWorkOrdersResult: null,

    reportingOnOrdersDelivery: false,
    reportOnOrdersDeliveryResult: null,

    incomingOrdersPerShift: [],
    gettingIncomingOrdersPerShift: false,
    gettingIncomingOrdersPerShiftResult: null,

    // если true, то можно редактировать текущее распоряжение о приеме/сдаче дежурства, false - нельзя
    editExistingTakeDutyOrder: false,
    // если true, то необходимо отобразить диалоговое окно принятия дежурства ДСП
    showCreateDSPTakeDutyOrderDlg: false,

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

    // массив id распоряжений, для которых идет процесс утверждения / проверки возможности утверждения
    ordersBeingCheckedForAssertion: [],
    // массив результатов процессов утверждения / проверки возможности утверждения
    checkForAssertionResults: [],

    // один результат на все запущенные процессы издания распоряжений
    dispatchOrderResult: null,
    // количество запущенных процессов издания распоряжений по их типам
    dispatchOrdersBeingProcessed: [],

    // массив id распоряжений, для которых идет процесс установки отметки об их действительности / недействительности
    ordersBeingChangedTheirInvalidMark: [],
    // массив результатов установки отметки о действительности / недействительности распоряжений
    changeOrdersInvalidMarksResults: [],

    // массив id цепочек, для которых идет процесс [отмены] принудительного их завершения
    orderChainsBeingChangedTheirChainEndDateTime: [],
    // массив id распоряжений, для которых идет процесс [отмены] принудительного завершения их цепочки
    ordersBeingChangedTheirChainEndDateTime: [],
    // массив результатов процесса [отмены] принудительного завершения цепочки распоряжений
    changeChainEndDateTimeResults: [],

    editDispatchedOrderResult: null,
    editDispatchedOrdersBeingProcessed: 0,

    // массив id распоряжений, для которых идет процесс удаления получателей распоряжений на рабочих местах станций
    ordersBeingDeletedStationWorkPlaceReceivers: [],
    // массив результатов удаления получателей распоряжений на рабочих местах станций (привязан к id распоряжений)
    delStationWorkPlaceReceiverResults: [],

    // текущее выбранное "окно"
    selectedOkno: null,

    // последние данные о поезде ДР, извлеченные из буфера обмена
    dataForDROrderFromClipboard: null,
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
    ...okna.getters,
    ...checkClipboard.getters,
    ...invalidOrders.getters,
    ...forcelyClosedOrderChains.getters,
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
    ...okna.mutations,
    ...checkClipboard.mutations,
    ...invalidOrders.mutations,
    ...forcelyClosedOrderChains.mutations,
  },

  actions: {
    ...getWorkOrders.actions,
    ...reportOnOrdersDelivery.actions,
    ...confirmOrder.actions,
    ...incomingOrdersPerShift.actions,
    ...delWorkOrdersChains.actions,
    ...dispatchOrder.actions,
    ...editOrder.actions,
    ...checkClipboard.actions,
    ...invalidOrders.actions,
    ...forcelyClosedOrderChains.actions,
  },
};
