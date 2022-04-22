import axios from 'axios';
import { DY58_SERVER_ACTIONS_PATHS } from '@/constants/servers';

export const getOknas = async (stationsCodes) => {
  const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.getOknas, { stationsCodes });
  return response.data;
};
