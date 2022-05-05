import { store } from '@/store';
import { APP_CREDENTIALS, WORK_POLIGON_TYPES } from '@/constants/appCredentials';
import { getUserFIOString, getUserPostFIOString } from './transformUserData';
import { CurrShiftGetOrderStatus } from '@/constants/orders';
import {
  SET_GET_ORDER_STATUS_TO_ALL_DNC_SECTORS,
  SET_GET_ORDER_STATUS_TO_DEFINIT_DNC_SECTOR,
  SET_GET_ORDER_STATUS_TO_ALL_LEFT_DNC_SECTORS,
} from '@/store/mutation-types';


/**
 * Данный модуль предназначен для получения и редактирования информации о получателях распоряжения среди ДНЦ.
 */
export const dnc = {
  getters: {
    /**
     * Возвращает весь персонал текущего участка ДНЦ, если текущий полигон управления - участок ДНЦ.
     */
    getCurrentDNCSectorShift(state, getters) {
      if (!state.sectorPersonal || !state.sectorPersonal.DNCSectorsShift) {
        return null;
      }
      const userWorkPoligon = getters.getUserWorkPoligon;
      return (userWorkPoligon.type !== WORK_POLIGON_TYPES.DNC_SECTOR)
        ? null
        : state.sectorPersonal.DNCSectorsShift.find((item) => item.sectorId === userWorkPoligon.code);
    },

    /**
     * Возвращает массив ДНЦ текущего полигона управления "Участок ДНЦ".
     */
    getCurrDNCSectorWorkPoligonUsers(_state, getters) {
      const currentDNCSectorShift = getters.getCurrentDNCSectorShift;
      return !currentDNCSectorShift || !currentDNCSectorShift.people
        ? [] :
        currentDNCSectorShift.people
          .filter((el) => el.appsCredentials === APP_CREDENTIALS.DNC_FULL)
          .map((el) => {
            return {
              id: el._id,
              postFIO: getUserPostFIOString({ post: el.post, name: el.name, fatherName: el.fatherName, surname: el.surname }),
            };
          });
    },

    /**
     * Возвращает весь персонал участков ДНЦ, связанных с текущим полигоном управления.
     * Если текущий полигон управления - участок ДНЦ, то его персонал в выборку не включается.
     */
    getAllDNCShiftExceptCurrent(state, getters) {
      if (!state.sectorPersonal || !state.sectorPersonal.DNCSectorsShift) {
        return [];
      }
      const userWorkPoligon = getters.getUserWorkPoligon;
      return (userWorkPoligon.type !== WORK_POLIGON_TYPES.DNC_SECTOR)
        ? state.sectorPersonal.DNCSectorsShift
        : state.sectorPersonal.DNCSectorsShift.filter((item) => item.sectorId !== userWorkPoligon.code);
    },

    /**
     * Возвращает информацию о всех ДНЦ участков ДНЦ, связанных с текущим полигоном управления
     * (если текущий полигон управления - участок ДНЦ, то он в выборку не включается).
     * Данным ДНЦ и может адресоваться информация, отправляемая текущим пользователем.
     */
    getDNCShiftForSendingData: (state, getters) => {
      if (!state.sectorPersonal || !state.sectorPersonal.DNCSectorsShift) {
        return [];
      }
      return getters.getAllDNCShiftExceptCurrent.map((item) => ({
          id: item.sectorId,
          type: WORK_POLIGON_TYPES.DNC_SECTOR,
          sector: item.sectorTitle,
          post: item.lastUserChoicePost || '',
          fio: item.lastUserChoice || '',
          fioId: item.lastUserChoiceId,
          fioOnline: item.lastUserChoiceOnline,
          people: item.people
            .filter((el) => el.appsCredentials === APP_CREDENTIALS.DNC_FULL)
            .map((el) => {
              return {
                id: el._id,
                post: el.post,
                fio: getUserFIOString({ name: el.name, fatherName: el.fatherName, surname: el.surname }),
                online: el.online,
              };
            }),
          sendOriginal: item.sendOriginal,
      }));
    },
  },

  mutations: {
    /**
     * Оригинал/Копия/Ничего всем участкам ДНЦ (кроме текущего, если текущий - участок ДНЦ).
     */
    [SET_GET_ORDER_STATUS_TO_ALL_DNC_SECTORS] (state, { getOrderStatus }) {
      if (state.sectorPersonal && state.sectorPersonal.DNCSectorsShift) {
        store.getters.getAllDNCShiftExceptCurrent.forEach((el) => {
          if (el.sendOriginal !== getOrderStatus) {
            el.sendOriginal = getOrderStatus;
          }
        });
      }
    },

    /**
     * Оригинал/Копия/Ничего конкретному участку ДНЦ.
     */
    [SET_GET_ORDER_STATUS_TO_DEFINIT_DNC_SECTOR] (state, { dncSectorId, getOrderStatus }) {
      if (state.sectorPersonal && state.sectorPersonal.DNCSectorsShift) {
        const sector = state.sectorPersonal.DNCSectorsShift.find(el => el.sectorId === dncSectorId);
        if (sector && sector.sendOriginal !== getOrderStatus) {
          sector.sendOriginal = getOrderStatus;
        }
      }
    },

    /**
     * Оригинал/Копия/Ничего всем оставшимся участкам ДНЦ.
     */
    [SET_GET_ORDER_STATUS_TO_ALL_LEFT_DNC_SECTORS] (state, { getOrderStatus }) {
      if (state.sectorPersonal && state.sectorPersonal.DNCSectorsShift) {
        store.getters.getAllDNCShiftExceptCurrent.forEach(el => {
          if (el.sendOriginal === CurrShiftGetOrderStatus.doNotSend && el.sendOriginal !== getOrderStatus) {
            el.sendOriginal = getOrderStatus;
          }
        });
      }
    },
  },
}
