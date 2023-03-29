import { watch } from 'vue';
import { SET_ALLOW_APPLICATION_NAVIGATION, SET_DO_NOT_ALLOW_APPLICATION_NAVIGATION } from '@/store/mutation-types';
import isEqual from '@/additional/isEqual';

// Модуль отслеживания изменений при формировании информации по документу.
export const useWatchOrderDataChanges = ({ state, store, initialOrderData }) => {
  watch([() => state.orderPlace,
         () => state.timeSpan,
         () => state.orderText,
         () => state.dncSectorsToSendOrder,
         () => state.dspSectorsToSendOrder,
         () => state.ecdSectorsToSendOrder,
         () => state.otherSectorsToSendOrder],
    () => {
      if (state.orderDispatchedSuccessfully)
        return;
      if (
        !isEqual(state.orderPlace, initialOrderData.orderPlace) ||
        !isEqual(state.timeSpan, initialOrderData.timeSpan) ||
        !isEqual(state.orderText, initialOrderData.orderText) ||
        !isEqual(state.dncSectorsToSendOrder, initialOrderData.dncSectorsToSendOrder) ||
        !isEqual(state.dspSectorsToSendOrder, initialOrderData.dspSectorsToSendOrder) ||
        !isEqual(state.ecdSectorsToSendOrder, initialOrderData.ecdSectorsToSendOrder) ||
        !isEqual(state.otherSectorsToSendOrder, initialOrderData.otherSectorsToSendOrder)
      ) {
        store.commit(SET_DO_NOT_ALLOW_APPLICATION_NAVIGATION);
      } else {
        store.commit(SET_ALLOW_APPLICATION_NAVIGATION);
      }
    }
  );
};
