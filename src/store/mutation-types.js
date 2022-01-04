// Confirm Order
export const SET_CONFIRM_ORDER_RESULT = 'setConfirmOrderResult';
export const SET_CONFIRM_ORDER_FOR_OTHERS_RESULT = 'setConfirmOrderForOthersResult';
export const CLEAR_CONFIRM_ORDER_RESULT = 'clearConfirmOrderResult';
export const CLEAR_CONFIRM_ORDER_FOR_OTHERS_RESULT = 'clearConfirmOrderForOthersResult';
export const SET_ORDER_BEING_CONFIRMED = 'setOrderBeingConfirmed';
export const SET_ORDER_BEING_CONFIRMED_FOR_OTHERS = 'setOrderBeingConfirmedForOthers';
export const SET_ORDER_FINISHED_BEING_CONFIRMED = 'setOrderFinishedBeingConfirmed';
export const SET_ORDER_FINISHED_BEING_CONFIRMED_FOR_OTHERS = 'setOrderFinishedBeingConfirmedForOthers';
export const SET_CONFIRM_ORDER_RESULT_SEEN_BY_USER = 'setConfirmOrderResultSeenByUser';
export const SET_CONFIRM_ORDER_FOR_OTHERS_RESULT_SEEN_BY_USER = 'setConfirmOrderForOthersResultSeenByUser';
export const CLEAR_ALL_CONFIRM_ORDERS_RESULTS_SEEN_BY_USER = 'clearAllConfirmOrdersResultsSeenByUser';
export const CLEAR_ALL_CONFIRM_ORDERS_FOR_OTHERS_RESULTS_SEEN_BY_USER = 'clearAllConfirmOrdersForOthersResultsSeenByUser';
export const SET_ORDER_CONFIRMED = 'setOrderConfirmed';
export const SET_ORDER_CONFIRMED_FOR_OTHERS = 'setOrderConfirmedForOthers';

// Main Menu Items
export const DETERMINE_LOGOUT_ITEM_ACTION = 'determineLogoutItemAction';
export const SET_ACTIVE_MAIN_MENU_ITEM = 'setActiveMainMenuItem';

// Orders
export const CLEAR_DISPATCH_ORDER_RESULT = 'clearDispatchOrderResult';
export const ADD_ORDERS_BEING_DISPATCHED_NUMBER = 'addOrdersBeingDispatchedNumber';
export const SUB_ORDERS_BEING_DISPATCHED_NUMBER = 'subOrdersBeingDispatchedNumber';
export const SET_DISPATCH_ORDER_RESULT = 'setDispatchOrderResult';
export const ADD_ORDER = 'addOrder';

// Last Orders Params
export const DEL_CURR_LAST_ORDERS_PARAMS = 'delCurrLastOrdersParams';
export const SET_LAST_ORDERS_NUMBER = 'setLastOrdersNumber';
export const RESET_ORDER_NUMBERS_DATA = 'resetOrderNumbersData';
export const SET_LAST_ORDERS_PARAMS = 'setLastOrdersParams';
export const CLEAR_LOADING_LAST_ORDERS_RESULT = 'clearLoadingLastOrdersResult';
export const SET_LOADING_LAST_ORDERS_RESULT = 'setLoadingLastOrdersResult';
export const SET_LOADING_LAST_ORDERS_PARAMS_STATUS = 'setLoadingLastOrdersParamsStatus';

// Order Pattern Elements Refs
export const SET_LOADING_ORDER_PATTERNS_ELEMENTS_REFS_STATUS = 'setLoadingOrderPatternsElementsRefsStatus';
export const SET_LOADING_REFS_RESULT = 'setLoadingRefsResult';
export const CLEAR_LOADING_REFS_RESULT = 'clearLoadingRefsResult';
export const SET_ORDER_PATTERNS_ELEMENTS_REFS = 'setOrderPatternsElementsRefs';
export const DEL_ORDER_PATTERNS_ELEMENTS_REFS = 'delOrderPatternsElementsRefs';

// Incoming Orders Per Shift
export const SET_INCOMING_ORDERS_PER_SHIFT = 'setIncomingOrdersPerShift';
export const CLEAR_GETTING_INCOMING_ORDERS_PER_SHIFT_RESULT = 'clearGettingIncomingOrdersPerShiftResult';
export const SET_GETTING_INCOMING_ORDERS_PER_SHIFT_RESULT = 'setGettingIncomingOrdersPerShiftResult';
export const SET_GETTING_INCOMING_ORDERS_PER_SHIFT_STATUS = 'setGettingIncomingOrdersPerShiftStatus';

