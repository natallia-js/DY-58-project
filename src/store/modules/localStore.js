import LocalStoreServer from '@/additional/localStoreServer';
import {
  STORE_ORDERS_LOCALLY,
  STORE_WORK_POLIGON_PERSONAL_DATA_LOCALLY,
  STORE_WORK_POLIGON_DATA_LOCALLY,
  GET_ALL_LOCALLY_SAVED_ORDERS,
  GET_LOCALLY_SAVED_USER_WORK_POLIGON,
  CHECK_WORK_POLIGON_DATA_HASH,
  CHECK_ADJACENT_SECTORS_DATA_HASH,
  CHECK_NEAREST_SECTORS_DATA_HASH,
  CHECK_STATION_BLOCKS_DATA_HASH,
  CHECK_STATION_DNC_SECTORS_DATA_HASH,
  CHECK_STATION_ECD_SECTORS_DATA_HASH,
} from '@/store/action-types';
import { STORE_DATA_LOCALLY_TIME_IN_MS } from '@/constants/appSettings';
import wait from '@/additional/wait';

export const localStore = {
  state: {
    localStoreServer: (() => {
      try { return new LocalStoreServer(STORE_DATA_LOCALLY_TIME_IN_MS); }
      catch { return null; }
    })(),
  },

  getters: {
    /**
     * true - сервер для работы с локальным хранилищем данных создан, false - не создан;
     * Не использовать в watch!!!
     */
    isLocalStoreServerCreated(state) {
      return state.localStoreServer.db ? true : false;
    },

    localStoreServerCreateError(state) {
      return state.localStoreServer.createStoreError ? true : false;
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

    async [STORE_WORK_POLIGON_PERSONAL_DATA_LOCALLY] (context, data) {
      context.state.localStoreServer.saveWorkPoligonPersonalData(data);
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

    async [CHECK_STATION_BLOCKS_DATA_HASH] (context, hash) {
      return await context.state.localStoreServer.checkStationBlocksDataHash(hash);
    },

    async [CHECK_STATION_DNC_SECTORS_DATA_HASH] (context, hash) {
      return await context.state.localStoreServer.checkStationDNCSectorsDataHash(hash);
    },

    async [CHECK_STATION_ECD_SECTORS_DATA_HASH] (context, hash) {
      return await context.state.localStoreServer.checkStationECDSectorsDataHash(hash);
    },
  },
}
