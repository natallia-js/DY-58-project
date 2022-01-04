import axios from 'axios';
import { AUTH_SERVER_ACTIONS_PATHS } from '@/constants/servers';
import { getRequestAuthorizationHeader } from './common';

export const loginUser = async ({ login, password, takeDuty }) => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.login,
    { login, password, takeDuty },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const logoutWithDutyPass = async () => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.logoutWithDutyPass,
    {},
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};
