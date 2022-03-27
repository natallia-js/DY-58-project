import { store } from '@/store';
import { APP_CREDENTIALS, WORK_POLIGON_TYPES } from '@/constants/appCredentials';
import { getUserFIOString } from './transformUserData';
import { CurrShiftGetOrderStatus } from '@/constants/orders';
import {
  SET_GET_ORDER_STATUS_TO_ALL_DSP,
  SET_GET_ORDER_STATUS_TO_DEFINIT_DSP,
  SET_GET_ORDER_STATUS_TO_ALL_LEFT_DSP,
} from '@/store/mutation-types';
import compareStrings from '@/additional/compareStrings';
import getStationWorkPlaceFullCode from '@/additional/getStationWorkPlaceFullCode';


/**
 * Данный модуль предназначен для получения и редактирования информации о получателях распоряжения среди ДСП.
 */
export const dsp = {
  getters: {
    /**
     * Возвращает массив ДСП (Операторов при ДСП) текущего рабочего места полигона управления "Станция".
     * Т.е. возвращаются не все пользователи ДСП и Операторы при ДСП станции, а только те, кто зарегистрирован
     * для работы на текущем рабочем месте (место самого ДСП станции либо рабочее место на станции - если речь идет
     * об Операторе при ДСП).
     */
    getCurrStationWorkPlaceUsers: (state, getters) => {
      const userWorkPoligon = getters.getUserWorkPoligon;
      if (!getters.userWorkPoligonIsStation || !state.sectorPersonal ||
        !state.sectorPersonal.sectorStationsShift || !userWorkPoligon) {
        return [];
      }
      const stationWithPersonal = state.sectorPersonal.sectorStationsShift.find((item) =>
        String(item.stationId) === String(userWorkPoligon.code)
      );
      if (!stationWithPersonal || !stationWithPersonal.people || !stationWithPersonal.people.length) {
        return [];
      }
      return stationWithPersonal.people
        .filter((item) =>
          (item.appsCredentials === APP_CREDENTIALS.DSP_FULL || item.appsCredentials === APP_CREDENTIALS.DSP_Operator) &&
          (
            (!userWorkPoligon.subCode && !item.stationWorkPlaceId) ||
            (userWorkPoligon.subCode && item.stationWorkPlaceId && item.stationWorkPlaceId === userWorkPoligon.subCode)
          )
        )
        .map((item) => ({
          userId: item._id,
          post: item.post,
          name: item.name,
          fatherName: item.fatherName,
          surname: item.surname,
        }));
    },

    /**
     * Возвращает массив с информацией обо всех ДСП и Операторах при ДСП текущего полигона управления "Станция".
     * В выборку не включаются пользователи рабочего места текущего пользователя.
     * Например, на некоторой станции есть рабочее место ДСП, рабочее место оператора при ДСП №1 и
     * рабочее место оператора при ДСП №2. Если зашел пользователь с рабочего места оператора при ДСП №1,
     * то данный метод вернет пользователей рабочего места ДСП и пользователей рабочего места оператора при ДСП №2.
     * Возвращаемая информация группируется по принадлежности пользователей к конкретному рабочему месту.
     */
    getCurrStationUsersThatDoNotBelongToCurrWorkPlace(state, getters) {
      const userWorkPoligon = getters.getUserWorkPoligon;
      if (!getters.userWorkPoligonIsStation || !state.sectorPersonal ||
        !state.sectorPersonal.sectorStationsShift || !getters.getUserWorkPoligonData || !userWorkPoligon) {
        return [];
      }
      const stationWithPersonal = state.sectorPersonal.sectorStationsShift.find((item) =>
        String(item.stationId) === String(getters.getUserWorkPoligonData.St_ID)
      );
      if (!stationWithPersonal || !stationWithPersonal.people || !stationWithPersonal.people.length) {
        return [];
      }
      const groupedPeople = [];
      const addDataInGroup = (groupCode, groupName, data) => {
        const group = groupedPeople.find((item) => item.groupCode === groupCode);
        if (!group) {
          groupedPeople.push({ groupCode, groupName, items: [data] });
        } else {
          group.items.push(data);
        }
      };
      stationWithPersonal.people
        .filter((item) =>
          (item.appsCredentials === APP_CREDENTIALS.DSP_FULL || item.appsCredentials === APP_CREDENTIALS.DSP_Operator) &&
          (
            (!userWorkPoligon.subCode && item.stationWorkPlaceId) ||
            (userWorkPoligon.subCode && !item.stationWorkPlaceId) ||
            (userWorkPoligon.subCode && item.stationWorkPlaceId && item.stationWorkPlaceId !== userWorkPoligon.subCode)
          )
        )
        .forEach((item) => {
          const dataToAdd = {
            key: `${getStationWorkPlaceFullCode(item.stationId, item.stationWorkPlaceId)}${item._id}`,
            workPlaceId: item.stationWorkPlaceId, // обязательно!
            userId: item._id,
            post: item.post, // обязательно!
            name: item.name, // обязательно!
            fatherName: item.fatherName, // обязательно!
            surname: item.surname, // обязательно!
          };
          if (!item.stationWorkPlaceId) {
            addDataInGroup(`${getStationWorkPlaceFullCode(userWorkPoligon.code, userWorkPoligon.subCode)}`, getters.getUserWorkPoligonName, dataToAdd);
          } else {
            addDataInGroup(`${getStationWorkPlaceFullCode(item.stationId, item.stationWorkPlaceId)}`, getters.getCurrStationWorkPlaceNameById(item.stationWorkPlaceId), dataToAdd);
          }
        });
      return groupedPeople.sort((a, b) => compareStrings(a.groupName.toLowerCase(), b.groupName.toLowerCase()));
    },

    /**
     * Возвращает информацию обо всех ДСП (не Операторах ДСП станций!), связанных с текущим полигом управления.
     * Данным лицам и может адресоваться информация, отправляемая текущим пользователем.
     * Если текущий олигон управления - участок ДСП, то в выборке данный участок не участвует (только смежные).
     * Еще один нюанс: один и тот же пользователь может быть зарегистрирован как ДСП, так и оператор при
     * ДСП одной и той же станции. Будет выбрана только информация по ДСП.
     */
    getDSPShiftForSendingData(state, getters) {
      if (!state.sectorPersonal || !state.sectorPersonal.sectorStationsShift ||
        !getters.getUserWorkPoligon || !getters.getUserWorkPoligonData) {
        return [];
      }
      let arr = state.sectorPersonal.sectorStationsShift;

      // Если текущий полигон - станция, то не включаем ее в выборку
      if (getters.userWorkPoligonIsStation) {
        arr = arr.filter((item) => String(item.stationId) !== String(getters.getUserWorkPoligonData.St_ID));
      }
      // Извлекаем необходимые данные, сортируя их по поездным участкам и порядку станций на данных участках
      arr = arr.sort((a, b) => { return a.trainSectorId - b.trainSectorId; })
        .sort((a, b) => {
          if (a.trainSectorId !== b.trainSectorId) return 0;
          return a.stationPosInTrainSector - b.stationPosInTrainSector;
        })
        .map((item) => {
          return {
            id: item.stationId,
            type: WORK_POLIGON_TYPES.STATION,
            station: item.stationTitle,
            sector: item.trainSectorTitle || '',
            post: item.lastUserChoicePost || '',
            fio: item.lastUserChoice || '',
            fioId: item.lastUserChoiceId,
            fioOnline: item.lastUserChoiceOnline,
            people: item.people
              .filter((el) => el.appsCredentials === APP_CREDENTIALS.DSP_FULL)
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
      return arr;
    },
  },

  mutations: {
    /**
     * Оригинал/Копия/Ничего всем станциям. Если текущий полигон управления - станция,
     * то она не участвует в переборе.
     */
    [SET_GET_ORDER_STATUS_TO_ALL_DSP] (state, { getOrderStatus }) {
      if (state.sectorPersonal && state.sectorPersonal.sectorStationsShift) {
        let arr = state.sectorPersonal.sectorStationsShift;
        if (store.getters.userWorkPoligonIsStation) {
          arr = arr.filter((item) => String(item.stationId) !== String(store.getters.getUserWorkPoligonData.St_ID));
        }
        arr.forEach((el) => {
          if (el.sendOriginal !== getOrderStatus) {
            el.sendOriginal = getOrderStatus;
          }
        });
      }
    },

    /**
     * Оригинал/Копия/Ничего конкретной станции.
     */
    [SET_GET_ORDER_STATUS_TO_DEFINIT_DSP] (state, { stationId, getOrderStatus }) {
      if (state.sectorPersonal && state.sectorPersonal.sectorStationsShift) {
        state.sectorPersonal.sectorStationsShift.forEach((el) => {
          if (el.stationId === stationId && el.sendOriginal !== getOrderStatus) {
            el.sendOriginal = getOrderStatus;
          }
        });
      }
    },

    /**
     * Оригинал/Копия/Ничего всем оставшимся станциям. Если текущий полигон управления - станция,
     * то она не участвует в переборе.
     */
    [SET_GET_ORDER_STATUS_TO_ALL_LEFT_DSP] (state, { getOrderStatus }) {
      if (state.sectorPersonal && state.sectorPersonal.sectorStationsShift) {
        let arr = state.sectorPersonal.sectorStationsShift;
        if (store.getters.userWorkPoligonIsStation) {
          arr = arr.filter((item) => String(item.stationId) !== String(store.getters.getUserWorkPoligonData.St_ID));
        }
        arr.forEach(el => {
          if (el.sendOriginal === CurrShiftGetOrderStatus.doNotSend &&
              el.sendOriginal !== getOrderStatus) {
            el.sendOriginal = getOrderStatus;
          }
        });
      }
    },
  },
}
