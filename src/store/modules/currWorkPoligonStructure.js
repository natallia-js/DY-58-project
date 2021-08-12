import axios from 'axios';
import { AUTH_SERVER_ACTIONS_PATHS } from '../../constants/servers';
import { WORK_POLIGON_TYPES } from '../../constants/appCredentials';

export const currWorkPoligonStructure = {
  state: {
    // Для хранения информации о поездных участках ДНЦ / ЭЦД
    trainSectors: null,
    // Для хранения информации о станции в случае, когда рабочий полигон - станция
    station: null,
    //
    loadingCurrWorkPoligonStructure: false,
    //
    errorLoadingCurrWorkPoligonStructure: null,
  },

  getters: {
    //
  },

  mutations: {
    delCurrWorkPoligonData(state) {
      if (state.trainSectors) {
        state.trainSectors = null;
      }
      if (state.station) {
        state.station = null;
      }
    },
  },

  actions: {
    async loadStationData(context, { stationId }) {
      context.state.errorLoadingCurrWorkPoligonStructure = null;
      context.state.loadingCurrWorkPoligonStructure = true;
      try {
        const headers = {
          'Authorization': `Bearer ${context.getters.getCurrentUserToken}`,
        };
        const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getStationsDefinitData,
          { stationIds: [stationId] },
          { headers }
        );
        console.log(response.data);
      } catch (err) {
        context.state.errorLoadingCurrWorkPoligonStructure = err;
      }
      context.state.loadingCurrWorkPoligonStructure = false;
    },

    async loadDNCSectorData(context) {
      console.log(context);
    },

    async loadECDSectorData(context) {
      console.log(context);
    },

    async loadCurrWorkPoligonData(context) {
      const workPoligon = context.getters.getUserWorkPoligon;
      if (!workPoligon) {
        return;
      }
      switch (workPoligon.type) {
        case WORK_POLIGON_TYPES.STATION:
          await context.dispatch('loadStationData', { stationId: workPoligon.code });
          break;
        case WORK_POLIGON_TYPES.DNC_SECTOR:
          await context.dispatch('loadDNCSectorData');
          break;
        case WORK_POLIGON_TYPES.ECD_SECTOR:
          await context.dispatch('loadECDSectorData');
          break;
      }
    },
  },
};
