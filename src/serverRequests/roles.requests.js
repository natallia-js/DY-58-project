import axios from 'axios';
import { AUTH_SERVER_ACTIONS_PATHS } from '@/constants/servers';
import { getRequestAuthorizationHeader } from './common';

export const getAllRolesFromServer = async () => {
  const response = await axios.get(AUTH_SERVER_ACTIONS_PATHS.getAllRoles,
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};
