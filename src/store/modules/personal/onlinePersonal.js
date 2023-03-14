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
     * Для персонала полигона управления позволяет установить признак нахождения online,
     * статус принятия дежурства (на дежурстве / не на дежурстве / неизвестно) и полномочия, с которыми
     * пользователь зашел в систему.
     * Кроме того, запоминаются ip компьютера и информация о браузере пользователя.
     * Массив onlineUsers содержит список объектов, каждый из которых имеет поля type, id, workPlaceId -
     * информация о рабочем полигоне пользователей, которые в данный момент работают в системе,
     * и поле people - массив объектов пользователей, которые в данный момент online на данном рабочем
     * полигоне; каждый объект содержит поля:
     *   - clientIP (ip компьютера пользователя),
     *   - userAgent (информация о браузере пользователя),
     *   - clientId (id пользователя),
     *   - isClientOnDuty (флаг, указывающий на то, находится пользователь в данный момент на дежурстве или нет;
     *                     может принимать значения true, false, null),
     *   - userCredential (полномочие, с которым пользователь зашел в систему, например, DNC_FULL)
     */
    [SET_ONLINE_SHIFT_PERSONAL] (state, onlineUsers) {
      if (!Array.isArray(onlineUsers) || !state.sectorPersonal) {
        return;
      }
      function setOnlineSectorsShift(sectorsArray, sectorType) {
        sectorsArray?.forEach((sectorData) => {
          if (!sectorData.people?.length) {
            return;
          }
          // среди входных данных ищем online-пользователей текущего рассматриваемого полигона управления sectorData
          // (newSectorUsersInfo - объект в случае, если sectorType - участок ДНЦ либо ЭЦД; если же sectorType - станция, то
          // newSectorUsersInfo - массив, поскольку на рабочем полигоне "станция" могут существовать полигоны типа "рабочее место на станции")
          let newSectorUsersInfo;
          if (sectorType === WORK_POLIGON_TYPES.STATION) {
            newSectorUsersInfo = onlineUsers.filter((item) => item.type === sectorType && String(item.id) === String(sectorData.stationId));
          } else {
            newSectorUsersInfo = onlineUsers.find((item) => item.type === sectorType && String(item.id) === String(sectorData.sectorId));
          }

          // для каждого пользователя рассматриваемого полигона управления проверяем online-статус и меняем, при необходимости
          sectorData.people.forEach((user) => {

            // для установки online-статуса пользователя конкретного рабочего полигона
            const setCurrentWorkPoligonUserOnlineStatus = (onlineStatusInfo) => {
              if (!onlineStatusInfo) return;
              if (!user.online) user.online = true;
              const userOnlineStatus = {
                clientIP: onlineStatusInfo.clientIP,
                userAgent: onlineStatusInfo.userAgent,
                onDuty: (onlineStatusInfo.isClientOnDuty === 'true')
                  ? true
                  : (onlineStatusInfo.isClientOnDuty === 'false')
                    ? false
                    : null,
                currentCredential: onlineStatusInfo.userCredential,
              };
              if (!user.onlineStatuses) {
                user.onlineStatuses = [userOnlineStatus];
                return;
              }
              const existingUserOnlineStatus = user.onlineStatuses.find((status) =>
                status.clientIP === onlineStatusInfo.clientIP && status.userAgent === onlineStatusInfo.userAgent);
              if (!existingUserOnlineStatus)
                user.onlineStatuses.push(userOnlineStatus);
              else {
                if (existingUserOnlineStatus.onDuty !== userOnlineStatus.onDuty)
                  existingUserOnlineStatus.onDuty = userOnlineStatus.onDuty;
                if (existingUserOnlineStatus.currentCredential !== userOnlineStatus.currentCredential)
                  existingUserOnlineStatus.currentCredential = userOnlineStatus.currentCredential;
              }
            };

            // для сброса online-статуса пользователя конкретного рабочего полигона
            const resetCurrentWorkPoligonUserOnlineStatus = () => {
              if (user.online) user.online = false;
              if (user.onlineStatuses?.length) user.onlineStatuses = [];
            };

            // для текущего пользователя user ищет информацию о его online-статусе в объекте workPoligonOnlineData,
            // переданном сервером; в зависимости от результата поиска устанавливает online-статус пользователя
            const analyzeCurrentUserOnlineStatusOnWorkPoligon = (workPoligonOnlineData) => {
              // среди online-пользователей рабочего полигона ищем текущего пользователя user
              const currUserOnlineInfoArray = workPoligonOnlineData?.people?.filter((el) => el.clientId === user._id);
              // если текущий пользователь online, сохраняем об этом информацию в объекте user
              if (currUserOnlineInfoArray?.length) {
                for (let currUserOnlineInfo of currUserOnlineInfoArray)
                  setCurrentWorkPoligonUserOnlineStatus(currUserOnlineInfo);
              // если текущий пользователь не online, удаляем информацию по online-статусу, если она ранее была записана в user
              } else {
                resetCurrentWorkPoligonUserOnlineStatus();
              }
            };

            if (sectorType === WORK_POLIGON_TYPES.STATION) {
              // среди online-пользователей текущего полигона управления станция (нашли выше) ищем информацию о текущем пользователе
              // (пробегаем по всем рабочим местам станции, по которым получена информация о наличии online-пользователей)
              newSectorUsersInfo
                // берем только те рабочие места на станции, на которых зарегистрирован пользователь user
                .filter((poligonOnlineData) =>
                  (!user.stationWorkPlaceId && !poligonOnlineData.workPlaceId) ||
                  (user.stationWorkPlaceId && poligonOnlineData.workPlaceId && String(user.stationWorkPlaceId) === String(poligonOnlineData.workPlaceId))
                )
                // на каждом рабочем месте отмечаем факт наличия пользователя user на дежурстве
                .forEach((poligonOnlineData) => {
                  analyzeCurrentUserOnlineStatusOnWorkPoligon(poligonOnlineData);
                });
            } else {
              analyzeCurrentUserOnlineStatusOnWorkPoligon(newSectorUsersInfo);
            }
          });

          // если у полигона управления не определен default online-пользователь, то в зависимости от типа полигона
          // управления выбираем первого интересующего online-пользователя и закрепляем его за данным полигоном управления;
          // интересующий пользователь - тот, который на дежурстве и имеет указанное полномочие, связанное в качестве основного
          // с полигоном управления определенного типа; если на дежурстве никого нет, то null

          const isUserOnDuty = (userToCheck) => Boolean(
            userToCheck &&
            (
              (sectorType === WORK_POLIGON_TYPES.STATION && userToCheck.onlineStatuses?.find((status) => status.onDuty && status.currentCredential === APP_CREDENTIALS.DSP_FULL)) ||
              (sectorType === WORK_POLIGON_TYPES.DNC_SECTOR && userToCheck.onlineStatuses?.find((status) => status.onDuty && status.currentCredential === APP_CREDENTIALS.DNC_FULL)) ||
              (sectorType === WORK_POLIGON_TYPES.ECD_SECTOR && userToCheck.onlineStatuses?.find((status) => status.onDuty && status.currentCredential === APP_CREDENTIALS.ECD_FULL))
            ));

          if (!sectorData.lastUserChoiceId) {
            const onlineUser = !sectorData?.people?.length
              ? null
              : sectorData.people.find((user) => user.online && isUserOnDuty(user));

            // если нашли походящего online-пользователя текущего рабочего полигона, устанавливаем его
            if (onlineUser) {
              sectorData.lastUserChoicePost = onlineUser.post;
              sectorData.lastUserChoiceId = onlineUser._id;
              sectorData.lastUserChoice = getUserFIOString({
                name: onlineUser.name,
                fatherName: onlineUser.fatherName,
                surname: onlineUser.surname,
              });
              sectorData.lastUserChoiceOnline = onlineUser.online;
              sectorData.lastUserChoiceOnDuty = isUserOnDuty(onlineUser);
            }
          }
          // если для текущего рабочего полигона online-пользователь найден не был, то меняем у текущего рабочего
          // полигона информацию, связанную с последним зафиксированным на нем online-пользователем (если таков был)
          else {
            const lastChosenUser = sectorData.people.find((user) => user._id === sectorData.lastUserChoiceId);

            if (sectorData.lastUserChoiceOnline !== (lastChosenUser?.online || null)) {
              sectorData.lastUserChoiceOnline = lastChosenUser?.online || null;
            }
            if (sectorData.lastUserChoiceOnDuty !== (lastChosenUser?.onDuty || null)) {
              sectorData.lastUserChoiceOnDuty = isUserOnDuty(lastChosenUser) || null;
            }
          }
        });
      }
      setOnlineSectorsShift(state.sectorPersonal.sectorStationsShift, WORK_POLIGON_TYPES.STATION);
      setOnlineSectorsShift(state.sectorPersonal.DNCSectorsShift, WORK_POLIGON_TYPES.DNC_SECTOR);
      setOnlineSectorsShift(state.sectorPersonal.ECDSectorsShift, WORK_POLIGON_TYPES.ECD_SECTOR);
    },

    /**
     * Данный метод создан специально для страницы создания нового распоряжения.
     * Он вызывается при открытии данной страницы и позволяет заполнить таблицы в секции "Кому".
     * Заполнение происходит путем определения для каждого участка / станции первого ПОДХОДЯЩЕГО из
     * online-пользователей данного участка / станции.
     * Подходящим считается тот пользователь, который в данный момент находится на дежурстве с правами
     * ОСНОВОГО пользователя соответствующего участка (для участка ДНЦ это ДНЦ, для участка ЭЦД это ЭЦД,
     * для станции это ДСП).
     */
    [CHOOSE_ONLY_ONLINE_PERSONAL] (state) {
      function setOnlineSectorsShift(sectorsArray, credential) {
        sectorsArray?.forEach((sector) => {
          if (sector.people) {
            // ищем пользователя, который online, на дежурстве и имеет заданное полномочие на текущем полигоне управления
            const onlineUser = sector.people.find((user) =>
              user.online &&
              user.onlineStatuses?.find((status) => status.onDuty && status.currentCredential === credential)
            );
            if (onlineUser) {
              sector.lastUserChoicePost = onlineUser.post;
              sector.lastUserChoiceId = onlineUser._id;
              sector.lastUserChoice = getUserFIOString({
                name: onlineUser.name,
                fatherName: onlineUser.fatherName,
                surname: onlineUser.surname,
              });
              sector.lastUserChoiceOnline = true;
              sector.lastUserChoiceOnDuty = true;
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
      setOnlineSectorsShift(state.sectorPersonal.DNCSectorsShift, APP_CREDENTIALS.DNC_FULL);
      setOnlineSectorsShift(state.sectorPersonal.sectorStationsShift, APP_CREDENTIALS.DSP_FULL);
      setOnlineSectorsShift(state.sectorPersonal.ECDSectorsShift, APP_CREDENTIALS.ECD_FULL);
    },
  },
}
