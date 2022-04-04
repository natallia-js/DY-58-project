import { computed } from 'vue';


/**
 * Данный модуль предназначен для работы с черновиком распоряжения.
 */
 export const useOrderDraft = (inputVals) => {
  const {
    state,
    props,
    store,
    confirm,
    defineOrderTimeSpanOptions,
    showOnGIDOptions,
    defaultOrderPlace,
    defaultOrderText,
    defaultTimeSpan,
  } = inputVals;

  // Объект текущего черновика распоряжения (объект либо null)
  const currentOrderDraft = computed(() =>
    state.currentOrderDraftId ? store.getters.getOrderDraftById(state.currentOrderDraftId) : null);

  // Способствует отображению персонала из выбранного черновика распоряжения
  const applySelectedOrderDraftPersonal = () => {
    if (!currentOrderDraft.value) {
      return;
    }
    store.dispatch('applyPersonalForSendingData', {
      dspToSend: currentOrderDraft.value.dspToSend,
      dncToSend: currentOrderDraft.value.dncToSend,
      ecdToSend: currentOrderDraft.value.ecdToSend,
      otherToSend: currentOrderDraft.value.otherToSend,
    });
  };

  // Способствует отображению на полях формы данных из черновика распоряжения
  const applySelectedOrderDraft = () => {
    if (!currentOrderDraft.value) {
      return;
    }
    // Для корректного изменения некоторых параметров состояния необходимо, чтобы производимые
    // изменения не влияли на другие параметры, поэтому запрещаем (временно) подобное влияние
    state.resetValueOnWatchChanges = false;

    // порядок присвоения важен!
    state.showOnGID = currentOrderDraft.value.showOnGID ?
      { ...currentOrderDraft.value.showOnGID } : showOnGIDOptions[0];
    state.orderPlace = currentOrderDraft.value.place ?
      { ...currentOrderDraft.value.place } : { ...defaultOrderPlace };
    state.orderText = currentOrderDraft.value.orderText ?
      {
        ...currentOrderDraft.value.orderText,
        orderText: currentOrderDraft.value.orderText.orderText ?
          currentOrderDraft.value.orderText.orderText.map((el) => ({ ... el})) : null,
      } : { ...defaultOrderText };

    // далее установка значений идет через глобальный store, т.к. через локальное состояние не сработает:
    // таблицы персонала работают с глобальным store (информация о персонале может быть недоступна в момент
    // перезагрузки страницы, в связи с чем этот код будет повторен при появлении информации)
    applySelectedOrderDraftPersonal();

    // порядок присвоения важен! (после выполнения данного куска кода state.resetValueOnWatchChanges
    // примет значение true)
    state.defineOrderTimeSpan = currentOrderDraft.value.defineOrderTimeSpan ?
      { ...currentOrderDraft.value.defineOrderTimeSpan } : defineOrderTimeSpanOptions[0];
    state.timeSpan = currentOrderDraft.value.timeSpan ?
      { ...currentOrderDraft.value.timeSpan } : { ...defaultTimeSpan };
  };

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
        if (!currentOrderDraft.value) {
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
            id: currentOrderDraft.value._id,
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

  return {
    handleSaveOrderDraft,
    currentOrderDraft,
    applySelectedOrderDraft,
    applySelectedOrderDraftPersonal,
  };
};
