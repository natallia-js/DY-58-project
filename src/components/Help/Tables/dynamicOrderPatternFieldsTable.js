export const DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS = {
  fieldType: 'fieldType',
  description: 'description',
  senceValues: 'senceValues',
  senceValueDescription: 'senceValueDescription',
  autofill: 'autofill',
};

export const dynamicOrderPatternFieldsTableData = () => {
  const tableData = [];
  let fieldType = 'Поле ввода';
  let description = 'Значение в данное поле пользователь вводит самостоятельно, никаких проверок на корректность введенного значения нет, ' +
    'ограничение на длину вводимого значения не установлено. Автоматически заполняется значением "связанного" поля (если есть) выбранного ' +
    'предшествующего документа в цепочке (см. выше описание поля "На документ / На приказ/запрещение")';
  tableData.push(
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Вес поезда',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст. Заполнение обязательно',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Вид движения',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст. Заполнение обязательно',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Выходные светофоры ст.отпр.',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст. Заполнение обязательно',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Длина поезда',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст. Заполнение обязательно',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'ДНЦ',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст. Заполнение обязательно',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Индекс поезда',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст. Заполнение обязательно',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Километры',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст. Заполнение обязательно',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
    {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Количество вагонов',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст. Заполнение обязательно',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Место работ',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст. Заполнение обязательно',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Для заявок заполняется при выборе "окна"',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Номер соединенного поезда',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст. Заполнение обязательно',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Перегон',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст. Заполнение обязательно',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Поезда',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст. Заполнение обязательно',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Примечание',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст. ДУ-58 не требует заполнения данного поля',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Причина оставления поезда',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст. Заполнение обязательно',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Продолжительность "окна"',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст. Заполнение обязательно',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Для заявок заполняется при выборе "окна"',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Пути перегона',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст. Заполнение обязательно',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Для заявок заполняется при выборе "окна"',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Пути станции',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст. Заполнение обязательно',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Пути станции отправления',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст. Заполнение обязательно',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Пути станции прибытия',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст. Заполнение обязательно',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Работы',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст. Заполнение обязательно',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Для заявок заполняется при выборе "окна"',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Руководители',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст. Заполнение обязательно',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Для заявок заполняется при выборе "окна"',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Средства связи',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст. Заполнение обязательно',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Станция',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст. Заполнение обязательно',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Станция отправления',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст. Заполнение обязательно',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Станция прибытия',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст. Заполнение обязательно',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Характеристика поезда',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст. Заполнение обязательно',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Четность',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст. Заполнение обязательно',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  });
  fieldType = 'Текстовая область';
  description = 'Предполагает ввод со стороны пользователя текста произвольной длины. ' +
    'Размер поля "подстраивается" под размер содержащихся в нем данных. ' +
    'ДУ-58 позволяет не заполнять данное поле. ' +
    'Автоматически заполняется значением "связанного" поля (если есть) выбранного предшествующего ' +
    'документа в цепочке (см. выше описание поля "На документ / На приказ/запрещение")';
  tableData.push(
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  });
  fieldType = 'Выпадающий список';
  description = 'Предполагает выбор со стороны пользователя одного из значений, содержащихся в списке выбора. ' +
    'Заполнение поля обязательно. ' +
    'Автоматически заполняется значением "связанного" поля (если есть) выбранного предшествующего ' +
    'документа в цепочке (см. выше описание поля "На документ / На приказ/запрещение")';
  tableData.push(
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Дежурство сдал',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Дежурство принял',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Номер действующего распоряжения',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Номер действующего распоряжения на закрытие перегона',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Номер действующей заявки',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Номер действующего уведомления',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Номер действующего приказа',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Номер действующего запрещения',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Отключить, включить',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Перегон',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Перегон станции отправления',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Порядок действий',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Путь перегона',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Путь перегона станции отправления',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Путь станции',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Путь станции отправления',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Путь станции прибытия',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Руководители',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Станция',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Станция отправления',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Станция прибытия',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Точное место',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  });
  fieldType = 'Дата';
  description = '';
  tableData.push({
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: '',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  });
  fieldType = 'Время';
  description = '';
  tableData.push({
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: '',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  });
  fieldType = 'Дата-время';
  description = '';
  tableData.push({
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: '',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  });
  fieldType = 'Таблица "Поезд ДР"';
  description = '';
  tableData.push({
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: '',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: '-',
  });
  return tableData;
};
