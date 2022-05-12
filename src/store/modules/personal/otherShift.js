import { CurrShiftGetOrderStatus } from '@/constants/orders';
import objectId from '@/additional/objectId.generator';
import {
  SET_GET_ORDER_STATUS_TO_ALL_OTHER_SHIFT,
  SET_GET_ORDER_STATUS_TO_DEFINIT_OTHER_SHIFT,
  SET_GET_ORDER_STATUS_TO_ALL_LEFT_OTHER_SHIFT,
  ADD_OTHER_GET_ORDER_RECORD,
  EDIT_OTHER_GET_ORDER_RECORD,
  DEL_OTHER_GET_ORDER_RECORD,
  SET_OTHER_SHIFT_FOR_SENDING_DATA,
  DEL_UNSELECTED_STRUCTURAL_DIVISIONS,
} from '@/store/mutation-types';
import compareStrings from '@/additional/compareStrings';


/**
 * Данный модуль предназначен для получения и редактирования информации об ином персонале - получателе распоряжения.
 */
export const otherShift = {
  getters: {
    /**
     * Возвращает информацию о виртуальном персонале (который реально не зарегистрирован в системе,
     * но должен присутствовать в текстах распоряжений).
     * Данные сортируем по наименованию места.
     */
    getOtherShiftForSendingData: (state) => {
      if (!state.sectorPersonal || !state.sectorPersonal.otherShift) {
        return [];
      }
      return state.sectorPersonal.otherShift
        .map((item) => ({ ...item })) // без этой строки корректно работать не будет!
        .sort((a, b) => compareStrings(a.placeTitle.toLowerCase(), b.placeTitle.toLowerCase()));
    },
  },

  mutations: {
    /**
     * Добавляет запись в список иных адресатов.
     * При добавлении не допускает дубликатов записей в таблице.
     */
    [ADD_OTHER_GET_ORDER_RECORD] (state, props) {
      const {
        additionalId,
        placeTitle,
        post,
        fio,
        sendOriginal = CurrShiftGetOrderStatus.doNotSend,
      } = props;

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
     * Редактирует запись с указанным id в списке иных адресатов.
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
     * Удаляет запись с указанным id из списка иных адресатов.
     */
    [DEL_OTHER_GET_ORDER_RECORD] (state, id) {
      if (state.sectorPersonal && state.sectorPersonal.otherShift) {
        state.sectorPersonal.otherShift = state.sectorPersonal.otherShift.filter((item) => item._id !== id);
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
     * Удаляются все записи, additionalId которых нет в selectedRecsAdditionalIds.
     */
    [DEL_UNSELECTED_STRUCTURAL_DIVISIONS] (state, selectedRecsAdditionalIds) {
      if (!state.sectorPersonal || !state.sectorPersonal.otherShift) {
        return;
      }
      if (!selectedRecsAdditionalIds || !selectedRecsAdditionalIds.length) {
        state.sectorPersonal.otherShift = state.sectorPersonal.otherShift.filter((el) =>
          !el.additionalId || el.additionalId < 0);
      } else {
        state.sectorPersonal.otherShift = state.sectorPersonal.otherShift.filter((el) =>
          !el.additionalId || el.additionalId < 0 ||
          (el.additionalId > 0 && selectedRecsAdditionalIds.includes(el.additionalId))
        );
      }
    },
  },
}
