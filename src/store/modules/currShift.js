import axios from 'axios';
import { AUTH_SERVER_ACTIONS_PATHS } from '../../constants/servers';
import { WORK_POLIGON_TYPES } from '../../constants/appCredentials';

export const CurrSectorsShiftGetOrderStatus = Object.freeze({
  sendOriginal: 0,
  sendCopy: 1,
  doNotSend: 2,
});

export const CurrSectorsShiftTblColumnNames = Object.freeze({
  sector: 'sector',
  fio: 'fio',
  notification: 'notification',
});

export const CurrSectorsShiftTblColumns = [
  { field: CurrSectorsShiftTblColumnNames.sector, title: 'Участок', width: '30%', },
  { field: CurrSectorsShiftTblColumnNames.fio, title: 'ФИО', width: '30%', },
  { field: CurrSectorsShiftTblColumnNames.notification, title: 'Уведомление', width: '200px', },
];


/**
 * Для работы со сменным персоналом смежных и ближайших участков (ДНЦ, ЭЦД)
 */
export const currShift = {
  state: {
    shiftPersonal: [],
    adjacentSectorsShiftPersonal: [],
    nearestSectorsShiftPersonal: [],
    loadingCurrShift: false,
    errorLoadingCurrShift: null,
  },

  getters: {
    getCurrSectorsShift: (state) => {
      return state.shiftPersonal;
    },

    getAdjacentSectorsShiftPersonal: (state) => {
      return state.adjacentSectorsShiftPersonal;
    },

    getNearestSectorsShiftPersonal: (state) => {
      return state.nearestSectorsShiftPersonal;
    },

    getLoadingCurrSectorsShiftStatus: (state) => {
      return state.loadingCurrSectorsShift;
    },

    getErrorLoadingCurrSectorsShift: (state) => {
      return state.errorLoadingCurrSectorsShift;
    },
  },

  mutations: {
    setCurrSectorsShift(state, currShift) {
      currShift = [
        { id: 11, sector: 'Витебск узел', fio: 'Авдеенко В.Г.', post: 'ДНЦ', sendOriginal: CurrSectorsShiftGetOrderStatus.sendCopy, },
        { id: 12, sector: 'Могилев-Езерище', fio: 'Ковалев Е.А.', post: 'ДНЦ', sendOriginal: CurrSectorsShiftGetOrderStatus.doNotSend, },
        { id: 13, sector: 'Орша узел', fio: 'Павлов В.Г.', post: 'ДНЦ', sendOriginal: CurrSectorsShiftGetOrderStatus.sendOriginal, },
        { id: 14, sector: 'Могилев узел', fio: 'Степанов И.Д.', post: 'ДНЦ', sendOriginal: CurrSectorsShiftGetOrderStatus.doNotSend, },
      ];

      state.shiftPersonal = currShift;
    },

    /**
     * Оригинал всем
     */
    originalToAllSectorsShift(state) {
      if (state.shiftPersonal) {
        state.shiftPersonal.forEach(el => el.sendOriginal = CurrSectorsShiftGetOrderStatus.sendOriginal);
      }
    },

    /**
     * Оригинал всем смежным участкам
     */
    originalToAllAdjacentSectorsShift(state) {
      if (state.adjacentSectorsShiftPersonal) {
        state.adjacentSectorsShiftPersonal.forEach(el => el.sendOriginal = CurrSectorsShiftGetOrderStatus.sendOriginal);
      }
    },

    /**
     * Оригинал всем ближайшим участкам
     */
    originalToAllNearestSectorsShift(state) {
      if (state.nearestSectorsShiftPersonal) {
        state.nearestSectorsShiftPersonal.forEach(el => el.sendOriginal = CurrSectorsShiftGetOrderStatus.sendOriginal);
      }
    },

    /**
     * Оригинал всем оставшимся
     */
    originalToAllLeftSectorsShift(state) {
      if (state.shiftPersonal) {
        state.shiftPersonal.forEach(el => {
          if (el.sendOriginal === CurrSectorsShiftGetOrderStatus.doNotSend) {
            el.sendOriginal = CurrSectorsShiftGetOrderStatus.sendOriginal;
          }
        });
      }
    },

    /**
     * Оригинал всем оставшимся смежным участкам
     */
    originalToAllLeftAdjacentSectorsShift(state) {
      if (state.adjacentSectorsShiftPersonal) {
        state.adjacentSectorsShiftPersonal.forEach(el => {
          if (el.sendOriginal === CurrSectorsShiftGetOrderStatus.doNotSend) {
            el.sendOriginal = CurrSectorsShiftGetOrderStatus.sendOriginal;
          }
        });
      }
    },

    /**
     * Оригинал всем оставшимся ближайшим участкам
     */
    originalToAllLeftNearestSectorsShift(state) {
      if (state.nearestSectorsShiftPersonal) {
        state.nearestSectorsShiftPersonal.forEach(el => {
          if (el.sendOriginal === CurrSectorsShiftGetOrderStatus.doNotSend) {
            el.sendOriginal = CurrSectorsShiftGetOrderStatus.sendOriginal;
          }
        });
      }
    },

    /**
     * Копия всем
     */
    copyToAllSectorsShift(state) {
      if (state.shiftPersonal) {
        state.shiftPersonal.forEach(el => el.sendOriginal = CurrSectorsShiftGetOrderStatus.sendCopy);
      }
    },

    /**
     * Копия всем смежным участкам
     */
    copyToAllAdjacentSectorsShift(state) {
      if (state.adjacentSectorsShiftPersonal) {
        state.adjacentSectorsShiftPersonal.forEach(el => el.sendOriginal = CurrSectorsShiftGetOrderStatus.sendCopy);
      }
    },

    /**
     * Копия всем ближайшим участкам
     */
    copyToAllNearestSectorsShift(state) {
      if (state.nearestSectorsShiftPersonal) {
        state.nearestSectorsShiftPersonal.forEach(el => el.sendOriginal = CurrSectorsShiftGetOrderStatus.sendCopy);
      }
    },

    /**
     * Копия всем оставшимся
     */
    copyToAllLeftSectorsShift(state) {
      if (state.shiftPersonal) {
        state.shiftPersonal.forEach(el => {
          if (el.sendOriginal === CurrSectorsShiftGetOrderStatus.doNotSend) {
            el.sendOriginal = CurrSectorsShiftGetOrderStatus.sendCopy;
          }
        });
      }
    },

    /**
     * Копия всем оставшимся смежным участкам
     */
    copyToAllLeftAdjacentSectorsShift(state) {
      if (state.adjacentSectorsShiftPersonal) {
        state.adjacentSectorsShiftPersonal.forEach(el => {
          if (el.sendOriginal === CurrSectorsShiftGetOrderStatus.doNotSend) {
            el.sendOriginal = CurrSectorsShiftGetOrderStatus.sendCopy;
          }
        });
      }
    },

    /**
     * Копия всем оставшимся ближайшим участкам
     */
    copyToAllLeftNearestSectorsShift(state) {
      if (state.nearestSectorsShiftPersonal) {
        state.nearestSectorsShiftPersonal.forEach(el => {
          if (el.sendOriginal === CurrSectorsShiftGetOrderStatus.doNotSend) {
            el.sendOriginal = CurrSectorsShiftGetOrderStatus.sendCopy;
          }
        });
      }
    },

    /**
     * Не передавать всем
     */
    doNotSendToAllSectorsShift(state) {
      if (state.shiftPersonal) {
        state.shiftPersonal.forEach(el => el.sendOriginal = CurrSectorsShiftGetOrderStatus.doNotSend);
      }
    },

    /**
     * Не передавать всем смежным участкам
     */
    doNotSendToAllAdjacentSectorsShift(state) {
      if (state.adjacentSectorsShiftPersonal) {
        state.adjacentSectorsShiftPersonal.forEach(el => el.sendOriginal = CurrSectorsShiftGetOrderStatus.doNotSend);
      }
    },

    /**
     * Не передавать всем ближайшим участкам
     */
    doNotSendToAllNearestSectorsShift(state) {
      if (state.nearestSectorsShiftPersonal) {
        state.nearestSectorsShiftPersonal.forEach(el => el.sendOriginal = CurrSectorsShiftGetOrderStatus.doNotSend);
      }
    },
  },

  actions: {
    async loadShiftDataForDNC(context) {
      const currPoligonData = context.getters.getUserWorkPoligonData;
      if (!currPoligonData) {
        return;
      }
      const adjacentSectorsIds = context.getters.getAdjacentDNCSectors.map((sector) => sector.DNCS_ID);
      const stationsIds = context.getters.getSectorStations.map((station) => station.St_ID);

      console.log(currPoligonData)

      /*context.state.shiftPersonal = [
        {
          post: 'ДНЦ',
          adjacentSectorsShift: context.getters.getAdjacentDNCSectors.map((sector) => {
            return {
              sectorId: sector.DNCS_ID,
              sectorTitle: sector.DNCS_Title,
              people: [],
            };
          }),
        },
        {
          post: 'ДСП',
          sectorStationsShift: context.getters.getSectorStations.map((station) => {
            return {
              trainSectorID: 1,
              trainSectorTitle: '',
              stationId: 1,
              stationTitle: '',
              people: [],
            };
          }),
        },
      ];*/
      context.state.errorLoadingCurrShift = null;
      context.state.loadingCurrShift = true;
      try {
        const headers = {
          'Authorization': `Bearer ${context.getters.getCurrentUserToken}`,
        };
        // Вначале извлекаем id тех пользователей, которые работают на участках ДНЦ, смежных с
        // участком ДНЦ с id = sectorId, а также на станциях участка ДНЦ с id = sectorId
        if (adjacentSectorsIds.length) {
          const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getDNCSectorsWorkPoligonsUsers,
            { sectorIds: adjacentSectorsIds },
            { headers }
          );
          console.log(response.data)
        }
        if (stationsIds.length) {
          const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getStationsWorkPoligonsUsers,
            { stationIds: stationsIds },
            { headers }
          );
          console.log(response.data)
        }
        /*const adjDNCSectResponse = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getAdjacentDNCSectorsShortDefinitData,
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
        };*/
      } catch (err) {
        context.state.errorLoadingCurrShift = err;
        console.log(err)
      }
      context.state.loadingCurrShift = false;
    },

    /**
     * Позволяет извлечь из БД информацию о персонале рабочего полигона.
     * Извлекает информацию в зависимости от типа текущего рабочего полигона пользователя:
     * 1) если рабочий полигон - участок ДНЦ, то извлекается информация о:
     *   - online ДНЦ смежных участков ДНЦ
     *   - online ДСП станций рабочего полигона
     */
    async loadCurrSectorsShift(context) {
      const workPoligon = context.getters.getUserWorkPoligon;
      if (!workPoligon) {
        return;
      }
      switch (workPoligon.type) {
        case WORK_POLIGON_TYPES.STATION:
          break;
        case WORK_POLIGON_TYPES.DNC_SECTOR:
          await context.dispatch('loadShiftDataForDNC');
          break;
        case WORK_POLIGON_TYPES.ECD_SECTOR:
          break;
      }
    },
  },
}
