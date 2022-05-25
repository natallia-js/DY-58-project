import { AUTH_SERVER_ACTIONS_PATHS } from '@/constants/servers';
import { makeServerRequest } from './common';

export const applyForRegistration = async (props) => {
  const {
    login, password, name, fatherName, surname, post, contactData,
    service, roles, stations, dncSectors, ecdSectors,
  } = props;
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.applyForRegistration,
    method: 'POST',
    params: {
      login, password, name, fatherName, surname, post, contactData,
      service, roles, stations, dncSectors, ecdSectors,
    },
  });
  return response.data;
};

export const authUser = async ({ login, password }) => {
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.login,
    method: 'POST',
    params: { login, password },
  });
  return response.data;
};

export const whoAmI = async () => {
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.whoAmI,
    method: 'POST',
    params: {},
  });
  return response.data;
}

export const startWorkWithoutTakingDuty = async (props) => {
  const { workPoligonType, workPoligonId, workSubPoligonId, specialCredentials } = props;
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.startWorkWithoutTakingDuty,
    method: 'POST',
    params: {
      workPoligonType,
      workPoligonId,
      workSubPoligonId,
      specialCredentials,
    },
  });
  return response.data;
};

export const takeDutyUser = async (props) => {
  const { workPoligonType, workPoligonId, workSubPoligonId, specialCredentials } = props;
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.takeDuty,
    method: 'POST',
    params: {
      workPoligonType,
      workPoligonId,
      workSubPoligonId,
      specialCredentials,
    },
  });
  return response.data;
};

export const logoutUser = async () => {
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.logout,
    method: 'POST',
    params: {},
  });
  return response.data;
};

export const logoutWithDutyPass = async () => {
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.logoutWithDutyPass,
    method: 'POST',
    params: {},
  });
  return response.data;
};
