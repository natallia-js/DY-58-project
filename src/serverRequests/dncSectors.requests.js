import { AUTH_SERVER_ACTIONS_PATHS } from '@/constants/servers';
import { makeServerRequest } from './common';

export const getAllDNCSectorsShortData = async () => {
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.getAllDNCSectorsShortData,
    method: 'POST',
    params: {},
  });
  return response.data;
};

export const getDNCSectorsShortData = async ({ dncSectorIds }) => {
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.getDNCSectorsShortData,
    method: 'POST',
    params: { dncSectorIds },
  });
  return response.data;
};

export const getDefinitDNCSectorData = async ({ sectorId, onlyHash = false }) => {
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.getDefinitDNCSectorData,
    method: 'POST',
    params: { sectorId, onlyHash },
  });
  return response.data;
};

export const getAdjacentDNCSectorsShortDefinitData = async ({ sectorId, onlyHash = false }) => {
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.getAdjacentDNCSectorsShortDefinitData,
    method: 'POST',
    params: { sectorId, onlyHash },
  });
  return response.data;
};

export const getNearestECDSectorsShortDefinitData = async ({ sectorId, onlyHash = false }) => {
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.getNearestECDSectorsShortDefinitData,
    method: 'POST',
    params: { sectorId, onlyHash },
  });
  return response.data;
};
