export const usePossibleOptions = ({ isECD }) => {
  // Уточнять время действия издаваемого распоряжения либо не уточнять
  const defineOrderTimeSpanOptions = ([
    { name: 'Время действия по умолчанию', value: false },
    { name: 'Уточнить время действия', value: true },
  ]);

  // Отображать издаваемое распоряжение на ГИД или не отображать
  const showOnGIDOptions = ([
    { name: !isECD.value ? 'Не отображать на ГИД' : 'Не указывать место действия', value: false },
    { name: !isECD.value ? 'Отобразить на ГИД': 'Определить место действия', value: true },
  ]);

  return {
    defineOrderTimeSpanOptions,
    showOnGIDOptions,
  };
};
