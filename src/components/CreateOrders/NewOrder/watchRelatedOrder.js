import { watch } from 'vue';
import { APPLY_PERSONAL_FOR_SENDING_DATA_ACTION } from '@/store/action-types';

export const useWatchRelatedOrder = (inputVals) => {
  const {
    props,
    emit,
    store,
    relatedOrderId,
    relatedOrderObject,
    setRelatedOrderNumberInOrderText,
    lastOtherToSendSource,
  } = inputVals;

  // Инициализация полей формы создания нового распоряжения при определении связанного
  // распоряжения (ранее изданного).
  watch(relatedOrderId, (newVal) => {
    if (newVal) {
      // Установка номера связанного документа в тексте создаваемого шаблонного распоряжения
      setRelatedOrderNumberInOrderText();

      // Если выбрано связанное распоряжение и у самого первого распоряжения в его цепочке есть список "иных"
      // адресатов, то этот список необходимо применить к формируемому распоряжению.
      if (relatedOrderObject.value) {
        const firstOrderInChain = store.getters.getFirstOrderInChain(relatedOrderObject.value.orderChainId);
        if (firstOrderInChain) {
          store.dispatch(APPLY_PERSONAL_FOR_SENDING_DATA_ACTION, { otherToSend: firstOrderInChain.otherToSend });
          lastOtherToSendSource.value = firstOrderInChain.otherToSend;
        }
      }
    }
    if (props.prevOrderId !== newVal) {
      emit('changeProps', {
        newRouteParams: {
          orderType: props.orderType,
          prevOrderId: newVal,
          orderDraftId: props.orderDraftId,
        },
        rerender: false,
      });
    }
  });
};
