import { DY58_SERVER_ACTIONS_PATHS } from '@/constants/servers';
import { makeServerRequest } from './common';

export const getOknas = async (stationsCodes) => {
  const response = await makeServerRequest({
    url: DY58_SERVER_ACTIONS_PATHS.getOknas,
    method: 'POST',
    params: { stationsCodes },
  });
  return response.data;
};
