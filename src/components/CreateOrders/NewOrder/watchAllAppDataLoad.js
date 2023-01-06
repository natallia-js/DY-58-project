import { watch } from 'vue';
import { SET_LAST_CIRCULAR_ORDER_OTHER_PERSONAL, SET_LAST_CIRCULAR_ORDER_DSP } from '@/store/mutation-types';
import { APPLY_PERSONAL_FOR_SENDING_DATA_ACTION } from '@/store/action-types';


// Модуль для выполнения работ сразу по окончании загрузки ВСЕХ данных приложения.
export const useWatchAllAppDataLoad = (inputVals) => {
  const {
    state, store, relatedOrderObject, currentOrderDraft, existingDNC_ECDTakeDutyOrder,
    handleClearOrderAddressesLists, applySelectedOrderDraft,
  } = inputVals;

  /**
   * 1. из последнего циркуляра (ДНЦ / ЭЦД) подгружаем всех "иных" адресатов (не выделяем записи в качестве выбранных)
   * 2. из связанного документа выбираем "иных" (если не установлены в п.1. - устанавливаем; выделяем в качестве выбранных)
   * 3. из черновика выбираем "иных" (если не установлены в п.п.1,2. - устанавливаем; выделяем в качестве выбранных)
   */
  const updateOtherShiftFromMultipleSources = () => {
    // Есть циркулярное распоряжение => подгружаем из него всех "иных" адресатов, не назначая их в качестве адресатов
    // создаваемого документа
    if (existingDNC_ECDTakeDutyOrder.value) {
      store.commit(SET_LAST_CIRCULAR_ORDER_OTHER_PERSONAL, { existingDNC_ECDTakeDutyOrder: existingDNC_ECDTakeDutyOrder.value });
    }

    // Если есть связанное распоряжение (на которое издается текущее), то берем первое распоряжение в его
    // цепочке, извлекаем список "иных" адресатов и применяем его к новому издаваемому распоряжению (учитывая этих
    // адресатов как адресатов создаваемого документа)
    if (relatedOrderObject.value) {
      const firstOrderInChain = store.getters.getFirstOrderInChain(relatedOrderObject.value.orderChainId);
      if (firstOrderInChain?.otherToSend?.length) {
        store.dispatch(APPLY_PERSONAL_FOR_SENDING_DATA_ACTION, { otherToSend: firstOrderInChain.otherToSend, rewriteOtherToSend: false });
      }
    }

    // Если есть черновик, по которому издается текущее распоряжение, и в нем есть список "иных" адресатов,
    // то применяем этот список к новому издаваемому распоряжению
    if (currentOrderDraft.value?.otherToSend?.length) {
      store.dispatch(APPLY_PERSONAL_FOR_SENDING_DATA_ACTION, { otherToSend: currentOrderDraft.value.otherToSend, rewriteOtherToSend: false });
    }
  };

  /**
   * Обновление данных на форме издания нового распоряжения.
   * Используется при загрузке / перезагрузке компонента (формы).
   */
  const updateFormData = () => {
    // Инициализация списков возможных адресатов
    handleClearOrderAddressesLists();

    // Отображение персонала из черновика (кроме "иных" адресатов).
    // Из связанного распоряжения информация нас здесь не интересует (только "иные" адресаты - см. ниже).
    if (state.currentOrderDraftId && store.getters.getAllOrderDrafts?.length) {
      applySelectedOrderDraft({ setOtherShift: false });

    // Если черновика нет, то необходимо отобразить ДСП из последнего циркуляра - только для того ДНЦ, который сейчас работает
    // в программе и только для его последнего циркуляра
    } else if (
      store.getters.isDNC && existingDNC_ECDTakeDutyOrder.value &&
      existingDNC_ECDTakeDutyOrder.value.creator &&
      existingDNC_ECDTakeDutyOrder.value.creator.id === store.getters.getUserId
    ) {
      store.commit(SET_LAST_CIRCULAR_ORDER_DSP, { existingDNC_ECDTakeDutyOrder: existingDNC_ECDTakeDutyOrder.value });
    }

    // Отображение "иных" адресатов из всех известных источников
    updateOtherShiftFromMultipleSources();

    // Поскольку выше была обновлена информация об "иных" адресатах, в хуке mounted компонента больше
    // нет необходимости делать то же самое
    state.updateFormDataOnMounted = false;
  };

  // Когда подгрузится вся информация приложения (случай загрузки / перезагрузки страницы), тогда необходимо предпринять меры
  // по отображению определенных данных на странице.
  watch (() => store.getters.ifAllDataLoadedOnApplicationReload, (newVal) => {
    if (newVal && state.updateFormDataOnMounted) {
      updateFormData();
    }
  });

  return {
    updateFormData,
  };
};
