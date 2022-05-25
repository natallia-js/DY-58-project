import { DY58_SERVER_ACTIONS_PATHS } from '@/constants/servers';
import { makeServerRequest } from './common';

export const getOrderDraftsFromServer = async () => {
  const response = await makeServerRequest({
    url: DY58_SERVER_ACTIONS_PATHS.getOrdersDrafts,
    method: 'POST',
    params: {},
  });
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
  const response = await makeServerRequest({
    url: DY58_SERVER_ACTIONS_PATHS.saveOrderDraft,
    method: 'POST',
    params: {
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
  });
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
  const response = await makeServerRequest({
    url: DY58_SERVER_ACTIONS_PATHS.editOrderDraft,
    method: 'POST',
    params: {
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
  });
  return response.data;
};

export const delOrderDraftOnServer = async (id) => {
  const response = await makeServerRequest({
    url: DY58_SERVER_ACTIONS_PATHS.delOrderDraft,
    method: 'POST',
    params: { id },
  });
  return response.data;
};
