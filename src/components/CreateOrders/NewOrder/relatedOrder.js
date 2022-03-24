import { computed, watch } from 'vue';
import { getLocaleDateTimeString } from '@/additional/dateTimeConvertions';


/**
 * Данный модуль предназначен для работы со связанным распоряжением по отношению к издаваемому
 * (распоряжением, находящимся в той цепочке распоряжений, что и издаваемое).
 */
export const useRelatedOrder = (state, { props, store, emit }) => {
  const relatedOrderId = computed(() => {
    const chosenRelatedOrderKey = state.prevRelatedOrder ? Object.keys(state.prevRelatedOrder)[0] : 'null';
    return chosenRelatedOrderKey !== 'null' ? chosenRelatedOrderKey : null;
  });

  const relatedOrderObject = computed(() => relatedOrderId.value ?
    store.getters.getActiveOrders.find((order) => order._id === relatedOrderId.value) : null
  );

  watch(relatedOrderObject, (newVal) => {
    emit('changeProps', {
      orderType: props.orderType,
      prevOrderId: newVal ? newVal._id : null,
      orderDraftId: props.orderDraftId,
    });
  });

  const relatedOrderObjectStartDateTimeString = computed(() => {
    if (!relatedOrderObject.value || !relatedOrderObject.value.timeSpan) {
      return null;
    }
    return getLocaleDateTimeString(relatedOrderObject.value.timeSpan.start);
  });

  return {
    relatedOrderObject,
    relatedOrderObjectStartDateTimeString,
  };
};
