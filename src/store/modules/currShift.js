import axios from 'axios';
import { AUTH_SERVER_ACTIONS_PATHS } from '../../constants/servers';
import { WORK_POLIGON_TYPES } from '../../constants/appCredentials';
import { CurrShiftGetOrderStatus } from '../../constants/orders';

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

export const CurrStationsShiftTblColumnNames = Object.freeze({
  sector: 'sector',
  station: 'station',
  fio: 'fio',
  notification: 'notification',
});

export const CurrStationsShiftTblColumns = [
  { field: CurrStationsShiftTblColumnNames.station, title: 'Станция', width: '30%', },
  { field: CurrStationsShiftTblColumnNames.fio, title: 'ФИО', width: '30%', },
  { field: CurrStationsShiftTblColumnNames.notification, title: 'Уведомление', width: '200px', },
];

const DNC = 'ДНЦ';
const DSP = 'ДСП';


/**
 * Для работы со сменным персоналом смежных, ближайших участков (ДНЦ, ЭЦД) и станций
 */
export const currShift = {
  state: {
    shiftPersonal: [],
    loadingCurrShift: false,
    errorLoadingCurrShift: null,
  },

  getters: {
    getShiftPersonal: (state) => {
      return state.shiftPersonal;
    },

    /**
     * Возвращает информацию о ДНЦ смежных участков, которым необходимо отправить некоторые данные
     * (распоряжение).
     */
    getCurrAdjacentDNCSectorsDNCShiftForSendingData: (state) => {
      if (!state.shiftPersonal.adjacentDNCSectorsShift) {
        return [];
      }
      console.log(state.shiftPersonal.adjacentDNCSectorsShift)
      return state.shiftPersonal.adjacentDNCSectorsShift.map((item) => {
        return {
          id: item.sectorId,
          type: WORK_POLIGON_TYPES.DNC_SECTOR,
          sector: item.sectorTitle,
          fio: item.people
            .filter((el) => el.post === DNC)
            .reduce((accumulator, currentValue, index) =>
              accumulator + `${currentValue.surname} ${currentValue.name.charAt(0)}.` +
              `${currentValue.fatherName ? currentValue.fatherName.charAt(0) + '.' : ''}` +
              `${index === item.people.length - 1 ? '' : ', '}`, ''),
          sendOriginalToDNC: item.sendOriginalToDNC,
        };
      });
    },

    /**
     * Возвращает информацию о ДСП станций участка ДНЦ (рабочего полигона текущего пользователя),
     * которым необходимо отправить некоторые данные (распоряжение).
     */
    getCurrStationsDSPShiftForSendingData: (state) => {
      if (!state.shiftPersonal.sectorStationsShift) {
        return [];
      }
      return state.shiftPersonal.sectorStationsShift.map((item) => {
        return {
          id: item.stationId,
          type: WORK_POLIGON_TYPES.STATION,
          station: item.stationTitle,
          sector: item.trainSectorTitle,
          fio: item.people
            .filter((el) => el.post === DSP)
            .reduce((accumulator, currentValue, index) =>
              accumulator + `${currentValue.surname} ${currentValue.name.charAt(0)}.` +
              `${currentValue.fatherName ? currentValue.fatherName.charAt(0) + '.' : ''}` +
              `${index === item.people.length - 1 ? '' : ', '}`, ''),
          sendOriginalToDSP: item.sendOriginalToDSP,
        };
      });
    },

    getLoadingCurrSectorsShiftStatus: (state) => {
      return state.loadingCurrSectorsShift;
    },

    getErrorLoadingCurrSectorsShift: (state) => {
      return state.errorLoadingCurrSectorsShift;
    },
  },

  mutations: {
    /**
     * Оригинал/Копия/Ничего всем ДНЦ смежных участков ДНЦ
     */
    setGetOrderStatusToAllAdjacentDNCSectorsDNCShift(state, { getOrderStatus }) {
      if (state.shiftPersonal && state.shiftPersonal.adjacentDNCSectorsShift) {
        state.shiftPersonal.adjacentDNCSectorsShift.forEach((el) => {
          if (el.sendOriginalToDNC !== getOrderStatus) {
            el.sendOriginalToDNC = getOrderStatus;
          }
        });
      }
    },

    /**
     * Оригинал/Копия/Ничего ДНЦ конкретного смежного участка ДНЦ
     */
    setGetOrderStatusToDefinitAdjacentDNCSectorDNCShift(state, { dncSectorId, getOrderStatus }) {
      if (state.shiftPersonal && state.shiftPersonal.adjacentDNCSectorsShift) {
        const sector = state.shiftPersonal.adjacentDNCSectorsShift.find(el => el.sectorId === dncSectorId);
        if (sector && sector.sendOriginalToDNC !== getOrderStatus) {
          sector.sendOriginalToDNC = getOrderStatus;
        }
      }
    },

    /**
     * Оригинал/Копия/Ничего ДНЦ всех оставшихся смежных участков ДНЦ
     */
    setGetOrderStatusToAllLeftAdjacentDNCSectorsDNCShift(state, { getOrderStatus }) {
      if (state.shiftPersonal && state.shiftPersonal.adjacentDNCSectorsShift) {
        state.shiftPersonal.adjacentDNCSectorsShift.forEach(el => {
          if (el.sendOriginalToDNC === CurrShiftGetOrderStatus.doNotSend &&
              el.sendOriginalToDNC !== getOrderStatus) {
            el.sendOriginalToDNC = getOrderStatus;
          }
        });
      }
    },

    /**
     * Оригинал/Копия/Ничего всем ДСП станций участка ДНЦ
     */
    setGetOrderStatusToAllDNCSectorStationsDSPShift(state, { getOrderStatus }) {
      if (state.shiftPersonal && state.shiftPersonal.sectorStationsShift) {
        state.shiftPersonal.sectorStationsShift.forEach((el) => {
          if (el.sendOriginalToDSP !== getOrderStatus) {
            el.sendOriginalToDSP = getOrderStatus;
          }
        });
      }
    },

    /**
     * Оригинал/Копия/Ничего ДСП конкретной станции участка ДНЦ
     */
    setGetOrderStatusToDefinitDNCSectorStationDSPShift(state, { stationId, getOrderStatus }) {
      if (state.shiftPersonal && state.shiftPersonal.sectorStationsShift) {
        const station = state.shiftPersonal.sectorStationsShift.find(el => el.stationId === stationId);
        if (station && station.sendOriginalToDSP !== getOrderStatus) {
          station.sendOriginalToDSP = getOrderStatus;
        }
      }
    },

    /**
     * Оригинал/Копия/Ничего ДСП всех оставшихся станций участка ДНЦ
     */
     setGetOrderStatusToAllLeftDNCSectorStationsDSPShift(state, { getOrderStatus }) {
      if (state.shiftPersonal && state.shiftPersonal.sectorStationsShift) {
        state.shiftPersonal.sectorStationsShift.forEach(el => {
          if (el.sendOriginalToDSP === CurrShiftGetOrderStatus.doNotSend &&
              el.sendOriginalToDSP !== getOrderStatus) {
            el.sendOriginalToDSP = getOrderStatus;
          }
        });
      }
    },
  },

  actions: {
    /**
     * Подгружает информацию об оперативном персонале, которая необходима ДНЦ
     */
    async loadShiftDataForDNC(context) {
      if (!context.getters.getUserWorkPoligonData) {
        return;
      }
      // id смежных участков ДНЦ
      const adjacentSectorsIds = context.getters.getAdjacentDNCSectors.map((sector) => sector.DNCS_ID);
      // id станций участка ДНЦ
      const stationsIds = context.getters.getSectorStations.map((station) => station.St_ID);

      const shiftPersonal = {
        // Информация о тех пользователях, которые работают на участках ДНЦ, смежных с
        // участком ДНЦ с id = sectorId
        adjacentDNCSectorsShift: context.getters.getAdjacentDNCSectors.map((sector) => {
          return {
            sectorId: sector.DNCS_ID,
            sectorTitle: sector.DNCS_Title,
            people: [],
            sendOriginalToDNC: CurrShiftGetOrderStatus.doNotSend,
          };
        }),
        // Информация о тех пользователях, которые работают на станциях участка ДНЦ с id = sectorId
        sectorStationsShift: context.getters.getSectorStationsWithTrainSectors.map((station) => {
          return {
            trainSectorId: station.trainSectorId,
            trainSectorTitle: station.trainSectorTitle,
            stationPosInTrainSector: station.posInTrainSector,
            stationId: station.St_ID,
            stationUNMC: station.St_UNMC,
            stationTitle: station.St_Title,
            people: [],
            sendOriginalToDSP: CurrShiftGetOrderStatus.doNotSend,
          };
        }),
      };

      context.state.errorLoadingCurrShift = null;
      context.state.loadingCurrShift = true;
      try {
        const headers = {
          'Authorization': `Bearer ${context.getters.getCurrentUserToken}`,
        };
        // Извлекаем информацию о тех пользователях, которые работают на участках ДНЦ, смежных с
        // участком ДНЦ с id = sectorId
        if (adjacentSectorsIds.length) {
          const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getDNCSectorsWorkPoligonsUsers,
            { sectorIds: adjacentSectorsIds, onlyOnline: true },
            { headers }
          );
          if (response.data && response.data.length) {
            response.data.forEach((user) => {
              const element = shiftPersonal.adjacentDNCSectorsShift.find((item) => item.sectorId === user.dncSectorId);
              if (element) {
                element.people.push(user);
              }
            });
          }
        }
        // Извлекаем информацию о тех пользователях, которые работают на станциях участка ДНЦ с id = sectorId
        if (stationsIds.length) {
          const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getStationsWorkPoligonsUsers,
            { stationIds: stationsIds, onlyOnline: true },
            { headers }
          );
          if (response.data && response.data.length) {
            response.data.forEach((user) => {
              const element = shiftPersonal.sectorStationsShift.find((item) => item.stationId === user.stationId);
              if (element) {
                element.people.push(user);
              }
            });
          }
        }
        context.state.shiftPersonal = shiftPersonal;
      } catch (err) {
        context.state.errorLoadingCurrShift = err;
      }
      context.state.loadingCurrShift = false;
    },

    /**
     * Позволяет извлечь из БД информацию о персонале рабочего полигона.
     * Извлекает информацию в зависимости от типа текущего рабочего полигона пользователя:
     * 1) если рабочий полигон - участок ДНЦ, то извлекается информация о:
     *   - online-пользователях смежных участков ДНЦ
     *   - online-пользователях станций рабочего полигона
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
