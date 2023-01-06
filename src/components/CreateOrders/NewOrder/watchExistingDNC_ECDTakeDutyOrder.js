import { watch, computed } from 'vue';
import {
  SET_LAST_CIRCULAR_ORDER_OTHER_PERSONAL,
  SET_LAST_CIRCULAR_ORDER_DSP,
  SET_LAST_DNC_CIRCULAR_ORDER_DSP_FOR_ECD,
} from '@/store/mutation-types';


export const useWatchExistingDNC_ECDTakeDutyOrder = ({ state, store, isDNC, isECD }) => {
  // последнее циркулярное распоряжение (ДНЦ / ЭЦД)
  const existingDNC_ECDTakeDutyOrder = computed(() => store.getters.getExistingDNC_ECDTakeDutyOrder);
  // время (в мс) издания последнего циркулярного распоряжения (ДНЦ / ЭЦД)
  const existingDNC_ECDTakeDutyOrderDateTime = computed(() => existingDNC_ECDTakeDutyOrder.value ? existingDNC_ECDTakeDutyOrder.value.createDateTime.getTime() : null);

  // циркулярные распоряжения ДНЦ, которые передаются "невидимыми" для ЭЦД с целью получения из них информации по ДСП
  const existingDNCTakeDutyOrders_ForECD = computed(() => store.getters.getExistingDNCTakeDutyOrders_ForECD);
  // строка, образованная в результате конкатенации строк с датами создания циркуляров ДНЦ
  const existingDNCTakeDutyOrders_ForECD_UniqueString = computed(() =>
    !existingDNCTakeDutyOrders_ForECD.value ? null : existingDNCTakeDutyOrders_ForECD.value.reduce((accum, curr) => accum + curr.createDateTime.toISOString(), '')
  );

  /**
   * Здесь отслеживается именно время (в мс) издания последнего циркулярного распоряжения, т.к. при
   * отслеживании самого объекта циркулярного распоряжения данный watch будет срабатывать каждый раз при
   * обновлении списка распоряжений. И установленные адресаты, соответственно, будут "затираться".
   */
  watch(existingDNC_ECDTakeDutyOrderDateTime, () => {
    if (
      // последнее циркулярное распоряжение есть ?
      existingDNC_ECDTakeDutyOrderDateTime.value &&
      // его издатель - текущий пользователь ?
      existingDNC_ECDTakeDutyOrder.value.creator &&
      existingDNC_ECDTakeDutyOrder.value.creator.id === store.getters.getUserId
    ) {
      // Список ДСП автоматически подгружаем только для ДНЦ, из его последнего циркулярного распоряжения
      if (isDNC.value) {
        store.commit(SET_LAST_CIRCULAR_ORDER_DSP, { existingDNC_ECDTakeDutyOrder: existingDNC_ECDTakeDutyOrder.value });
      }
      // Для ЭЦД автоматически из его циркулярного распоряжения подгружаем список "иных" адресатов, если
      // этот список не был подгружен в момент перезагрузки страницы либо перехода на нее с другой страницы
      // (т.е. код ниже будет выполняться только в том случае, если вдруг откуда-то появится новый циркуляр,
      // изданный от имени текущего пользователя, пока тот находился на странице издания нового распоряжения)
      if (isECD.value && store.getters.ifAllDataLoadedOnApplicationReload && !state.updateFormDataOnMounted) {
        store.commit(SET_LAST_CIRCULAR_ORDER_OTHER_PERSONAL, { existingDNC_ECDTakeDutyOrder: existingDNC_ECDTakeDutyOrder.value });
      }
    }
  }, { immediate: true }); // это обязательно, т.к. нужно, чтобы код в watch выполнялся каждый раз при
                           // переходе на страницу (!) и между закладками

  /**
   * Здесь отслеживается именно строка с датами создания циркуляров ДНЦ, т.к. при
   * отслеживании самого массива циркуляров ДНЦ данный watch будет срабатывать каждый раз при
   * обновлении списка распоряжений. И установленные адресаты, соответственно, будут "затираться".
   */
  watch(existingDNCTakeDutyOrders_ForECD_UniqueString, () => {
    // Список ДСП для ЭЦД автоматически подгружаем при наличии хотя бы одного циркулярного распоряжения
    // ДНЦ ближайшего участка с этой информацией
    if (isECD.value && existingDNCTakeDutyOrders_ForECD.value) {
      store.commit(SET_LAST_DNC_CIRCULAR_ORDER_DSP_FOR_ECD, { existingDNCTakeDutyOrders_ForECD: existingDNCTakeDutyOrders_ForECD.value });
    }
  }, { immediate: true }); // это обязательно, т.к. нужно, чтобы код в watch выполнялся каждый раз при
                           // переходе на страницу (!) и между закладками

  return {
    existingDNC_ECDTakeDutyOrder,
  };
};
