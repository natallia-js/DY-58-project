import { store } from '@/store';

export const getRequestAuthorizationHeader = () => {
  return {
    'Authorization': `Bearer ${store.getters.getCurrentUserToken}`,
  };
};
