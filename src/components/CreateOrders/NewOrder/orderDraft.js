import { watch } from 'vue';
import {
  SET_GET_ORDER_STATUSES_TO_ONLY_DEFINIT_SECTORS,
  SET_OTHER_SHIFT_FOR_SENDING_DATA,
} from '@/store/mutation-types';
import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';

/**
 * Данный модуль предназначен для работы с черновиком распоряжения.
 */
 export const useOrderDraft = (inputVals) => {
  const {
    state,
    props,
    store,
    confirm,
    showSuccessMessage,
    showErrMessage,
  } = inputVals;

  const applySelectedOrderDraftPersonal = (currentOrderDraft) => {
    store.commit(SET_GET_ORDER_STATUSES_TO_ONLY_DEFINIT_SECTORS, {
      poligonsType: WORK_POLIGON_TYPES.STATION,
      sectorsGetOrderStatuses: currentOrderDraft.dspToSend,
    });
    store.commit(SET_GET_ORDER_STATUSES_TO_ONLY_DEFINIT_SECTORS, {
      poligonsType: WORK_POLIGON_TYPES.DNC_SECTOR,
      sectorsGetOrderStatuses: currentOrderDraft.dncToSend,
    });
    store.commit(SET_GET_ORDER_STATUSES_TO_ONLY_DEFINIT_SECTORS, {
      poligonsType: WORK_POLIGON_TYPES.ECD_SECTOR,
      sectorsGetOrderStatuses: currentOrderDraft.ecdToSend,
    });
  };

  // Способствует отображению на полях формы данных из черновика распоряжения
  const applySelectedOrderDraft = () => {
    state.resetValueOnWatchChanges = false;

    // Определяем объект текущего черновика распоряжения
    const currentOrderDraft = store.getters.getOrderDraftById(state.currentOrderDraftId);
    if (!currentOrderDraft) {
      //state.currentOrderDraftId = null;
      return;
    }

    // порядок присвоения важен!
    state.showOnGID = currentOrderDraft.showOnGID;
    state.orderPlace = currentOrderDraft.place;

    state.orderText = currentOrderDraft.orderText;

    // далее установка значений идет через глобальный store, т.к. через локальное состояние не сработает:
    // таблицы персонала работают с глобальным store (информация о персонале может быть недоступна в момент
    // перезагрузки страницы, в связи с чем этот код будет повторен при появлении информации)
    applySelectedOrderDraftPersonal(currentOrderDraft);

    store.commit(SET_OTHER_SHIFT_FOR_SENDING_DATA, currentOrderDraft.otherToSend);

    // порядок присвоения важен!
    state.defineOrderTimeSpan = currentOrderDraft.defineOrderTimeSpan;
    state.timeSpan = currentOrderDraft.timeSpan;
  };

  /*const findOrderDraft = (draftId) => {
    const currentOrderDraft = store.getters.getOrderDraftById(draftId);
    if (currentOrderDraft) {
      state.currentOrderDraftId = draftId;
      state.orderDraftLoaded = true;
    }
  };*/

  // При выборе черновика распоряжения производим заполнение полей состояния (формы) значениями его полей
  watch(() => state.currentOrderDraftId, (newVal) => {console.log('watch state.currentOrderDraftId', newVal)
    if (newVal) {
      applySelectedOrderDraft();
    }
  }, { immediate: true });

  // Сюда попадаем (в частности) при перезагрузке страницы, когда не сразу доступны черновики распоряжений
  // (id нужного черновика может быть, а вот подгрузки всех черновиков нужно подождать)
  watch(() => store.getters.getAllOrderDrafts, (newVal) => {
    /*if (!props.orderDraftId || !newVal || !newVal.length ||
      props.orderDraftType !== props.orderType || state.orderDraftLoaded) {
      return;
    }
    findOrderDraft(props.orderDraftId);*/
    if (!state.currentOrderDraftId || !newVal || !newVal.length ||
      props.orderDraftType !== props.orderType || state.orderDraftLoaded) {
      return;
    }
    state.orderDraftLoaded = true;  // ???
    applySelectedOrderDraft();
  });

  watch(() => store.getters.getSectorPersonal, (newVal) => {console.log('watch store.getters.getSectorPersonal',newVal,state.currentOrderDraftId)
    if (newVal && state.currentOrderDraftId) {
      const currentOrderDraft = store.getters.getOrderDraftById(state.currentOrderDraftId);
      console.log('2currentOrderDraft',currentOrderDraft)
      if (currentOrderDraft) {
        applySelectedOrderDraftPersonal(currentOrderDraft);
      }
    }
  });

  /**
   * Позволяет сохранить черновик распоряжения.
   * Если при сохранении черновика выясняется, что этот черновик был выбран пользователем и просто
   * отредактирован, то в БД просто происходит редактирование существующего черновика, в противном
   * случае в БД создается новая запись о черновике.
   *
   * При сохранении черновика не производится проверка корректности заполнения полей данных (на форме).
   */
  const handleSaveOrderDraft = (event) => {
    confirm.require({
      target: event.currentTarget,
      group: 'confirmSaveOrderDraft',
      message: 'Сохранить черновик распоряжения?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        state.waitingForServerResponse = true;
        if (!state.currentOrderDraftId) {
          // Создание нового черновика
          store.dispatch('saveOrderDraft', {
            type: props.orderType,
            createDateTime: state.createDateTime,
            place: state.orderPlace,
            timeSpan: state.timeSpan,
            defineOrderTimeSpan: state.defineOrderTimeSpan,
            orderText: state.orderText,
            dncToSend: state.dncSectorsToSendOrder.map((el) => ({
              id: el.id,
              type: el.type,
              fioId: el.fioId,
              sendOriginal: el.sendOriginal,
            })) || [],
            dspToSend: state.dspSectorsToSendOrder.map((el) => ({
              id: el.id,
              type: el.type,
              fioId: el.fioId,
              sendOriginal: el.sendOriginal,
            })) || [],
            ecdToSend: state.ecdSectorsToSendOrder.map((el) => ({
              id: el.id,
              type: el.type,
              fioId: el.fioId,
              sendOriginal: el.sendOriginal,
            })) || [],
            otherToSend: state.otherSectorsToSendOrder || [],
            createdOnBehalfOf: state.createdOnBehalfOf,
            showOnGID: state.showOnGID,
          });
        } else {
          // Редактирование существующего черновика
          store.dispatch('editOrderDraft', {
            id: state.currentOrderDraftId,
            type: props.orderType,
            place: state.orderPlace,
            timeSpan: state.timeSpan,
            defineOrderTimeSpan: state.defineOrderTimeSpan,
            orderText: state.orderText,
            dncToSend: state.dncSectorsToSendOrder.map((el) => ({
              id: el.id,
              type: el.type,
              fioId: el.fioId,
              sendOriginal: el.sendOriginal,
            })) || [],
            dspToSend: state.dspSectorsToSendOrder.map((el) => ({
              id: el.id,
              type: el.type,
              fioId: el.fioId,
              sendOriginal: el.sendOriginal,
            })) || [],
            ecdToSend: state.ecdSectorsToSendOrder.map((el) => ({
              id: el.id,
              type: el.type,
              fioId: el.fioId,
              sendOriginal: el.sendOriginal,
            })) || [],
            otherToSend: state.otherSectorsToSendOrder || [],
            createdOnBehalfOf: state.createdOnBehalfOf,
            showOnGID: state.showOnGID,
          });
        }
      },
    });
  };

  /**
   * Для отображения результата операции сохранения черновика распоряжения (отправки на сервер) -
   * используется как при создании нового черновика, так и при редактировании существующего.
   */
  watch(() => store.getters.getSaveOrderDraftResult, (newVal) => {
    if (!newVal || newVal.orderType !== props.orderType) {
      return;
    }
    state.waitingForServerResponse = false;
    if (!newVal.error) {
      showSuccessMessage(newVal.message);
    } else {
      showErrMessage(newVal.message);
    }
  });

  return {
    //findOrderDraft,
    handleSaveOrderDraft,
  };
};
