import { AUTH_SERVER_ACTIONS_PATHS } from '@/constants/servers';
import { makeServerRequest } from './common';

export const getStationsWorkPlacesData = async ({ stationIds }) => {
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.getStationsWorkPlacesData,
    method: 'POST',
    params: { stationIds },
  });
  return response.data;
};

export const getDefinitStationData = async ({ stationId, onlyHash = false }) => {
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.getDefinitStationData,
    method: 'POST',
    params: { stationId, onlyHash },
  });
  return response.data;
};

export const getStationBlocksData = async ({ stationId, onlyHash = false }) => {
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.getStationBlocksData,
    method: 'POST',
    params: { stationId, onlyHash },
  });
  return response.data;
};

export const getStationDNCSectorsData = async ({ stationId, onlyHash = false }) => {
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.getStationDNCSectorsData,
    method: 'POST',
    params: { stationId, onlyHash },
  });
  return response.data;
};

export const getStationECDSectorsData = async ({ stationId, onlyHash = false }) => {
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.getStationECDSectorsData,
    method: 'POST',
    params: { stationId, onlyHash },
  });
  return response.data;
};
