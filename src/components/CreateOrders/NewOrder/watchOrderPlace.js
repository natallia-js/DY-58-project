import { watch } from 'vue';
import {
  SET_GET_ORDER_STATUS_TO_ALL_DSP,
  SET_GET_ORDER_STATUS_TO_DEFINIT_DSP,
} from '@/store/mutation-types';
import {
  CurrShiftGetOrderStatus,
  ORDER_PLACE_VALUES,
} from '@/constants/orders';


export const useWatchOrderPlace = ({ state, store }) => {
  // При изменении значения параметра места действия распоряжения меняем список "Кому" по станциям,
  // а также, при необходимости, заполняем значения соответствующих полей в тексте распоряжения
  watch(() => state.orderPlace.value, (newValue) => {
    if (!state.resetValueOnWatchChanges || !newValue) {
      return;
    }
    // Вначале все записи "чистим" (т.е. отменяем передачу всем, кто до этого был назначен)
    store.commit(SET_GET_ORDER_STATUS_TO_ALL_DSP, { getOrderStatus: CurrShiftGetOrderStatus.doNotSend });
    let blockObject;
    switch (state.orderPlace.place) {
      case ORDER_PLACE_VALUES.station:
        // Затем назначаем получение оригинала распоряжения выбранной станции
        store.commit(SET_GET_ORDER_STATUS_TO_DEFINIT_DSP,
          { stationId: newValue, getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
        break;
      case ORDER_PLACE_VALUES.span:
        // Затем назначаем получение оригинала распоряжения станциям выбранного перегона
        blockObject = store.getters.getSectorBlockById(newValue);
        if (blockObject) {
          store.commit(SET_GET_ORDER_STATUS_TO_DEFINIT_DSP,
            { stationId: blockObject.Bl_StationID1, getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
          store.commit(SET_GET_ORDER_STATUS_TO_DEFINIT_DSP,
            { stationId: blockObject.Bl_StationID2, getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
        }
        break;
    }
  });
};
