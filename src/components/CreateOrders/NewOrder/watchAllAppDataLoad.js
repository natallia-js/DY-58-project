import { watch } from 'vue';
import {
  SET_LAST_CIRCULAR_ORDER_OTHER_PERSONAL,
  SET_LAST_CIRCULAR_ORDER_DSP,
  SET_USER_CHOSEN_STATUS,
  SET_GET_ORDER_STATUS_TO_DEFINIT_DSP,
  SET_GET_ORDER_STATUS_TO_DEFINIT_DNC_SECTOR,
  SET_GET_ORDER_STATUS_TO_DEFINIT_ECD_SECTOR,
  SET_GET_ORDER_STATUS_TO_DEFINIT_OTHER_SHIFT,
  ADD_OTHER_GET_ORDER_RECORD,
} from '@/store/mutation-types';
import { APPLY_PERSONAL_FOR_SENDING_DATA_ACTION } from '@/store/action-types';
import { getDY58OriginalFlag } from '@/additional/formOrderText';
import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';
import { getLocaleDateTimeString } from '@/additional/dateTimeConvertions';


// Модуль для выполнения работ сразу по окончании загрузки ВСЕХ данных приложения.
export const useWatchAllAppDataLoad = (inputVals) => {
  const {
    props, state, store, relatedOrderObject, currentOrderDraft, existingDNC_ECDTakeDutyOrder,
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
   * Обновление данных на форме издания нового распоряжения / редактирования существующего распоряжения.
   * Используется при загрузке / перезагрузке компонента (формы).
   */
  const updateFormData = () => {
    // Инициализация списков возможных адресатов (списки ДСП, ДНЦ, ЭЦД чистим, список иных адресатов для ЭЦД
    // заполняем значениями по умолчанию)
    handleClearOrderAddressesLists();

    // Случай, когда будет создаваться новый документ
    if (!props.orderId) {
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
    }
    // Случай, когда будет редактироваться существующий документ (пока нормально могут редактироваться только циркуляры)
    else {
      state.createOrder = false;
      // Ищем документ, подлежащий редактированию
      const orderToEdit = store.getters.getActiveOrderById(props.orderId);
      if (!orderToEdit) {
        state.updateFormDataOnMounted = false;
        return;
      }
      // Подгружаем определенные значения элементов шаблона
      state.number = orderToEdit.number;
      state.createDateTime = orderToEdit.createDateTime;
      state.createDateTimeString = getLocaleDateTimeString(orderToEdit.createDateTime);
      state.specialTrainCategories = orderToEdit.specialTrainCategories;
      state.timeSpan = orderToEdit.timeSpan;
      state.orderText = {
        ...orderToEdit.orderText,
        orderText: orderToEdit.orderText.orderText.map((el) => ({
          ...el,
          value: el.editValue,
        })),
      };

      // Вспомогательная функция, позволяющая отобразить адресатов редактируемого документа
      const setOrderPoligonAddressees = (addresseesArray, addresseesPoligonType) => {
        addresseesArray?.forEach((addressee) => {
          store.commit(SET_USER_CHOSEN_STATUS, {
            userId: addressee._id,
            chooseUser: true,
            workPoligonType: addressee.type,
            workPoligonId: addressee.id,
          });
          if (addresseesPoligonType === WORK_POLIGON_TYPES.STATION)
            store.commit(SET_GET_ORDER_STATUS_TO_DEFINIT_DSP,
              { stationId: addressee.id, getOrderStatus: getDY58OriginalFlag(addressee.sendOriginal) });
          else if (addresseesPoligonType === WORK_POLIGON_TYPES.DNC_SECTOR)
            store.commit(SET_GET_ORDER_STATUS_TO_DEFINIT_DNC_SECTOR,
              { dncSectorId: addressee.id, getOrderStatus: getDY58OriginalFlag(addressee.sendOriginal) });
          else if (addresseesPoligonType === WORK_POLIGON_TYPES.ECD_SECTOR)
            store.commit(SET_GET_ORDER_STATUS_TO_DEFINIT_ECD_SECTOR,
              { ecdSectorId: addressee.id, getOrderStatus: getDY58OriginalFlag(addressee.sendOriginal) });
        });
      }

      // Если в документе, подлежащем редактированию, есть списки адресатов из числа ДСП, ДНЦ, ЭЦД, подгружаем их
      setOrderPoligonAddressees(orderToEdit.dspToSend, WORK_POLIGON_TYPES.STATION);
      setOrderPoligonAddressees(orderToEdit.dncToSend, WORK_POLIGON_TYPES.DNC_SECTOR);
      setOrderPoligonAddressees(orderToEdit.ecdToSend, WORK_POLIGON_TYPES.ECD_SECTOR);

      // Если в документе, подлежащем редактированию, есть список иных адресатов, подгружаем их
      orderToEdit?.otherToSend.forEach((addressee) => {
        // для документа, который ранее был издан, у каждого его иного адресата уже есть поле _id
        store.commit(ADD_OTHER_GET_ORDER_RECORD, { ...addressee });
        store.commit(SET_GET_ORDER_STATUS_TO_DEFINIT_OTHER_SHIFT,
          { otherId: addressee._id, getOrderStatus: getDY58OriginalFlag(addressee.sendOriginal) });
      });
    }

    // Поскольку выше была обновлена информация по создаваемому/редактируемому документу, в хуке mounted компонента больше
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
