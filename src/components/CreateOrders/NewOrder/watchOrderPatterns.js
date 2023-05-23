import { watch } from 'vue';


export const useWatchOrderPatterns = (inputVals) => {
  const {
    state, store, props, initialOrderText, setRelatedOrderNumberInOrderText,
    getShowOnGidFlag, getUserDutyToDefineOrderTimeSpan, setRequestOrderTextFields,
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
   * Если текущий тип распоряжения - заявка, то при наличии выбранного "окна" необходимо произвести
   * заполнение соответствующих полей шаблонного распоряжения.
   */
  watch(() => state.orderText.patternId, (newVal) => {
    if (!newVal) {
      state.specialTrainCategories = null;
    } else {
      state.specialTrainCategories = store.getters.getOrderPatternSpecialTrainCategories(newVal);
    }
    // флаг необходимости указывать место действия документа
    state.showOnGID = getShowOnGidFlag.value;
    // флаг необходимости указывать время действия документа
    state.defineOrderTimeSpan = getUserDutyToDefineOrderTimeSpan.value;
    // Установка номера связанного документа в тексте создаваемого шаблонного распоряжения
    setRelatedOrderNumberInOrderText();
    // Для формируемой заявки устанавливаем значения полей шаблона, если выбрано "окно"
    setRequestOrderTextFields();
  });
};
