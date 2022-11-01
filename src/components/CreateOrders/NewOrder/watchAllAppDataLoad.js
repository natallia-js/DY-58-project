import { watch } from 'vue';
//import { CLEAR_OTHER_SHIFT } from '@/store/mutation-types';
import { APPLY_PERSONAL_FOR_SENDING_DATA_ACTION } from '@/store/action-types';

export const useWatchAllAppDataLoad = (inputVals) => {
  const {
    store, relatedOrderObject, currentOrderDraft, /*existingDNC_ECDTakeDutyOrder,*/
    lastOtherToSendSource/*, displayLastCircularOrderOtherPersonal,*/
  } = inputVals;

  // Когда подгрузится вся информация приложения (загрузка/перезагрузка страницы), тогда необходимо предпринять меры
  // по отображению информации в таблице "иных" адресатов
  watch (() => store.getters.ifAllDataLoadedOnApplicationReload, (newVal) => {
    if (!newVal) return;

    // Если есть связанное распоряжение (на которое издается текущее), то берем первое распоряжение в его
    // цепочке, извлекаем список "иных" адресатов и применяем его к новому издаваемому распоряжению
    if (relatedOrderObject.value) {
      const firstOrderInChain = store.getters.getFirstOrderInChain(relatedOrderObject.value.orderChainId);
      if (firstOrderInChain?.otherToSend?.length) {
        store.dispatch(APPLY_PERSONAL_FOR_SENDING_DATA_ACTION, { otherToSend: firstOrderInChain.otherToSend });
        lastOtherToSendSource.value = firstOrderInChain.otherToSend;
      }
    }
    // Если есть черновик, по которому издается текущее распоряжение и в нем есть список "иных" адресатов,
    // то применяем этот список к новому издаваемому распоряжению
    else if (currentOrderDraft.value?.otherToSend?.length) {
      store.dispatch(APPLY_PERSONAL_FOR_SENDING_DATA_ACTION, { otherToSend: currentOrderDraft.value.otherToSend });
      lastOtherToSendSource.value = currentOrderDraft.value.otherToSend;
    }
    //
    /*else if (existingDNC_ECDTakeDutyOrder.value) {
      displayLastCircularOrderOtherPersonal();
      lastOtherToSendSource.value = existingDNC_ECDTakeDutyOrder.value.otherToSend;
    }*/
    /*else {
      store.commit(CLEAR_OTHER_SHIFT);
    }*/
  });
};
