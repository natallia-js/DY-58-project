import { store } from '@/store';
import { APP_CREDENTIALS, WORK_POLIGON_TYPES } from '@/constants/appCredentials';
import { getUserFIOString } from './transformUserData';
import { CurrShiftGetOrderStatus } from '@/constants/orders';
import {
  SET_DEFAULT_DSP_ADDRESSES,
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
     * Возвращает массив ДСП (Операторов при ДСП и др.) текущего рабочего места полигона управления "Станция".
     * Т.е. возвращаются не все пользователи ДСП, Операторы при ДСП и др. станции, а только те, кто зарегистрирован
     * для работы на текущем рабочем месте.
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
          (
            item.appsCredentials.includes(APP_CREDENTIALS.DSP_FULL) ||
            item.appsCredentials.includes(APP_CREDENTIALS.DSP_Operator) ||
            item.appsCredentials.includes(APP_CREDENTIALS.STATION_WORKS_MANAGER)
          ) &&
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
          appsCredentials: item.appsCredentials,
        }));
    },

    /**
     * Возвращает массив ДСП текущего рабочего места полигона управления "Станция".
     * Т.е. возвращаются не все пользователи ДСП, а только те, кто зарегистрирован
     * для работы на текущем рабочем месте (место самого ДСП станции либо рабочее место на станции - если речь идет
     * об Операторе при ДСП).
     */
    getCurrStationDSPUsers: (_state, getters) => {
      return getters.getCurrStationWorkPlaceUsers.filter((user) => user.appsCredentials.includes(APP_CREDENTIALS.DSP_FULL));
    },

    /**
     * Возвращает массив с информацией обо всех ДСП и Операторах при ДСП текущего полигона управления "Станция".
     * В выборку не включаются пользователи рабочего места текущего пользователя.
     * Например, на некоторой станции есть рабочее место ДСП, рабочее место оператора при ДСП №1 и
     * рабочее место оператора при ДСП №2. Если зашел пользователь с рабочего места оператора при ДСП №1,
     * то данный метод вернет пользователей рабочего места ДСП и пользователей рабочего места оператора при ДСП №2.
     * Возвращаемая информация группируется по принадлежности пользователей к конкретному рабочему месту.
     */
    getCurrStationDSPandOperatorUsersThatDoNotBelongToCurrWorkPlace(state, getters) {
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
          (
            item.appsCredentials.includes(APP_CREDENTIALS.DSP_FULL) ||
            item.appsCredentials.includes(APP_CREDENTIALS.DSP_Operator)
          ) &&
          (
            (!userWorkPoligon.subCode && item.stationWorkPlaceId) ||
            (userWorkPoligon.subCode && !item.stationWorkPlaceId) ||
            (userWorkPoligon.subCode && item.stationWorkPlaceId && item.stationWorkPlaceId !== userWorkPoligon.subCode)
          )
        )
        .forEach((item) => {
          const dataToAdd = {
            key: `${getStationWorkPlaceFullCode(item.stationId, item.stationWorkPlaceId)}${item._id}`,
            workPlaceId: item.stationWorkPlaceId, // обязательно! (нужно "из вне")
            userId: item._id,
            post: item.post, // обязательно! (нужно "из вне")
            name: item.name, // обязательно! (нужно "из вне")
            fatherName: item.fatherName, // обязательно! (нужно "из вне")
            surname: item.surname, // обязательно! (нужно "из вне")
          };
          if (!item.stationWorkPlaceId) {
            addDataInGroup(`${getStationWorkPlaceFullCode(userWorkPoligon.code, userWorkPoligon.subCode)}`, getters.getUserWorkPoligonName(), dataToAdd);
          } else {
            addDataInGroup(`${getStationWorkPlaceFullCode(item.stationId, item.stationWorkPlaceId)}`, getters.getCurrStationWorkPlaceNameById(item.stationWorkPlaceId), dataToAdd);
          }
        });
      return groupedPeople.sort((a, b) => compareStrings(a.groupName.toLowerCase(), b.groupName.toLowerCase()));
    },

    /**
     * Возвращает информацию обо всех ДСП (не Операторах при ДСП станций!), связанных с текущим полигом управления.
     * Данным лицам и может адресоваться информация, отправляемая текущим пользователем.
     * Если текущий полигон управления - участок ДСП, то в выборке данный участок не участвует (только смежные).
     * Еще один нюанс: один и тот же пользователь может быть зарегистрирован как в качестве ДСП,
     * так и как Оператор при ДСП одной и той же станции. Будет выбрана только информация по ДСП.
     * Метод возвращает абсолютно всех пользователей, зарегистрированных как ДСП, находятся они в
     * данный момент на дежурстве или нет.
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
      arr = arr
        .sort((a, b) => {
          if (a.trainSectorId < b.trainSectorId) return -1;
          if (a.trainSectorId > b.trainSectorId) return 1;
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
            fioOnDuty: item.lastUserChoiceOnDuty,
            people: item.people
              .filter((el) => el.appsCredentials.includes(APP_CREDENTIALS.DSP_FULL))
              .map((el) => {
                return {
                  id: el._id,
                  post: el.post,
                  fio: getUserFIOString({ name: el.name, fatherName: el.fatherName, surname: el.surname }),
                  online: el.online,
                  // полагаем, что пользователь на дежурстве, если у него в массиве onlineStatuses есть хотя бы одна
                  // запись "на дежурстве" с полномочием ДСП
                  onDuty: Boolean(el.onlineStatuses?.find((status) => status.onDuty && status.currentCredential === APP_CREDENTIALS.DSP_FULL)),
                };
              }),
            sendOriginal: item.sendOriginal,
          };
        });
      return arr;
    },

    getStationUserByFIO(state) {
      return ({ stationId, fio }) => {
        if (!state.sectorPersonal || !state.sectorPersonal.sectorStationsShift) {
          return null;
        }
        const stationShiftInfo = state.sectorPersonal.sectorStationsShift.find((el) => el.stationId === stationId);
        if (!stationShiftInfo || !stationShiftInfo.people) {
          return;
        }
        return stationShiftInfo.people.find((u) =>
          getUserFIOString({ name: u.name, fatherName: u.fatherName, surname: u.surname }) === fio);
      };
    },
  },

  mutations: {
    /**
     * Устанавливает указанных адресатов распоряжения из числа ДСП станций.
     * Учитывает наличие более одного поездного участка, в который может входить одна и та же станция.
     */
    [SET_DEFAULT_DSP_ADDRESSES] (state, dspUsers) {
      if (!dspUsers || !state.sectorPersonal || !state.sectorPersonal.sectorStationsShift) {
        return;
      }
      dspUsers.forEach((user) => {
        const stationsShiftInfo = state.sectorPersonal.sectorStationsShift.filter((el) => el.stationId === user.stationId);
        if (!stationsShiftInfo?.length)
          return;
        for (let stationShiftInfo of stationsShiftInfo) {
          const elIndex = state.sectorPersonal.sectorStationsShift.findIndex((el) =>
            el.stationId === stationShiftInfo.stationId && el.trainSectorId === stationShiftInfo.trainSectorId);
          if (!stationShiftInfo?.people?.length)
            continue;
          const stationUser = stationShiftInfo.people.find((u) =>
            getUserFIOString({ name: u.name, fatherName: u.fatherName, surname: u.surname }) === user.fio);
          if (!stationUser)
            continue;
          state.sectorPersonal.sectorStationsShift[elIndex] = {
            ...state.sectorPersonal.sectorStationsShift[elIndex],
            lastUserChoiceId: stationUser._id,
            lastUserChoicePost: stationUser.post,
            lastUserChoice: user.fio,
          };
        }
      });
    },

    /**
     * Оригинал/Копия/Ничего всем станциям. Если текущий полигон управления - станция,
     * то она не участвует в переборе.
     */
    [SET_GET_ORDER_STATUS_TO_ALL_DSP] (state, { getOrderStatus, trainSectorTitle }) {
      if (state.sectorPersonal && state.sectorPersonal.sectorStationsShift) {
        let arr = state.sectorPersonal.sectorStationsShift;
        if (store.getters.userWorkPoligonIsStation) {
          arr = arr.filter((item) => String(item.stationId) !== String(store.getters.getUserWorkPoligonData.St_ID));
        }
        arr.forEach((el) => {
          if (trainSectorTitle && el.trainSectorTitle !== trainSectorTitle) {
            return;
          }
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
    [SET_GET_ORDER_STATUS_TO_ALL_LEFT_DSP] (state, { getOrderStatus, trainSectorTitle }) {
      if (state.sectorPersonal && state.sectorPersonal.sectorStationsShift) {
        let arr = state.sectorPersonal.sectorStationsShift;
        if (store.getters.userWorkPoligonIsStation) {
          arr = arr.filter((item) => String(item.stationId) !== String(store.getters.getUserWorkPoligonData.St_ID));
        }
        arr.forEach((el) => {
          if (trainSectorTitle && el.trainSectorTitle !== trainSectorTitle) {
            return;
          }
          if (el.sendOriginal === CurrShiftGetOrderStatus.doNotSend && el.sendOriginal !== getOrderStatus) {
            el.sendOriginal = getOrderStatus;
          }
        });
      }
    },
  },
}
