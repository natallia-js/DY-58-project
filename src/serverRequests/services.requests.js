import { AUTH_SERVER_ACTIONS_PATHS } from '@/constants/servers';
import { makeServerRequest } from './common';

export const getAllServicesFromServer = async () => {
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.getAllServices,
    method: 'POST',
    params: {},
  });
  return response.data;
};
