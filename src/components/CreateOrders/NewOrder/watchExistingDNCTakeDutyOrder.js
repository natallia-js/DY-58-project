import { watch, computed } from 'vue';
import { SET_DEFAULT_DSP_ADDRESSES, SET_OTHER_SHIFT_FOR_SENDING_DATA } from '@/store/mutation-types';
import { CurrShiftGetOrderStatus } from '@/constants/orders';


export const useWatchExistingDNCTakeDutyOrder = ({ store, isDNC, isECD }) => {
  const existingDNC_ECDTakeDutyOrder = computed(() => store.getters.getExistingDNC_ECDTakeDutyOrder);
  const existingDNC_ECDTakeDutyOrderDateTime = computed(() => existingDNC_ECDTakeDutyOrder.value ? existingDNC_ECDTakeDutyOrder.value.createDateTime.getTime() : null);

  /**
   * Для ДНЦ/ЭЦД при издании любого нового документа подгружаем список ДСП из последнего
   * циркулярного распоряжения, но только в том случае, если этот ДНЦ/ЭЦД - автор этого
   * циркулярного распоряжения.
   * Кроме этого, для ЭЦД при создании любого нового документа подгружаем список "иных"
   * адресатов из последнего циркулярного распоряжения, изданного текущим пользователем.
   * 
   * Здесь отслеживается именно время (в мс) издания последнего циркулярного распоряжения, т.к. при
   * отслеживании самого объекта циркулярного распоряжения данный watch будет срабатывать каждый раз при
   * обновлении списка распоряжений. И установленные адресаты, соответственно, будут "затираться".
   */
  watch(existingDNC_ECDTakeDutyOrderDateTime, (newVal) => {
    if (
      newVal && existingDNC_ECDTakeDutyOrder.value &&
      (isDNC.value || isECD.value) &&
      (existingDNC_ECDTakeDutyOrder.value.dspToSend || existingDNC_ECDTakeDutyOrder.value.otherToSend) &&
      existingDNC_ECDTakeDutyOrder.value.creator &&
      existingDNC_ECDTakeDutyOrder.value.creator.id === store.getters.getUserId
    ) {
      if (existingDNC_ECDTakeDutyOrder.value.dspToSend) {
        store.commit(SET_DEFAULT_DSP_ADDRESSES, existingDNC_ECDTakeDutyOrder.value.dspToSend.map((el) => ({
          stationId: el.id,
          post: el.post,
          fio: el.fio,
        })));
      }
      if (isECD.value) {
        store.commit(SET_OTHER_SHIFT_FOR_SENDING_DATA,
          existingDNC_ECDTakeDutyOrder.value.otherToSend
            ? existingDNC_ECDTakeDutyOrder.value.otherToSend.map((el) => ({
                ...el,
                sendOriginal: CurrShiftGetOrderStatus.doNotSend,
                confirmDateTime: null, // это нужно для того чтобы создаваемый документ не был на момент создания подтвержден
              }))
            : null
        );
      }
    }
  }, { immediate: true }); // это обязательно, т.к. нужно, чтобы код в watch выполнялся каждый раз при
                           // переходе на страницу (!) и между закладками
}
