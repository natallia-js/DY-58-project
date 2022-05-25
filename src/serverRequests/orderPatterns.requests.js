import { AUTH_SERVER_ACTIONS_PATHS } from '@/constants/servers';
import { makeServerRequest } from './common';

export const getOrderPatternsElementsRefs = async () => {
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.getOrderPatternsElementsRefs,
    method: 'POST',
    params: {},
  });
  return response.data;
};

export const getOrderPatterns = async ({ workPoligonType, workPoligonId, getChildPatterns }) => {
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.getOrderPatterns,
    method: 'POST',
    params: { workPoligonType, workPoligonId, getChildPatterns },
  });
  return response.data;
};

export const modOrderCategoryTitle = async ({ service, orderType, title, newTitle }) => {
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.modOrderCategoryTitle,
    method: 'POST',
    params: { service, orderType, title, newTitle },
  });
  return response.data;
};

export const deleteOrderPattern = async (id) => {
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.delOrderPattern,
    method: 'POST',
    params: { id },
  });
  return response.data;
};

export const modifyOrderPattern = async ({ id, title, specialTrainCategories, elements }) => {
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.modOrderPattern,
    method: 'POST',
    params: { id, title, specialTrainCategories, elements },
  });
  return response.data;
};

export const createNewOrderPattern = async (params) => {
  const {
    service,
    type,
    category,
    title,
    specialTrainCategories,
    elements,
    isPersonalPattern,
    workPoligonType,
    workPoligonId,
  } = params;
  const response = await makeServerRequest({
    url: AUTH_SERVER_ACTIONS_PATHS.createOrderPattern,
    method: 'POST',
    params: {
      service,
      type,
      category,
      title,
      specialTrainCategories,
      elements,
      isPersonalPattern,
      workPoligonType,
      workPoligonId,
    },
  });
  return response.data;
}
