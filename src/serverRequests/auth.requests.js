import axios from 'axios';
import { AUTH_SERVER_ACTIONS_PATHS } from '@/constants/servers';
import { APP_CODE_NAME } from '@/constants/appCredentials';
import { getRequestAuthorizationHeader } from './common';

export const authUser = async ({ login, password }) => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.login,
    {
      login,
      password,
      applicationAbbreviation: APP_CODE_NAME,
    },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const startWorkWithoutTakingDuty = async (props) => {
  const { workPoligonType, workPoligonId, workSubPoligonId, specialCredentials } = props;
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.startWorkWithoutTakingDuty,
    {
      workPoligonType,
      workPoligonId,
      workSubPoligonId,
      specialCredentials,
      applicationAbbreviation: APP_CODE_NAME,
    },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const takeDutyUser = async (props) => {
  const { workPoligonType, workPoligonId, workSubPoligonId, specialCredentials } = props;
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.takeDuty,
    {
      workPoligonType,
      workPoligonId,
      workSubPoligonId,
      specialCredentials,
      applicationAbbreviation: APP_CODE_NAME,
    },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const logoutUser = async () => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.logout,
    { applicationAbbreviation: APP_CODE_NAME },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const logoutWithDutyPass = async () => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.logoutWithDutyPass,
    { applicationAbbreviation: APP_CODE_NAME },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};
