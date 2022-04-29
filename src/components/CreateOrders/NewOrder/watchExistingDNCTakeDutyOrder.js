import { watch } from 'vue';
import { SET_DEFAULT_DSP_ADDRESSES } from '@/store/mutation-types';


export const useWatchExistingDNCTakeDutyOrder = ({ store, isDNC }) => {

  /**
   * Для ДНЦ при издании любого нового документа подгружаем список ДСП из последнего
   * циркулярного распоряжения, но только в том случае, если этот ДНЦ - автор этого
   * циркулярного распоряжения.
   */
  watch(() => store.getters.getExistingDNCTakeDutyOrder, (circularOrder) => {
    if (
      circularOrder &&
      isDNC.value &&
      circularOrder.dspToSend &&
      circularOrder.creator &&
      circularOrder.creator.id === store.getters.getUserId
    ) {
      store.commit(SET_DEFAULT_DSP_ADDRESSES, circularOrder.dspToSend.map((el) => ({
        stationId: el.id,
        post: el.post,
        fio: el.fio,
      })));
    }
  }, { immediate: true }); // это обязательно, т.к. нужно, чтобы код в watch выполнялся каждый раз при
                           // переходе на страницу (!) и между закладками
}
