import axios from 'axios';
import { AUTH_SERVER_ACTIONS_PATHS } from '@/constants/servers';

export const getAllServicesFromServer = async () => {
  const response = await axios.get(AUTH_SERVER_ACTIONS_PATHS.getAllServices,
    { withCredentials: true }
  );
  return response.data;
};
