const AUTH_SERVER_ADDRESS = 'http://localhost:5000';

export const AUTH_SERVER_ACTIONS_PATHS = Object.freeze({
  login: `${AUTH_SERVER_ADDRESS}/api/auth/login`,

  getStationsShortData: `${AUTH_SERVER_ADDRESS}/api/nsi/stations/shortDefinitData`,
  getDNCSectorsShortData: `${AUTH_SERVER_ADDRESS}/api/nsi/dncSectors/shortDefinitData`,
  getECDSectorsShortData: `${AUTH_SERVER_ADDRESS}/api/nsi/ecdSectors/shortDefinitData`,

  getOrderPatterns: `${AUTH_SERVER_ADDRESS}/api/orderPatterns/data`,
});
