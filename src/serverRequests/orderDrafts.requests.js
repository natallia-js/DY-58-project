import axios from 'axios';
import { DY58_SERVER_ACTIONS_PATHS } from '@/constants/servers';
import { getRequestAuthorizationHeader } from './common';

export const getOrderDraftsFromServer = async () => {
  const response = await axios.get(DY58_SERVER_ACTIONS_PATHS.getOrdersDrafts,
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const saveOrderDraftOnServer = async (params) => {
  const {
    type,
    createDateTime,
    place,
    timeSpan,
    defineOrderTimeSpan,
    orderText,
    dncToSend,
    dspToSend,
    ecdToSend,
    otherToSend,
    createdOnBehalfOf,
    showOnGID,
  } = params;
  const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.saveOrderDraft,
    {
      type,
      createDateTime,
      place,
      timeSpan,
      defineOrderTimeSpan,
      orderText,
      dncToSend,
      dspToSend,
      ecdToSend,
      otherToSend,
      createdOnBehalfOf,
      showOnGID,
    },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const editOrderDraftOnServer = async (params) => {
  const {
    id,
    place,
    timeSpan,
    defineOrderTimeSpan,
    orderText,
    dncToSend,
    dspToSend,
    ecdToSend,
    otherToSend,
    createdOnBehalfOf,
    showOnGID,
  } = params;
  const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.editOrderDraft,
    {
      id,
      place,
      timeSpan,
      defineOrderTimeSpan,
      orderText,
      dncToSend,
      dspToSend,
      ecdToSend,
      otherToSend,
      createdOnBehalfOf,
      showOnGID,
    },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};
