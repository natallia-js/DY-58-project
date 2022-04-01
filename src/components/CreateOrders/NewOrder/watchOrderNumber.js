import { watch } from 'vue';


export const useWatchOrderNumber = ({ state, store, props }) => {
  // Номер распоряжения заданного типа рассчитывается автоматически и отображается пользователю
  watch(() => store.getters.getNextOrdersNumber(props.orderType), (newVal) => state.number = newVal);
};
