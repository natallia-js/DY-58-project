import axios from 'axios';
import { AUTH_SERVER_ACTIONS_PATHS } from '@/constants/servers';

export const getAllDNCSectorsShortData = async () => {
  const response = await axios.get(AUTH_SERVER_ACTIONS_PATHS.getAllDNCSectorsShortData,
    { withCredentials: true }
  );
  return response.data;
};

export const getDNCSectorsShortData = async ({ dncSectorIds }) => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getDNCSectorsShortData,
    { dncSectorIds },
    { withCredentials: true }
  );
  return response.data;
};

export const getDefinitDNCSectorData = async (sectorId) => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getDefinitDNCSectorData,
    { sectorId },
    { withCredentials: true }
  );
  return response.data;
};

export const getAdjacentDNCSectorsShortDefinitData = async (sectorId) => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getAdjacentDNCSectorsShortDefinitData,
    { sectorId },
    { withCredentials: true }
  );
  return response.data;
};

export const getNearestECDSectorsShortDefinitData = async (sectorId) => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getNearestECDSectorsShortDefinitData,
    { sectorId },
    { withCredentials: true }
  );
  return response.data;
};
