import { AUTH_SERVER_ACTIONS_PATHS } from '@/constants/servers';
import { makeServerRequest } from './common';

export const getAllECDSectorsShortData = async () => {
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.getAllECDSectorsShortData,
    method: 'POST',
    params: {},
  });
  return response.data;
};

export const getECDSectorsShortData = async ({ ecdSectorIds }) => {
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.getECDSectorsShortData,
    method: 'POST',
    params: { ecdSectorIds },
  });
  return response.data;
};

export const getDefinitECDSectorData = async (sectorId) => {
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.getDefinitECDSectorData,
    method: 'POST',
    params: { sectorId },
  });
  return response.data;
};

export const getAdjacentECDSectorsShortDefinitData = async (sectorId) => {
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.getAdjacentECDSectorsShortDefinitData,
    method: 'POST',
    params: { sectorId },
  });
  return response.data;
};

export const getNearestDNCSectorsShortDefinitData = async (sectorId) => {
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.getNearestDNCSectorsShortDefinitData,
    method: 'POST',
    params: { sectorId },
  });
  return response.data;
};
