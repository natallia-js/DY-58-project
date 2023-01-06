import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';
import { ORDER_PLACE_VALUES } from '@/constants/orders';
import {
  SET_ERROR_LOADING_CURR_WORK_POLIGON_DATA,
  SET_LOADING_CURR_WORK_POLIGON_DATA_STATUS,
  DEL_CURR_WORK_POLIGON_DATA,
  SET_SYSTEM_MESSAGE,
} from '@/store/mutation-types';
import {
  LOAD_STATION_DATA_ACTION,
  LOAD_DNC_SECTOR_DATA_ACTION,
  LOAD_ECD_SECTOR_DATA_ACTION,
  LOAD_CURR_WORK_POLIGON_DATA_ACTION,
  GET_LOCALLY_SAVED_USER_WORK_POLIGON,
  //CHECK_WORK_POLIGON_DATA_HASH,
  //CHECK_ADJACENT_SECTORS_DATA_HASH,
  //CHECK_NEAREST_SECTORS_DATA_HASH,
  STORE_WORK_POLIGON_DATA_LOCALLY,
  //CHECK_STATION_BLOCKS_DATA_HASH,
  //CHECK_STATION_DNC_SECTORS_DATA_HASH,
  //CHECK_STATION_ECD_SECTORS_DATA_HASH,
} from '@/store/action-types';
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
import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';
import wait from '@/additional/wait';


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
      return (includeWorkPlaceName = true) => {
        const defaultMessage = '<Наименование рабочего полигона неизвестно>';
        const workPoligon = getters.getUserWorkPoligon;
        if (!workPoligon) {
          return defaultMessage;
        }
        let poligonName;
        let workPlaceName;
        switch (workPoligon.type) {
          case WORK_POLIGON_TYPES.STATION:
            if (state.station) {
              poligonName = `${state.station.St_Title}`;//(${state.station.St_UNMC})`;
              if (!workPoligon.subCode || !includeWorkPlaceName) {
                return poligonName;
              }
              if (state.station.TStationWorkPlaces) {
                const stationWorkPlace = state.station.TStationWorkPlaces.find((wp) => wp.SWP_ID === workPoligon.subCode);
                workPlaceName = stationWorkPlace ? stationWorkPlace.SWP_Name : null;
              }
              return workPlaceName ? `${poligonName} ${workPlaceName}` : poligonName;
            }
            return defaultMessage;
          case WORK_POLIGON_TYPES.DNC_SECTOR:
            return state.sector ? state.sector.DNCS_Title : null;
          case WORK_POLIGON_TYPES.ECD_SECTOR:
            return state.sector ? state.sector.ECDS_Title : null;
          default:
            return defaultMessage;
        }
      };
    },

    /**
     * Используется лишь функцией, периодически запрашивающей информацию по online-пользователям у сервера.
     */
    getWorkPoligonsShortStructure(_state, getters) {
      const workPoligon = getters.getUserWorkPoligon;
      if (!workPoligon) {
        return [];
      }
      const wpStructure = [];
      if (getters.getSectorPersonal.sectorStationsShift) {
        getters.getSectorPersonal.sectorStationsShift.forEach((el) => {
          wpStructure.push({
            type: WORK_POLIGON_TYPES.STATION,
            id: el.stationId,
          });
        });
      }
      if (getters.getSectorPersonal.DNCSectorsShift) {
        getters.getSectorPersonal.DNCSectorsShift.forEach((el) => {
          wpStructure.push({
            type: WORK_POLIGON_TYPES.DNC_SECTOR,
            id: el.sectorId,
          });
        });
      }
      if (getters.getSectorPersonal.ECDSectorsShift) {
        getters.getSectorPersonal.ECDSectorsShift.forEach((el) => {
          wpStructure.push({
            type: WORK_POLIGON_TYPES.ECD_SECTOR,
            id: el.sectorId,
          });
        });
      }
      return wpStructure;
    },

    /**
     * Если текущий рабочий полигон - станция, то данный метод для заданного id рабочего места на
     * станции возвращает наименование данного рабочего места.
     */
    getCurrStationWorkPlaceNameById(state, getters) {
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

    /**
     * Если текущий рабочий полигон - станция, то:
     * для заданных id станции и id рабочего места на станции возвращает наименование рабочего места.
     */
    getStationWorkPlaceNameById(_state, getters) {
      return (stationId, workPlaceId) => {
        const workPoligon = getters.getUserWorkPoligon;
        if (!workPoligon) {
          return null;
        }
        switch (workPoligon.type) {
          case WORK_POLIGON_TYPES.STATION:
            if (workPoligon.code === stationId) {
              return getters.getCurrStationWorkPlaceNameById(workPlaceId);
            } else {
              return null;
            }
          default:
            return null;
        }
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

    isECDWorkPoligon(_state, getters) {
      const workPoligon = getters.getUserWorkPoligon;
      return workPoligon?.type === WORK_POLIGON_TYPES.ECD_SECTOR;
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
     * По заданному ЕСР-коду ГИД станции позволяет получить ее объект.
     * Рабочий полигон - как участок ДНЦ / ЭЦД, так и станция.
     * Если метод ничего не находит, то возвращает null.
     */
    getSectorStationByGID_ESRCode: (_state, getters) => (esrCode) => {
      return getters.getSectorStations.find((station) => station.St_GID_UNMC === esrCode);
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
     *
     */
    getSectorStationIdByTitle: (_state, getters) => (stationTitle) => {
      const stationObject = getters.getSectorStations.find((station) => station.St_Title === stationTitle);
      return stationObject ? stationObject.St_ID : null;
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
     *
     */
    getSectorBlockIdByTitle: (_state, getters) => (blockTitle) => {
      const blockObject = getters.getSectorBlocks.find((block) => block.Bl_Title === blockTitle);
      return blockObject ? blockObject.Bl_ID : null;
    },

    /**
     * Возвращает объект перегона участка управления по его id.
     */
    getSectorBlockById: (_state, getters) => (blockId) => {
      return getters.getSectorBlocks.find((block) => block.Bl_ID === blockId);
    },

    /**
     *
     */
    getSectorBlockStationsIds: (_state, getters) => (blockId) => {
      const blockObject = getters.getSectorBlockById(blockId);
      if (blockObject) {
        const station1Id = blockObject.Bl_StationID1 ? blockObject.Bl_StationID1 : (blockObject.station1 ? blockObject.station1.St_ID : null);
        const station2Id = blockObject.Bl_StationID2 ? blockObject.Bl_StationID2 : (blockObject.station2 ? blockObject.station2.St_ID : null);
        if (!station1Id || !station2Id) {
          return null;
        }
        return [station1Id, station2Id];
      }
      return null;
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
        const stations = [];
        const trainSectors = state.sector.TDNCTrainSectors || state.sector.TECDTrainSectors;
        trainSectors.forEach((sector) => {
          if (!sector.TStations || !sector.TStations.length) {
            return;
          }
          stations.push(...sector.TStations);
        });
        return stations;
      }
      if (state.station) {
        const stations = [{
          St_ID: state.station.St_ID,
          St_Title: state.station.St_Title,
          St_UNMC: state.station.St_UNMC,
          TStationTracks: state.station.TStationTracks,
        }];
        if (state.station.TBlocks) {
          state.station.TBlocks.forEach((block) => {
            if (block.station1.St_ID !== state.station.St_ID) {
              stations.push(block.station1);
            } else if (block.station2.St_ID !== state.station.St_ID) {
              stations.push(block.station2);
            }
          });
        }
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
     * Возвращает объект перегона по заданным кодам ограничивающих его станций.
     */
    getBlockTitleByStationsUNMCs(_state, getters) {
      return (stationUNMC1, stationUNMC2) => {
        if (!stationUNMC1 || !stationUNMC2) {
          return null;
        }
        const station1 = getters.getSectorStationByESRCode(stationUNMC1);
        const station2 = getters.getSectorStationByESRCode(stationUNMC2);
        if (!station1 || !station2) {
          return null;
        }
        const block = getters.getSectorBlocks.find((bl) => {
          // Заранее определяем id станций, ограничивающих перегон (делается это по-разному для случаев
          // перегона полигона управления ДНЦ/ЭЦД и станции)
          const blockStation1 = bl.Bl_StationID1 ? bl.Bl_StationID1 : bl.station1 ? bl.station1.St_ID : null;
          const blockStation2 = bl.Bl_StationID2 ? bl.Bl_StationID2 : bl.station2 ? bl.station2.St_ID : null;
          return [station1.St_ID, station2.St_ID].includes(blockStation1) &&
                 [station1.St_ID, station2.St_ID].includes(blockStation2);
        });
        if (block) {
          return block.Bl_Title;
        }
        return null;
      };
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
          additionalId: division.ECDSD_ID, // именно такое название поля, как в otherShift (см. personal)
          placeTitle: division.ECDSD_Title,
          post: division.ECDSD_Post,
          fio: division.ECDSD_FIO,
          position: division.ECDSD_Position,
        };
      });
    },

    getStructuralDivisionById(_state, getters) {
      return (id) => {
        return getters.getStructuralDivisions.find((el) => el.additionalId === id);
      };
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

    [SET_ERROR_LOADING_CURR_WORK_POLIGON_DATA] (state, error) {
      state.errorLoadingCurrWorkPoligonStructure = error;
    },

    [SET_LOADING_CURR_WORK_POLIGON_DATA_STATUS] (state, status) {
      state.loadingCurrWorkPoligonStructure = status;
    },
  },

  actions: {
    /**
     * Подгружает с сервера либо локального хранилища информацию о полигоне управления "Станция".
     */
    async [LOAD_STATION_DATA_ACTION] (context, { stationId }) {
      const responseData = await getDefinitStationData({ stationId });
      const stationBlocksResponseData = await getStationBlocksData({ stationId });
      const dncSectorsResponseData = await getStationDNCSectorsData({ stationId });
      const ecdSectorsResponseData = await getStationECDSectorsData({ stationId });

      context.state.station = {
        ...context.state.station,
        ...responseData,
        TBlocks: stationBlocksResponseData,
        TDNCSectors: dncSectorsResponseData,
        TECDSectors: ecdSectorsResponseData,
      };

      context.dispatch(STORE_WORK_POLIGON_DATA_LOCALLY, {
        ...context.state.station,
        hash: '',
        stationBlocksDataHash: '',
        stationDNCSectorsDataHash: '',
        stationECDSectorsDataHash: '',
      });
    },

    /**
     * Подгружает с сервера либо локального хранилища информацию о полигоне управления "Участок ДНЦ".
     */
    async [LOAD_DNC_SECTOR_DATA_ACTION] (context, { sectorId }) {
      const responseData = await getDefinitDNCSectorData({ sectorId });
      const adjDNCSectResponseData = await getAdjacentDNCSectorsShortDefinitData({ sectorId });
      const nearECDSectResponseData = await getNearestECDSectorsShortDefinitData({ sectorId });

      context.state.sector = {
        ...context.state.sector,
        ...responseData,
        TAdjacentDNCSectors: adjDNCSectResponseData,
        TNearestECDSectors: nearECDSectResponseData,
      };

      context.dispatch(STORE_WORK_POLIGON_DATA_LOCALLY, {
        ...context.state.sector,
        hash: '',
        adjacentSectorsDataHash: '',
        nearestSectorsDataHash: '',
      });
    },

    /**
     * Подгружает с сервера либо локального хранилища информацию о полигоне управления "Участок ЭЦД".
     */
    async [LOAD_ECD_SECTOR_DATA_ACTION] (context, { sectorId }) {
      const responseData = await getDefinitECDSectorData({ sectorId });
      const adjECDSectResponseData = await getAdjacentECDSectorsShortDefinitData({ sectorId });
      const nearDNCSectResponseData = await getNearestDNCSectorsShortDefinitData({ sectorId });

      context.state.sector = {
        ...context.state.sector,
        ...responseData,
        TAdjacentECDSectors: adjECDSectResponseData,
        TNearestDNCSectors: nearDNCSectResponseData,
      };

      context.dispatch(STORE_WORK_POLIGON_DATA_LOCALLY, {
        ...context.state.sector,
        hash: '',
        adjacentSectorsDataHash: '',
        nearestSectorsDataHash: '',
      });
    },

    /**
     * В зависимости от полигона управления пользователя запускает операцию подгрузки
     * с сервера информации о данном полигоне управления.
     */
    async [LOAD_CURR_WORK_POLIGON_DATA_ACTION] (context) {
      if (!context.getters.canUserWorkWithSystem) {
        const errMessage = 'У вас нет права на получение информации о рабочем полигоне';
        context.commit(SET_ERROR_LOADING_CURR_WORK_POLIGON_DATA, errMessage);
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }
      const workPoligon = context.getters.getUserWorkPoligon;
      if (!workPoligon) {
        const errMessage = 'Ошибка загрузки информации о рабочем полигоне: неизвестен рабочий полигон';
        context.commit(SET_ERROR_LOADING_CURR_WORK_POLIGON_DATA, errMessage);
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }
      context.commit(SET_ERROR_LOADING_CURR_WORK_POLIGON_DATA, null);
      context.commit(SET_LOADING_CURR_WORK_POLIGON_DATA_STATUS, true);
      try {
        if (context.getters.ifUserWorksOffline) {
          // wait только для того чтобы система корректно успела отреагировать на изменение флага,
          // устанавливаемого при SET_LOADING_CURR_WORK_POLIGON_DATA_STATUS
          if (workPoligon.type === WORK_POLIGON_TYPES.STATION)
            context.state.station = await context.dispatch(GET_LOCALLY_SAVED_USER_WORK_POLIGON);
          else
            context.state.sector = await context.dispatch(GET_LOCALLY_SAVED_USER_WORK_POLIGON);
          await wait(100);
        } else {
          switch (workPoligon.type) {
            case WORK_POLIGON_TYPES.STATION:
              await context.dispatch(LOAD_STATION_DATA_ACTION, { stationId: workPoligon.code });
              break;
            case WORK_POLIGON_TYPES.DNC_SECTOR:
              await context.dispatch(LOAD_DNC_SECTOR_DATA_ACTION, { sectorId: workPoligon.code });
              break;
            case WORK_POLIGON_TYPES.ECD_SECTOR:
              await context.dispatch(LOAD_ECD_SECTOR_DATA_ACTION, { sectorId: workPoligon.code });
              break;
          }
        }
        context.commit(SET_SYSTEM_MESSAGE, { error: false, datetime: new Date(), message: 'Загружена информация о рабочем полигоне' });
      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка загрузки информации о рабочем полигоне');
        context.commit(SET_ERROR_LOADING_CURR_WORK_POLIGON_DATA, errMessage);
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
      } finally {
        context.commit(SET_LOADING_CURR_WORK_POLIGON_DATA_STATUS, false);
      }
    },
  },
};
