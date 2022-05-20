import axios from 'axios';
import { AUTH_SERVER_ACTIONS_PATHS } from '@/constants/servers';

export const getAllRolesFromServer = async () => {
  const response = await axios.get(AUTH_SERVER_ACTIONS_PATHS.getAllRoles,
    { withCredentials: true }
  );
  return response.data;
};
