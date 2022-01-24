const AUTH_SERVER_ADDRESS = process.env.VUE_APP_AUTH_SERVER_ADDRESS;
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
  login: `${AUTH_SERVER_ADDRESS}/api/auth/login`,
  startWorkWithoutTakingDuty: `${AUTH_SERVER_ADDRESS}/api/auth/startWorkWithoutTakingDuty`,
  takeDuty: `${AUTH_SERVER_ADDRESS}/api/auth/takeDuty`,
  logout: `${AUTH_SERVER_ADDRESS}/api/auth/logout`,
  logoutWithDutyPass: `${AUTH_SERVER_ADDRESS}/api/auth/logoutWithDutyPass`,

  getStationsShortData: `${AUTH_SERVER_ADDRESS}/api/nsi/stations/shortDefinitData`,
  getStationsWorkPlacesData: `${AUTH_SERVER_ADDRESS}/api/nsi/stations/workPlacesData`,
  getDNCSectorsShortData: `${AUTH_SERVER_ADDRESS}/api/nsi/dncSectors/shortDefinitData`,
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
  getOrderPatternsElementsRefs: `${AUTH_SERVER_ADDRESS}/api/orderPatternElementRefs/data`,
  modOrderCategoryTitle: `${AUTH_SERVER_ADDRESS}/api/orderPatterns/modCategoryTitle`,
  delOrderPattern: `${AUTH_SERVER_ADDRESS}/api/orderPatterns/del`,
  modOrderPattern: `${AUTH_SERVER_ADDRESS}/api/orderPatterns/mod`,
  createOrderPattern: `${AUTH_SERVER_ADDRESS}/api/orderPatterns/add`,
});

export const DY58_SERVER_ACTIONS_PATHS = Object.freeze({
  getOrdersCreatedFromGivenDate: `${AUTH_SERVER_ADDRESS}/api/orders/ordersCreatedFromGivenDate`,
  getLastOrdersParams: `${AUTH_SERVER_ADDRESS}/api/lastOrdersParams/data`,
  getWorkOrders: `${AUTH_SERVER_ADDRESS}/api/workOrders/data`,
  dispatchOrder: `${AUTH_SERVER_ADDRESS}/api/orders/add`,
  editDispatchedOrder: `${AUTH_SERVER_ADDRESS}/api/orders/mod`,
  confirmOrder: `${AUTH_SERVER_ADDRESS}/api/workOrders/confirmOrder`,
  confirmOrdersForOthers: `${AUTH_SERVER_ADDRESS}/api/workOrders/confirmOrdersForOthers`,
  reportOnOrdersDelivery: `${AUTH_SERVER_ADDRESS}/api/workOrders/reportOnDelivery`,
  delConfirmedOrdersFromChain: `${AUTH_SERVER_ADDRESS}/api/workOrders/delConfirmedOrdersFromChain`,
});
