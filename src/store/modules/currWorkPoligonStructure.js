import axios from 'axios';
import { AUTH_SERVER_ACTIONS_PATHS } from '../../constants/servers';
import { WORK_POLIGON_TYPES } from '../../constants/appCredentials';
import { ORDER_PLACE_VALUES } from '../../constants/orders';

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
          return 'Наименование рабочего полигона не указано';
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

    /**
     * По заданному id станции / перегона (placeType) позволяет получить ее / его наименование.
     * Данный метод имеет смысл вызывать лишь в том случае, если рабочий полигон - участок ДНЦ / ЭЦД.
     * Если метод ничего не находит, то возвращает null.
     */
    getSectorStationOrBlockTitleById: (_state, getters) => ({ placeType, id }) => {
      let place;
      switch (placeType) {
        case ORDER_PLACE_VALUES.station:
          place = getters.getSectorStations.find((station) => String(station.St_ID) === String(id));
          if (place) {
            return `${place.St_Title} (${place.St_UNMC})`;
          }
          break;
        case ORDER_PLACE_VALUES.span:
          place = getters.getSectorBlocks.find((block) => block.Bl_ID === id);
          if (place) {
            return place.Bl_Title;
          }
          break;
      }
      return null;
    },

    /**
     *
     */
    getSectorStationByTitle: (_state, getters) => (stationTitle) => {
      return getters.getSectorStations.find((station) => station.St_Title === stationTitle);
    },

    /**
     * Возвращает список станций текущего полигона управления (если полигон управления -
     * участок ДНЦ / ЭЦД).
     */
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
        stations.push(...sector.TStations);
      });
      return stations;
    },

    /**
     * Возвращает список станций текущего полигона управления (если полигон управления -
     * участок ДНЦ / ЭЦД) с привязкой к соответствующему поездному участку).
     */
    getSectorStationsWithTrainSectors(state) {
      if (!state.sector || (!state.sector.TDNCTrainSectors && !state.sector.TECDTrainSectors)) {
        return [];
      }
      const trainSectors = state.sector.TDNCTrainSectors || state.sector.TECDTrainSectors;
      const stations = [];
      trainSectors.forEach((sector) => {
        if (!sector.TStations || !sector.TStations.length) {
          return;
        }
        const sectorStations = sector.TStations.map((station) => {
          return {
            ...station,
            trainSectorId: sector.DNCTS_ID || sector.ECDTS_ID,
            trainSectorTitle: sector.DNCTS_Title || sector.ECDTS_Title,
            posInTrainSector:
              station.TDNCTrainSectorStation ? station.TDNCTrainSectorStation.DNCTSS_StationPositionInTrainSector:
              station.TECDTrainSectorStation ? station.TECDTrainSectorStation.ECDTSS_StationPositionInTrainSector:
              -1,
          };
        });
        stations.push(...sectorStations);
      });
      return stations;
    },

    /**
     *
     */
     getSectorBlocksByStationTitle: (_state, getters) => (stationTitle) => {
       const stationObject = getters.getSectorStationByTitle(stationTitle);
       if (!stationObject) {
         return [];
       }
       const stationId = stationObject.St_ID;
       return getters.getSectorBlocks.filter((block) => block.Bl_StationID1 === stationId || block.Bl_StationID2 === stationId);
    },

    /**
     * Возвращает список перегонов текущего полигона управления (если полигон управления -
     * участок ДНЦ / ЭЦД).
     */
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
        blocks.push(...sector.TBlocks);
      });
      return blocks;
    },

    getAdjacentDNCSectors(state) {
      if (!state.sector || !state.sector.TAdjacentDNCSectors) {
        return [];
      }
      return state.sector.TAdjacentDNCSectors;
    },

    getNearestECDSectors(state) {
      if (!state.sector || !state.sector.TNearestECDSectors) {
        return [];
      }
      return state.sector.TNearestECDSectors;
    },

    getAdjacentECDSectors(state) {
      if (!state.sector || !state.sector.TAdjacentECDSectors) {
        return [];
      }
      return state.sector.TAdjacentECDSectors;
    },

    getNearestDNCSectors(state) {
      if (!state.sector || !state.sector.TNearestDNCSectors) {
        return [];
      }
      return state.sector.TNearestDNCSectors;
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
    /**
     *
     */
    async loadStationData(context, { stationId }) {
      context.state.errorLoadingCurrWorkPoligonStructure = null;
      context.state.loadingCurrWorkPoligonStructure = true;
      try {
        const headers = {
          'Authorization': `Bearer ${context.getters.getCurrentUserToken}`,
        };
        const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getDefinitStationData,
          { stationId },
          { headers }
        );
        const blocksResponse = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getStationBlocksData,
          { stationId },
          { headers }
        );
        const dncSectorsResponse = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getStationDNCSectorsData,
          { stationId },
          { headers }
        );
        const ecdSectorsResponse = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getStationECDSectorsData,
          { stationId },
          { headers }
        );
        context.state.station = {
          ...response.data,
          TBlocks: blocksResponse.data,
          TDNCSectors: dncSectorsResponse.data,
          TECDSectors: ecdSectorsResponse.data,
        };
        console.log(context.state.station)
      } catch (err) {
        context.state.errorLoadingCurrWorkPoligonStructure = err;
      }
      context.state.loadingCurrWorkPoligonStructure = false;
    },

    /**
     *
     */
    async loadDNCSectorData(context, { sectorId }) {
      context.state.errorLoadingCurrWorkPoligonStructure = null;
      context.state.loadingCurrWorkPoligonStructure = true;
      try {
        const headers = {
          'Authorization': `Bearer ${context.getters.getCurrentUserToken}`,
        };
        const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getDefinitDNCSectorData,
          { sectorId },
          { headers }
        );
        const adjDNCSectResponse = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getAdjacentDNCSectorsShortDefinitData,
          { sectorId },
          { headers }
        );
        const nearECDSectResponse = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getNearestECDSectorsShortDefinitData,
          { sectorId },
          { headers }
        );
        context.state.sector = {
          ...response.data,
          TAdjacentDNCSectors: adjDNCSectResponse.data,
          TNearestECDSectors: nearECDSectResponse.data,
        };
      } catch (err) {
        context.state.errorLoadingCurrWorkPoligonStructure = err;
      }
      context.state.loadingCurrWorkPoligonStructure = false;
    },

    /**
     *
     */
    async loadECDSectorData(context, { sectorId }) {
      context.state.errorLoadingCurrWorkPoligonStructure = null;
      context.state.loadingCurrWorkPoligonStructure = true;
      try {
        const headers = {
          'Authorization': `Bearer ${context.getters.getCurrentUserToken}`,
        };
        const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getDefinitECDSectorData,
          { sectorId },
          { headers }
        );
        const adjECDSectResponse = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getAdjacentECDSectorsShortDefinitData,
          { sectorId },
          { headers }
        );
        const nearDNCSectResponse = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getNearestDNCSectorsShortDefinitData,
          { sectorId },
          { headers }
        );
        context.state.sector = {
          ...response.data,
          TAdjacentECDSectors: adjECDSectResponse.data,
          TNearestDNCSectors: nearDNCSectResponse.data,
        };
      } catch (err) {
        context.state.errorLoadingCurrWorkPoligonStructure = err;
      }
      context.state.loadingCurrWorkPoligonStructure = false;
    },

    /**
     *
     */
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
          await context.dispatch('loadDNCSectorData', { sectorId: workPoligon.code });
          break;
        case WORK_POLIGON_TYPES.ECD_SECTOR:
          await context.dispatch('loadECDSectorData', { sectorId: workPoligon.code });
          break;
      }
    },
  },
};
