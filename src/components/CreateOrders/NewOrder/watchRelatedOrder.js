import { watch } from 'vue';


export const useWatchRelatedOrder = (inputVals) => {
  const { props, emit, relatedOrderObject, setRelatedOrderNumberInOrderText } = inputVals;

  watch(relatedOrderObject, (newVal) => {
    setRelatedOrderNumberInOrderText();
    emit('changeProps', {
      orderType: props.orderType,
      prevOrderId: newVal ? newVal._id : null,
      orderDraftId: props.orderDraftId,
    });
  });
};
