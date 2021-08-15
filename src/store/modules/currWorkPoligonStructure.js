import axios from 'axios';
import { AUTH_SERVER_ACTIONS_PATHS } from '../../constants/servers';
import { WORK_POLIGON_TYPES } from '../../constants/appCredentials';

export const currWorkPoligonStructure = {
  state: {
    // Для хранения информации об участке ДНЦ / ЭЦД
    sector: null,
    // Для хранения информации о станции в случае, когда рабочий полигон - станция
    station: null,
    // true - идет процесс загрузки структуры рабочего полигона, false - не идет
    loadingCurrWorkPoligonStructure: false,
    // null - в процессе загрузки структуры рабочего полигона ошибок не было;
    // строковое значение (т.е. не null) - сообщение об ошибке загрузки информации о структуре полигона
    errorLoadingCurrWorkPoligonStructure: null,
  },

  getters: {
    getLoadingCurrWorkPoligonStructureStatus(state) {
      return state.loadingCurrWorkPoligonStructure;
    },

    getErrorLoadingCurrWorkPoligonStructure(state) {
      return state.errorLoadingCurrWorkPoligonStructure;
    },

    getUserWorkPoligonName(state, getters) {
      const workPoligon = getters.getUserWorkPoligon;
      if (!workPoligon) {
        return;
      }
      switch (workPoligon.type) {
        case WORK_POLIGON_TYPES.STATION:
          return state.station ? `${state.station.St_Title} (${state.station.St_UNMC})` : null;
        case WORK_POLIGON_TYPES.DNC_SECTOR:
          return state.sector ? state.sector.DNCS_Title : null;
        case WORK_POLIGON_TYPES.ECD_SECTOR:
          return state.sector ? state.sector.ECDS_Title : null;
        default:
          return null;
      }
    },

    getUserWorkPoligonData(state, getters) {
      const workPoligon = getters.getUserWorkPoligon;
      if (!workPoligon) {
        return;
      }
      switch (workPoligon.type) {
        case WORK_POLIGON_TYPES.STATION:
          return state.station;
        case WORK_POLIGON_TYPES.DNC_SECTOR:
        case WORK_POLIGON_TYPES.ECD_SECTOR:
          return state.sector;
        default:
          return null;
      }
    },

    getSectorStations(state) {
      if (!state.sector || (!state.sector.TDNCTrainSectors && !state.sector.TECDTrainSectors)) {
        return [];
      }
      const trainSectors = state.sector.TDNCTrainSectors || state.sector.TECDTrainSectors;
      const stations = [];
      trainSectors.forEach((sector) => {
        if (!sector.TStations || !sector.TStations.length) {
          return;
        }
        stations.push(sector.TStations);
      });
    },

    getSectorBlocks(state) {
      if (!state.sector || (!state.sector.TDNCTrainSectors && !state.sector.TECDTrainSectors)) {
        return [];
      }
      const trainSectors = state.sector.TDNCTrainSectors || state.sector.TECDTrainSectors;
      const blocks = [];
      trainSectors.forEach((sector) => {
        if (!sector.TBlocks || !sector.TBlocks.length) {
          return;
        }
        blocks.push(sector.TBlocks);
      });
    },
  },

  mutations: {
    delCurrWorkPoligonData(state) {
      if (state.sector) {
        state.sector = null;
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
        context.state.station = !response.data || !response.data.length ? null : response.data[0];
      } catch (err) {
        context.state.errorLoadingCurrWorkPoligonStructure = err;
      }
      context.state.loadingCurrWorkPoligonStructure = false;
    },

    async loadDNCSectorData(context, { sectorId }) {
      context.state.errorLoadingCurrWorkPoligonStructure = null;
      context.state.loadingCurrWorkPoligonStructure = true;
      try {
        const headers = {
          'Authorization': `Bearer ${context.getters.getCurrentUserToken}`,
        };
        const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getDNCSectorsDefinitData,
          { sectorId },
          { headers }
        );
        context.state.sector = response.data;
      } catch (err) {
        context.state.errorLoadingCurrWorkPoligonStructure = err;
      }
      context.state.loadingCurrWorkPoligonStructure = false;
    },

    async loadECDSectorData(context, { sectorId }) {
      context.state.errorLoadingCurrWorkPoligonStructure = null;
      context.state.loadingCurrWorkPoligonStructure = true;
      try {
        const headers = {
          'Authorization': `Bearer ${context.getters.getCurrentUserToken}`,
        };
        const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getECDSectorsDefinitData,
          { sectorId },
          { headers }
        );
        context.state.sector = response.data;
      } catch (err) {
        context.state.errorLoadingCurrWorkPoligonStructure = err;
      }
      context.state.loadingCurrWorkPoligonStructure = false;
    },

    async loadCurrWorkPoligonData(context) {
      const workPoligon = context.getters.getUserWorkPoligon;
      if (!workPoligon) {
        return;
      }
      switch (workPoligon.type) {
        case WORK_POLIGON_TYPES.STATION: console.log('station', workPoligon.code)
          await context.dispatch('loadStationData', { stationId: workPoligon.code });
          break;
        case WORK_POLIGON_TYPES.DNC_SECTOR:
          await context.dispatch('loadDNCSectorData', { sectorId: workPoligon.code });
          break;
        case WORK_POLIGON_TYPES.ECD_SECTOR:
          await context.dispatch('loadECDSectorData', { sectorId: workPoligon.code });
          break;
      }
    },
  },
};
