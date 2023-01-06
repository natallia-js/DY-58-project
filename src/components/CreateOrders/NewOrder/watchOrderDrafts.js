import { watch } from 'vue';
import { APPLY_PERSONAL_FOR_SENDING_DATA_ACTION } from '@/store/action-types';


// Модуль для работы с выбранным черновиком распоряжения
export const useWatchOrderDrafts = (inputVals) => {
  const {
    state, store, props, emit, currentOrderDraft,
    defineOrderTimeSpanOptions,
    showOnGIDOptions,
    defaultOrderPlace,
    defaultOrderText,
    defaultTimeSpan,
  } = inputVals;

  watch(() => props.orderDraftId, () => {
    state.currentOrderDraftId = props.orderDraftId;
  });

  /**
   * Позволяет отобразить персонал из выбранного черновика распоряжения.
   */
  const applySelectedOrderDraftPersonal = ({ setOtherShift }) => {
    if (!currentOrderDraft.value) {
      return;
    }
    // установка значений идет через глобальный store, т.к. через локальное состояние не сработает:
    // таблицы персонала работают с глобальным store
    store.dispatch(APPLY_PERSONAL_FOR_SENDING_DATA_ACTION, {
      dspToSend: currentOrderDraft.value.dspToSend,
      dncToSend: currentOrderDraft.value.dncToSend,
      ecdToSend: currentOrderDraft.value.ecdToSend,
      otherToSend: setOtherShift ? currentOrderDraft.value.otherToSend : null,
      rewriteOtherToSend: true,
    });
  };

  /**
   * Способствует отображению на полях формы данных из выбранного черновика распоряжения.
   */
  const applySelectedOrderDraft = ({ setOtherShift }) => {
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

    // отображение персонала из выбранного черновика распоряжения
    applySelectedOrderDraftPersonal({ setOtherShift });

    // порядок присвоения важен! (после выполнения данного куска кода state.resetValueOnWatchChanges
    // примет значение true)
    state.defineOrderTimeSpan = currentOrderDraft.value.defineOrderTimeSpan ?
      { ...currentOrderDraft.value.defineOrderTimeSpan } : defineOrderTimeSpanOptions[0];
    state.timeSpan = currentOrderDraft.value.timeSpan ?
      { ...currentOrderDraft.value.timeSpan } : { ...defaultTimeSpan };
  };

  /**
   * При выборе черновика распоряжения производим заполнение полей состояния (формы) значениями его полей.
   */
  watch(currentOrderDraft, (newVal) => {
    // Применяем выбранный черновик распоряжения только в том случае, когда пользователь выбирает черновик, находясь на странице
    // создания нового распоряжения. В иных случаях - обновление этой страницы, переход на эту страницу - данные черновика
    // устанавливаются в watch на загрузку всех данных приложения
    if (store.getters.ifAllDataLoadedOnApplicationReload && !state.updateFormDataOnMounted) {
      applySelectedOrderDraft({
        setOtherShift: store.getters.ifAllDataLoadedOnApplicationReload && !state.updateFormDataOnMounted,
      });
    }

    emit('changeProps', {
      newRouteParams: {
        orderType: props.orderType,
        prevOrderId: props.prevOrderId,
        orderDraftId: newVal ? newVal._id : null,
      },
      rerender: false,
    });
  });

  return {
    applySelectedOrderDraft,
  };
};
