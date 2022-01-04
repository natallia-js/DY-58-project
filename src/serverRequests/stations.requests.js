import axios from 'axios';
import { AUTH_SERVER_ACTIONS_PATHS } from '@/constants/servers';
import { getRequestAuthorizationHeader } from './common';

export const getStationsWorkPlacesData = async ({ stationIds }) => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getStationsWorkPlacesData,
    { stationIds },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const getDefinitStationData = async (stationId) => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getDefinitStationData,
    { stationId },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const getStationBlocksData = async (stationId) => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getStationBlocksData,
    { stationId },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const getStationDNCSectorsData = async (stationId) => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getStationDNCSectorsData,
    { stationId },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const getStationECDSectorsData = async (stationId) => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getStationECDSectorsData,
    { stationId },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};
