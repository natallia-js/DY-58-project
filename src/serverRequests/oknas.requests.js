import axios from 'axios';
import { DY58_SERVER_ACTIONS_PATHS } from '@/constants/servers';

export const getOknas = async () => {
  const response = await axios.get(DY58_SERVER_ACTIONS_PATHS.getOknas, {});
  return response.data;
};
