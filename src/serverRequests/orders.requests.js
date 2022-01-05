import axios from 'axios';
import { DY58_SERVER_ACTIONS_PATHS } from '@/constants/servers';
import { getRequestAuthorizationHeader } from './common';

export const getLastOrdersParams = async ({ workPoligonType, workPoligonId, workPoligonWorkPlaceId }) => {
  const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.getLastOrdersParams,
    { workPoligonType, workPoligonId, workPoligonWorkPlaceId },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const getOrdersCreatedFromGivenDate = async ({ datetime, workPoligonType, workPoligonId }) => {
  const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.getOrdersCreatedFromGivenDate,
    { datetime, workPoligonType, workPoligonId },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const confirmOrderForMyself = async ({ workPoligonType, workPoligonId, workSubPoligonId, id, confirmDateTime }) => {
  const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.confirmOrder,
    { workPoligonType, workPoligonId, workSubPoligonId, id, confirmDateTime },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const confirmOrdersForOthers = async ({ workPoligonType, workPoligonId, confirmWorkPoligons, orderId, confirmDateTime }) => {
  const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.confirmOrdersForOthers,
    { workPoligonType, workPoligonId, confirmWorkPoligons, orderId, confirmDateTime },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const delConfirmedOrdersFromChain = async ({ workPoligonType, workPoligonId, workSubPoligonId, chainId }) => {
  const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.delConfirmedOrdersFromChain,
    { workPoligonType, workPoligonId, workSubPoligonId, chainId },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const getWorkOrdersFromServer = async ({ workPoligonType, workPoligonId, workSubPoligonId, startDate }) => {
  const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.getWorkOrders,
    { workPoligonType, workPoligonId, workSubPoligonId, startDate },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const reportServerOnOrdersDelivery = async ({ workPoligonType, workPoligonId, workSubPoligonId, orderIds, deliverDateTime }) => {
  const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.reportOnOrdersDelivery,
    { workPoligonType, workPoligonId, workSubPoligonId, orderIds, deliverDateTime },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const dispatchOrderToServer = async (params) => {
  const {
    type,
    number,
    createDateTime,
    place,
    timeSpan,
    orderText,
    dncToSend,
    dspToSend,
    ecdToSend,
    otherToSend,
    workPoligon,
    creator,
    createdOnBehalfOf,
    orderChainId,
    showOnGID,
    specialTrainCategories,
  } = params;
  const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.dispatchOrder,
    {
      type,
      number,
      createDateTime,
      place,
      timeSpan,
      orderText,
      dncToSend,
      dspToSend,
      ecdToSend,
      otherToSend,
      workPoligon,
      creator,
      createdOnBehalfOf,
      orderChainId,
      showOnGID,
      specialTrainCategories,
    },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};
