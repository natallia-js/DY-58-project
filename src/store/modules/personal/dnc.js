import { APP_CREDENTIALS, WORK_POLIGON_TYPES } from '@/constants/appCredentials';
import { getUserFIOString } from './transformUserData';
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
     * Возвращает информацию о всех ДНЦ участков ДНЦ, связанных с текущим полигоном управления.
     * Данным ДНЦ и может адресоваться информация, отправляемая текущим пользователем.
     */
    getDNCShiftForSendingData: (state) => {
      if (!state.sectorPersonal || !state.sectorPersonal.DNCSectorsShift) {
        return [];
      }
      return state.sectorPersonal.DNCSectorsShift.map((item) => {
        return {
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
        };
      });
    },
  },

  mutations: {
    /**
     * Оригинал/Копия/Ничего всем участкам ДНЦ.
     */
    [SET_GET_ORDER_STATUS_TO_ALL_DNC_SECTORS] (state, { getOrderStatus }) {
      if (state.sectorPersonal && state.sectorPersonal.DNCSectorsShift) {
        state.sectorPersonal.DNCSectorsShift.forEach((el) => {
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
        state.sectorPersonal.DNCSectorsShift.forEach(el => {
          if (el.sendOriginal === CurrShiftGetOrderStatus.doNotSend &&
              el.sendOriginal !== getOrderStatus) {
            el.sendOriginal = getOrderStatus;
          }
        });
      }
    },
  },
}
