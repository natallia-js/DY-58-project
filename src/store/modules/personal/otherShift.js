import { CurrShiftGetOrderStatus } from '@/constants/orders';
import objectId from '@/additional/objectId.generator';
import {
  SET_GET_ORDER_STATUS_TO_ALL_OTHER_SHIFT,
  SET_GET_ORDER_STATUS_TO_DEFINIT_OTHER_SHIFT,
  SET_GET_ORDER_STATUS_TO_ALL_LEFT_OTHER_SHIFT,
  ADD_OTHER_GET_ORDER_RECORD,
  REWRITE_OTHER_GET_ORDER_RECORD,
  EDIT_OTHER_GET_ORDER_RECORD,
  DEL_OTHER_GET_ORDER_RECORD,
  DEL_OTHER_GET_ORDER_RECORD_BY_ADDITIONAL_ID,
  SET_OTHER_SHIFT_FOR_SENDING_DATA,
  CLEAR_OTHER_SHIFT,
} from '@/store/mutation-types';
import { store } from '@/store';

/**
 * Данный модуль предназначен для получения и редактирования информации об ином персонале - получателе распоряжения.
 */
export const otherShift = {
  getters: {
    /**
     * Возвращает информацию о виртуальном персонале (который реально не зарегистрирован в системе,
     * но должен присутствовать в текстах распоряжений).
     * Данные сортируем по заданным порядковым номерам записей (записи без заданного явно порядкового
     * номера будут в конце списка).
     * Затем группируем записи по наименованию места (т.е. записи с одинаковым наименованием места будут
     * находится рядом, при этом в данной группе вначале будут следовать записи с порядковым номером, далее -
     * без него, т.е. со значением -1).
     */
    getOtherShiftForSendingData(state) {
      if (!state.sectorPersonal || !state.sectorPersonal.otherShift) {
        return [];
      }
      const sortedByPositionArr = state.sectorPersonal.otherShift
        .map((item) => ({ ...item })) // без этой строки корректно работать не будет!
        .sort((a, b) => {
          if ((!a.position || a.position < 0) && b.position)
            return 1;
          if (a.position && (!b.position || b.position < 0))
            return -1;
          return a.position - b.position;
        });
      const indexOfFirstElementWithNoPosition = sortedByPositionArr.findIndex((el) => !el.position || el.position < 0);
      if (indexOfFirstElementWithNoPosition <= 0) {
        return sortedByPositionArr;
      }
      let groupedByPlaceTitlesArray = sortedByPositionArr.slice(0, indexOfFirstElementWithNoPosition);
      let groupedByPlaceTitlesArrayPlaceTitles = groupedByPlaceTitlesArray.map((el) => el.placeTitle);
      sortedByPositionArr.slice(indexOfFirstElementWithNoPosition).forEach((el) => {
        const lastPosition = groupedByPlaceTitlesArrayPlaceTitles.lastIndexOf(el.placeTitle);
        if (lastPosition < 0) {
          groupedByPlaceTitlesArrayPlaceTitles.push(el.placeTitle);
          groupedByPlaceTitlesArray.push(el);
        } else {
          groupedByPlaceTitlesArrayPlaceTitles = [
            ...groupedByPlaceTitlesArrayPlaceTitles.slice(0, lastPosition + 1),
            el.placeTitle,
            ...groupedByPlaceTitlesArrayPlaceTitles.slice(lastPosition + 1),
          ];
          groupedByPlaceTitlesArray = [
            ...groupedByPlaceTitlesArray.slice(0, lastPosition + 1),
            el,
            ...groupedByPlaceTitlesArray.slice(lastPosition + 1),
          ];
        }
      });
      return groupedByPlaceTitlesArray;
    },

    /**
     * Возвращает информацию об "ином" персонале по заданному наименованию места.
     */
    getOtherShiftByPlaceTitle(state) {
      return (placeTitle) => {
        if (!state.sectorPersonal || !state.sectorPersonal.otherShift) {
          return [];
        }
        return state.sectorPersonal.otherShift.filter((el) => el.placeTitle === placeTitle);
      };
    },

    getOtherPlaceSelectedPerson(state) {
      return (placeTitle) => {
        const existingPlaceTitleIndex = state.sectorPersonal.otherShift.findIndex((el) => el.placeTitle === placeTitle);
        if (existingPlaceTitleIndex >= 0) {
          return state.sectorPersonal.otherShift[existingPlaceTitleIndex];
        }
        return null;
      };
    },

    getOtherPersonId(state) {
      return (placeTitle, personAdditionalId) => {
        const chosenUser = state.sectorPersonal.otherShift.find((el) =>
          el.placeTitle === placeTitle && el.additionalId === personAdditionalId
        );
        return chosenUser ? chosenUser._id : null;
      };
    },

    getNewOtherPersonId(state) {
      return ({ placeTitle, post, fio }) => {
        const newUser = state.sectorPersonal.otherShift.find((el) =>
          el.placeTitle === placeTitle && el.post === post && el.fio === fio
        );
        return newUser ? newUser._id : null;
      };
    },
  },

  mutations: {
    /**
     * Добавляет запись в список иных адресатов.
     * При добавлении не допускает дубликатов записей в таблице.
     * Если для указанного placeTitle в списке иных адресатов присутствует запись с пустыми
     * полями post и fio, то эта запись перезаписывается.
     * Две записи с одинаковыми положительными значениями additionalId не могут быть: если у новой записи значение
     * additionalId совпадает со значением additionalId существующей записи, то новая запись не добавляется.
     * position - позиция записи (данные в таблице иных адресатов сортируются по этой позиции при отображении),
     * additionalId - для реально существующих в БД структурных подразделений значение > 0, для создаваемых пользователем
     *   в процессе издания распоряжения это значение = -1,
     * placeTitle - наименование поля места иного адресата
     * post - должность иного адресата
     * fio - фио иного адресата
     * sendOriginal - отсылать иному адресату оригинал/копию либо ничего
     * existingStructuralDivision - true - указывает на то, что запись относится к реально существующему в БД структурному
     *   подразделению (актуально для записей без значений в полях post, fio в случае группировки структурных подразделений
     *   у ЭЦД)
     */
    [ADD_OTHER_GET_ORDER_RECORD] (state, props) {
      const {
        position = -1,
        additionalId = -1,
        placeTitle,
        post,
        fio,
        sendOriginal = CurrShiftGetOrderStatus.doNotSend,
        existingStructuralDivision = false,
      } = props;

      if (!state.sectorPersonal) {
        state.sectorPersonal = {};
      }
      if (!state.sectorPersonal.otherShift) {
        state.sectorPersonal.otherShift = [];
      }

      // Если в списке "иных" присутствует аналогичная запись, но ее статус sendOriginal отличен от
      // передаваемого, то редактируем существующую запись
      const theSameRec = state.sectorPersonal.otherShift.find((el) => el.additionalId === additionalId);
      if (additionalId > 0 && theSameRec) {
        if (theSameRec.sendOriginal !== sendOriginal) {
          theSameRec.sendOriginal = sendOriginal;
        }
        return;
      }
      const trimmedPlaceTitle = placeTitle ? placeTitle.trim() : '';
      const theSamePlaceTitleElementSD = state.sectorPersonal.otherShift.find((el) =>
        el.placeTitle === trimmedPlaceTitle && el.existingStructuralDivision === true);
      const ifExistingStructuralDivision = !existingStructuralDivision ? (theSamePlaceTitleElementSD ? true : false) : true

      // Объект для добавления
      const objectToAdd = {
        position,
        additionalId: additionalId || -1, // называть 'id' нельзя (id структурного подразделения в БД)
        placeTitle: trimmedPlaceTitle,
        post: post ? post.trim() : '',
        fio: fio ? fio.trim() : '',
        existingStructuralDivision: ifExistingStructuralDivision,
        sendOriginal,
      };
      // Если необходимо добавить структурное подразделение с existingStructuralDivision = true, то для всех
      // существующих записей в списке иных адресатов, у которых такое же значение placeTitle, как и у objectToAdd,
      // проставляем existingStructuralDivision = true (если оно false)
      if (ifExistingStructuralDivision === true) {
        const recsToModify = state.sectorPersonal.otherShift.filter((el) =>
          el.placeTitle === trimmedPlaceTitle && !el.existingStructuralDivision);
        recsToModify.forEach((el) => el.existingStructuralDivision = true);
      }
      // Если у objectToAdd отсутствуют значения post и fio, то при наличии в списке иных адресатов записи со значением
      // placeTitle как у objectToAdd новую запись не добавляем
      if (!objectToAdd.post && !objectToAdd.fio) {
        if (state.sectorPersonal.otherShift.find((el) => el.placeTitle === objectToAdd.placeTitle)) {
          return;
        }
      }
      // Ищем в списке иных адресатов запись с таким же placeTitle, но с пустыми post и fio
      const emptyRecordTheSamePlaceTitleIndex = state.sectorPersonal.otherShift.findIndex((el) =>
        el.placeTitle === objectToAdd.placeTitle && !el.post && !el.fio);
      // Если такая запись есть, то новую не создаем: редактируем найденную запись
      if (emptyRecordTheSamePlaceTitleIndex >= 0) {
        state.sectorPersonal.otherShift = [
          ...state.sectorPersonal.otherShift.slice(0, emptyRecordTheSamePlaceTitleIndex),
          {
            ...state.sectorPersonal.otherShift[emptyRecordTheSamePlaceTitleIndex],
            ...objectToAdd,
          },
          ...state.sectorPersonal.otherShift.slice(emptyRecordTheSamePlaceTitleIndex + 1),
        ];
        return;
      }

      // Прежде чем создавать новую запись проверяем, есть ли уже запись с такими же данными
      const theSameObject = state.sectorPersonal.otherShift.find((el) =>
        JSON.stringify({
          placeTitle: objectToAdd.placeTitle,
          post: objectToAdd.post,
          fio: objectToAdd.fio,
        }) === JSON.stringify({
          placeTitle: el.placeTitle ? el.placeTitle.trim() : '',
          post: el.post ? el.post.trim() : '',
          fio: el.fio ? el.fio.trim() : '',
        })
      );
      // Если запись с аналогичными данными есть, то копию не создаем
      if (theSameObject) {
        return;
      }
      state.sectorPersonal.otherShift = [
        ...state.sectorPersonal.otherShift,
        {
          _id: objectId(),
          ...objectToAdd,
        },
      ];
    },

    /**
     * Перезаписывает запись с "иным(-и)" адресатом(-ами) заданного placeTitle указанными данными.
     */
    [REWRITE_OTHER_GET_ORDER_RECORD] (state, props) {
      const {
        position = -1,
        additionalId = -1,
        placeTitle,
        post,
        fio,
        sendOriginal = CurrShiftGetOrderStatus.doNotSend,
        existingStructuralDivision = false,
      } = props;
      const existingPlaceTitleIndex = state.sectorPersonal.otherShift.findIndex((el) => el.placeTitle === placeTitle);
      if (existingPlaceTitleIndex >= 0) {
        state.sectorPersonal.otherShift = [
          ...state.sectorPersonal.otherShift.slice(0, existingPlaceTitleIndex),
          {
            ...state.sectorPersonal.otherShift[existingPlaceTitleIndex],
            ...{
              position,
              additionalId,
              placeTitle,
              post,
              fio,
              sendOriginal,
              existingStructuralDivision,
            },
          },
          ...state.sectorPersonal.otherShift.slice(existingPlaceTitleIndex + 1),
        ];
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
     * Запись, у которой existingStructuralDivision = true, удаляется только в том случае, если
     * присутствует более одной записи с таким же placeTitle. При этом на все такие записи переносится
     * значение поля position удаляемой записи (для сохранения порядка сортировки записей в таблице).
     */
    [DEL_OTHER_GET_ORDER_RECORD] (state, id) {
      if (state.sectorPersonal && state.sectorPersonal.otherShift) {
        const recordToDelete = state.sectorPersonal.otherShift.find((item) => item._id === id);
        if (recordToDelete) {
          if (
            !recordToDelete.existingStructuralDivision ||
            (state.sectorPersonal.otherShift.filter((item) => item.placeTitle === recordToDelete.placeTitle).length > 1)
          ) {
            state.sectorPersonal.otherShift = state.sectorPersonal.otherShift.filter((item) => item._id !== id);
            if (recordToDelete.position !== -1) {
              state.sectorPersonal.otherShift = state.sectorPersonal.otherShift.map((el) => {
                if (el.placeTitle === recordToDelete.placeTitle)
                  return {
                    ...el,
                    position: recordToDelete.position,
                  };
                return el;
              });
            }
          } else {
            recordToDelete.post = '';
            recordToDelete.fio = '';
            recordToDelete.additionalId = -1;
          }
        }
      }
    },

    [DEL_OTHER_GET_ORDER_RECORD_BY_ADDITIONAL_ID] (state, additionalId) {
      if (state.sectorPersonal && state.sectorPersonal.otherShift) {
        const recordToDelete = state.sectorPersonal.otherShift.find((item) => item.additionalId === additionalId);
        if (recordToDelete) {
          recordToDelete.post = '';
          recordToDelete.fio = '';
          recordToDelete.additionalId = -1;
        }
      }
    },

    /**
     * Удаляет все записи из списка "иных" адресатов.
     * Для ЭЦД: после удаления записей из списка формирует список заново данными структурных подразделений.
     */
    [CLEAR_OTHER_SHIFT] (state) {
      if (!state.sectorPersonal)
        state.sectorPersonal = {};
      state.sectorPersonal.otherShift = [];
      if (store.getters.isECD) {
        const structuralDivisions = store.getters.getStructuralDivisions
          .sort((a, b) => {
            if (!a.position && b.position)
              return 1;
            if (a.position && !b.position)
              return -1;
            return a.position - b.position;
          });
        (structuralDivisions || []).forEach((division) =>
          store.commit(ADD_OTHER_GET_ORDER_RECORD, {
            position: division.position,
            placeTitle: division.placeTitle,
            existingStructuralDivision: true,
          }));
      }
    },

    /**
     * Переписывает информацию обо всех иных адресатах, которым необходимо адресовать распоряжение,
     * с использованием указанного нового массива данных.
     */
    [SET_OTHER_SHIFT_FOR_SENDING_DATA] (state, newData) {
      if (state.sectorPersonal) {
        if (!state.sectorPersonal.otherShift) {
          state.sectorPersonal.otherShift = newData || [];
        } else {
          store.commit(CLEAR_OTHER_SHIFT);
          state.sectorPersonal.otherShift = state.sectorPersonal.otherShift
            .map((el) => ({ ...el, post: '', fio: '' }))
            .filter((el, index) =>
              index === state.sectorPersonal.otherShift.findIndex((item) => item.placeTitle == el.placeTitle)
            );
          (newData || []).forEach((el) => store.commit(ADD_OTHER_GET_ORDER_RECORD, { ...el } ));
        }
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
  },
}