// Del Work Orders Chains
export const SET_DELETE_ORDERS_CHAIN_RESULT = 'setDeleteOrdersChainResult';
export const SET_DELETE_ORDERS_CHAIN_RESULT_SEEN_BY_USER = 'setDeleteOrdersChainResultSeenByUser';
export const CLEAR_DELETE_ORDERS_CHAIN_RESULT = 'clearDeleteOrdersChainResult';
export const CLEAR_ALL_DELETE_ORDERS_CHAIN_RESULTS_SEEN_BY_USER = 'clearAllDeleteOrdersChainResultsSeenByUser';
export const SET_ORDERS_CHAIN_BEING_DELETED = 'setOrdersChainBeingDeleted';
export const SET_ORDERS_CHAIN_FINISHED_BEING_DELETED = 'setOrdersChainFinishedBeingDeleted';
export const DELETE_CONFIRMED_ORDERS_CHAIN = 'deleteConfirmedOrdersChain';

// Get Work Orders
export const SET_START_DATE_TO_GET_DATA = 'setStartDateToGetData';
export const SET_START_DATE_TO_GET_DATA_NO_CHECK = 'setStartDateToGetDataNoCheck';
export const CLEAR_LOADING_WORK_ORDERS_RESULT = 'clearLoadingWorkOrdersResult';
export const SET_LOADING_WORK_ORDERS_RESULT = 'setLoadingWorkOrdersResult';
export const SET_LOADING_WORK_ORDERS_STATUS = 'setLoadingWorkOrdersStatus';
export const SET_NEW_WORK_ORDERS_ARRAY = 'setNewWorkOrdersArray';
export const UPDATE_NUMBER_OF_INCOMING_ORDERS_PER_SHIFT = 'updateNumberOfIncomingOrdersPerShift';

// Incoming Orders
export const NOTIFIED_ABOUT_NEW_INCOMING_ORDERS = 'notifiedAboutNewIncomingOrders';

// Report On Orders Delivery
export const CLEAR_REPORT_ON_ORDERS_DELIVERY_RESULT = 'clearReportOnOrdersDeliveryResult';
export const SET_REPORT_ON_ORDERS_DELIVERY_RESULT = 'setReportOnOrdersDeliveryResult';
export const SET_REPORTING_ON_ORDER_DELIVERY_STATUS = 'setReportingOnOrderDeliveryStatus';

// Curr Date Time
export const SET_CURR_DATE_TIME = 'setCurrDateTime';

// Curr User
export const SET_USER_CREDENTIAL = 'setUserCredential';
export const SET_USER_WORK_POLIGON = 'setUserWorkPoligon';
export const LOGIN = 'login';
export const TRY_LOGIN_VIA_LOCAL_STORAGE = 'tryLoginViaLocalStorage';
export const CANCEL_LOGOUT = 'cancelLogout';
export const PREPARE_FOR_LOGOUT = 'prepareForLogout';
export const START_LOGOUT_PROCESS = 'startLogoutProcess';
export const LOGOUT_FINISHED_WITH_ERROR = 'logoutFinishedWithError';
export const LOGOUT_FINISHED_WITHOUT_ERROR = 'logoutFinishedWithoutError';
export const CLEAR_USER_DATA_ON_LOGOUT = 'clearUserDataOnLogout';

// Curr Work Poligon Structure
export const DEL_CURR_WORK_POLIGON_DATA = 'delCurrWorkPoligonData';

