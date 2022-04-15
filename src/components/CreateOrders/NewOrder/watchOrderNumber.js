import { watch } from 'vue';
import { ALL_ORDERS_TYPE_ECD } from '@/constants/orderPatterns';


export const useWatchOrderNumber = ({ state, store, props, isECD }) => {
  // Номер распоряжения заданного типа рассчитывается автоматически и отображается пользователю
  watch(() => store.getters.getNextOrdersNumber(!isECD.value ? props.orderType : ALL_ORDERS_TYPE_ECD),
    (newVal) => state.number = newVal);
};
