import axios from 'axios';
import { AUTH_SERVER_ACTIONS_PATHS } from '@/constants/servers';

export const getAllECDSectorsShortData = async () => {
  const response = await axios.get(AUTH_SERVER_ACTIONS_PATHS.getAllECDSectorsShortData,
    { withCredentials: true }
  );
  return response.data;
};

export const getECDSectorsShortData = async ({ ecdSectorIds }) => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getECDSectorsShortData,
    { ecdSectorIds },
    { withCredentials: true }
  );
  return response.data;
};

export const getDefinitECDSectorData = async (sectorId) => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getDefinitECDSectorData,
    { sectorId },
    { withCredentials: true }
  );
  return response.data;
};

export const getAdjacentECDSectorsShortDefinitData = async (sectorId) => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getAdjacentECDSectorsShortDefinitData,
    { sectorId },
    { withCredentials: true }
  );
  return response.data;
};

export const getNearestDNCSectorsShortDefinitData = async (sectorId) => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getNearestDNCSectorsShortDefinitData,
    { sectorId },
    { withCredentials: true }
  );
  return response.data;
};
