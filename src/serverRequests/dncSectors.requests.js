import axios from 'axios';
import { AUTH_SERVER_ACTIONS_PATHS } from '@/constants/servers';
import { getRequestAuthorizationHeader } from './common';

export const getDNCSectorsShortData = async ({ dncSectorIds }) => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getDNCSectorsShortData,
    { dncSectorIds },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const getDefinitDNCSectorData = async (sectorId) => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getDefinitDNCSectorData,
    { sectorId },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const getAdjacentDNCSectorsShortDefinitData = async (sectorId) => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getAdjacentDNCSectorsShortDefinitData,
    { sectorId },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const getNearestECDSectorsShortDefinitData = async (sectorId) => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getNearestECDSectorsShortDefinitData,
    { sectorId },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};
