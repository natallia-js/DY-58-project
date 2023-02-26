import { APP_CREDENTIALS, WORK_POLIGON_TYPES } from '@/constants/appCredentials';
import { getUserFIOString } from './transformUserData';
import {
  SET_ONLINE_SHIFT_PERSONAL,
  CHOOSE_ONLY_ONLINE_PERSONAL,
} from '@/store/mutation-types';


/**
 * Данный модуль предназначен для установки online-статуса персоналу участка.
 */
export const onlinePersonal = {
  mutations: {
    /**
     * Для всего персонала полигона управления позволяет установить признак нахождения online, а также
     * статус принятия дежурства (на дежурстве / не на дежурстве / неизвестно).
     * Массив onlineUsers содержит список объектов, каждый из которых имеет поля type, id, workPlaceId -
     * информация о рабочем полигоне пользователей, которые в данный момент работают в системе,
     * и поле people - массив объектов пользователей, которые в данный момент online на данном рабочем
     * полигоне (каждый объект содержит поля clientId, isClientOnDuty, где isClientOnDuty может принимать
     * значения true, false, null).
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
              // среди online-пользователей текущего полигона управления ищем информацию о текущем пользователе
              const currUserInfo = newSectorUsersInfo.find((item) =>
                (!user.stationWorkPlaceId && !item.workPlaceId) ||
                (user.stationWorkPlaceId && item.workPlaceId && String(user.stationWorkPlaceId) === String(item.workPlaceId))
              );
              userOnlineStatus = currUserInfo?.people?.find((el) => el.clientId === user._id);
            } else {
              userOnlineStatus = newSectorUsersInfo?.people?.find((el) => el.clientId === user._id);
            }
            if (user.online !== Boolean(userOnlineStatus)) {
              user.online = Boolean(userOnlineStatus);
              user.onDuty = userOnlineStatus ? userOnlineStatus.isClientOnDuty : null;
            }
          });
          // если у полигона управления не определен default online-пользователь, то в зависимости от типа полигона
          // управления выбираем первого интересующего online-пользователя и закрепляем его за данным полигоном управления;
          // интересующий пользователь - тот, который на дежурстве; если на дежурстве никого нет, то null
          if (!sectorData.lastUserChoiceId) {
            const onlineUser = !sectorData?.people?.length ? null :
              sectorData.people.find((user) => user.online && user.onDuty &&
                (
                  (sectorType === WORK_POLIGON_TYPES.STATION && user.appsCredentials.includes(APP_CREDENTIALS.DSP_FULL)) ||
                  (sectorType === WORK_POLIGON_TYPES.DNC_SECTOR && user.appsCredentials.includes(APP_CREDENTIALS.DNC_FULL)) ||
                  (sectorType === WORK_POLIGON_TYPES.ECD_SECTOR && user.appsCredentials.includes(APP_CREDENTIALS.ECD_FULL))
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
              sectorData.lastUserChoiceOnDuty = onlineUser.onDuty;
            }
          } else {
            const lastChosenUser = sectorData.people.find((user) => user._id === sectorData.lastUserChoiceId);
            if (sectorData.lastUserChoiceOnline !== lastChosenUser.online) {
              sectorData.lastUserChoiceOnline = lastChosenUser.online;
            }
            if (sectorData.lastUserChoiceOnDuty !== lastChosenUser.onDuty) {
              sectorData.lastUserChoiceOnDuty = lastChosenUser.onDuty;
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
                userCredsCheckFunction(user.appsCredentials) && user.online && user.onDuty
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
                sector.lastUserChoiceOnDuty = onlineUser.onDuty;
              } /* этого делать не нужно, т.к. затрется вся информация, подтягиваемая с циркуляра:
              else {
                sector.lastUserChoicePost = null;
                sector.lastUserChoiceId = null;
                sector.lastUserChoice = null;
                sector.lastUserChoiceOnline = false;
              }*/
            }
          });
        }
      }
      setOnlineSectorsShift(state.sectorPersonal.DNCSectorsShift, (creds) => creds.includes(APP_CREDENTIALS.DNC_FULL));
      setOnlineSectorsShift(state.sectorPersonal.sectorStationsShift, (creds) => creds.includes(APP_CREDENTIALS.DSP_FULL));
      setOnlineSectorsShift(state.sectorPersonal.ECDSectorsShift, (creds) => creds.includes(APP_CREDENTIALS.ECD_FULL));
    },
  },
}
