import { watch } from 'vue';
import { CLEAR_OTHER_SHIFT } from '@/store/mutation-types';
import { APPLY_PERSONAL_FOR_SENDING_DATA_ACTION } from '@/store/action-types';

export const useWatchAllAppDataLoad = (inputVals) => {
  const {
    store, relatedOrderObject, currentOrderDraft, existingDNC_ECDTakeDutyOrder,
    lastOtherToSendSource, displayLastCircularOrderOtherPersonal,
  } = inputVals;

  // Когда подгрузится вся информация приложения (загрузка/перезагрузка страницы), тогда необходимо предпринять меры
  // по отображению информации в таблице "иных" адресатов
  watch (() => store.getters.ifAllDataLoadedOnApplicationReload, (newVal) => {
    if (newVal) {
      if (relatedOrderObject.value) {
        const firstOrderInChain = store.getters.getFirstOrderInChain(relatedOrderObject.value.orderChainId);
        if (firstOrderInChain) {
          store.dispatch(APPLY_PERSONAL_FOR_SENDING_DATA_ACTION, { otherToSend: firstOrderInChain.otherToSend });
          lastOtherToSendSource.value = firstOrderInChain.otherToSend;
        }
      } else if (currentOrderDraft.value) {
        store.dispatch(APPLY_PERSONAL_FOR_SENDING_DATA_ACTION, {
          otherToSend: currentOrderDraft.value.otherToSend,
        });
        lastOtherToSendSource.value = currentOrderDraft.value.otherToSend;
      } else if (existingDNC_ECDTakeDutyOrder.value) {
        displayLastCircularOrderOtherPersonal();
        lastOtherToSendSource.value = existingDNC_ECDTakeDutyOrder.value.otherToSend;
      } else {
        store.commit(CLEAR_OTHER_SHIFT);
      }
    }
  });
};
