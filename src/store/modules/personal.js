import { WORK_POLIGON_TYPES } from '../../constants/appCredentials';
import { CurrShiftGetOrderStatus, ReceiversPosts } from '../../constants/orders';
import {
  getDNCSectorsWorkPoligonsUsers,
  getStationsWorkPoligonsUsers,
  getECDSectorsWorkPoligonsUsers,
} from '../../serverRequests/users.requests';

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

const getUserFIOString = ({ name, fatherName, surname }) => {
  return `${surname} ${name.charAt(0)}.${fatherName ? fatherName.charAt(0) + '.': ''}`;
};

/*const getUserPostFIOString = ({ post, name, fatherName, surname }) => {
  return `${post} ${getUserFIOString({ name, fatherName, surname })}`;
};*/

/**
 * Для работы со сменным персоналом смежных, ближайших участков (ДНЦ, ЭЦД) и станций
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
     * (т.е. идентификаторы всего персонала).
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
      getUsersIds(state.sectorPersonal.adjacentDNCSectorsShift);
      getUsersIds(state.sectorPersonal.sectorStationsShift);
      getUsersIds(state.sectorPersonal.nearestECDSectorsShift);
      return ids;
    },

    /**
     * Возвращает информацию о всех ДНЦ участков ДНЦ, смежных с текущим полигоном
     * управления (участком ДНЦ).
     */
    getCurrAdjacentDNCSectorsDNCShiftForSendingData: (state) => {
      if (!state.sectorPersonal || !state.sectorPersonal.adjacentDNCSectorsShift) {
        return [];
      }
      return state.sectorPersonal.adjacentDNCSectorsShift.map((item) => {
        return {
          id: item.sectorId,
          type: WORK_POLIGON_TYPES.DNC_SECTOR,
          sector: item.sectorTitle,
          fio: item.people
            .filter((el) => el.post === ReceiversPosts.DNC)
            .reduce((accumulator, currentValue, index) =>
              accumulator + `${currentValue.surname} ${currentValue.name.charAt(0)}.` +
              `${currentValue.fatherName ? currentValue.fatherName.charAt(0) + '.' : ''}` +
              `${index === item.people.length - 1 ? '' : ', '}`, ''),
          sendOriginalToDNC: item.sendOriginalToDNC,
        };
      });
    },

    /**
     * Возвращает информацию о всех ДСП станций участка ДНЦ (рабочего полигона текущего пользователя).
     */
    getCurrStationsDSPShiftForSendingData: (state) => {
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
          sendOriginalToDSP: item.sendOriginalToDSP,
        };
      });
      return arr;
    },

    /**
     * Возвращает информацию о всех ЭЦД участков ЭЦД, ближайших к текущему полигону
     * управления (участку ДНЦ).
     */
     getCurrNearestECDSectorsECDShiftForSendingData: (state) => {
      if (!state.sectorPersonal || !state.sectorPersonal.nearestECDSectorsShift) {
        return [];
      }
      return state.sectorPersonal.nearestECDSectorsShift.map((item) => {
        return {
          id: item.sectorId,
          type: WORK_POLIGON_TYPES.ECD_SECTOR,
          sector: item.sectorTitle,
          fio: item.people
            .filter((el) => el.post === ReceiversPosts.ECD)
            .reduce((accumulator, currentValue, index) =>
              accumulator + `${currentValue.surname} ${currentValue.name.charAt(0)}.` +
              `${currentValue.fatherName ? currentValue.fatherName.charAt(0) + '.' : ''}` +
              `${index === item.people.length - 1 ? '' : ', '}`, ''),
          sendOriginalToECD: item.sendOriginalToECD,
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
      if (state.sectorPersonal && state.sectorPersonal.adjacentDNCSectorsShift) {
        state.sectorPersonal.adjacentDNCSectorsShift.forEach((el) => {
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
      if (state.sectorPersonal && state.sectorPersonal.adjacentDNCSectorsShift) {
        const sector = state.sectorPersonal.adjacentDNCSectorsShift.find(el => el.sectorId === dncSectorId);
        if (sector && sector.sendOriginalToDNC !== getOrderStatus) {
          sector.sendOriginalToDNC = getOrderStatus;
        }
      }
    },

    /**
     * Оригинал/Копия/Ничего ДНЦ всех оставшихся смежных участков ДНЦ
     */
    setGetOrderStatusToAllLeftAdjacentDNCSectorsDNCShift(state, { getOrderStatus }) {
      if (state.sectorPersonal && state.sectorPersonal.adjacentDNCSectorsShift) {
        state.sectorPersonal.adjacentDNCSectorsShift.forEach(el => {
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
      if (state.sectorPersonal && state.sectorPersonal.sectorStationsShift) {
        state.sectorPersonal.sectorStationsShift.forEach((el) => {
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
      if (state.sectorPersonal && state.sectorPersonal.sectorStationsShift) {
        const station = state.sectorPersonal.sectorStationsShift.find(el => el.stationId === stationId);
        if (station && station.sendOriginalToDSP !== getOrderStatus) {
          station.sendOriginalToDSP = getOrderStatus;
        }
      }
    },

    /**
     * Оригинал/Копия/Ничего ДСП всех оставшихся станций участка ДНЦ
     */
    setGetOrderStatusToAllLeftDNCSectorStationsDSPShift(state, { getOrderStatus }) {
      if (state.sectorPersonal && state.sectorPersonal.sectorStationsShift) {
        state.sectorPersonal.sectorStationsShift.forEach(el => {
          if (el.sendOriginalToDSP === CurrShiftGetOrderStatus.doNotSend &&
              el.sendOriginalToDSP !== getOrderStatus) {
            el.sendOriginalToDSP = getOrderStatus;
          }
        });
      }
    },

    /**
     * Оригинал/Копия/Ничего всем ЭЦД ближайших участков ЭЦД
     */
    setGetOrderStatusToAllNearestECDSectorsECDShift(state, { getOrderStatus }) {
      if (state.sectorPersonal && state.sectorPersonal.nearestECDSectorsShift) {
        state.sectorPersonal.nearestECDSectorsShift.forEach((el) => {
          if (el.sendOriginalToECD !== getOrderStatus) {
            el.sendOriginalToECD = getOrderStatus;
          }
        });
      }
    },

    /**
     * Оригинал/Копия/Ничего ЭЦД конкретного ближайшего участка ЭЦД
     */
    setGetOrderStatusToDefinitNearestECDSectorECDShift(state, { ecdSectorId, getOrderStatus }) {
      if (state.sectorPersonal && state.sectorPersonal.nearestECDSectorsShift) {
        const sector = state.sectorPersonal.nearestECDSectorsShift.find(el => el.sectorId === ecdSectorId);
        if (sector && sector.sendOriginalToECD !== getOrderStatus) {
          sector.sendOriginalToECD = getOrderStatus;
        }
      }
    },

    /**
     * Оригинал/Копия/Ничего ЭЦД всех оставшихся ближайших участков ЭЦД
     */
     setGetOrderStatusToAllLeftNearestECDSectorsECDShift(state, { getOrderStatus }) {
      if (state.sectorPersonal && state.sectorPersonal.nearestECDSectorsShift) {
        state.sectorPersonal.nearestECDSectorsShift.forEach(el => {
          if (el.sendOriginalToECD === CurrShiftGetOrderStatus.doNotSend &&
              el.sendOriginalToECD !== getOrderStatus) {
            el.sendOriginalToECD = getOrderStatus;
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
      setOnlineSectorsShift(state.sectorPersonal.adjacentDNCSectorsShift);
      setOnlineSectorsShift(state.sectorPersonal.sectorStationsShift);
      setOnlineSectorsShift(state.sectorPersonal.nearestECDSectorsShift);
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
      setOnlineSectorsShift(state.sectorPersonal.adjacentDNCSectorsShift);
      setOnlineSectorsShift(state.sectorPersonal.sectorStationsShift);
      setOnlineSectorsShift(state.sectorPersonal.nearestECDSectorsShift);
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
      if (findUserAndSetChosenStatus(state.sectorPersonal.adjacentDNCSectorsShift)) return;
      if (findUserAndSetChosenStatus(state.sectorPersonal.sectorStationsShift)) return;
      if (findUserAndSetChosenStatus(state.sectorPersonal.nearestECDSectorsShift)) return;
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
        adjacentDNCSectorsShift: context.getters.getAdjacentDNCSectors.map((sector) => {
          return {
            sectorId: sector.DNCS_ID,
            sectorTitle: sector.DNCS_Title,
            people: [],
            sendOriginalToDNC: CurrShiftGetOrderStatus.doNotSend,
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
            sendOriginalToDSP: CurrShiftGetOrderStatus.doNotSend,
          };
        }),
        // Здесь будет информация о тех пользователях, которые работают на участках ЭЦД, ближайших к
        // участку ДНЦ с id = sectorId
        nearestECDSectorsShift: context.getters.getNearestECDSectors.map((sector) => {
          return {
            sectorId: sector.ECDS_ID,
            sectorTitle: sector.ECDS_Title,
            people: [],
            sendOriginalToECD: CurrShiftGetOrderStatus.doNotSend,
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
              const element = shiftPersonal.adjacentDNCSectorsShift.find((item) => item.sectorId === user.dncSectorId);
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
              const element = shiftPersonal.nearestECDSectorsShift.find((item) => item.sectorId === user.ecdSectorId);
              if (element) {
                element.people.push(user);
              }
            });
          }
        }
        context.state.sectorPersonal = shiftPersonal || {};
      } catch (err) {
        console.log(err)
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
        adjacentECDSectorsShift: context.getters.getAdjacentECDSectors.map((sector) => {
          return {
            sectorId: sector.ECDS_ID,
            sectorTitle: sector.ECDS_Title,
            people: [],
            sendOriginalToECD: CurrShiftGetOrderStatus.doNotSend,
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
            sendOriginalToDSP: CurrShiftGetOrderStatus.doNotSend,
          };
        }),
        // Здесь будет информация о тех пользователях, которые работают на участках ДНЦ, ближайших к
        // участку ЭЦД с id = sectorId
        nearestDNCSectorsShift: context.getters.getNearestDNCSectors.map((sector) => {
          return {
            sectorId: sector.DNCS_ID,
            sectorTitle: sector.DNCS_Title,
            people: [],
            sendOriginalToDNC: CurrShiftGetOrderStatus.doNotSend,
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
              const element = shiftPersonal.adjacentECDSectorsShift.find((item) => item.sectorId === user.ecdSectorId);
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
              const element = shiftPersonal.nearestDNCSectorsShift.find((item) => item.sectorId === user.dncSectorId);
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
