import { watch } from 'vue';
import { APPLY_PERSONAL_FOR_SENDING_DATA_ACTION } from '@/store/action-types';

export const useWatchOrderDrafts = (inputVals) => {
  const {
    state, store, props, emit, currentOrderDraft,
    defineOrderTimeSpanOptions,
    showOnGIDOptions,
    defaultOrderPlace,
    defaultOrderText,
    defaultTimeSpan,
    lastOtherToSendSource,
  } = inputVals;

  watch(() => props.orderDraftId, () => {
    state.currentOrderDraftId = props.orderDraftId;
  });

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

    // отображению персонала из выбранного черновика распоряжения;
    // установка значений идет через глобальный store, т.к. через локальное состояние не сработает:
    // таблицы персонала работают с глобальным store (информация о персонале может быть недоступна в момент
    // перезагрузки страницы, в связи с чем этот код будет повторен при появлении информации)
    store.dispatch(APPLY_PERSONAL_FOR_SENDING_DATA_ACTION, {
      dspToSend: currentOrderDraft.value.dspToSend,
      dncToSend: currentOrderDraft.value.dncToSend,
      ecdToSend: currentOrderDraft.value.ecdToSend,
      otherToSend: currentOrderDraft.value.otherToSend,
    });
    lastOtherToSendSource.value = currentOrderDraft.value.otherToSend;

    // порядок присвоения важен! (после выполнения данного куска кода state.resetValueOnWatchChanges
    // примет значение true)
    state.defineOrderTimeSpan = currentOrderDraft.value.defineOrderTimeSpan ?
      { ...currentOrderDraft.value.defineOrderTimeSpan } : defineOrderTimeSpanOptions[0];
    state.timeSpan = currentOrderDraft.value.timeSpan ?
      { ...currentOrderDraft.value.timeSpan } : { ...defaultTimeSpan };
  };

  // При выборе черновика распоряжения производим заполнение полей состояния (формы) значениями его полей
  watch(currentOrderDraft, (newVal) => {
    applySelectedOrderDraft();
    emit('changeProps', {
      newRouteParams: {
        orderType: props.orderType,
        prevOrderId: props.prevOrderId,
        orderDraftId: newVal ? newVal._id : null,
      },
      rerender: false,
    });
  });

  // Сюда попадаем (в частности) при перезагрузке страницы, когда не сразу доступны черновики распоряжений
  // (id нужного черновика может быть, а вот подгрузки всех черновиков нужно подождать)
  watch(() => store.getters.getAllOrderDrafts, (newVal) => {
    if (!state.currentOrderDraftId || !newVal || !newVal.length) {
      return;
    }
    // Искусственно вызываем отображение данных выбранного черновика
    const tmp = state.currentOrderDraftId;
    state.currentOrderDraftId = null;
    state.currentOrderDraftId = tmp;
  });
};
