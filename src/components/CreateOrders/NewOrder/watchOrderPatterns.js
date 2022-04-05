import { watch } from 'vue';


export const useWatchOrderPatterns = (inputVals) => {
  const {
    state, store, props, initialOrderText, setRelatedOrderNumberInOrderText,
    getUserDutyToDefineOrderPlace, getUserDutyToDefineOrderTimeSpan,
  } = inputVals;

  // Сюда попадаем (в частности) при перезагрузке страницы, когда не сразу доступны шаблоны распоряжений
  watch([() => store.getters.getAllOrderPatterns, () => props.orderPatternId],
    ([newPatterns, newOrderPatternId]) => {
      if (newPatterns && newPatterns.length && newOrderPatternId) {
        state.orderText = initialOrderText();
      }
    }
  );

  /**
   * При смене шаблона распоряжения извлекает отметки об особой категории поезда,
   * закрепленные за данным шаблоном.
   * Кроме того, определяем необходимость заполнения полей места и времени действия распоряжения.
   * А также устанавливаем для шаблонного распоряжения поле номера связанного распоряжения (при его
   * наличии и наличии связанного распоряжения).
   */
  watch(() => state.orderText.patternId, (newVal) => {
    if (!newVal) {
      state.specialTrainCategories = null;
    } else {
      state.specialTrainCategories = store.getters.getOrderPatternSpecialTrainCategories(newVal);
    }
    state.showOnGID = getUserDutyToDefineOrderPlace.value;
    state.defineOrderTimeSpan = getUserDutyToDefineOrderTimeSpan.value;
    setRelatedOrderNumberInOrderText();
  });
};
