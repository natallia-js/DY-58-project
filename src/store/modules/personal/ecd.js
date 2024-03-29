import { store } from '@/store';
import { APP_CREDENTIALS, WORK_POLIGON_TYPES } from '@/constants/appCredentials';
import { getUserFIOString, getUserPostFIOString } from './transformUserData';
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
     * Возвращает весь персонал текущего участка ЭЦД, если текущий полигон управления - участок ЭЦД.
     */
    getCurrentECDSectorShift(state, getters) {
      if (!state.sectorPersonal || !state.sectorPersonal.ECDSectorsShift) {
        return null;
      }
      const userWorkPoligon = getters.getUserWorkPoligon;
      return (userWorkPoligon.type !== WORK_POLIGON_TYPES.ECD_SECTOR)
        ? null
        : state.sectorPersonal.ECDSectorsShift.find((item) => item.sectorId === userWorkPoligon.code);
    },

    /**
     * Возвращает массив ЭЦД текущего полигона управления "Участок ЭЦД".
     */
    getCurrECDSectorWorkPoligonUsers(_state, getters) {
      const currentECDSectorShift = getters.getCurrentECDSectorShift;
      return !currentECDSectorShift || !currentECDSectorShift.people
        ? [] :
        currentECDSectorShift.people
          .filter((el) => el.appsCredentials.includes(APP_CREDENTIALS.ECD_FULL))
          .map((el) => {
            return {
              id: el._id,
              postFIO: getUserPostFIOString({ post: el.post, name: el.name, fatherName: el.fatherName, surname: el.surname }),
            };
          });
    },

    /**
     * Возвращает весь персонал участков ЭЦД, связанных с текущим полигоном управления.
     * Если текущий полигон управления - участок ЭЦД, то его персонал в выборку не включается.
     */
     getAllECDShiftExceptCurrent(state, getters) {
      if (!state.sectorPersonal || !state.sectorPersonal.ECDSectorsShift) {
        return [];
      }
      const userWorkPoligon = getters.getUserWorkPoligon;
      return (userWorkPoligon.type !== WORK_POLIGON_TYPES.ECD_SECTOR)
        ? state.sectorPersonal.ECDSectorsShift
        : state.sectorPersonal.ECDSectorsShift.filter((item) => item.sectorId !== userWorkPoligon.code);
    },

    /**
     * Возвращает информацию о всех ЭЦД участков ЭЦД, связанных с текущим полигоном управления
     * (если текущий полигон управления - участок ЭЦД, то он в выборку не включается).
     * Данным ЭЦД и может адресоваться информация, отправляемая текущим пользователем.
     * Метод возвращает абсолютно всех пользователей, зарегистрированных как ЭЦД, находятся они в
     * данный момент на дежурстве или нет.
     */
    getECDShiftForSendingData: (state, getters) => {
      if (!state.sectorPersonal || !state.sectorPersonal.ECDSectorsShift) {
        return [];
      }
      return getters.getAllECDShiftExceptCurrent.map((item) => ({
        id: item.sectorId,
        type: WORK_POLIGON_TYPES.ECD_SECTOR,
        sector: item.sectorTitle,
        post: item.lastUserChoicePost || '',
        fio: item.lastUserChoice || '',
        lastUserChoiceFIOId: item.lastUserChoiceId,
        lastUserChoiceFIOOnline: item.lastUserChoiceOnline,
        lastUserChoiceFIOOnDuty: item.lastUserChoiceOnDuty,
        people: item.people
          .filter((el) => el.appsCredentials.includes(APP_CREDENTIALS.ECD_FULL))
          .map((el) => {
            return {
              id: el._id,
              post: el.post,
              fio: getUserFIOString({ name: el.name, fatherName: el.fatherName, surname: el.surname }),
              // полагаем, что пользователь online как ЭЦД на текущем полигоне управления, если у него в массиве
              // onlineStatuses есть хотя бы одна запись с полномочием ЭЦД
              online: Boolean(el.online && el.onlineStatuses?.find((status) => status.currentCredential === APP_CREDENTIALS.ECD_FULL)),
              // полагаем, что пользователь на дежурстве, если у него в массиве onlineStatuses есть хотя бы одна
              // запись "на дежурстве" с полномочием ЭЦД
              onDuty: Boolean(el.onlineStatuses?.find((status) => status.onDuty && status.currentCredential === APP_CREDENTIALS.ECD_FULL)),
            };
          }),
        sendOriginal: item.sendOriginal,
      }));
    },
  },

  mutations: {
    /**
     * Оригинал/Копия/Ничего всем участкам ЭЦД.
     */
    [SET_GET_ORDER_STATUS_TO_ALL_ECD_SECTORS] (state, { getOrderStatus }) {
      if (state.sectorPersonal && state.sectorPersonal.ECDSectorsShift) {
        store.getters.getAllECDShiftExceptCurrent.forEach((el) => {
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
        store.getters.getAllECDShiftExceptCurrent.forEach(el => {
          if (el.sendOriginal === CurrShiftGetOrderStatus.doNotSend &&
              el.sendOriginal !== getOrderStatus) {
            el.sendOriginal = getOrderStatus;
          }
        });
      }
    },
  }
}