// Order Patterns
export const DEL_CURR_ORDER_PATTERN_DATA = 'delCurrOrderPatternsData';
export const SET_NEW_ORDER_PATTERNS_ARRAY = 'setNewOrderPatternsArray';
export const SET_LOADING_ORDER_PATTERNS_STATUS = 'setLoadingOrderPatternsStatus';
export const CLEAR_LOADING_ORDER_PATTERNS_RESULT = 'clearLoadingOrderPatternsResult';
export const SET_LOADING_ORDER_PATTERNS_RESULT = 'setLoadingOrderPatternsResult';
export const CLEAR_MODIFY_ORDER_CATEGORY_TITLE_RESULT = 'clearModifyOrderCategoryTitleResult';
export const SET_MODIFY_ORDER_CATEGORY_TITLE_RESULT = 'setModifyOrderCategoryTitleResult';
export const ADD_MODIFY_ORDER_CATEGORY_TITLE_RECS_BEING_PROCESSED = 'addModifyOrderCategoryTitleRecsBeingProcessed';
export const SUB_MODIFY_ORDER_CATEGORY_TITLE_RECS_BEING_PROCESSED = 'subModifyOrderCategoryTitleRecsBeingProcessed';
export const SET_ORDER_CATEGORY_TITLE = 'setOrderCategoryTitle';
export const CLEAR_DEL_ORDER_PATTERN_RESULT = 'clearDelOrderPatternResult';
export const SET_DEL_ORDER_PATTERN_RESULT = 'setDelOrderPatternResult';
export const ADD_DEL_ORDER_PATTERN_RECS_BEING_PROCESSED = 'addDelOrderPatternRecsBeingProcessed';
export const SUB_DEL_ORDER_PATTERN_RECS_BEING_PROCESSED = 'subDelOrderPatternRecsBeingProcessed';
export const DEL_ORDER_PATTERN = 'delOrderPattern';
export const CLEAR_MOD_ORDER_PATTERN_RESULT = 'clearModOrderPatternResult';
export const SET_MOD_ORDER_PATTERN_RESULT = 'setModOrderPatternResult';
export const ADD_MOD_ORDER_PATTERN_RECS_BEING_PROCESSED = 'addModOrderPatternRecsBeingProcessed';
export const SUB_MOD_ORDER_PATTERN_RECS_BEING_PROCESSED = 'subModOrderPatternRecsBeingProcessed';
export const MOD_ORDER_PATTERN = 'modOrderPattern';
export const CLEAR_CREATE_ORDER_PATTERN_RESULT = 'clearCreateOrderPatternResult';
export const SET_CREATE_ORDER_PATTERN_RESULT = 'setCreateOrderPatternResult';
export const ADD_CREATE_ORDER_PATTERN_RECS_BEING_PROCESSED = 'addCreateOrderPatternRecsBeingProcessed';
export const SUB_CREATE_ORDER_PATTERN_RECS_BEING_PROCESSED = 'subCreateOrderPatternRecsBeingProcessed';
export const ADD_NEW_ORDER_PATERN = 'addNewOrderPattern';

// Personal
export const CLEAR_SHIFT_FOR_SENDING_DATA = 'clearShiftForSendingData';
export const SET_GET_ORDER_STATUS_TO_ALL_DNC_SECTORS = 'setGetOrderStatusToAllDNCSectors';
export const SET_GET_ORDER_STATUS_TO_DEFINIT_DNC_SECTOR = 'setGetOrderStatusToDefinitDNCSector';
export const SET_GET_ORDER_STATUS_TO_ALL_LEFT_DNC_SECTORS = 'setGetOrderStatusToAllLeftDNCSectors';
export const SET_GET_ORDER_STATUS_TO_ALL_DSP = 'setGetOrderStatusToAllDSP';
export const SET_GET_ORDER_STATUS_TO_DEFINIT_DSP = 'setGetOrderStatusToDefinitDSP';
export const SET_GET_ORDER_STATUS_TO_ALL_LEFT_DSP = 'setGetOrderStatusToAllLeftDSP';
export const SET_GET_ORDER_STATUS_TO_ALL_ECD_SECTORS = 'setGetOrderStatusToAllECDSectors';
export const SET_GET_ORDER_STATUS_TO_DEFINIT_ECD_SECTOR = 'setGetOrderStatusToDefinitECDSector';
export const SET_GET_ORDER_STATUS_TO_ALL_LEFT_ECD_SECTORS = 'setGetOrderStatusToAllLeftECDSectors';
export const SET_GET_ORDER_STATUS_TO_ALL_OTHER_SHIFT = 'setGetOrderStatusToAllOtherShift';
export const SET_GET_ORDER_STATUS_TO_DEFINIT_OTHER_SHIFT = 'setGetOrderStatusToDefinitOtherShift';
export const SET_GET_ORDER_STATUS_TO_ALL_LEFT_OTHER_SHIFT = 'setGetOrderStatusToAllLeftOtherShift';
export const SET_ONLINE_SHIFT_PERSONAL = 'setOnlineShiftPersonal';
export const CHOOSE_ONLY_ONLINE_PERSONAL = 'chooseOnlyOnlinePersonal';
export const SET_USER_CHOSEN_STATUS = 'setUserChosenStatus';
export const ADD_OTHER_GET_ORDER_RECORD = 'addOtherGetOrderRecord';
export const EDIT_OTHER_GET_ORDER_RECORD = 'editOtherGetOrderRecord';
export const DEL_OTHER_GET_ORDER_RECORD = 'delOtherGetOrderRecord';
export const DEL_OTHER_GET_ORDER_RECORD_BY_ADDITIONAL_ID = 'delOtherGetOrderRecordByAdditionalId';