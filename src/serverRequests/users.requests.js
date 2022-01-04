import axios from 'axios';
import { AUTH_SERVER_ACTIONS_PATHS } from '@/constants/servers';
import { getRequestAuthorizationHeader } from './common';

export const getDNCSectorsWorkPoligonsUsers = async ({ sectorIds, onlyOnline }) => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getDNCSectorsWorkPoligonsUsers,
    { sectorIds, onlyOnline },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const getStationsWorkPoligonsUsers = async ({ stationIds, onlyOnline }) => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getStationsWorkPoligonsUsers,
    { stationIds, onlyOnline },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const getECDSectorsWorkPoligonsUsers = async ({ sectorIds, onlyOnline }) => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getECDSectorsWorkPoligonsUsers,
    { sectorIds, onlyOnline },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};
