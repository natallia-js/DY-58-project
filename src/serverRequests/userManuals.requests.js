import { DY58_SERVER_ACTIONS_PATHS } from '@/constants/servers';
import { makeServerRequest } from './common';

export const getUserManualsList = async () => {
  const response = await makeServerRequest({
    url: DY58_SERVER_ACTIONS_PATHS.getUserManualsList,
    method: 'GET',
  });
  return response.data;
};

export const downloadDY58Manual = async (fileName) => {
  const response = await makeServerRequest({
    url: DY58_SERVER_ACTIONS_PATHS.downloadDY58Manual + '/' + fileName,
    method: 'GET',
    upload: true,
  });
  return response.data;
};
