import axios from 'axios';
import { AUTH_SERVER_ACTIONS_PATHS } from '@/constants/servers';

export const getOrderPatternsElementsRefs = async () => {
  const response = await axios.get(AUTH_SERVER_ACTIONS_PATHS.getOrderPatternsElementsRefs,
    { withCredentials: true }
  );
  return response.data;
};

export const getOrderPatterns = async ({ workPoligonType, workPoligonId, getChildPatterns }) => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getOrderPatterns,
    { workPoligonType, workPoligonId, getChildPatterns },
    { withCredentials: true }
  );
  return response.data;
};

export const modOrderCategoryTitle = async ({ service, orderType, title, newTitle }) => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.modOrderCategoryTitle,
    { service, orderType, title, newTitle },
    { withCredentials: true }
  );
  return response.data;
};

export const deleteOrderPattern = async (id) => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.delOrderPattern,
    { id },
    { withCredentials: true }
  );
  return response.data;
};

export const modifyOrderPattern = async ({ id, title, specialTrainCategories, elements }) => {
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.modOrderPattern,
    { id, title, specialTrainCategories, elements },
    { withCredentials: true }
  );
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
  const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.createOrderPattern,
    {
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
    { withCredentials: true }
  );
  return response.data;
}
