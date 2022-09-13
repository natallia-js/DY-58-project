import { AUTH_SERVER_ACTIONS_PATHS } from '@/constants/servers';
import { DY58_CREDENTIALS_GROUP_NAME, APP_CREDENTIALS } from '@/constants/appCredentials';
import { makeServerRequest } from './common';

export const getDNCSectorsWorkPoligonsUsers = async ({ sectorIds, onlyOnline }) => {
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.getDNCSectorsWorkPoligonsUsers,
    method: 'POST',
    params: {
      sectorIds,
      onlyOnline,
      credsGroups: [{ credsGroup: DY58_CREDENTIALS_GROUP_NAME, creds: [APP_CREDENTIALS.DNC_FULL] }],
    },
  });
  return response.data;
};

export const getStationsWorkPoligonsUsers = async ({ stationIds, onlyOnline, includeWorkPlaces }) => {
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.getStationsWorkPoligonsUsers,
    method: 'POST',
    params: {
      stationIds,
      onlyOnline,
      credsGroups: [{
        credsGroup: DY58_CREDENTIALS_GROUP_NAME,
        creds: [APP_CREDENTIALS.DSP_FULL, APP_CREDENTIALS.DSP_Operator, APP_CREDENTIALS.STATION_WORKS_MANAGER],
      }],
      includeWorkPlaces,
    },
  });
  return response.data;
};

export const getECDSectorsWorkPoligonsUsers = async ({ sectorIds, onlyOnline }) => {
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.getECDSectorsWorkPoligonsUsers,
    method: 'POST',
    params: {
      sectorIds,
      onlyOnline,
      credsGroups: [{ credsGroup: DY58_CREDENTIALS_GROUP_NAME, creds: [APP_CREDENTIALS.ECD_FULL] }],
    },
  });
  return response.data;
};
