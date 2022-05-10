import { watch } from 'vue';
import { SET_DEFAULT_DSP_ADDRESSES } from '@/store/mutation-types';


export const useWatchExistingDNCTakeDutyOrder = ({ store, isDNC, isECD }) => {
  /**
   * Для ДНЦ/ЭЦД при издании любого нового документа подгружаем список ДСП из последнего
   * циркулярного распоряжения, но только в том случае, если этот ДНЦ/ЭЦД - автор этого
   * циркулярного распоряжения.
   * Кроме этого, для ЭЦД при создании любого нового документа подгружаем список "иных"
   * адресатов из последнего циркулярного распоряжения, изданного текущим пользователем.
   */
  watch(() => store.getters.getExistingDNC_ECDTakeDutyOrder, (circularOrder) => {
    if (
      circularOrder &&
      (isDNC.value || isECD.value) &&
      (circularOrder.dspToSend || circularOrder.otherToSend) &&
      circularOrder.creator && circularOrder.creator.id === store.getters.getUserId
    ) {
      if (circularOrder.dspToSend) {
        store.commit(SET_DEFAULT_DSP_ADDRESSES, circularOrder.dspToSend.map((el) => ({
          stationId: el.id,
          post: el.post,
          fio: el.fio,
        })));
      }
      if (isECD.value) {
        store.dispatch('applyPersonalForSendingData', { otherToSend: circularOrder.otherToSend });
      }
    }
  }, { immediate: true }); // это обязательно, т.к. нужно, чтобы код в watch выполнялся каждый раз при
                           // переходе на страницу (!) и между закладками
}
