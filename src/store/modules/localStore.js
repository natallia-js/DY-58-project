import LocalStoreServer from '@/additional/localStoreServer';
import {
  STORE_ORDERS_LOCALLY,
  GET_ALL_LOCALLY_SAVED_ORDERS,
  GET_LOCALLY_SAVED_USER_WORK_POLIGON,
  CHECK_WORK_POLIGON_DATA_HASH,
  CHECK_ADJACENT_SECTORS_DATA_HASH,
  CHECK_NEAREST_SECTORS_DATA_HASH,
  STORE_WORK_POLIGON_DATA_LOCALLY,
} from '@/store/action-types';
import { STORE_DATA_LOCALLY_TIME_IN_MS } from '@/constants/appSettings';
import wait from '@/additional/wait';

export const localStore = {
  state: {
    localStoreServer: {
      db: null,
    },
    /* (() => {
      try { return new LocalStoreServer(STORE_DATA_LOCALLY_TIME_IN_MS); }
      catch { return null; }
    })(),*/
  },

  getters: {
    isLocalStoreServerCreated(state) { console.log('isLocalStoreServerCreated',state.localStoreServer.db)
      return state.localStoreServer.db ? true : false;
    },
  },

  mutations: {
    sss(state) {
      try {
        state.localStoreServer = new LocalStoreServer(STORE_DATA_LOCALLY_TIME_IN_MS);
      } catch { state.localStoreServer = { db: null }; }
    },
  },

  actions: {
    async [STORE_ORDERS_LOCALLY] (context, data) {
      context.state.localStoreServer.checkAndSaveOrdersIfNecessary(data);
    },

    async [GET_ALL_LOCALLY_SAVED_ORDERS] (context) {
      if (!context.state.localStoreServer.db) {
        await wait(100);
      }
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

    async [CHECK_ADJACENT_SECTORS_DATA_HASH] (context, hash) {
      return await context.state.localStoreServer.checkAdjacentSectorsDataHash(hash);
    },

    async [CHECK_NEAREST_SECTORS_DATA_HASH] (context, hash) {
      return await context.state.localStoreServer.checkNearestSectorsDataHash(hash);
    },
  },
}
