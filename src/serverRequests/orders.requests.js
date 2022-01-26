import axios from 'axios';
import { DY58_SERVER_ACTIONS_PATHS } from '@/constants/servers';
import { getRequestAuthorizationHeader } from './common';

export const getLastOrdersParams = async () => {
  const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.getLastOrdersParams,
    {},
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const getOrdersCreatedFromGivenDate = async ({ datetime }) => {
  const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.getOrdersCreatedFromGivenDate,
    { datetime },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const confirmOrderForMyself = async ({ id, confirmDateTime }) => {
  const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.confirmOrder,
    { id, confirmDateTime },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const confirmOrdersForOthers = async ({ confirmWorkPoligons, orderId, confirmDateTime }) => {
  const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.confirmOrdersForOthers,
    { confirmWorkPoligons, orderId, confirmDateTime },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const delConfirmedOrdersFromChain = async ({ chainId }) => {
  const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.delConfirmedOrdersFromChain,
    { chainId },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const getWorkOrdersFromServer = async ({ startDate }) => {
  const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.getWorkOrders,
    { startDate },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const reportServerOnOrdersDelivery = async ({ orderIds, deliverDateTime }) => {
  const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.reportOnOrdersDelivery,
    { orderIds, deliverDateTime },
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
    workPoligonTitle,
    creator,
    createdOnBehalfOf,
    orderChainId,
    showOnGID,
    specialTrainCategories,
    idOfTheOrderToCancel,
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
      workPoligonTitle,
      creator,
      createdOnBehalfOf,
      orderChainId,
      showOnGID,
      specialTrainCategories,
      idOfTheOrderToCancel,
    },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const editDispatchedOrderOnServer = async (params) => {
  const {
    id,
    timeSpan,
    orderText,
  } = params;
  const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.editDispatchedOrder,
    {
      id,
      timeSpan,
      orderText,
    },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};

export const delStationWorkPlaceReceiverOnServer = async ({ orderId, workPlaceId }) => {
  const response = await axios.post(DY58_SERVER_ACTIONS_PATHS.delStationWorkPlaceReceiver,
    { orderId, workPlaceId },
    { headers: getRequestAuthorizationHeader() }
  );
  return response.data;
};
