import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';
import { ORDER_PLACE_VALUES } from '@/constants/orders';
import { DEL_CURR_WORK_POLIGON_DATA } from '@/store/mutation-types';
import {
  getDefinitStationData,
  getStationBlocksData,
  getStationDNCSectorsData,
  getStationECDSectorsData,
} from '@/serverRequests/stations.requests';
import {
  getDefinitDNCSectorData,
  getAdjacentDNCSectorsShortDefinitData,
  getNearestECDSectorsShortDefinitData,
} from '@/serverRequests/dncSectors.requests';
import {
  getDefinitECDSectorData,
  getAdjacentECDSectorsShortDefinitData,
  getNearestDNCSectorsShortDefinitData,
} from '@/serverRequests/ecdSectors.requests';


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
      let poligonName;
      let workPlaceName;
      switch (workPoligon.type) {
        case WORK_POLIGON_TYPES.STATION:
          if (state.station) {
            poligonName = `${state.station.St_Title} (${state.station.St_UNMC})`;
            if (!workPoligon.subCode) {
              return poligonName;
            }
            if (state.station.TStationWorkPlaces) {
              const stationWorkPlace = state.station.TStationWorkPlaces.find((wp) => wp.SWP_ID === workPoligon.subCode);
              workPlaceName = stationWorkPlace ? stationWorkPlace.SWP_Name : null;
            }
            return workPlaceName ? `${poligonName} ${workPlaceName}` : poligonName;
          }
          return null;
        case WORK_POLIGON_TYPES.DNC_SECTOR:
          return state.sector ? state.sector.DNCS_Title : null;
        case WORK_POLIGON_TYPES.ECD_SECTOR:
          return state.sector ? state.sector.ECDS_Title : null;
        default:
          return 'Наименование рабочего полигона неизвестно';
      }
    },

    getStationWorkPlaceNameById(state, getters) {
      return (workPlaceId) => {
        const workPoligon = getters.getUserWorkPoligon;
        if (!workPoligon || workPoligon.type !== WORK_POLIGON_TYPES.STATION || !state.station ||
          !state.station.TStationWorkPlaces) {
          return null;
        }
        const stationWorkPlace = state.station.TStationWorkPlaces.find((wp) => wp.SWP_ID === workPlaceId);
        if (!stationWorkPlace) {
          return null;
        }
        return stationWorkPlace.SWP_Name || null;
      };
    },

    getUserWorkPoligonData(state, getters) {
      const workPoligon = getters.getUserWorkPoligon;
      if (!workPoligon) {
        return null;
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
     * Рабочий полигон - как участок ДНЦ / ЭЦД, так и станция.
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
          place = getters.getSectorBlocks.find((block) => String(block.Bl_ID) === String(id));
          if (place) {
            return place.Bl_Title;
          }
          break;
      }
      return null;
    },

    /**
     * По заданному ЕСР-коду станции позволяет получить ее объект.
     * Рабочий полигон - как участок ДНЦ / ЭЦД, так и станция.
     * Если метод ничего не находит, то возвращает null.
     */
    getSectorStationByESRCode: (_state, getters) => (esrCode) => {
      return getters.getSectorStations.find((station) => station.St_UNMC === esrCode);
    },

    /**
     * Возвращает объект станции текущего полигона управления.
     * Если полигон управления - участок ДНЦ / ЭЦД, то возвращается одна из станций,
     * входящих в состав поездных участков.
     * Если полигон управления - станция, то возвращается либо она сама, либо одна из
     * станций, граничащих с нею.
     * В противном случае возвращается null.
     */
    getSectorStationByTitle: (_state, getters) => (stationTitle) => {
      return getters.getSectorStations.find((station) => station.St_Title === stationTitle);
    },

    /**
     * Возвращает объект перегона текущего полигона управления.
     * Если полигон управления - участок ДНЦ / ЭЦД, то возвращается один из перегонов,
     * входящих в состав поездных участков.
     * Если полигон управления - станция, то возвращается один из смежных с нею перегонов.
     * В противном случае возвращается null.
     */
    getSectorBlockByTitle: (_state, getters) => (blockTitle) => {
      return getters.getSectorBlocks.find((block) => block.Bl_Title === blockTitle);
    },

    /**
     * Возвращает объект перегона участка управления по его id.
     */
    getSectorBlockById: (_state, getters) => (blockId) => {
      return getters.getSectorBlocks.find((block) => block.Bl_ID === blockId);
    },

    /**
     * Возвращает список станций текущего полигона управления.
     * Если полигон управления - участок ДНЦ / ЭЦД, то возвращается список станций,
     * входящих в состав поездных участков.
     * Если полигон управления - станция, то возвращается список из нее самой и граничащих с нею станций.
     * В противном случае возвращается пустой массив.
     */
    getSectorStations(state) {
      if (state.sector && (state.sector.TDNCTrainSectors || state.sector.TECDTrainSectors)) {
        const trainSectors = state.sector.TDNCTrainSectors || state.sector.TECDTrainSectors;
        const stations = [];
        trainSectors.forEach((sector) => {
          if (!sector.TStations || !sector.TStations.length) {
            return;
          }
          stations.push(...sector.TStations);
        });
        return stations;
      }
      if (state.station && state.station.TBlocks) {
        const stations = [{
          St_ID: state.station.St_ID,
          St_Title: state.station.St_Title,
          St_UNMC: state.station.St_UNMC,
          TStationTracks: state.station.TStationTracks,
        }];
        state.station.TBlocks.forEach((block) => {
          if (block.station1.St_ID !== state.station.St_ID) {
            stations.push(block.station1);
          } else if (block.station2.St_ID !== state.station.St_ID) {
            stations.push(block.station2);
          }
        });
        return stations;
      }
      return [];
    },

    /**
     * Возвращает список станций текущего полигона управления (если полигон управления -
     * участок ДНЦ / ЭЦД) с привязкой к соответствующему поездному участку).
     * В противном случае возвращает пустой массив.
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
     * Возвращает список перегонов станции по ее наименованию.
     * Если полигон управления - участок ДНЦ / ЭЦД, то поиск станции осуществляется в рамках
     * поездных участков.
     * Если полигон управления - станция, то значение параметра stationTitle должно быть ее
     * наименованием.
     * В остальных случаях возвращается пустой массив.
     */
    getSectorBlocksByStationTitle: (state, getters) => (stationTitle) => {
      if (state.sector) {
        const stationObject = getters.getSectorStationByTitle(stationTitle);
        if (!stationObject) {
          return [];
        }
        const stationId = stationObject.St_ID;
        return getters.getSectorBlocks.filter((block) => block.Bl_StationID1 === stationId || block.Bl_StationID2 === stationId);
      }
      if (state.station && state.station.St_Title === stationTitle) {
        return state.station.TBlocks;
      }
      return [];
    },

    /**
     * Возвращает список перегонов текущего полигона управления.
     * Если полигон управления - участок ДНЦ / ЭЦД, то возвращается список перегонов,
     * входящих в состав поездных участков.
     * Если полигон управления - станция, то возвращается список граничащих с нею перегонов.
     * В противном случае возвращается пустой массив.
     */
    getSectorBlocks(state) {
      if (state.sector && (state.sector.TDNCTrainSectors || state.sector.TECDTrainSectors)) {
        const trainSectors = state.sector.TDNCTrainSectors || state.sector.TECDTrainSectors;
        const blocks = [];
        trainSectors.forEach((sector) => {
          if (!sector.TBlocks || !sector.TBlocks.length) {
            return;
          }
          blocks.push(...sector.TBlocks);
        });
        return blocks;
      }
      if (state.station && state.station.TBlocks) {
        return state.station.TBlocks;
      }
      return [];
    },

    /**
     * В случае, если полигон управления - участок ДНЦ, возвращает массив смежных с ним
     * участков ДНЦ.
     */
    getAdjacentDNCSectors(state) {
      if (!state.sector || !state.sector.TAdjacentDNCSectors) {
        return [];
      }
      return state.sector.TAdjacentDNCSectors;
    },

    /**
     * В случае, если полигон управления - участок ДНЦ, возвращает массив ближайших к нему
     * участков ЭЦД.
     */
    getNearestECDSectors(state) {
      if (!state.sector || !state.sector.TNearestECDSectors) {
        return [];
      }
      return state.sector.TNearestECDSectors;
    },

    /**
     * В случае, если полигон управления - участок ЭЦД, возвращает массив смежных с ним
     * участков ЭЦД.
     */
    getAdjacentECDSectors(state) {
      if (!state.sector || !state.sector.TAdjacentECDSectors) {
        return [];
      }
      return state.sector.TAdjacentECDSectors;
    },

    /**
     * В случае, если полигон управления - участок ЭЦД, возвращает массив ближайших к нему
     * участков ДНЦ.
     */
    getNearestDNCSectors(state) {
      if (!state.sector || !state.sector.TNearestDNCSectors) {
        return [];
      }
      return state.sector.TNearestDNCSectors;
    },

    /**
     * В случае, если полигон управления - станция, возвращает массив участков ДНЦ,
     * в состав которых она входит.
     */
    getStationDNCSectors(state) {
      if (!state.station || !state.station.TDNCSectors) {
        return [];
      }
      return state.station.TDNCSectors;
    },

    /**
     * В случае, если полигон управления - станция, возвращает массив участков ЭЦД,
     * в состав которых она входит.
     */
    getStationECDSectors(state) {
      if (!state.station || !state.station.TECDSectors) {
        return [];
      }
      return state.station.TECDSectors;
    },

    /**
     * Для полигона управления, являющегося участком ЭЦД, возвращает его структурные подразделения.
     */
    getStructuralDivisions(state) {
      if (!state.sector || !state.sector.TECDStructuralDivisions || !state.sector.TECDStructuralDivisions.length) {
        return [];
      }
      return state.sector.TECDStructuralDivisions.map((division) => {
        return {
          additionalId: division.ECDSD_ID, // именно накое название поля, как в otherShift (см. personal)
          placeTitle: division.ECDSD_Title,
          post: division.ECDSD_Post,
          fio: division.ECDSD_FIO,
          fullInfo: `${division.ECDSD_Title}${division.ECDSD_Post ? ' ' + division.ECDSD_Post : ''}${division.ECDSD_FIO ? ' ' + division.ECDSD_FIO : ''}`,
        };
      });
    },
  },

  mutations: {
    [DEL_CURR_WORK_POLIGON_DATA] (state) {
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
     * Подгружает с сервера информацию о полигоне управления "Станция".
     */
    async loadStationData(context, { stationId }) {
      context.state.errorLoadingCurrWorkPoligonStructure = null;
      context.state.loadingCurrWorkPoligonStructure = true;
      try {
        const responseData = await getDefinitStationData(stationId);
        const blocksResponseData = await getStationBlocksData(stationId);
        const dncSectorsResponseData = await getStationDNCSectorsData(stationId);
        const ecdSectorsResponseData = await getStationECDSectorsData(stationId);
        context.state.station = {
          ...responseData,
          TBlocks: blocksResponseData,
          TDNCSectors: dncSectorsResponseData,
          TECDSectors: ecdSectorsResponseData,
        };
      } catch (error) {
        context.state.errorLoadingCurrWorkPoligonStructure = error;
      }
      context.state.loadingCurrWorkPoligonStructure = false;
    },

    /**
     * Подгружает с сервера информацию о полигоне управления "Участок ДНЦ".
     */
    async loadDNCSectorData(context, { sectorId }) {
      context.state.errorLoadingCurrWorkPoligonStructure = null;
      context.state.loadingCurrWorkPoligonStructure = true;
      try {
        const responseData = await getDefinitDNCSectorData(sectorId);
        const adjDNCSectResponseData = await getAdjacentDNCSectorsShortDefinitData(sectorId);
        const nearECDSectResponseData = await getNearestECDSectorsShortDefinitData(sectorId);
        context.state.sector = {
          ...responseData,
          TAdjacentDNCSectors: adjDNCSectResponseData,
          TNearestECDSectors: nearECDSectResponseData,
        };
      } catch (error) {
        context.state.errorLoadingCurrWorkPoligonStructure = error;
      }
      context.state.loadingCurrWorkPoligonStructure = false;
    },

    /**
     * Подгружает с сервера информацию о полигоне управления "Участок ЭЦД".
     */
    async loadECDSectorData(context, { sectorId }) {
      context.state.errorLoadingCurrWorkPoligonStructure = null;
      context.state.loadingCurrWorkPoligonStructure = true;
      try {
        const responseData = await getDefinitECDSectorData(sectorId);
        const adjECDSectResponseData = await getAdjacentECDSectorsShortDefinitData(sectorId);
        const nearDNCSectResponseData = await getNearestDNCSectorsShortDefinitData(sectorId);
        context.state.sector = {
          ...responseData,
          TAdjacentECDSectors: adjECDSectResponseData,
          TNearestDNCSectors: nearDNCSectResponseData,
        };
      } catch (error) {
        context.state.errorLoadingCurrWorkPoligonStructure = error;
      }
      context.state.loadingCurrWorkPoligonStructure = false;
    },

    /**
     * В зависимости от полигона управления пользователя запускает операцию подгрузки
     * с сервера информации о данном полигоне управления.
     */
    async loadCurrWorkPoligonData(context) {
      // если ранее начатая загрузка данных не завершена, то повторно ничего не запускаем
      if (context.state.loadingCurrWorkPoligonStructure) {
        return;
      }
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
