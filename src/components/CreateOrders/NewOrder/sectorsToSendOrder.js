import { computed, watch } from 'vue';
import { CurrShiftGetOrderStatus, ORDER_PLACE_VALUES } from '../../../constants/orders';

/**
 * Данный модуль предназначен для работы с участками, на которые необходимо передать
 * издаваемое распоряжение.
 */
export const useSectorsToSendOrder = (state, store) => {
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
  const formSelectedPersonalString = (personalArray, placeFieldName) => {
    if (!personalArray) {
      return '';
    }
    let originalToString = '';
    let copyToString = '';
    const sendOriginalTo = personalArray.filter((el) => el.sendOriginal === CurrShiftGetOrderStatus.sendOriginal);
    if (sendOriginalTo.length) {
      originalToString = '<span class="dy58-send-original">Оригинал:</span> ' +
        sendOriginalTo.reduce((accumulator, currentValue, index) =>
          accumulator + `${currentValue[placeFieldName]}${!currentValue.post ? '' : ' ' + currentValue.post}${!currentValue.fio ? '' : ' ' + currentValue.fio}` +
          `${index === sendOriginalTo.length - 1 ? '' : ', '}`, '');
    }
    let sendCopyTo = personalArray.filter((el) => el.sendOriginal === CurrShiftGetOrderStatus.sendCopy);
    if (sendCopyTo.length) {
      copyToString = '<span class="dy58-send-copy">Копия:</span> ' +
        sendCopyTo.reduce((accumulator, currentValue, index) =>
          accumulator + `${currentValue[placeFieldName]}${!currentValue.post ? '' : ' ' + currentValue.post}${!currentValue.fio ? '' : ' ' + currentValue.fio}` +
          `${index === sendCopyTo.length - 1 ? '' : ', '}`, '');
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
  const selectedDSPString = computed(() => formSelectedPersonalString(dspSectorsToSendOrderNoDupl.value, 'station'));

  // Строка для отображения информации о выбранных ДНЦ
  const selectedDNCString = computed(() => formSelectedPersonalString(dncSectorsToSendOrderNoDupl.value, 'sector'));

  // Строка для отображения информации о выбранных ДСП
  const selectedECDString = computed(() => formSelectedPersonalString(ecdSectorsToSendOrderNoDupl.value, 'sector'));

  // Строка для отображения информации о выбранных иных адресатах
  const selectedOtherAddresseesString = computed(() => formSelectedPersonalString(state.otherSectorsToSendOrder, 'placeTitle'));

  // При изменении значения параметра места действия распоряжения меняем список "Кому" по станциям
  watch(() => state.orderPlace, (newVal) => {
    // Вначале все записи "чистим" (т.е. отменяем передачу всем, кто до этого был назначен)
    store.commit('setGetOrderStatusToAllDSP', { getOrderStatus: CurrShiftGetOrderStatus.doNotSend });
    let blockObject;
    switch (newVal.place) {
      case ORDER_PLACE_VALUES.station:
        // Затем назначаем получение оригинала распоряжения выбранной станции
        store.commit('setGetOrderStatusToDefinitDSP',
          { stationId: newVal.value, getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
        break;
      case ORDER_PLACE_VALUES.span:
        // Затем назначаем получение оригинала распоряжения станциям выбранного перегона
        blockObject = store.getters.getSectorBlockById(newVal.value);
        if (blockObject) {
          store.commit('setGetOrderStatusToDefinitDSP',
            { stationId: blockObject.Bl_StationID1, getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
          store.commit('setGetOrderStatusToDefinitDSP',
            { stationId: blockObject.Bl_StationID2, getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
        }
        break;
    }
  });

  return {
    dspSectorsToSendOrderNoDupl,
    dncSectorsToSendOrderNoDupl,
    ecdSectorsToSendOrderNoDupl,
    selectedDSPString,
    selectedDNCString,
    selectedECDString,
    selectedOtherAddresseesString,
  };
};
