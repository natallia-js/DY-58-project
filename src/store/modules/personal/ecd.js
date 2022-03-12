import { APP_CREDENTIALS, WORK_POLIGON_TYPES } from '@/constants/appCredentials';
import { getUserFIOString } from './transformUserData';
import { CurrShiftGetOrderStatus } from '@/constants/orders';
import {
  SET_GET_ORDER_STATUS_TO_ALL_ECD_SECTORS,
  SET_GET_ORDER_STATUS_TO_DEFINIT_ECD_SECTOR,
  SET_GET_ORDER_STATUS_TO_ALL_LEFT_ECD_SECTORS,
} from '@/store/mutation-types';


/**
 * Данный модуль предназначен для получения и редактирования информации о получателях распоряжения среди ЭЦД.
 */
export const ecd = {
  getters: {
    /**
     * Возвращает информацию о всех ЭЦД участков ЭЦД, связанных с текущим полигоном управления.
     * Данным ЭЦД и может адресоваться информация, отправляемая текущим пользователем.
     */
    getECDShiftForSendingData: (state) => {
      if (!state.sectorPersonal || !state.sectorPersonal.ECDSectorsShift) {
        return [];
      }
      return state.sectorPersonal.ECDSectorsShift.map((item) => {
        return {
          id: item.sectorId,
          type: WORK_POLIGON_TYPES.ECD_SECTOR,
          sector: item.sectorTitle,
          post: item.lastUserChoicePost || '',
          fio: item.lastUserChoice || '',
          fioId: item.lastUserChoiceId,
          fioOnline: item.lastUserChoiceOnline,
          people: item.people
            .filter((el) => el.appsCredentials === APP_CREDENTIALS.ECD_FULL)
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
     * Оригинал/Копия/Ничего всем участкам ЭЦД.
     */
    [SET_GET_ORDER_STATUS_TO_ALL_ECD_SECTORS] (state, { getOrderStatus }) {
      if (state.sectorPersonal && state.sectorPersonal.ECDSectorsShift) {
        state.sectorPersonal.ECDSectorsShift.forEach((el) => {
          if (el.sendOriginal !== getOrderStatus) {
            el.sendOriginal = getOrderStatus;
          }
        });
      }
    },

    /**
     * Оригинал/Копия/Ничего конкретному участку ЭЦД.
     */
    [SET_GET_ORDER_STATUS_TO_DEFINIT_ECD_SECTOR] (state, { ecdSectorId, getOrderStatus }) {
      if (state.sectorPersonal && state.sectorPersonal.ECDSectorsShift) {
        const sector = state.sectorPersonal.ECDSectorsShift.find(el => el.sectorId === ecdSectorId);
        if (sector && sector.sendOriginal !== getOrderStatus) {
          sector.sendOriginal = getOrderStatus;
        }
      }
    },

    /**
     * Оригинал/Копия/Ничего всем оставшимся участкам ЭЦД.
     */
    [SET_GET_ORDER_STATUS_TO_ALL_LEFT_ECD_SECTORS] (state, { getOrderStatus }) {
      if (state.sectorPersonal && state.sectorPersonal.ECDSectorsShift) {
        state.sectorPersonal.ECDSectorsShift.forEach(el => {
          if (el.sendOriginal === CurrShiftGetOrderStatus.doNotSend &&
              el.sendOriginal !== getOrderStatus) {
            el.sendOriginal = getOrderStatus;
          }
        });
      }
    },
  }
}
