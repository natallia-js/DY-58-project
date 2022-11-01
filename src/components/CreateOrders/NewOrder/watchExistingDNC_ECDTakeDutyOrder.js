import { watch, computed } from 'vue';
import {
  //CLEAR_OTHER_SHIFT,
  SET_DEFAULT_DSP_ADDRESSES,
  //ADD_OTHER_GET_ORDER_RECORD,
} from '@/store/mutation-types';

export const useWatchExistingDNC_ECDTakeDutyOrder = ({ store, isDNC, isECD /*, lastOtherToSendSource */ }) => {
  const existingDNC_ECDTakeDutyOrder = computed(() => store.getters.getExistingDNC_ECDTakeDutyOrder);
  const existingDNC_ECDTakeDutyOrderDateTime = computed(() => existingDNC_ECDTakeDutyOrder.value ? existingDNC_ECDTakeDutyOrder.value.createDateTime.getTime() : null);
  const existingDNCTakeDutyOrders_ForECD = computed(() => store.getters.getExistingDNCTakeDutyOrders_ForECD);

  const displayLastCircularOrderDSP = () => {
    if (existingDNC_ECDTakeDutyOrder.value.dspToSend) {
      store.commit(SET_DEFAULT_DSP_ADDRESSES, existingDNC_ECDTakeDutyOrder.value.dspToSend.map((el) => ({
        stationId: el.id,
        post: el.post,
        fio: el.fio,
      })));
    }
  };

  // const displayLastCircularOrderOtherPersonal = () => {
  //   if (existingDNC_ECDTakeDutyOrder.value.otherToSend) {
  //     store.commit(CLEAR_OTHER_SHIFT);
  // Участки кода ниже, с одной стороны, дублируют друг друга, с другой - почему-то срабатывает только первый
  //     /*existingDNC_ECDTakeDutyOrder.value.otherToSend.forEach((el) => {
  //       store.commit(ADD_OTHER_GET_ORDER_RECORD, el)
  //     });*/
  //     lastOtherToSendSource.value = existingDNC_ECDTakeDutyOrder.value.otherToSend;
  //   }
  // };

  const displayLastDNCCircularOrdersDSP_ForECD = () => {
    existingDNCTakeDutyOrders_ForECD.value.forEach((order) => {
      store.commit(SET_DEFAULT_DSP_ADDRESSES, order.dspToSend.map((el) => ({
        stationId: el.id,
        post: el.post,
        fio: el.fio,
      })));
    })
  };

  /**
   * Здесь отслеживается именно время (в мс) издания последнего циркулярного распоряжения, т.к. при
   * отслеживании самого объекта циркулярного распоряжения данный watch будет срабатывать каждый раз при
   * обновлении списка распоряжений. И установленные адресаты, соответственно, будут "затираться".
   */
  watch(existingDNC_ECDTakeDutyOrderDateTime, () => {
    if (
      existingDNC_ECDTakeDutyOrderDateTime.value &&
      existingDNC_ECDTakeDutyOrder.value.creator &&
      existingDNC_ECDTakeDutyOrder.value.creator.id === store.getters.getUserId
    ) {
      // Список ДСП автоматически подгружаем только для ДНЦ, из его последнего циркулярного распоряжения
      if (isDNC.value/* || isECD.value*/) {
        displayLastCircularOrderDSP();
      }
      // Для ЭЦД автоматически из его циркулярного распоряжения подгружаем список "иных" адресатов
      // if (isECD.value) {
      //   displayLastCircularOrderOtherPersonal();
      // }
    }
  }, { immediate: true }); // это обязательно, т.к. нужно, чтобы код в watch выполнялся каждый раз при
                           // переходе на страницу (!) и между закладками

  watch(existingDNCTakeDutyOrders_ForECD, () => {
    // Список ДСП для ЭЦД автоматически подгружаем при наличии хотя бы одного циркулярного распоряжения
    // ДНЦ ближайшего участка с этой информацией
    if (isECD.value && existingDNCTakeDutyOrders_ForECD.value) {
      displayLastDNCCircularOrdersDSP_ForECD();
    }
  }, { immediate: true }); // это обязательно, т.к. нужно, чтобы код в watch выполнялся каждый раз при
                           // переходе на страницу (!) и между закладками


  return {
    //existingDNC_ECDTakeDutyOrder,
    //displayLastCircularOrderDSP,
    //displayLastCircularOrderOtherPersonal,
  };
};
