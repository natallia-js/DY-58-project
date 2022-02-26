import { APP_CREDENTIALS, WORK_POLIGON_TYPES } from '@/constants/appCredentials';
import { CurrShiftGetOrderStatus } from '@/constants/orders';
import {
  getDNCSectorsWorkPoligonsUsers,
  getStationsWorkPoligonsUsers,
  getECDSectorsWorkPoligonsUsers,
} from '@/serverRequests/users.requests';
import objectId from '@/additional/objectId.generator';
import { store } from '@/store';
import {
  CLEAR_SHIFT_FOR_SENDING_DATA,
  SET_GET_ORDER_STATUS_TO_ALL_DNC_SECTORS,
  SET_GET_ORDER_STATUS_TO_DEFINIT_DNC_SECTOR,
  SET_GET_ORDER_STATUSES_TO_ONLY_DEFINIT_SECTORS,
  SET_GET_ORDER_STATUS_TO_ALL_LEFT_DNC_SECTORS,
  SET_GET_ORDER_STATUS_TO_ALL_DSP,
  SET_GET_ORDER_STATUS_TO_DEFINIT_DSP,
  SET_GET_ORDER_STATUS_TO_ALL_LEFT_DSP,
  SET_GET_ORDER_STATUS_TO_ALL_ECD_SECTORS,
  SET_GET_ORDER_STATUS_TO_DEFINIT_ECD_SECTOR,
  SET_GET_ORDER_STATUS_TO_ALL_LEFT_ECD_SECTORS,
  SET_GET_ORDER_STATUS_TO_ALL_OTHER_SHIFT,
  SET_GET_ORDER_STATUS_TO_DEFINIT_OTHER_SHIFT,
  SET_GET_ORDER_STATUS_TO_ALL_LEFT_OTHER_SHIFT,
  SET_ONLINE_SHIFT_PERSONAL,
  CHOOSE_ONLY_ONLINE_PERSONAL,
  SET_USER_CHOSEN_STATUS,
  ADD_OTHER_GET_ORDER_RECORD,
  EDIT_OTHER_GET_ORDER_RECORD,
  DEL_OTHER_GET_ORDER_RECORD,
  DEL_CURR_SECTORS_SHIFT,
  SET_OTHER_SHIFT_FOR_SENDING_DATA,
  DEL_UNSELECTED_STRUCTURAL_DIVISIONS,
} from '@/store/mutation-types';
import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';

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
  post: 'post',
  fio: 'fio',
  notification: 'notification',
});

export const CurrStationsShiftTblColumns = [
  { field: CurrStationsShiftTblColumnNames.station, title: 'Станция', width: '30%', },
  { field: CurrStationsShiftTblColumnNames.post, title: 'Должность', width: '15%', },
  { field: CurrStationsShiftTblColumnNames.fio, title: 'ФИО', width: '30%', },
  { field: CurrStationsShiftTblColumnNames.notification, title: 'Уведомление', width: '200px', },
];

export const OtherShiftTblColumnNames = Object.freeze({
  placeTitle: 'placeTitle',
  post: 'post',
  fio: 'fio',
  notification: 'notification',
});

export const OtherShiftTblColumns = [
  { field: OtherShiftTblColumnNames.placeTitle, title: 'Место', width: '25%', },
  { field: OtherShiftTblColumnNames.post, title: 'Должность', width: '25%', },
  { field: OtherShiftTblColumnNames.fio, title: 'ФИО', width: '25%', },
  { field: OtherShiftTblColumnNames.notification, title: 'Уведомление', width: '200px', },
];

export const getUserFIOString = ({ name, fatherName, surname }) => {
  return `${surname} ${name.charAt(0)}.${fatherName && fatherName.length ? fatherName.charAt(0) + '.': ''}`;
};

export const getUserPostFIOString = ({ post, name, fatherName, surname }) => {
  return `${post} ${getUserFIOString({ name, fatherName, surname })}`;
};


/**
 * Для работы со сменным персоналом смежных, ближайших участков (ДНЦ, ЭЦД) и станций.
 * А также для работы с виртуальным персоналом (персоналом, не зарегистрированным в системе,
 * но который должен фигурировать в текстах распоряжений).
 */
