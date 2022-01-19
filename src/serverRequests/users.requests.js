import axios from 'axios';
import { AUTH_SERVER_ACTIONS_PATHS } from '@/constants/servers';
import { getRequestAuthorizationHeader } from './common';
import { APP_CODE_NAME, APP_CREDENTIALS } from '@/constants/appCredentials';

export const getDNCSectorsWorkPoligonsUsers = async ({ sectorIds, onlyOnline }) => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getDNCSectorsWorkPoligonsUsers,
    { sectorIds, onlyOnline, apps: [{ app: APP_CODE_NAME, creds: [APP_CREDENTIALS.DNC_FULL] }] },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const getStationsWorkPoligonsUsers = async ({ stationIds, onlyOnline }) => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getStationsWorkPoligonsUsers,
    { stationIds, onlyOnline, apps: [{ app: APP_CODE_NAME, creds: [APP_CREDENTIALS.DSP_FULL, APP_CREDENTIALS.DSP_Operator] }] },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const getECDSectorsWorkPoligonsUsers = async ({ sectorIds, onlyOnline }) => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getECDSectorsWorkPoligonsUsers,
    { sectorIds, onlyOnline, apps: [{ app: APP_CODE_NAME, creds: [APP_CREDENTIALS.ECD_FULL] }] },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};
