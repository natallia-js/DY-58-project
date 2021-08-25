const AUTH_SERVER_ADDRESS = 'http://localhost:5000';
export const WS_SERVER_ADDRESS = 'ws://localhost:5000';

export const WS_SERVER_PARAMS = Object.freeze({
  RETRY_INTERVAL: 5000,
  CONNECTION_OK_MESSAGE: 'connection OK',
  SERVER_PING_MESSAGE: 'ping',
  PONG_MESSAGE: (data) => `pong ${data}`,
  MAX_SERVER_MESSAGES_STORED: 10,
});

export const AUTH_SERVER_ACTIONS_PATHS = Object.freeze({
  login: `${AUTH_SERVER_ADDRESS}/api/auth/login`,

  getStationsShortData: `${AUTH_SERVER_ADDRESS}/api/nsi/stations/shortDefinitData`,
  getDNCSectorsShortData: `${AUTH_SERVER_ADDRESS}/api/nsi/dncSectors/shortDefinitData`,
  getECDSectorsShortData: `${AUTH_SERVER_ADDRESS}/api/nsi/ecdSectors/shortDefinitData`,

  getStationsDefinitData: `${AUTH_SERVER_ADDRESS}/api/nsi/stations/definitData`,
  getDNCSectorsDefinitData: `${AUTH_SERVER_ADDRESS}/api/nsi/dncSectors/definitData`,
  getECDSectorsDefinitData: `${AUTH_SERVER_ADDRESS}/api/nsi/ecdSectors/definitData`,

  getAdjacentDNCSectorsShortDefinitData: `${AUTH_SERVER_ADDRESS}/api/nsi/adjacentDNCSectors/definitData`,
  getAdjacentECDSectorsShortDefinitData: `${AUTH_SERVER_ADDRESS}/api/nsi/adjacentECDSectors/definitData`,
  getNearestECDSectorsShortDefinitData: `${AUTH_SERVER_ADDRESS}/api/nsi/nearestDNCandECDSectors/dncDefinitData`,
  getNearestDNCSectorsShortDefinitData: `${AUTH_SERVER_ADDRESS}/api/nsi/nearestDNCandECDSectors/ecdDefinitData`,

  getDNCSectorsWorkPoligonsUsers: `${AUTH_SERVER_ADDRESS}/api/workPoligons/dncSectors/definitData`,
  getStationsWorkPoligonsUsers: `${AUTH_SERVER_ADDRESS}/api/workPoligons/stations/definitData`,

  getOrderPatterns: `${AUTH_SERVER_ADDRESS}/api/orderPatterns/data`,
  modOrderCategoryTitle: `${AUTH_SERVER_ADDRESS}/api/orderPatterns/modCategoryTitle`,
  delOrderPattern: `${AUTH_SERVER_ADDRESS}/api/orderPatterns/del`,
  modOrderPattern: `${AUTH_SERVER_ADDRESS}/api/orderPatterns/mod`,
  createOrderPattern: `${AUTH_SERVER_ADDRESS}/api/orderPatterns/add`,
});