export const personal = {
  state: {
    sectorPersonal: {},
    loadingCurrShift: false,
    errorLoadingCurrShift: null,
  },

  getters: {
    /**
     * Возвращает объект со списками всего персонала полигона управления
     */
    getSectorPersonal(state) {
      return state.sectorPersonal;
    },

    /**
     * Возвращает идентификаторы всех лиц, входящих в состав полигона управления
     * (т.е. идентификаторы всего зарегистрированного в системе персонала).
     * Если одно и то же лицо входит в несколько участков (например, когда станция входит
     * в состав смежных поездных участков), то его id не дублируется.
     */
    getShiftPersonalIds: (state) => {
      const ids = [];
      function getUsersIds(sectorsArray) {
        if (sectorsArray && sectorsArray.length) {
          sectorsArray.forEach((sector) => {
            if (sector.people) {
              ids.push(...sector.people.map((user) => user._id));
            }
          });
        }
      }
      getUsersIds(state.sectorPersonal.DNCSectorsShift);
      getUsersIds(state.sectorPersonal.sectorStationsShift);
      getUsersIds(state.sectorPersonal.ECDSectorsShift);
      return [...new Set(ids)];
    },

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
     * Возвращает массив с информацией обо всех ДСП и Операторах при ДСП текущего
     * полигона управления "Станция".
     * В выборку не включаются пользователи рабочего места текущего пользователя.
     * Например, на некоторой станции есть рабочее место ДСП, рабочее место оператора при ДСП №1 и
     * рабочее место оператора при ДСП №2. Если зашел пользователь с рабочего места оператора при ДСП №1,
     * то данный метод вернет пользователей рабочего места ДСП и пользователей рабочего места оператора при ДСП №2.
     * Возвращаемая информация группируется по принадлежности пользователей к конкретному рабочему месту.
     */
    getCurrStationUsersThatDoNotBelongToCurrWorkPlace: (state, getters) => {
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
      const stationName = getters.getUserWorkPoligonData.St_Title;
      const addDataInGroup = (groupName, data) => {
        const group = groupedPeople.find((item) => item.groupName === groupName);
        if (!group) {
          groupedPeople.push({
            groupName: groupName,
            items: [data],
          });
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
            key: `${item.stationId}${item.stationWorkPlaceId || ''}${item._id}`,
            workPoligonType: userWorkPoligon.type,
            workPoligonId: item.stationId,
            workPlaceId: item.stationWorkPlaceId,
            userId: item._id,
            post: item.post,
            name: item.name,
            fatherName: item.fatherName,
            surname: item.surname,
          };
          if (!item.stationWorkPlaceId) {
            addDataInGroup(stationName, dataToAdd);
          } else {
            addDataInGroup(getters.getStationWorkPlaceNameById(item.stationWorkPlaceId), dataToAdd);
          }
        });
      return groupedPeople;
    },

    /**
     * Возвращает информацию о виртуальном персонале (который реально не зарегистрирован в системе,
     * но должен присутствовать в текстах распоряжений).
     */
    getOtherShiftForSendingData: (state) => {
      if (!state.sectorPersonal || !state.sectorPersonal.otherShift) {
        return [];
      }
      return state.sectorPersonal.otherShift.map((item) => ({ ...item }));
    },

    /**
     *
     */
    getLoadingCurrSectorsShiftStatus: (state) => {
      return state.loadingCurrShift;
    },

    /**
     *
     */
    getErrorLoadingCurrSectorsShift: (state) => {
      return state.errorLoadingCurrShift;
    },
  },

  mutations: {
    /**
     * Чистит информацию о тех, кому необходимо адресовать распоряжение (по всем массивам данных).
     */
    [CLEAR_SHIFT_FOR_SENDING_DATA] (state) {console.log('CLEAR_SHIFT_FOR_SENDING_DATA')
      if (!state.sectorPersonal) {
        return;
      }
      const clearSendItem = (item) => {
        if (item.lastUserChoice || item.sendOriginal !== CurrShiftGetOrderStatus.doNotSend) {
          item.lastUserChoicePost = null;
          item.lastUserChoice = null;
          item.lastUserChoiceId = null;
          item.lastUserChoiceOnline = false;
          item.sendOriginal = CurrShiftGetOrderStatus.doNotSend;
        }
      }
      if (state.sectorPersonal.DNCSectorsShift) {
        state.sectorPersonal.DNCSectorsShift.forEach((el) => clearSendItem(el));
      }
      if (state.sectorPersonal.ECDSectorsShift) {
        state.sectorPersonal.ECDSectorsShift.forEach((el) => clearSendItem(el));
      }
      if (state.sectorPersonal.sectorStationsShift) {
        state.sectorPersonal.sectorStationsShift.forEach((el) => clearSendItem(el));
      }
      if (state.sectorPersonal.otherShift) {
        state.sectorPersonal.otherShift = [];
      }
    },

    /**
     * Переписывает информацию обо всех иных адресатах, которым необходимо адресовать распоряжение,
     * с использованием указанного нового массива данных.
     */
    [SET_OTHER_SHIFT_FOR_SENDING_DATA] (state, newData) {
      if (state.sectorPersonal) {
        state.sectorPersonal.otherShift = newData || [];
      }
    },

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

    /**
     * Оригинал/Копия/Ничего всем виртуальным получателям распоряжения.
     */
    [SET_GET_ORDER_STATUS_TO_ALL_OTHER_SHIFT] (state, { getOrderStatus }) {
      if (state.sectorPersonal && state.sectorPersonal.otherShift) {
        state.sectorPersonal.otherShift.forEach((el) => {
          if (el.sendOriginal !== getOrderStatus) {
            el.sendOriginal = getOrderStatus;
          }
        });
      }
    },

    /**
     * Оригинал/Копия/Ничего конкретному виртуальному получателю распоряжения.
     */
    [SET_GET_ORDER_STATUS_TO_DEFINIT_OTHER_SHIFT] (state, { otherId, getOrderStatus }) {
      if (state.sectorPersonal && state.sectorPersonal.otherShift) {
        const sector = state.sectorPersonal.otherShift.find(el => el._id === otherId);
        if (sector && sector.sendOriginal !== getOrderStatus) {
          sector.sendOriginal = getOrderStatus;
        }
      }
    },

    /**
     * Оригинал/Копия/Ничего всем оставшимся виртуальным получателям распоряжения.
     */
    [SET_GET_ORDER_STATUS_TO_ALL_LEFT_OTHER_SHIFT] (state, { getOrderStatus }) {
      if (state.sectorPersonal && state.sectorPersonal.otherShift) {
        state.sectorPersonal.otherShift.forEach(el => {
          if (el.sendOriginal === CurrShiftGetOrderStatus.doNotSend &&
              el.sendOriginal !== getOrderStatus) {
            el.sendOriginal = getOrderStatus;
          }
        });
      }
    },

    /**
     * Для всего персонала полигона управления позволяет установить признак
     * нахождения online.
     * Массив onlineUsers содержит список объектов, каждый из которых имеет поля type, id, workPlaceId -
     * информация о рабочем полигоне, и поле people - массив id лиц, которые online на данном рабочем
     * полигоне.
     */
    [SET_ONLINE_SHIFT_PERSONAL] (state, onlineUsers) {
      if (!onlineUsers || !Array.isArray(onlineUsers) || !state.sectorPersonal) {
        return;
      }
      function setOnlineSectorsShift(sectorsArray, sectorType) {
        if (!sectorsArray) {
          return;
        }
        sectorsArray.forEach((sectorData) => {
          if (!sectorData.people || !sectorData.people.length) {
            return;
          }
          // ищем online-пользователей текущего рассматриваемого полигона управления
          let newSectorUsersInfo;
          if (sectorType === WORK_POLIGON_TYPES.STATION) {
            newSectorUsersInfo = onlineUsers.filter((item) => item.type === sectorType && String(item.id) === String(sectorData.stationId));
          } else {
            newSectorUsersInfo = onlineUsers.find((item) => item.type === sectorType && String(item.id) === String(sectorData.sectorId));
          }
          // для каждого пользователя рассматриваемого полигона управления проверяем online-статус и меняем,
          // при необходимости
          sectorData.people.forEach((user) => {
            let userOnlineStatus;
            if (sectorType === WORK_POLIGON_TYPES.STATION) {
              const currUserInfo = newSectorUsersInfo.find((item) =>
                (!user.stationWorkPlaceId && !item.workPlaceId) ||
                (user.stationWorkPlaceId && item.workPlaceId && String(user.stationWorkPlaceId) === String(item.workPlaceId))
              );
              userOnlineStatus = currUserInfo && currUserInfo.people && currUserInfo.people.includes(user._id);
            } else {
              userOnlineStatus = newSectorUsersInfo && newSectorUsersInfo.people && newSectorUsersInfo.people.includes(user._id);
            }
            if (user.online !== userOnlineStatus) {
              user.online = userOnlineStatus;
            }
          });
          // если у полигона управления не определен default online-пользователь, то в зависимости от типа полигона
          // управления выбираем первого интересующего online-пользователя и закрепляем его за данным полигоном управления
          if (!sectorData.lastUserChoiceId) {
            const onlineUser = !(sectorData && sectorData.people) ? null :
              sectorData.people.find((user) => user.online &&
                (
                  (sectorType === WORK_POLIGON_TYPES.STATION && user.appsCredentials === APP_CREDENTIALS.DSP_FULL) ||
                  (sectorType === WORK_POLIGON_TYPES.DNC_SECTOR && user.appsCredentials === APP_CREDENTIALS.DNC_FULL) ||
                  (sectorType === WORK_POLIGON_TYPES.ECD_SECTOR && user.appsCredentials === APP_CREDENTIALS.ECD_FULL)
                )
              );
            if (onlineUser) {
              sectorData.lastUserChoicePost = onlineUser.post;
              sectorData.lastUserChoiceId = onlineUser._id;
              sectorData.lastUserChoice = getUserFIOString({
                name: onlineUser.name,
                fatherName: onlineUser.fatherName,
                surname: onlineUser.surname,
              });
              sectorData.lastUserChoiceOnline = onlineUser.online;
            }
          } else {
            const lastChosenUser = sectorData.people.find((user) => user._id === sectorData.lastUserChoiceId);
            if (sectorData.lastUserChoiceOnline !== lastChosenUser.online) {
              sectorData.lastUserChoiceOnline = lastChosenUser.online;
            }
          }
        });
      }
      setOnlineSectorsShift(state.sectorPersonal.sectorStationsShift, WORK_POLIGON_TYPES.STATION);
      setOnlineSectorsShift(state.sectorPersonal.DNCSectorsShift, WORK_POLIGON_TYPES.DNC_SECTOR);
      setOnlineSectorsShift(state.sectorPersonal.ECDSectorsShift, WORK_POLIGON_TYPES.ECD_SECTOR);
    },

    /**
     * Данный метод создан специально для окна создания нового распоряжения.
     * Он вызывается при открытии данного окна и позволяет заполнить таблицы в секции "Кому".
     * Заполнение происходит путем определения для каждого участка / станции первого ПОДХОДЯЩЕГО из
     * online-пользователей данного участка / станции.
     */
    [CHOOSE_ONLY_ONLINE_PERSONAL] (state) {
      function setOnlineSectorsShift(sectorsArray, userCredsCheckFunction) {
        if (sectorsArray && sectorsArray.length) {
          sectorsArray.forEach((sector) => {
            if (sector.people) {
              const onlineUser = sector.people.find((user) =>
                userCredsCheckFunction(user.appsCredentials) && user.online
              );
              if (onlineUser) {
                sector.lastUserChoicePost = onlineUser.post;
                sector.lastUserChoiceId = onlineUser._id;
                sector.lastUserChoice = getUserFIOString({
                  name: onlineUser.name,
                  fatherName: onlineUser.fatherName,
                  surname: onlineUser.surname,
                });
                sector.lastUserChoiceOnline = onlineUser.online;
              } else {
                sector.lastUserChoicePost = null;
                sector.lastUserChoiceId = null;
                sector.lastUserChoice = null;
                sector.lastUserChoiceOnline = false;
              }
            }
          });
        }
      }
      setOnlineSectorsShift(state.sectorPersonal.DNCSectorsShift, (creds) => creds === APP_CREDENTIALS.DNC_FULL);
      setOnlineSectorsShift(state.sectorPersonal.sectorStationsShift, (creds) => creds === APP_CREDENTIALS.DSP_FULL);
      setOnlineSectorsShift(state.sectorPersonal.ECDSectorsShift, (creds) => creds === APP_CREDENTIALS.ECD_FULL);
    },

    /**
     * Позволяет установить статусы Оригинал/Копия/Ничего указанным участкам ДНЦ, для остальных участков
     * ДНЦ производится обнуление установленного статуса. Кроме того, если указаны id пользователей, которых
     * необходимо отметить в качестве выбранных, то метод делает это.
     * Параметры:
     *   poligonsType - тип полигонов, которые необходимо обработать
     *   sectorsGetOrderStatuses - массив объектов с полями:
     *     id - идентификатор участка
     *     sendOriginal - отметка о получении оригинала/копии
     *     fioId - идентификатор лица, которому отсылается документ
     */
     [SET_GET_ORDER_STATUSES_TO_ONLY_DEFINIT_SECTORS] (state, { poligonsType, sectorsGetOrderStatuses }) {
      function setChosenPoligonStatuses(sectorsShift) {
        if (!sectorsShift || !sectorsShift.length) {
          return;
        }
        const clearSendItem = (item, resetSendOriginal = false) => {
          if (item.lastUserChoice || item.sendOriginal !== CurrShiftGetOrderStatus.doNotSend) {
            item.lastUserChoicePost = null;
            item.lastUserChoice = null;
            item.lastUserChoiceId = null;
            item.lastUserChoiceOnline = false;
            if (resetSendOriginal)
              item.sendOriginal = CurrShiftGetOrderStatus.doNotSend;
          }
        };
        sectorsShift.forEach((sector) => {
          let sectStat;
          if (sectorsGetOrderStatuses) {
            sectStat = sectorsGetOrderStatuses.find((el) => el.id === sector.sectorId || el.id === sector.stationId);
          }
          if (!sectStat) {
            clearSendItem(sector, true);
          } else {
            if (sector.sendOriginal !== sectStat.sendOriginal) {
              sector.sendOriginal = sectStat.sendOriginal;
            }
            if (!sectStat.fioId || !sector.people || !sector.people.length) {
              clearSendItem(sector);
            } else {
              const neededUser = sector.people.find((u) => u._id === sectStat.fioId);
              if (!neededUser) {
                clearSendItem(sector);
              } else {
                sector.lastUserChoiceId = neededUser._id;
                sector.lastUserChoicePost = neededUser.post,
                sector.lastUserChoice = getUserFIOString({
                  name: neededUser.name,
                  fatherName: neededUser.fatherName,
                  surname: neededUser.surname,
                });
                sector.lastUserChoiceOnline = neededUser.online;
              }
            }
          }
        });
      }
      switch (poligonsType) {
        case WORK_POLIGON_TYPES.STATION:
          setChosenPoligonStatuses(state.sectorPersonal.sectorStationsShift);
          break;
        case WORK_POLIGON_TYPES.DNC_SECTOR:
          setChosenPoligonStatuses(state.sectorPersonal.DNCSectorsShift);
          break;
        case WORK_POLIGON_TYPES.ECD_SECTOR:
          setChosenPoligonStatuses(state.sectorPersonal.ECDSectorsShift);
          break;
      }
    },

    /**
     * Данный метод создан специально для диалога выбора получателя распоряжения,
     * открываемого из таблиц секции "Кому" окна создания распоряжения.
     * Метод позволяет зафиксировать выбор пользователя в диалоговом окне:
     * сохраняется информация о ФИО выбранного пользователя (либо удаляет пользователя, для
     * которого выбор отменен) и его online-статусе для соответствующего участка / станции.
     * Если участок / станция в рамках структуры полигона управления встречается более одного
     * раза, то действия в отношении пользователя производятся для каждой такой встречи.
     */
    [SET_USER_CHOSEN_STATUS] (state, { userId, chooseUser, workPoligonType, workPoligonId }) {
      function findUserAndSetChosenStatus(sectorsArray) {
        if (!sectorsArray || !sectorsArray.length) {
          return;
        }
        const neededSectors = sectorsArray.filter((item) => item.stationId === workPoligonId || item.sectorId === workPoligonId);
        if (!neededSectors.length) {
          return;
        }
        neededSectors.forEach((sector) => {
          if (sector.people && sector.people.length) {
            const neededUser = sector.people.find((user) => user._id === userId);
            if (!neededUser) {
              return;
            }
            sector.lastUserChoiceId = chooseUser ? userId : null;
            sector.lastUserChoicePost = chooseUser ? neededUser.post : null,
            sector.lastUserChoice = chooseUser ? getUserFIOString({
              name: neededUser.name,
              fatherName: neededUser.fatherName,
              surname: neededUser.surname,
            }) : null;
            sector.lastUserChoiceOnline = chooseUser ? neededUser.online : false;
          }
        });
      }
      switch (workPoligonType) {
        case WORK_POLIGON_TYPES.STATION:
          findUserAndSetChosenStatus(state.sectorPersonal.sectorStationsShift);
          break;
        case WORK_POLIGON_TYPES.DNC_SECTOR:
          findUserAndSetChosenStatus(state.sectorPersonal.DNCSectorsShift);
          break;
        case WORK_POLIGON_TYPES.ECD_SECTOR:
          findUserAndSetChosenStatus(state.sectorPersonal.ECDSectorsShift);
          break;
      }
    },

    /**
     * Удаляются все записи, additionalId которых нет в selectedRecsAdditionalIds.
     */
    [DEL_UNSELECTED_STRUCTURAL_DIVISIONS] (state, selectedRecsAdditionalIds) {
      if (!state.sectorPersonal || !state.sectorPersonal.otherShift) {
        return;
      }
      if (!selectedRecsAdditionalIds || !selectedRecsAdditionalIds.length) {
        state.sectorPersonal.otherShift = state.sectorPersonal.otherShift.filter((el) => el.additionalId < 0);
      } else {
        state.sectorPersonal.otherShift = state.sectorPersonal.otherShift.filter((el) =>
          el.additionalId < 0 ||
          (el.additionalId > 0 && selectedRecsAdditionalIds.includes(el.additionalId))
        );
      }
    },

    /**
     *
     */
    [ADD_OTHER_GET_ORDER_RECORD] (state, props) {
      const { additionalId, placeTitle, post, fio, sendOriginal = CurrShiftGetOrderStatus.doNotSend } = props;

      if (!state.sectorPersonal) {
        state.sectorPersonal = {};
      }
      if (!state.sectorPersonal.otherShift) {
        state.sectorPersonal.otherShift = [];
      }
      const objectToAdd = {
        additionalId: additionalId || -1, // называть 'id' нельзя
        placeTitle,
        post,
        fio,
      };
      const theSameObject = state.sectorPersonal.otherShift.find((el) =>
        JSON.stringify(objectToAdd) === JSON.stringify({
          additionalId: el.additionalId,
          placeTitle: el.placeTitle,
          post: el.post,
          fio: el.fio,
        })
      );
      if (!theSameObject) {
        state.sectorPersonal.otherShift.push({
          _id: objectId(),
          ...objectToAdd,
          sendOriginal,
        });
      }
    },

    /**
     *
     */
    [EDIT_OTHER_GET_ORDER_RECORD] (state, { _id, placeTitle, post, fio } ) {
      if (!state.sectorPersonal || !state.sectorPersonal.otherShift) {
        return;
      }
      const recIndex = state.sectorPersonal.otherShift.findIndex((item) => item._id === _id);
      if (recIndex < 0) {
        return;
      }
      state.sectorPersonal.otherShift[recIndex] = {
        ...state.sectorPersonal.otherShift[recIndex],
        placeTitle,
        post,
        fio,
      };
    },

    /**
     *
     */
    [DEL_OTHER_GET_ORDER_RECORD] (state, id) {
      if (!state.sectorPersonal || !state.sectorPersonal.otherShift) {
        return;
      }
      state.sectorPersonal.otherShift = state.sectorPersonal.otherShift.filter((item) => item._id !== id);
    },

    [DEL_CURR_SECTORS_SHIFT] (state) {
      state.sectorPersonal = {};
    },
  },

  actions: {
    /**
     * Подгружает информацию обо всем персонале участка ДСП.
     */
    async loadShiftDataForDSP(context) {
      // Если не известна структура рабочего полигона, то продолжать не можем
      if (!context.getters.getUserWorkPoligonData) {
        return;
      }
      // id участков ДНЦ
      const dncSectorsIds = context.getters.getStationDNCSectors.map((sector) => sector.DNCS_ID);
      // id участков ЭЦД
      const ecdSectorsIds = context.getters.getStationECDSectors.map((sector) => sector.ECDS_ID);
      // id всех станций: как текущего полигона управления, так и смежных к нему станций
      //const currStationWorkPoligon = context.getters.getUserWorkPoligonData;
      const stationsIds = context.getters.getSectorStations
        //.filter((station) => station.St_ID !== currStationWorkPoligon.St_ID)
        .map((station) => station.St_ID);

      // Сюда поместим информацию о персонале, необходимую ДСП. Предварительно (до обращения к БД)
      // сформируем структуру данных
      const shiftPersonal = {
        // Здесь будет информация о тех пользователях, которые работают на участках ДНЦ, в состав
        // которых входит станция (т.е. текущий полигон управления)
        DNCSectorsShift: context.getters.getStationDNCSectors.map((sector) => {
          return {
            sectorId: sector.DNCS_ID,
            sectorTitle: sector.DNCS_Title,
            people: [],
            sendOriginal: CurrShiftGetOrderStatus.doNotSend,
          };
        }),
        // Здесь будет информация о тех пользователях, которые работают на участках ЭЦД, в состав
        // которых входит станция (т.е. текущий полигон управления)
        ECDSectorsShift: context.getters.getStationECDSectors.map((sector) => {
          return {
            sectorId: sector.ECDS_ID,
            sectorTitle: sector.ECDS_Title,
            people: [],
            sendOriginal: CurrShiftGetOrderStatus.doNotSend,
          };
        }),
        // Здесь будет информация о тех пользователях, которые работают как на текущей станции (полигоне
        // управления), так и на станциях, смежных с текущей
        sectorStationsShift: context.getters.getSectorStations
          //.filter((station) => station.St_ID !== currStationWorkPoligon.St_ID)
          .map((station) => {
            return {
              stationId: station.St_ID,
              stationUNMC: station.St_UNMC,
              stationTitle: station.St_Title,
              people: [],
              sendOriginal: CurrShiftGetOrderStatus.doNotSend,
            };
        }),
      };
      // Извлекаем информацию из БД
      context.state.errorLoadingCurrShift = null;
      context.state.loadingCurrShift = true;
      try {
        // Извлекаем информацию о тех пользователях, которые работают на участках ДНЦ
        if (dncSectorsIds.length) {
          const responseData = await getDNCSectorsWorkPoligonsUsers({ sectorIds: dncSectorsIds, onlyOnline: false });
          if (responseData && responseData.length) {
            responseData.forEach((user) => {
              shiftPersonal.DNCSectorsShift.forEach((item) => {
                if (item.sectorId === user.dncSectorId) {
                  item.people.push({
                    ...user,
                    // на участках ДНЦ данному приложению известен лишь набор полномочий DNC_FULL
                    appsCredentials:
                      user.appsCredentials.length > 0 &&
                      user.appsCredentials[0].creds.includes(APP_CREDENTIALS.DNC_FULL)
                        ? APP_CREDENTIALS.DNC_FULL
                        : null,
                  });
                }
              });
            });
          }
        }
        // Извлекаем информацию о тех пользователях, которые работают на участках ЭЦД
        if (ecdSectorsIds.length) {
          const responseData = await getECDSectorsWorkPoligonsUsers({ sectorIds: ecdSectorsIds, onlyOnline: false });
          if (responseData && responseData.length) {
            responseData.forEach((user) => {
              shiftPersonal.ECDSectorsShift.forEach((item) => {
                if (item.sectorId === user.ecdSectorId) {
                  item.people.push({
                    ...user,
                    // на участках ЭЦД данному приложению известен лишь набор полномочий ECD_FULL
                    appsCredentials:
                      user.appsCredentials.length > 0 &&
                      user.appsCredentials[0].creds.includes(APP_CREDENTIALS.ECD_FULL)
                        ? APP_CREDENTIALS.ECD_FULL
                        : null,
                  });
                }
              });
            });
          }
        }
        // Извлекаем информацию о тех пользователях, которые работают на смежных станциях
        if (stationsIds.length) {
          const responseData = await getStationsWorkPoligonsUsers({ stationIds: stationsIds, onlyOnline: false });
          if (responseData && responseData.length) {
            responseData.forEach((user) => {
              shiftPersonal.sectorStationsShift.forEach((item) => {
                if (item.stationId === user.stationId) {
                  item.people.push({
                    ...user,
                    // на станциях данному приложению известны лишь наборы полномочий DSP_FULL и DSP_Operator
                    appsCredentials:
                      user.appsCredentials.length === 0 || !user.stationId ? null :
                        !user.stationWorkPlaceId && user.appsCredentials[0].creds.includes(APP_CREDENTIALS.DSP_FULL)
                          ? APP_CREDENTIALS.DSP_FULL
                          : user.stationWorkPlaceId && user.appsCredentials[0].creds.includes(APP_CREDENTIALS.DSP_Operator)
                            ? APP_CREDENTIALS.DSP_Operator
                            : null,
                  });
                }
              });
            });
          }
        }
        context.state.sectorPersonal = shiftPersonal || {};

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка подгрузки персонала участка ДСП');
        context.state.errorLoadingCurrShift = errMessage;

      } finally {
        context.state.loadingCurrShift = false;
      }
    },

    /**
     * Подгружает информацию обо всем персонале участка ДНЦ.
     */
    async loadShiftDataForDNC(context) {
      // Если не известна структура рабочего полигона, то продолжать не можем
      if (!context.getters.getUserWorkPoligonData) {
        return;
      }
      // id смежных участков ДНЦ
      const adjacentSectorsIds = context.getters.getAdjacentDNCSectors.map((sector) => sector.DNCS_ID);
      // id станций участка ДНЦ
      const stationsIds = context.getters.getSectorStations.map((station) => station.St_ID);
      // id ближайших участков ЭЦД
      const nearestSectorsIds = context.getters.getNearestECDSectors.map((sector) => sector.ECDS_ID);
      // Сюда поместим информацию о персонале, необходимую ДНЦ. Предварительно (до обращения к БД)
      // сформируем структуру данных
      const shiftPersonal = {
        // Здесь будет информация о тех пользователях, которые работают на участках ДНЦ, смежных с
        // участком ДНЦ с id = sectorId
        DNCSectorsShift: context.getters.getAdjacentDNCSectors.map((sector) => {
          return {
            sectorId: sector.DNCS_ID,
            sectorTitle: sector.DNCS_Title,
            people: [],
            sendOriginal: CurrShiftGetOrderStatus.doNotSend,
          };
        }),
        // Здесь будет информация о тех пользователях, которые работают на станциях участка ДНЦ с id = sectorId
        sectorStationsShift: context.getters.getSectorStationsWithTrainSectors.map((station) => {
          return {
            trainSectorId: station.trainSectorId,
            trainSectorTitle: station.trainSectorTitle,
            stationPosInTrainSector: station.posInTrainSector,
            stationId: station.St_ID,
            stationUNMC: station.St_UNMC,
            stationTitle: station.St_Title,
            people: [],
            sendOriginal: CurrShiftGetOrderStatus.doNotSend,
          };
        }),
        // Здесь будет информация о тех пользователях, которые работают на участках ЭЦД, ближайших к
        // участку ДНЦ с id = sectorId
        ECDSectorsShift: context.getters.getNearestECDSectors.map((sector) => {
          return {
            sectorId: sector.ECDS_ID,
            sectorTitle: sector.ECDS_Title,
            people: [],
            sendOriginal: CurrShiftGetOrderStatus.doNotSend,
          };
        }),
      };
      // Извлекаем информацию из БД
      context.state.errorLoadingCurrShift = null;
      context.state.loadingCurrShift = true;
      try {
        // Извлекаем информацию о тех пользователях, которые работают на участках ДНЦ, смежных с
        // участком ДНЦ с id = sectorId
        if (adjacentSectorsIds.length) {
          const responseData = await getDNCSectorsWorkPoligonsUsers({ sectorIds: adjacentSectorsIds, onlyOnline: false });
          if (responseData && responseData.length) {
            responseData.forEach((user) => {
              shiftPersonal.DNCSectorsShift.forEach((item) => {
                if (item.sectorId === user.dncSectorId) {
                  item.people.push({
                    ...user,
                    // на участках ДНЦ данному приложению известен лишь набор полномочий DNC_FULL
                    appsCredentials:
                      user.appsCredentials.length > 0 &&
                      user.appsCredentials[0].creds.includes(APP_CREDENTIALS.DNC_FULL)
                        ? APP_CREDENTIALS.DNC_FULL
                        : null,
                  });
                }
              });
            });
          }
        }
        // Извлекаем информацию о тех пользователях, которые работают на станциях участка ДНЦ с id = sectorId
        if (stationsIds.length) {
          const responseData = await getStationsWorkPoligonsUsers({ stationIds: stationsIds, onlyOnline: false });
          if (responseData && responseData.length) {
            responseData.forEach((user) => {
              shiftPersonal.sectorStationsShift.forEach((item) => {
                if (item.stationId === user.stationId) {
                  item.people.push({
                    ...user,
                    // на станциях данному приложению известны лишь наборы полномочий DSP_FULL и DSP_Operator
                    appsCredentials:
                      user.appsCredentials.length === 0 || !user.stationId ? null :
                        !user.stationWorkPlaceId && user.appsCredentials[0].creds.includes(APP_CREDENTIALS.DSP_FULL)
                          ? APP_CREDENTIALS.DSP_FULL
                          : user.stationWorkPlaceId && user.appsCredentials[0].creds.includes(APP_CREDENTIALS.DSP_Operator)
                            ? APP_CREDENTIALS.DSP_Operator
                            : null,
                  });
                }
              });
            });
          }
        }
        // Извлекаем информацию о тех пользователях, которые работают на участках ЭЦД, ближайших к
        // участку ДНЦ с id = sectorId
        if (nearestSectorsIds.length) {
          const responseData = await getECDSectorsWorkPoligonsUsers({ sectorIds: nearestSectorsIds, onlyOnline: false });
          if (responseData && responseData.length) {
            responseData.forEach((user) => {
              shiftPersonal.ECDSectorsShift.forEach((item) => {
                if (item.sectorId === user.ecdSectorId) {
                  item.people.push({
                    ...user,
                    // на участках ЭЦД данному приложению известен лишь набор полномочий ECD_FULL
                    appsCredentials:
                      user.appsCredentials.length > 0 &&
                      user.appsCredentials[0].creds.includes(APP_CREDENTIALS.ECD_FULL)
                        ? APP_CREDENTIALS.ECD_FULL
                        : null,
                  });
                }
              });
            });
          }
        }
        context.state.sectorPersonal = shiftPersonal || {};

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка подгрузки персонала участка ДНЦ');
        context.state.errorLoadingCurrShift = errMessage;

      } finally {
        context.state.loadingCurrShift = false;
      }
    },

    /**
     * Подгружает информацию обо всем персонале участка ЭЦД.
     */
     async loadShiftDataForECD(context) {
      // Если не известна структура рабочего полигона, то продолжать не можем
      if (!context.getters.getUserWorkPoligonData) {
        return;
      }
      // id смежных участков ЭЦД
      const adjacentSectorsIds = context.getters.getAdjacentECDSectors.map((sector) => sector.ECDS_ID);
      // id станций участка ЭЦД
      const stationsIds = context.getters.getSectorStations.map((station) => station.St_ID);
      // id ближайших участков ДНЦ
      const nearestSectorsIds = context.getters.getNearestDNCSectors.map((sector) => sector.DNCS_ID);
      // Сюда поместим информацию о персонале, необходимую ЭЦД. Предварительно (до обращения к БД)
      // сформируем структуру данных
      const shiftPersonal = {
        // Здесь будет информация о тех пользователях, которые работают на участках ЭЦД, смежных с
        // участком ЭЦД с id = sectorId
        ECDSectorsShift: context.getters.getAdjacentECDSectors.map((sector) => {
          return {
            sectorId: sector.ECDS_ID,
            sectorTitle: sector.ECDS_Title,
            people: [],
            sendOriginal: CurrShiftGetOrderStatus.doNotSend,
          };
        }),
        // Здесь будет информация о тех пользователях, которые работают на станциях участка ЭЦД с id = sectorId
        sectorStationsShift: context.getters.getSectorStationsWithTrainSectors.map((station) => {
          return {
            trainSectorId: station.trainSectorId,
            trainSectorTitle: station.trainSectorTitle,
            stationPosInTrainSector: station.posInTrainSector,
            stationId: station.St_ID,
            stationUNMC: station.St_UNMC,
            stationTitle: station.St_Title,
            people: [],
            sendOriginal: CurrShiftGetOrderStatus.doNotSend,
          };
        }),
        // Здесь будет информация о тех пользователях, которые работают на участках ДНЦ, ближайших к
        // участку ЭЦД с id = sectorId
        DNCSectorsShift: context.getters.getNearestDNCSectors.map((sector) => {
          return {
            sectorId: sector.DNCS_ID,
            sectorTitle: sector.DNCS_Title,
            people: [],
            sendOriginal: CurrShiftGetOrderStatus.doNotSend,
          };
        }),
      };
      // Извлекаем информацию из БД
      context.state.errorLoadingCurrShift = null;
      context.state.loadingCurrShift = true;
      try {
        // Извлекаем информацию о тех пользователях, которые работают на участках ЭЦД, смежных с
        // участком ЭЦД с id = sectorId
        if (adjacentSectorsIds.length) {
          const responseData = await getECDSectorsWorkPoligonsUsers({ sectorIds: adjacentSectorsIds, onlyOnline: false });
          if (responseData && responseData.length) {
            responseData.forEach((user) => {
              shiftPersonal.ECDSectorsShift.forEach((item) => {
                if (item.sectorId === user.ecdSectorId) {
                  item.people.push({
                    ...user,
                    // на участках ЭЦД данному приложению известен лишь набор полномочий ECD_FULL
                    appsCredentials:
                      user.appsCredentials.length > 0 &&
                      user.appsCredentials[0].creds.includes(APP_CREDENTIALS.ECD_FULL)
                        ? APP_CREDENTIALS.ECD_FULL
                        : null,
                  });
                }
              });
            });
          }
        }
        // Извлекаем информацию о тех пользователях, которые работают на станциях участка ЭЦД с id = sectorId
        if (stationsIds.length) {
          const responseData = await getStationsWorkPoligonsUsers({ stationIds: stationsIds, onlyOnline: false });
          if (responseData && responseData.length) {
            responseData.forEach((user) => {
              shiftPersonal.sectorStationsShift.forEach((item) => {
                if (item.stationId === user.stationId) {
                  item.people.push({
                    ...user,
                    // на станциях данному приложению известны лишь наборы полномочий DSP_FULL и DSP_Operator
                    appsCredentials:
                      user.appsCredentials.length === 0 || !user.stationId ? null :
                        !user.stationWorkPlaceId && user.appsCredentials[0].creds.includes(APP_CREDENTIALS.DSP_FULL)
                          ? APP_CREDENTIALS.DSP_FULL
                          : user.stationWorkPlaceId && user.appsCredentials[0].creds.includes(APP_CREDENTIALS.DSP_Operator)
                            ? APP_CREDENTIALS.DSP_Operator
                            : null,
                  });
                }
              });
            });
          }
        }
        // Извлекаем информацию о тех пользователях, которые работают на участках ДНЦ, ближайших к
        // участку ЭЦД с id = sectorId
        if (nearestSectorsIds.length) {
          const responseData = await getDNCSectorsWorkPoligonsUsers({ sectorIds: nearestSectorsIds, onlyOnline: false });
          if (responseData && responseData.length) {
            responseData.forEach((user) => {
              shiftPersonal.DNCSectorsShift.forEach((item) => {
                if (item.sectorId === user.dncSectorId) {
                  item.people.push({
                    ...user,
                    // на участках ДНЦ данному приложению известен лишь набор полномочий DNC_FULL
                    appsCredentials:
                      user.appsCredentials.length > 0 &&
                      user.appsCredentials[0].creds.includes(APP_CREDENTIALS.DNC_FULL)
                        ? APP_CREDENTIALS.DNC_FULL
                        : null,
                  });
                }
              });
            });
          }
        }
        context.state.sectorPersonal = shiftPersonal || {};

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка подгрузки персонала участка ЭЦД');
        context.state.errorLoadingCurrShift = errMessage;

      } finally {
        context.state.loadingCurrShift = false;
      }
    },


    /**
     * Позволяет извлечь из БД информацию о всем персонале рабочего полигона.
     * Извлекает информацию в зависимости от типа текущего рабочего полигона пользователя.
     */
    async loadCurrSectorsShift(context) {
      if (!context.getters.canUserWorkWithSystem) {
        return;
      }
      const workPoligon = context.getters.getUserWorkPoligon;
      if (!workPoligon) {
        return;
      }
      switch (workPoligon.type) {
        case WORK_POLIGON_TYPES.STATION:
          await context.dispatch('loadShiftDataForDSP');
          break;
        case WORK_POLIGON_TYPES.DNC_SECTOR:
          await context.dispatch('loadShiftDataForDNC');
          break;
        case WORK_POLIGON_TYPES.ECD_SECTOR:
          await context.dispatch('loadShiftDataForECD');
          break;
      }
    },
  },
}
