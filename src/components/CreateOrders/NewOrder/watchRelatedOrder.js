import { watch } from 'vue';
import { APPLY_PERSONAL_FOR_SENDING_DATA_ACTION } from '@/store/action-types';


// Модуль для работы со "связанным" распоряжением
export const useWatchRelatedOrder = (inputVals) => {
  const {
    props,
    emit,
    store,
    relatedOrderId,
    relatedOrderObject,
    setRelatedOrderNumberInOrderText,
  } = inputVals;

  // Инициализация полей формы создания нового распоряжения при определении связанного
  // распоряжения (ранее изданного).
  watch(relatedOrderId, (newVal) => {
    if (newVal) {

      // Установка номера связанного документа в тексте создаваемого шаблонного распоряжения
      setRelatedOrderNumberInOrderText();

      // Если выбрано связанное распоряжение, и у самого первого распоряжения в его цепочке есть список "иных"
      // адресатов, то этот список необходимо применить к формируемому распоряжению.
      if (relatedOrderObject.value) {
        const firstOrderInChain = store.getters.getFirstOrderInChain(relatedOrderObject.value.orderChainId);
        if (firstOrderInChain) {
          // Обновляем хранилице "иных" адресатов
          store.dispatch(APPLY_PERSONAL_FOR_SENDING_DATA_ACTION, { otherToSend: firstOrderInChain.otherToSend, rewriteOtherToSend: true });
        }
      }
    }
    if (props.prevOrderId !== newVal) {
      emit('changeProps', {
        newRouteParams: {
          orderType: props.orderType,
          orderId: null,
          prevOrderId: newVal,
          orderDraftId: props.orderDraftId,
        },
        rerender: false,
      });
    }
  });
};
