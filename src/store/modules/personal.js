import { WORK_POLIGON_TYPES } from '../../constants/appCredentials';
import { CurrShiftGetOrderStatus, ReceiversPosts } from '../../constants/orders';
import {
  getDNCSectorsWorkPoligonsUsers,
  getStationsWorkPoligonsUsers,
  getECDSectorsWorkPoligonsUsers,
} from '../../serverRequests/users.requests';
import objectId from '../../additional/objectId.generator';

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

const getUserFIOString = ({ name, fatherName, surname }) => {
  return `${surname} ${name.charAt(0)}.${fatherName ? fatherName.charAt(0) + '.': ''}`;
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
    getSectorPersonal: (state) => {
      return state.sectorPersonal;
    },

    /**
     * Возвращает идентификаторы всех лиц, входящих в состав полигона управления
     * (т.е. идентификаторы всего зарегистрированного в системе персонала).
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
      return ids;
    },

    /**
     * Возвращает информацию о всех ДНЦ участков ДНЦ, связанных с текущим полигоном управления.
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
          fio: item.lastUserChoice || '',
          fioOnline: item.lastUserChoiceOnline,
          people: item.people
            .filter((el) => el.post === ReceiversPosts.DNC)
            .map((el) => {
              return {
                id: el._id,
                fio: getUserFIOString({ name: el.name, fatherName: el.fatherName, surname: el.surname }),
                online: el.online,
              };
            }),
          sendOriginal: item.sendOriginal,
        };
      });
    },

    /**
     * Возвращает информацию о всех ДСП станций, связанных с текущим полигом управления.
     */
    getDSPShiftForSendingData: (state) => {
      if (!state.sectorPersonal || !state.sectorPersonal.sectorStationsShift) {
        return [];
      }
      const arr = state.sectorPersonal.sectorStationsShift.map((item) => {
        return {
          id: item.stationId,
          type: WORK_POLIGON_TYPES.STATION,
          station: item.stationTitle,
          sector: item.trainSectorTitle,
          fio: item.lastUserChoice || '',
          fioOnline: item.lastUserChoiceOnline,
          people: item.people
            .filter((el) => el.post === ReceiversPosts.DSP)
            .map((el) => {
              return {
                id: el._id,
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
          fio: item.lastUserChoice || '',
          fioOnline: item.lastUserChoiceOnline,
          people: item.people
            .filter((el) => el.post === ReceiversPosts.ECD)
            .map((el) => {
              return {
                id: el._id,
                fio: getUserFIOString({ name: el.name, fatherName: el.fatherName, surname: el.surname }),
                online: el.online,
              };
            }),
          sendOriginal: item.sendOriginal,
        };
      });
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
     * Оригинал/Копия/Ничего всем ДНЦ всех участков ДНЦ
     */
    setGetOrderStatusToAllDNCSectors(state, { getOrderStatus }) {
      if (state.sectorPersonal && state.sectorPersonal.DNCSectorsShift) {
        state.sectorPersonal.DNCSectorsShift.forEach((el) => {
          if (el.sendOriginal !== getOrderStatus) {
            el.sendOriginal = getOrderStatus;
          }
        });
      }
    },

    /**
     * Оригинал/Копия/Ничего ДНЦ конкретного участка ДНЦ
     */
    setGetOrderStatusToDefinitDNCSector(state, { dncSectorId, getOrderStatus }) {
      if (state.sectorPersonal && state.sectorPersonal.DNCSectorsShift) {
        const sector = state.sectorPersonal.DNCSectorsShift.find(el => el.sectorId === dncSectorId);
        if (sector && sector.sendOriginal !== getOrderStatus) {
          sector.sendOriginal = getOrderStatus;
        }
      }
    },

    /**
     * Оригинал/Копия/Ничего всем ДНЦ оставшихся участков ДНЦ
     */
    setGetOrderStatusToAllLeftDNCSectors(state, { getOrderStatus }) {
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
     * Оригинал/Копия/Ничего всем ДСП всех станций
     */
    setGetOrderStatusToAllDSP(state, { getOrderStatus }) {
      if (state.sectorPersonal && state.sectorPersonal.sectorStationsShift) {
        state.sectorPersonal.sectorStationsShift.forEach((el) => {
          if (el.sendOriginal !== getOrderStatus) {
            el.sendOriginal = getOrderStatus;
          }
        });
      }
    },

    /**
     * Оригинал/Копия/Ничего ДСП конкретной станции
     */
    setGetOrderStatusToDefinitDSP(state, { stationId, getOrderStatus }) {
      if (state.sectorPersonal && state.sectorPersonal.sectorStationsShift) {
        const station = state.sectorPersonal.sectorStationsShift.find(el => el.stationId === stationId);
        if (station && station.sendOriginal !== getOrderStatus) {
          station.sendOriginal = getOrderStatus;
        }
      }
    },

    /**
     * Оригинал/Копия/Ничего ДСП всех оставшихся станций
     */
    setGetOrderStatusToAllLeftDSP(state, { getOrderStatus }) {
      if (state.sectorPersonal && state.sectorPersonal.sectorStationsShift) {
        state.sectorPersonal.sectorStationsShift.forEach(el => {
          if (el.sendOriginal === CurrShiftGetOrderStatus.doNotSend &&
              el.sendOriginal !== getOrderStatus) {
            el.sendOriginal = getOrderStatus;
          }
        });
      }
    },

    /**
     * Оригинал/Копия/Ничего всем ЭЦД всех участков ЭЦД
     */
     setGetOrderStatusToAllECDSectors(state, { getOrderStatus }) {
      if (state.sectorPersonal && state.sectorPersonal.ECDSectorsShift) {
        state.sectorPersonal.ECDSectorsShift.forEach((el) => {
          if (el.sendOriginal !== getOrderStatus) {
            el.sendOriginal = getOrderStatus;
          }
        });
      }
    },

    /**
     * Оригинал/Копия/Ничего ЭЦД конкретного участка ЭЦД
     */
     setGetOrderStatusToDefinitECDSector(state, { ecdSectorId, getOrderStatus }) {
      if (state.sectorPersonal && state.sectorPersonal.ECDSectorsShift) {
        const sector = state.sectorPersonal.ECDSectorsShift.find(el => el.sectorId === ecdSectorId);
        if (sector && sector.sendOriginal !== getOrderStatus) {
          sector.sendOriginal = getOrderStatus;
        }
      }
    },

    /**
     * Оригинал/Копия/Ничего всем ЭЦД оставшихся участков ЭЦД
     */
     setGetOrderStatusToAllLeftECDSectors(state, { getOrderStatus }) {
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
     setGetOrderStatusToAllOtherShift(state, { getOrderStatus }) {
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
     setGetOrderStatusToDefinitOtherShift(state, { otherId, getOrderStatus }) {
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
     setGetOrderStatusToAllLeftOtherShift(state, { getOrderStatus }) {
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
     * нахождения online: для лиц, id которых находятся в массиве onlineUsersIds,
     * online = true, для остальных online = false.
     */
    setOnlineShiftPersonal: (state, onlineUsersIds) => {
      if (!onlineUsersIds || !onlineUsersIds.length) {
        return;
      }
      function setOnlineSectorsShift(sectorsArray) {
        if (sectorsArray && sectorsArray.length) {
          sectorsArray.forEach((sector) => {
            if (sector.people) {
              sector.people.forEach((user) => {
                user.online = onlineUsersIds.includes(user._id);
              });
              if (!sector.lastUserChoice) {
                const onlineUser = sector.people.find((user) => user.online);
                if (onlineUser) {
                  sector.lastUserChoice = getUserFIOString({
                    name: onlineUser.name,
                    fatherName: onlineUser.fatherName,
                    surname: onlineUser.surname,
                  });
                  sector.lastUserChoiceOnline = onlineUser.online;
                }
              }
            }
          });
        }
      }
      setOnlineSectorsShift(state.sectorPersonal.DNCSectorsShift);
      setOnlineSectorsShift(state.sectorPersonal.sectorStationsShift);
      setOnlineSectorsShift(state.sectorPersonal.ECDSectorsShift);
    },

    /**
     * В качестве последнего выбора пользователя (среди персонала полигона управления)
     * для каждого участка полигона определяет online-пользователя данного участка
     * (первого в списке имеющихся online-пользователей).
     */
    chooseOnlyOnlinePersonal(state) {
      function setOnlineSectorsShift(sectorsArray) {
        if (sectorsArray && sectorsArray.length) {
          sectorsArray.forEach((sector) => {
            if (sector.people) {
              const onlineUser = sector.people.find((user) => user.online);
              if (onlineUser) {
                sector.lastUserChoice = getUserFIOString({
                  name: onlineUser.name,
                  fatherName: onlineUser.fatherName,
                  surname: onlineUser.surname,
                });
                sector.lastUserChoiceOnline = onlineUser.online;
              } else {
                sector.lastUserChoice = null;
                sector.lastUserChoiceOnline = false;
              }
            }
          });
        }
      }
      setOnlineSectorsShift(state.sectorPersonal.DNCSectorsShift);
      setOnlineSectorsShift(state.sectorPersonal.sectorStationsShift);
      setOnlineSectorsShift(state.sectorPersonal.ECDSectorsShift);
    },

    /**
     *
     */
    setUserChosenStatus(state, userId) {
      function findUserAndSetChosenStatus(sectorsArray) {
        if (sectorsArray && sectorsArray.length) {
          for (let sector of sectorsArray) {
            if (sector.people) {
              const neededUser = sector.people.find((user) => user._id === userId);
              if (neededUser) {
                sector.lastUserChoice = getUserFIOString({
                  name: neededUser.name,
                  fatherName: neededUser.fatherName,
                  surname: neededUser.surname,
                });
                sector.lastUserChoiceOnline = neededUser.online;
                return true;
              }
            }
          }
        }
        return false;
      }
      if (findUserAndSetChosenStatus(state.sectorPersonal.DNCSectorsShift)) return;
      if (findUserAndSetChosenStatus(state.sectorPersonal.sectorStationsShift)) return;
      if (findUserAndSetChosenStatus(state.sectorPersonal.ECDSectorsShift)) return;
    },

    /**
     *
     */
    addOtherGetOrderRecord(state, props) {
      const { placeTitle, post, fio, sendOriginal = CurrShiftGetOrderStatus.doNotSend } = props;

      if (!state.sectorPersonal) {
        state.sectorPersonal = {};
      }
      if (!state.sectorPersonal.otherShift) {
        state.sectorPersonal.otherShift = [];
      }
      state.sectorPersonal.otherShift.push({ _id: objectId(), placeTitle, post, fio, sendOriginal });
    },

    /**
     *
     */
    editOtherGetOrderRecord(state, { _id, placeTitle, post, fio } ) {
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
    delOtherGetOrderRecord(state, id) {
      if (!state.sectorPersonal || !state.sectorPersonal.otherShift) {
        return;
      }
      state.sectorPersonal.otherShift = state.sectorPersonal.otherShift.filter((item) => item._id !== id);
    },
  },

  actions: {
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
              const element = shiftPersonal.DNCSectorsShift.find((item) => item.sectorId === user.dncSectorId);
              if (element) {
                element.people.push(user);
              }
            });
          }
        }
        // Извлекаем информацию о тех пользователях, которые работают на станциях участка ДНЦ с id = sectorId
        if (stationsIds.length) {
          const responseData = await getStationsWorkPoligonsUsers({ stationIds: stationsIds, onlyOnline: false });
          if (responseData && responseData.length) {
            responseData.forEach((user) => {
              const element = shiftPersonal.sectorStationsShift.find((item) => item.stationId === user.stationId);
              if (element) {
                element.people.push(user);
              }
            });
          }
        }
        // Извлекаем информацию о тех пользователях, которые работают на участках ЭЦД, ближайших к
        // участку ДНЦ с id = sectorId
        if (nearestSectorsIds.length) {
          const responseData = await getECDSectorsWorkPoligonsUsers({ sectorIds: nearestSectorsIds, onlyOnline: false });
          if (responseData && responseData.length) {
            responseData.forEach((user) => {
              const element = shiftPersonal.ECDSectorsShift.find((item) => item.sectorId === user.ecdSectorId);
              if (element) {
                element.people.push(user);
              }
            });
          }
        }
        context.state.sectorPersonal = shiftPersonal || {};
      } catch (err) {
        context.state.errorLoadingCurrShift = err;
      }
      context.state.loadingCurrShift = false;
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
              const element = shiftPersonal.ECDSectorsShift.find((item) => item.sectorId === user.ecdSectorId);
              if (element) {
                element.people.push(user);
              }
            });
          }
        }
        // Извлекаем информацию о тех пользователях, которые работают на станциях участка ЭЦД с id = sectorId
        if (stationsIds.length) {
          const responseData = await getStationsWorkPoligonsUsers({ stationIds: stationsIds, onlyOnline: false });
          if (responseData && responseData.length) {
            responseData.forEach((user) => {
              const element = shiftPersonal.sectorStationsShift.find((item) => item.stationId === user.stationId);
              if (element) {
                element.people.push(user);
              }
            });
          }
        }
        // Извлекаем информацию о тех пользователях, которые работают на участках ДНЦ, ближайших к
        // участку ЭЦД с id = sectorId
        if (nearestSectorsIds.length) {
          const responseData = await getDNCSectorsWorkPoligonsUsers({ sectorIds: nearestSectorsIds, onlyOnline: false });
          if (responseData && responseData.length) {
            responseData.forEach((user) => {
              const element = shiftPersonal.DNCSectorsShift.find((item) => item.sectorId === user.dncSectorId);
              if (element) {
                element.people.push(user);
              }
            });
          }
        }
        context.state.sectorPersonal = shiftPersonal || {};
      } catch (err) {
        context.state.errorLoadingCurrShift = err;
      }
      context.state.loadingCurrShift = false;
    },


    /**
     * Позволяет извлечь из БД информацию о всем персонале рабочего полигона.
     * Извлекает информацию в зависимости от типа текущего рабочего полигона пользователя:
     * 1) если рабочий полигон - участок ДНЦ, то извлекается информация о:
     *   - пользователях смежных участков ДНЦ
     *   - пользователях станций рабочего полигона
     *   - пользователях ближайших участков ЭЦД
     */
    async loadCurrSectorsShift(context) {
      // если ранее начатая загрузка данных не завершена, то повторно ничего не запускаем
      if (context.state.loadingCurrShift) {
        return;
      }
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
          await context.dispatch('loadShiftDataForECD');
          break;
      }
    },
  },
}
