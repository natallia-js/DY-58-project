const AUTH_SERVER_ADDRESS = process.env.VUE_APP_AUTH_SERVER_ADDRESS;
const DY58_SERVER_ADDRESS = process.env.VUE_APP_DY58_SERVER_ADDRESS;
export const WS_SERVER_ADDRESS = process.env.VUE_APP_WS_SERVER_ADDRESS;

export const WS_SERVER_PARAMS = Object.freeze({
  RETRY_CONNECTION_INTERVAL: 5000,
  UPDATE_DATA_INTERVAL: 10000,
  CONNECTION_OK_MESSAGE: 'connection OK',

  // сообщения от сервера
  SERVER_PING_MESSAGE: 'ping',
  ONLINE_USERS_MESSAGE_PATTERN: /^online /,

  // сообщения серверу
  PONG_MESSAGE: (data) => `pong ${data}`,
  GET_ONLINE_USERS: (workPoligonsData) => `online ${JSON.stringify(workPoligonsData)}`,

  MAX_SERVER_MESSAGES_STORED: 10,
});

export const AUTH_SERVER_ACTIONS_PATHS = Object.freeze({
  applyForRegistration: `${AUTH_SERVER_ADDRESS}/api/auth/applyForRegistration`,
  login: `${AUTH_SERVER_ADDRESS}/api/auth/login`,
  whoAmI: `${AUTH_SERVER_ADDRESS}/api/auth/whoAmI`,
  startWorkWithoutTakingDuty: `${AUTH_SERVER_ADDRESS}/api/auth/startWorkWithoutTakingDuty`,
  takeDuty: `${AUTH_SERVER_ADDRESS}/api/auth/takeDuty`,
  logout: `${AUTH_SERVER_ADDRESS}/api/auth/logout`,
  logoutWithDutyPass: `${AUTH_SERVER_ADDRESS}/api/auth/logoutWithDutyPass`,

  getAllPosts: `${AUTH_SERVER_ADDRESS}/api/nsi/posts/data`,
  getAllServices: `${AUTH_SERVER_ADDRESS}/api/nsi/services/data`,
  getAllRoles: `${AUTH_SERVER_ADDRESS}/api/roles/allData`,

  getStationsShortData: `${AUTH_SERVER_ADDRESS}/api/nsi/stations/shortDefinitData`,
  getStationsWorkPlacesData: `${AUTH_SERVER_ADDRESS}/api/nsi/stations/workPlacesData`,
  getAllDNCSectorsShortData: `${AUTH_SERVER_ADDRESS}/api/nsi/dncSectors/shortData`,
  getDNCSectorsShortData: `${AUTH_SERVER_ADDRESS}/api/nsi/dncSectors/shortDefinitData`,
  getAllECDSectorsShortData: `${AUTH_SERVER_ADDRESS}/api/nsi/ecdSectors/shortData`,
  getECDSectorsShortData: `${AUTH_SERVER_ADDRESS}/api/nsi/ecdSectors/shortDefinitData`,

  getDefinitStationData: `${AUTH_SERVER_ADDRESS}/api/nsi/stations/definitData`,
  getDefinitDNCSectorData: `${AUTH_SERVER_ADDRESS}/api/nsi/dncSectors/definitData`,
  getDefinitECDSectorData: `${AUTH_SERVER_ADDRESS}/api/nsi/ecdSectors/definitData`,

  getStationBlocksData: `${AUTH_SERVER_ADDRESS}/api/nsi/blocks/stationData`,
  getStationDNCSectorsData: `${AUTH_SERVER_ADDRESS}/api/nsi/dncSectors/shortStationData`,
  getStationECDSectorsData: `${AUTH_SERVER_ADDRESS}/api/nsi/ecdSectors/shortStationData`,

  getAdjacentDNCSectorsShortDefinitData: `${AUTH_SERVER_ADDRESS}/api/nsi/adjacentDNCSectors/definitData`,
  getAdjacentECDSectorsShortDefinitData: `${AUTH_SERVER_ADDRESS}/api/nsi/adjacentECDSectors/definitData`,
  getNearestECDSectorsShortDefinitData: `${AUTH_SERVER_ADDRESS}/api/nsi/nearestDNCandECDSectors/dncDefinitData`,
  getNearestDNCSectorsShortDefinitData: `${AUTH_SERVER_ADDRESS}/api/nsi/nearestDNCandECDSectors/ecdDefinitData`,

  getDNCSectorsWorkPoligonsUsers: `${AUTH_SERVER_ADDRESS}/api/workPoligons/dncSectors/definitData`,
  getStationsWorkPoligonsUsers: `${AUTH_SERVER_ADDRESS}/api/workPoligons/stations/definitData`,
  getECDSectorsWorkPoligonsUsers: `${AUTH_SERVER_ADDRESS}/api/workPoligons/ecdSectors/definitData`,

  getOrderPatterns: `${AUTH_SERVER_ADDRESS}/api/orderPatterns/data`,
  getOrderPatternsElementsRefs: `${AUTH_SERVER_ADDRESS}/api/orderPatternElementRefs/fullData`,
  modOrderCategoryTitle: `${AUTH_SERVER_ADDRESS}/api/orderPatterns/modCategoryTitle`,
  delOrderPattern: `${AUTH_SERVER_ADDRESS}/api/orderPatterns/del`,
  modOrderPattern: `${AUTH_SERVER_ADDRESS}/api/orderPatterns/mod`,
  createOrderPattern: `${AUTH_SERVER_ADDRESS}/api/orderPatterns/add`,
});

