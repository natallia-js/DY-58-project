import { watch } from 'vue';


export const useWatchRelatedOrder = (inputVals) => {
  const {
    props,
    emit,
    store,
    relatedOrderId,
    relatedOrderObject,
    setRelatedOrderNumberInOrderText,
  } = inputVals;

  watch(relatedOrderId, (newVal) => {
    // Установка номера связанного документа в тексте создаваемого шаблонного распоряжения
    setRelatedOrderNumberInOrderText();

    // Если выбрано связанное распоряжение и у самого первого распоряжения в его цепочке есть список "иных"
    // адресатов, то этот список необходимо применить к формируемому распоряжению.
    if (newVal && relatedOrderObject.value) {
      const firstOrderInChain = store.getters.getFirstOrderInChain(relatedOrderObject.value.orderChainId);
      if (firstOrderInChain) {
        store.dispatch('applyPersonalForSendingData', { otherToSend: firstOrderInChain.otherToSend });
      }
    }
    emit('changeProps', {
      orderType: props.orderType,
      prevOrderId: newVal,
      orderDraftId: props.orderDraftId,
    });
  });
};
