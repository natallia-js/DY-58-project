import axios from 'axios';
import { DY58_SERVER_ACTIONS_PATHS } from '@/constants/servers';

export const getOrderDraftsFromServer = async () => {
  const response = await axios.get(DY58_SERVER_ACTIONS_PATHS.getOrdersDrafts,
    { withCredentials: true }
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
    { withCredentials: true }
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
    { withCredentials: true }
  );
  return response.data;
};

export const delOrderDraftOnServer = async (id) => {
  const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.delOrderDraft,
    { id },
    { withCredentials: true }
  );
  return response.data;
};
