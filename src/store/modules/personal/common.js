import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';
import { CurrShiftGetOrderStatus } from '@/constants/orders';
import { getUserFIOString } from './transformUserData';
import {
  SET_GET_ORDER_STATUSES_TO_ONLY_DEFINIT_SECTORS,
  SET_OTHER_SHIFT_FOR_SENDING_DATA,
  CLEAR_SHIFT_FOR_SENDING_DATA,
  SET_USER_CHOSEN_STATUS,
  DEL_CURR_SECTORS_SHIFT,
} from '@/store/mutation-types';


/**
 * Данный модуль предназначен для редактирования информации, имеющей отношение не к конкретному типу
 * получателей распоряжения, а ко всему его списку.
 */
export const common = {
  mutations: {
    /**
     * Чистит информацию о тех, кому необходимо адресовать распоряжение (по всем массивам данных).
     */
    [CLEAR_SHIFT_FOR_SENDING_DATA] (state) {
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
     * Позволяет установить статусы Оригинал/Копия/Ничего заданным участкам (полигонам) указанного типа,
     * для остальных участков этого типа производится обнуление установленного статуса.
     * Кроме того, если указаны id пользователей, которых необходимо отметить в качестве выбранных,
     * то метод делает это.
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

    [DEL_CURR_SECTORS_SHIFT] (state) {
      state.sectorPersonal = {};
    },
  },

  actions: {
    /**
     * Устанавливает списки персонала, которому необходимо адресовать распоряжение.
     */
    applyPersonalForSendingData(context, { dspToSend, dncToSend, ecdToSend, otherToSend }) {
      context.commit(SET_GET_ORDER_STATUSES_TO_ONLY_DEFINIT_SECTORS, {
        poligonsType: WORK_POLIGON_TYPES.STATION,
        sectorsGetOrderStatuses: dspToSend,
      });
      context.commit(SET_GET_ORDER_STATUSES_TO_ONLY_DEFINIT_SECTORS, {
        poligonsType: WORK_POLIGON_TYPES.DNC_SECTOR,
        sectorsGetOrderStatuses: dncToSend,
      });
      context.commit(SET_GET_ORDER_STATUSES_TO_ONLY_DEFINIT_SECTORS, {
        poligonsType: WORK_POLIGON_TYPES.ECD_SECTOR,
        sectorsGetOrderStatuses: ecdToSend,
      });
      context.commit(SET_OTHER_SHIFT_FOR_SENDING_DATA, otherToSend);
    },
  },
}
