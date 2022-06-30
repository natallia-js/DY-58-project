import LocalStoreServer from '@/additional/localStoreServer';
import { STORE_ORDERS_LOCALLY } from '@/store/action-types';
import { STORE_DATA_LOCALLY_TIME_IN_MS } from '@/constants/appSettings';

export const localStore = {
  state: {
    localStoreServer: (() => {
      try { return new LocalStoreServer(STORE_DATA_LOCALLY_TIME_IN_MS); }
      catch { return null; }
    })(),
  },

  actions: {
    async [STORE_ORDERS_LOCALLY] (context, data) {
      context.state.localStoreServer.checkAndSaveDataIfNecessary(data);
    },

    async getAllLocalOrders(context) {
      try {
        return await context.state.localStoreServer.getAllData();
      } catch {
        return null;
      }
    },
  },
}
