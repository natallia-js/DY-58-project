import { DY58_SERVER_ACTIONS_PATHS } from '@/constants/servers';
import { makeServerRequest } from './common';

export const getLastOrdersParams = async () => {
  const response = await makeServerRequest({
    url: DY58_SERVER_ACTIONS_PATHS.getLastOrdersParams,
    method: 'POST',
    params: {},
  });
  return response.data;
};

export const getOrdersAddressedToThisPoligonFromGivenDate = async ({ datetime }) => {
  const response = await makeServerRequest({
    url: DY58_SERVER_ACTIONS_PATHS.getOrdersAddressedToThisPoligonFromGivenDate,
    method: 'POST',
    params: { datetime },
  });
  return response.data;
};

export const confirmOrderForMyself = async ({ id, confirmDateTime }) => {
  const response = await makeServerRequest({
    url: DY58_SERVER_ACTIONS_PATHS.confirmOrder,
    method: 'POST',
    params: { id, confirmDateTime },
  });
  return response.data;
};

export const confirmOrdersForOthers = async ({ confirmWorkPoligons, orderId, confirmDateTime }) => {
  const response = await makeServerRequest({
    url: DY58_SERVER_ACTIONS_PATHS.confirmOrdersForOthers,
    method: 'POST',
    params: { confirmWorkPoligons, orderId, confirmDateTime },
  });
  return response.data;
};

export const confirmOrderForOtherReceivers = async ({ orderId, confirmDateTime }) => {
  const response = await makeServerRequest({
    url: DY58_SERVER_ACTIONS_PATHS.confirmOrderForOtherReceivers,
    method: 'POST',
    params: { orderId, confirmDateTime },
  });
  return response.data;
};

export const delConfirmedOrdersFromChain = async ({ chainId }) => {
  const response = await makeServerRequest({
    url: DY58_SERVER_ACTIONS_PATHS.delConfirmedOrdersFromChain,
    method: 'POST',
    params: { chainId },
  });
  return response.data;
};

export const getWorkOrdersFromServer = async ({ startDate }) => {
  const response = await makeServerRequest({
    url: DY58_SERVER_ACTIONS_PATHS.getWorkOrders,
    method: 'POST',
    params: { startDate },
  });
  return response.data;
};

export const reportServerOnOrdersDelivery = async ({ orderIds, deliverDateTime }) => {
  const response = await makeServerRequest({
    url: DY58_SERVER_ACTIONS_PATHS.reportOnOrdersDelivery,
    method: 'POST',
    params: { orderIds, deliverDateTime },
  });
  return response.data;
};

export const dispatchOrderToServer = async (params) => {
  const {
    type,
    orderNumSaveType,
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
    createdOnBehalfOf,
    orderChainId,
    dispatchedOnOrder,
    showOnGID,
    specialTrainCategories,
    idOfTheOrderToCancel,
    draftId,
  } = params;
  const response = await makeServerRequest({
    url: DY58_SERVER_ACTIONS_PATHS.dispatchOrder,
    method: 'POST',
    params: {
      type,
      orderNumSaveType,
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
      createdOnBehalfOf,
      orderChainId,
      dispatchedOnOrder,
      showOnGID,
      specialTrainCategories,
      idOfTheOrderToCancel,
      draftId,
    },
  });
  return response.data;
};

export const editDispatchedOrderOnServer = async (params) => {
  const { id, timeSpan, orderText } = params;
  const response = await makeServerRequest({
    url: DY58_SERVER_ACTIONS_PATHS.editDispatchedOrder,
    method: 'POST',
    params: { id, timeSpan, orderText },
  });
  return response.data;
};

export const delStationWorkPlaceReceiverOnServer = async ({ orderId, workPlaceId }) => {
  const response = await makeServerRequest({
    url: DY58_SERVER_ACTIONS_PATHS.delStationWorkPlaceReceiver,
    method: 'POST',
    params: { orderId, workPlaceId },
  });
  return response.data;
};

export const getJournalOrdersFromServer = async (props) => {
  const {
    datetimeStart,
    datetimeEnd,
    includeDocsCriteria,
    sortFields,
    filterFields,
    page = null,
    docsCount = null,
  } = props;
  const response = await makeServerRequest({
    url: DY58_SERVER_ACTIONS_PATHS.getJournalOrders,
    method: 'POST',
    params: {
      datetimeStart,
      datetimeEnd,
      includeDocsCriteria,
      sortFields,
      filterFields,
      page,
      docsCount,
    },
  });
  return response.data;
};
