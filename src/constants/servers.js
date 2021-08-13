const AUTH_SERVER_ADDRESS = 'http://localhost:5000';

export const AUTH_SERVER_ACTIONS_PATHS = Object.freeze({
  login: `${AUTH_SERVER_ADDRESS}/api/auth/login`,

  getStationsShortData: `${AUTH_SERVER_ADDRESS}/api/nsi/stations/shortDefinitData`,
  getDNCSectorsShortData: `${AUTH_SERVER_ADDRESS}/api/nsi/dncSectors/shortDefinitData`,
  getECDSectorsShortData: `${AUTH_SERVER_ADDRESS}/api/nsi/ecdSectors/shortDefinitData`,
  getStationsDefinitData: `${AUTH_SERVER_ADDRESS}/api/nsi/stations/definitData`,
  getDNCSectorsDefinitData: `${AUTH_SERVER_ADDRESS}/api/nsi/dncSectors/definitData`,
  getECDSectorsDefinitData: `${AUTH_SERVER_ADDRESS}/api/nsi/ecdSectors/definitData`,

  getOrderPatterns: `${AUTH_SERVER_ADDRESS}/api/orderPatterns/data`,
  modOrderCategoryTitle: `${AUTH_SERVER_ADDRESS}/api/orderPatterns/modCategoryTitle`,
  delOrderPattern: `${AUTH_SERVER_ADDRESS}/api/orderPatterns/del`,
  modOrderPattern: `${AUTH_SERVER_ADDRESS}/api/orderPatterns/mod`,
  createOrderPattern: `${AUTH_SERVER_ADDRESS}/api/orderPatterns/add`,
});
