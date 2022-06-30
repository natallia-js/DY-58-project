import { computed } from 'vue';
import { getLocaleDateTimeString } from '@/additional/dateTimeConvertions';


/**
 * Данный модуль предназначен для работы со связанным распоряжением по отношению к издаваемому
 * (распоряжением, находящимся в той цепочке распоряжений, что и издаваемое).
 */
export const useRelatedOrder = ({ state, store }) => {

  const relatedOrderId = computed(() => {
    const chosenRelatedOrderKey = state.prevRelatedOrder ? Object.keys(state.prevRelatedOrder)[0] : 'null';
    return chosenRelatedOrderKey !== 'null' ? chosenRelatedOrderKey : null;
  });

  const relatedOrderObject = computed(() => relatedOrderId.value ?
    store.getters.getActiveOrders.find((order) => order._id === relatedOrderId.value) : null
  );

  const relatedOrderObjectStartDateTimeString = computed(() => {
    if (!relatedOrderObject.value || !relatedOrderObject.value.timeSpan) {
      return null;
    }
    return getLocaleDateTimeString(relatedOrderObject.value.timeSpan.start);
  });

  return {
    relatedOrderId,
    relatedOrderObject,
    relatedOrderObjectStartDateTimeString,
  };
};
