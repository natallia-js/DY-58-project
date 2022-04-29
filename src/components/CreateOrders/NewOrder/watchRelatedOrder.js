import { watch } from 'vue';


export const useWatchRelatedOrder = (inputVals) => {
  const { props, emit, store, relatedOrderObject, setRelatedOrderNumberInOrderText } = inputVals;

  const setOtherAddresses = (relatedOrder) => {
    if (relatedOrder) {
      const firstOrderInChain = store.getters.getFirstOrderInChain(relatedOrder.orderChainId);
      if (firstOrderInChain) {
        store.dispatch('applyPersonalForSendingData', { otherToSend: firstOrderInChain.otherToSend });
      }
    }
  };

  watch(relatedOrderObject, (newVal) => {
    setRelatedOrderNumberInOrderText();

    // Если выбрано связанное распоряжение и у самого первого распоряжения в его цепочке есть список "иных"
    // адресатов, то этот список необходимо применить к формируемому распоряжению.
    setOtherAddresses(newVal);

    emit('changeProps', {
      orderType: props.orderType,
      prevOrderId: newVal ? newVal._id : null,
      orderDraftId: props.orderDraftId,
    });
  });
};
