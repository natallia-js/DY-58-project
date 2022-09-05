import { computed } from 'vue';
import {
  CurrShiftGetOrderStatus,
  ORDERS_RECEIVERS_DEFAULT_POSTS,
} from '@/constants/orders';
import { CLEAR_SHIFT_FOR_SENDING_DATA } from '@/store/mutation-types';


/**
 * Данный модуль предназначен для работы с участками, на которые необходимо передать
 * издаваемое распоряжение.
 */
export const useSectorsToSendOrder = ({ state, store }) => {
  const dspSectorsToSendOrderNoDupl = computed(() => {
    if (!state.dspSectorsToSendOrder || !state.dspSectorsToSendOrder.length) {
      return [];
    }
    return state.dspSectorsToSendOrder.filter((item, index) => {
      return state.dspSectorsToSendOrder.findIndex((el) => el.id === item.id) === index;
    });
  });

  const dncSectorsToSendOrderNoDupl = computed(() => {
    if (!state.dncSectorsToSendOrder || !state.dncSectorsToSendOrder.length) {
      return [];
    }
    return state.dncSectorsToSendOrder.filter((item, index) => {
      return state.dncSectorsToSendOrder.findIndex((el) => el.id === item.id) === index;
    });
  });

  const ecdSectorsToSendOrderNoDupl = computed(() => {
    if (!state.ecdSectorsToSendOrder || !state.ecdSectorsToSendOrder.length) {
      return [];
    }
    return state.ecdSectorsToSendOrder.filter((item, index) => {
      return state.ecdSectorsToSendOrder.findIndex((el) => el.id === item.id) === index;
    });
  });

  // Возвращает строку для отображения персонала (конкретного типа),
  // выбранного в качестве получателей распоряжения
  const formSelectedPersonalString = (personalArray, placeFieldName, defaultPost) => {
    if (!personalArray) {
      return '';
    }
    let originalToString = '';
    let copyToString = '';
    const sendOriginalTo = personalArray.filter((el) => el.sendOriginal === CurrShiftGetOrderStatus.sendOriginal);

    const reducerFunction = (accumulator, currentValue, index, array) => {
      let post;
      if (currentValue.post) post = ' ' + currentValue.post;
      else if (!currentValue.fio && defaultPost) post = defaultPost;
      else post = '';
      return accumulator + `${currentValue[placeFieldName]}` +
        ` ${post}${!currentValue.fio ? '' : ' ' + currentValue.fio}` +
        `${index === array.length - 1 ? '' : ', '}`;
    };

    if (sendOriginalTo.length) {
      originalToString = '<span class="dy58-send-original">Оригинал:</span> ' +
        sendOriginalTo.reduce(reducerFunction, '');
    }
    let sendCopyTo = personalArray.filter((el) => el.sendOriginal === CurrShiftGetOrderStatus.sendCopy);
    if (sendCopyTo.length) {
      copyToString = '<span class="dy58-send-copy">Копия:</span> ' +
        sendCopyTo.reduce(reducerFunction, '');
    }
    let resultString = '';
    if (originalToString) {
      resultString = originalToString;
    }
    if (copyToString) {
      resultString = !resultString ? copyToString : `${resultString}; ${copyToString}`;
    }
    return resultString;
  };

  // Строка для отображения информации о выбранных ДСП
  const selectedDSPString = computed(() =>
    formSelectedPersonalString(dspSectorsToSendOrderNoDupl.value, 'station', ORDERS_RECEIVERS_DEFAULT_POSTS.DSP));

  // Строка для отображения информации о выбранных ДНЦ
  const selectedDNCString = computed(() =>
    formSelectedPersonalString(dncSectorsToSendOrderNoDupl.value, 'sector', ORDERS_RECEIVERS_DEFAULT_POSTS.DNC));

  // Строка для отображения информации о выбранных ДСП
  const selectedECDString = computed(() =>
    formSelectedPersonalString(ecdSectorsToSendOrderNoDupl.value, 'sector', ORDERS_RECEIVERS_DEFAULT_POSTS.ECD));

  // Строка для отображения информации о выбранных иных адресатах
  const selectedOtherAddresseesString = computed(() =>
    formSelectedPersonalString(state.otherSectorsToSendOrder, 'placeTitle', null));

  // Чистит списки адресатов распоряжения.
  const handleClearOrderAddressesLists = () => {
    store.commit(CLEAR_SHIFT_FOR_SENDING_DATA);
  };

  return {
    dspSectorsToSendOrderNoDupl,
    dncSectorsToSendOrderNoDupl,
    ecdSectorsToSendOrderNoDupl,
    selectedDSPString,
    selectedDNCString,
    selectedECDString,
    selectedOtherAddresseesString,
    handleClearOrderAddressesLists,
  };
};
