import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';
import { CurrShiftGetOrderStatus } from '@/constants/orders';
import { getUserFIOString } from './transformUserData';
import {
  SET_GET_ORDER_STATUSES_TO_ONLY_DEFINIT_SECTORS,
  CLEAR_SHIFT_FOR_SENDING_DATA,
  SET_USER_CHOSEN_STATUS,
  DEL_CURR_SECTORS_SHIFT,
  CLEAR_OTHER_SHIFT,
  ADD_OTHER_GET_ORDER_RECORD,
  SET_LAST_CIRCULAR_ORDER_OTHER_PERSONAL,
  SET_LAST_CIRCULAR_ORDER_DSP,
  SET_LAST_DNC_CIRCULAR_ORDER_DSP_FOR_ECD,
  SET_DEFAULT_DSP_ADDRESSES,
} from '@/store/mutation-types';
import { APPLY_PERSONAL_FOR_SENDING_DATA_ACTION } from '@/store/action-types';
import { store } from '@/store';
import { getDY58OriginalFlag } from '@/additional/formOrderText';


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
          item.lastUserChoiceOnDuty = null;
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
      store.commit(CLEAR_OTHER_SHIFT);
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
            item.lastUserChoiceOnDuty = null;
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
                sector.lastUserChoiceOnDuty = neededUser.onDuty;
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
            sector.lastUserChoiceOnline = chooseUser ? neededUser.onDuty : null;
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

    /**
     * Для отображения "иных" адресатов из последнего циркуляра ДНЦ/ЭЦД (когда ДНЦ/ЭЦД издает новое распоряжение).
     */
    [SET_LAST_CIRCULAR_ORDER_OTHER_PERSONAL] (_state, { existingDNC_ECDTakeDutyOrder }) {
      if (existingDNC_ECDTakeDutyOrder?.otherToSend) {
        existingDNC_ECDTakeDutyOrder.otherToSend.forEach((el) =>
          store.commit(ADD_OTHER_GET_ORDER_RECORD, { ...el, sendOriginal: CurrShiftGetOrderStatus.doNotSend }));
      }
    },

    /**
     * Для отображения ДСП из последнего циркуляра ДНЦ (когда ДНЦ издает новое распоряжение).
     */
    [SET_LAST_CIRCULAR_ORDER_DSP] (_state, { existingDNC_ECDTakeDutyOrder }) {
      if (existingDNC_ECDTakeDutyOrder?.dspToSend) {
        store.commit(SET_DEFAULT_DSP_ADDRESSES, existingDNC_ECDTakeDutyOrder.dspToSend.map((el) => ({
          stationId: el.id,
          post: el.post,
          fio: el.fio,
        })));
      }
    },

    /**
     * Для отображения ДСП из последнего циркуляра ДНЦ у ЭЦД (когда ЭЦД издает новое распоряжение).
     */
    [SET_LAST_DNC_CIRCULAR_ORDER_DSP_FOR_ECD] (_state, { existingDNCTakeDutyOrders_ForECD }) {
      if (existingDNCTakeDutyOrders_ForECD?.length) {
        existingDNCTakeDutyOrders_ForECD.forEach((order) => {
          if (order.dspToSend)
            store.commit(SET_DEFAULT_DSP_ADDRESSES, order.dspToSend.map((el) => ({
              stationId: el.id,
              post: el.post,
              fio: el.fio,
            })));
        });
      }
    },
  },

  actions: {
    /**
     * Устанавливает списки персонала, которому необходимо адресовать распоряжение.
     * Причем установка персонала производится с установкой статуса отправки оригинала / копии документа.
     */
    [APPLY_PERSONAL_FOR_SENDING_DATA_ACTION] (context, props) {
      const { dspToSend, dncToSend, ecdToSend, otherToSend, rewriteOtherToSend } = props;

      if (dspToSend)
        context.commit(SET_GET_ORDER_STATUSES_TO_ONLY_DEFINIT_SECTORS, {
          poligonsType: WORK_POLIGON_TYPES.STATION,
          sectorsGetOrderStatuses: dspToSend.map((el) =>
            ({
              ...el,
              sendOriginal: getDY58OriginalFlag(el.sendOriginal),
              confirmDateTime: null,
            })
          ),
        });
      if (dncToSend)
        context.commit(SET_GET_ORDER_STATUSES_TO_ONLY_DEFINIT_SECTORS, {
          poligonsType: WORK_POLIGON_TYPES.DNC_SECTOR,
          sectorsGetOrderStatuses: dncToSend.map((el) =>
            ({
              ...el,
              sendOriginal: getDY58OriginalFlag(el.sendOriginal),
              confirmDateTime: null,
            })
          ),
        });
      if (ecdToSend)
        context.commit(SET_GET_ORDER_STATUSES_TO_ONLY_DEFINIT_SECTORS, {
          poligonsType: WORK_POLIGON_TYPES.ECD_SECTOR,
          sectorsGetOrderStatuses: ecdToSend.map((el) =>
            ({
              ...el,
              sendOriginal: getDY58OriginalFlag(el.sendOriginal),
              confirmDateTime: null,
            })
          ),
        });
      if (otherToSend) {
        if (rewriteOtherToSend) {
          // Чистим список "иных" адресатов
          store.commit(CLEAR_OTHER_SHIFT);
          // Заполняем список "иных" адресатов соответствующими данными из последнего циркуляра
          const existingDNC_ECDTakeDutyOrder = context.getters.getExistingDNC_ECDTakeDutyOrder;
          if (existingDNC_ECDTakeDutyOrder) {
            context.commit(SET_LAST_CIRCULAR_ORDER_OTHER_PERSONAL, { existingDNC_ECDTakeDutyOrder });
          }
        }
        // Применяем список "иных" адресатов, переданный в параметрах
        otherToSend.forEach((el) =>
          context.commit(ADD_OTHER_GET_ORDER_RECORD, { ...el, sendOriginal: getDY58OriginalFlag(el.sendOriginal) }));
      }
    },
  },
}
