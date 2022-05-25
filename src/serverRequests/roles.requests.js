import { AUTH_SERVER_ACTIONS_PATHS } from '@/constants/servers';
import { makeServerRequest } from './common';

export const getAllRolesFromServer = async () => {
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.getAllRoles,
    method: 'POST',
    params: {},
  });
  return response.data;
};
