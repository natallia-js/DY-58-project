import { watch } from 'vue';


export const useWatchOperationsResults = (inputVals) => {
  const { state, store, props, showSuccessMessage, showErrMessage } = inputVals;

  /**
   * Для отображения результата операции издания распоряжения (отправки на сервер).
   */
  watch(() => store.getters.getDispatchOrderResult, (newVal) => {
    if (!newVal || newVal.orderType !== props.orderType) {
      return;
    }
    if (!newVal.error) {
      showSuccessMessage(newVal.message);
      if (state.prevRelatedOrder) {
        state.prevRelatedOrder = null;
        state.cancelOrderDateTime = null;
      }
    } else {
      showErrMessage(newVal.message);
    }
  });

  /**
   * Для отображения результата операции сохранения черновика распоряжения (отправки на сервер) -
   * используется как при создании нового черновика, так и при редактировании существующего.
   */
  watch(() => store.getters.getSaveOrderDraftResult, (newVal) => {
    if (!newVal || newVal.orderType !== props.orderType) {
      return;
    }
    if (!newVal.error) {
      showSuccessMessage(newVal.message);
    } else {
      showErrMessage(newVal.message);
    }
  });
};
