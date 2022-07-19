import LocalStoreServer from '@/additional/localStoreServer';
import {
  STORE_ORDERS_LOCALLY,
  GET_ALL_LOCALLY_SAVED_ORDERS,
  GET_LOCALLY_SAVED_USER_WORK_POLIGON,
  CHECK_WORK_POLIGON_DATA_HASH,
  CHECK_ADJACENT_ECD_SECTORS_DATA_HASH,
  CHECK_NEAREST_DNC_SECTORS_DATA_HASH,
  STORE_WORK_POLIGON_DATA_LOCALLY,
} from '@/store/action-types';
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
      context.state.localStoreServer.checkAndSaveOrdersIfNecessary(data);
    },

    async [GET_ALL_LOCALLY_SAVED_ORDERS] (context) {
      return await context.state.localStoreServer.getAllLocallySavedOrders();
    },

    async [STORE_WORK_POLIGON_DATA_LOCALLY] (context, data) {
      context.state.localStoreServer.saveWorkPoligonData(data);
    },

    async [GET_LOCALLY_SAVED_USER_WORK_POLIGON] (context) {
      return await context.state.localStoreServer.getLocallySavedUserWorkPoligon();
    },

    async [CHECK_WORK_POLIGON_DATA_HASH] (context, hash) {
      return await context.state.localStoreServer.checkWorkPoligonDataHash(hash);
    },

    async [CHECK_ADJACENT_ECD_SECTORS_DATA_HASH] (context, hash) {
      return await context.state.localStoreServer.checkAdjacentECDSectorsDataHash(hash);
    },

    async [CHECK_NEAREST_DNC_SECTORS_DATA_HASH] (context, hash) {
      return await context.state.localStoreServer.checkNearestDNCSectorsDataHash(hash);
    },
  },
}
