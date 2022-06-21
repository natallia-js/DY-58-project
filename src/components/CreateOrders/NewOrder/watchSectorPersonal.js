import { watch } from 'vue';

export const useWatchSectorPersonal = (inputVals) => {
  const { store, applySelectedOrderDraftPersonal, displayLastCircularOrderDSP } = inputVals;

  watch(() => store.getters.getSectorPersonal, () => {
    // Отображение персонала из выбранного черновика распоряжения
    applySelectedOrderDraftPersonal();
  });

  watch(() => store.getters.getSectorStationsShiftNumber, () => {
    // Отображение списка ДСП из последнего циркуляра
    displayLastCircularOrderDSP();
  });
};