export const DY58_SERVER_ACTIONS_PATHS = Object.freeze({
  getJournalOrders: `${DY58_SERVER_ADDRESS}/api/orders/journalData`,
  getOrdersAddressedToThisPoligonFromGivenDate: `${DY58_SERVER_ADDRESS}/api/orders/ordersAddressedToGivenWorkPoligonFromGivenDate`,
  getLastOrdersParams: `${DY58_SERVER_ADDRESS}/api/lastOrdersParams/data`,
  getWorkOrders: `${DY58_SERVER_ADDRESS}/api/workOrders/data`,
  dispatchOrder: `${DY58_SERVER_ADDRESS}/api/orders/add`,
  editDispatchedOrder: `${DY58_SERVER_ADDRESS}/api/orders/mod`,
  confirmOrder: `${DY58_SERVER_ADDRESS}/api/workOrders/confirmOrder`,
  confirmOrdersForOthers: `${DY58_SERVER_ADDRESS}/api/workOrders/confirmOrdersForOthers`,
  confirmOrderForOtherReceivers: `${DY58_SERVER_ADDRESS}/api/workOrders/confirmOrderForOtherReceivers`,
  reportOnOrdersDelivery: `${DY58_SERVER_ADDRESS}/api/workOrders/reportOnDelivery`,
  delConfirmedOrdersFromChain: `${DY58_SERVER_ADDRESS}/api/workOrders/delConfirmedOrdersFromChain`,
  delStationWorkPlaceReceiver: `${DY58_SERVER_ADDRESS}/api/workOrders/delStationWorkPlaceReceiver`,
  getOrdersDrafts: `${DY58_SERVER_ADDRESS}/api/orderDrafts/data`,
  saveOrderDraft: `${DY58_SERVER_ADDRESS}/api/orderDrafts/add`,
  editOrderDraft: `${DY58_SERVER_ADDRESS}/api/orderDrafts/mod`,
  delOrderDraft: `${DY58_SERVER_ADDRESS}/api/orderDrafts/del`,
  getOknas: `${DY58_SERVER_ADDRESS}/api/okna/data`,
  getUserManualsList: `${DY58_SERVER_ADDRESS}/api/upload/dy58UserManualsList`,
  downloadDY58Manual: `${DY58_SERVER_ADDRESS}/api/upload/downloadDY58Manual`,
  setOrderInvalidMark: `${DY58_SERVER_ADDRESS}/api/orders/setOrderInvalidMark`,
});
