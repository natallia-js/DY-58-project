import { watch } from 'vue';


export const useWatchRelatedOrder = (inputVals) => {
  const { props, emit, store, relatedOrderId, setRelatedOrderNumberInOrderText } = inputVals;

  watch(relatedOrderId, (newVal) => {
    setRelatedOrderNumberInOrderText();

    // Если выбрано связанное распоряжение и у самого первого распоряжения в его цепочке есть список "иных"
    // адресатов, то этот список необходимо применить к формируемому распоряжению.
    if (newVal) {
      const firstOrderInChain = store.getters.getFirstOrderInChain(newVal.orderChainId);
      if (firstOrderInChain) {
        store.dispatch('applyPersonalForSendingData', { otherToSend: firstOrderInChain.otherToSend });
      }
    }

    emit('changeProps', {
      orderType: props.orderType,
      prevOrderId: newVal ? newVal._id : null,
      orderDraftId: props.orderDraftId,
    });
  });
};
