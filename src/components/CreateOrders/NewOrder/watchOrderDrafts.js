import { watch } from 'vue';


export const useWatchOrderDrafts = (inputVals) => {
  const {
    state, store, props, emit, currentOrderDraft,
    applySelectedOrderDraft, applySelectedOrderDraftPersonal,
  } = inputVals;

  watch(() => props.orderDraftId, () => {
    state.currentOrderDraftId = props.orderDraftId;
  });

  // При выборе черновика распоряжения производим заполнение полей состояния (формы) значениями его полей
  watch(currentOrderDraft, (newVal) => {
    applySelectedOrderDraft();
    emit('changeProps', {
      orderType: props.orderType,
      prevOrderId: props.prevOrderId,
      orderDraftId: newVal ? newVal._id : null,
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

  watch(() => store.getters.getSectorPersonal, () => {
    applySelectedOrderDraftPersonal();
  });
};
