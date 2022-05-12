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
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Вид движения',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Выходные светофоры ст.отпр.',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Длина поезда',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'ДНЦ',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Индекс поезда',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Километры',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
    {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Количество вагонов',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Место работ',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно. Для заявок заполняется при выборе "окна"',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Номер соединенного поезда',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Перегон',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Поезда',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Примечание',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст.',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'ДУ-58 не требует заполнения данного поля',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Причина оставления поезда',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Продолжительность "окна"',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно. Для заявок заполняется при выборе "окна"',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Пути перегона',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно. Для заявок заполняется при выборе "окна"',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Пути станции',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Пути станции отправления',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Пути станции прибытия',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Работы',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно. Для заявок заполняется при выборе "окна"',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Руководители',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно. Для заявок заполняется при выборе "окна"',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Средства связи',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Станция',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Станция отправления',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Станция прибытия',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Характеристика поезда',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Четность',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Произвольный текст',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  });
  fieldType = 'Текстовая область';
  description = 'Предполагает ввод со стороны пользователя текста произвольной длины. ' +
    'Размер поля "подстраивается" под размер содержащихся в нем данных. ' +
    'Автоматически заполняется значением "связанного" поля (если есть) выбранного предшествующего ' +
    'документа в цепочке (см. выше описание поля "На документ / На приказ/запрещение")';
  tableData.push(
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'ДУ-58 позволяет не заполнять данное поле',
  });
  fieldType = 'Выпадающий список';
  description = 'Предполагает выбор со стороны пользователя одного из значений, содержащихся в списке выбора. ' +
    'Автоматически заполняется значением "связанного" поля (если есть) выбранного предшествующего ' +
    'документа в цепочке (см. выше описание поля "На документ / На приказ/запрещение")';
  tableData.push(
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Дежурство сдал',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Список строк, содержащих Должность и ФИО всех работников текущего рабочего полигона',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно. Значение по умолчанию - Должность и ФИО работника, фигурировавшего как лицо, принявшее дежурство в последнем циркулярном распоряжении (только для ДНЦ / ЭЦД)',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Дежурство принял',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Список строк, содержащих Должность и ФИО всех работников текущего рабочего полигона',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно. Значение по умолчанию - Должность + ФИО текущего пользователя',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Номер действующего распоряжения',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Список строк с номерами действующих распоряжений',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно. Заполняется автоматически при выборе "связанного" документа типа "распоряжение"',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Номер действующего распоряжения на закрытие перегона',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Список строк с номерами действующих распоряжений на закрытие перегона',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно. Заполняется автоматически при выборе "связанного" документа типа "распоряжение на закрытие перегона"',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Номер действующей заявки',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Список строк с номерами действующих заявок',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно. Заполняется автоматически при выборе "связанного" документа типа "заявка"',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Номер действующего уведомления',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Список строк с номерами действующих уведомлений',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно. Заполняется автоматически при выборе "связанного" документа типа "уведомление"',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Номер действующего приказа',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Список строк с номерами действующих приказов ЭЦД',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно. Заполняется автоматически при выборе "связанного" документа типа "приказ"',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Номер действующего запрещения',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Список строк с номерами действующих запрещений ЭЦД',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно. Заполняется автоматически при выборе "связанного" документа типа "запрещение"',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Отключить, включить',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Список строк "отключить", "отключены", "включить", "включены"',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Перегон',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Список строк с наименованиями перегонов полигона управления',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Перегон станции отправления',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Список строк с наименованиями перегонов, соответствующих выбранной в шаблоне станции отправления (первый элемент со смысловым значением "Станция отправления")',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Порядок действий',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Список строк "вручную", "дистанционно", "закрыть привод на замок", "вывесить запрещающие плакаты"',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Путь перегона',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Список строк с наименованиями путей, соответствующих выбранному в шаблоне перегону (первый элемент со смысловым значением "Перегон")',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Путь перегона станции отправления',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Список строк с наименованиями путей, соответствующих выбранному в шаблоне перегону станции отправления (первый элемент со смысловым значением "Перегон станции отправления")',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Путь станции',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Список строк с наименованиями путей, соответствующих выбранной в шаблоне станции (первый элемент со смысловым значением "Станция")',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Путь станции отправления',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Список строк с наименованиями путей, соответствующих выбранной в шаблоне станции отправления (первый элемент со смысловым значением "Станция отправления")',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Путь станции прибытия',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Список строк с наименованиями путей, соответствующих выбранной в шаблоне станции прибытия (первый элемент со смысловым значением "Станция прибытия")',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Руководители',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Список строк с Должностями и ФИО лиц, которые фигурируют в выбранном "окне" как основной и дополнительные руководители работ',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно. Значение по умолчанию при выбранном "окне" - Должность и ФИО основного руководителя работ',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Станция',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Список строк с наименованиями станций полигона управления',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Станция отправления',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Список строк с наименованиями станций полигона управления',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Станция прибытия',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Список строк с наименованиями станций полигона управления',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Точное место',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Список строк "станция", "подстанция", "подстанции", "перегон", "контактная сеть", "ВЛ", "КЛ"',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  });
  fieldType = 'Дата';
  description = 'Предполагает выбор значения из календаря либо ввод вручную пользователем. ' +
    'Формат значения: дд.мм.гггг'
    'Автоматически заполняется значением "связанного" поля (если есть) выбранного предшествующего ' +
    'документа в цепочке (см. выше описание поля "На документ / На приказ/запрещение")';
  tableData.push(
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Дата издания действующего распоряжения',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]:
      'Заполнение обязательно. Первый такой элемент шаблона автоматически заполняется при выборе значения в поле выпадающего списка "Номер действующего распоряжения" / "Номер действующего распоряжения на закрытие перегона"',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Дата издания действующей заявки',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]:
      'Заполнение обязательно. Первый такой элемент шаблона автоматически заполняется при выборе значения в поле выпадающего списка "Номер действующей заявки"',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Дата издания действующего уведомления',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]:
      'Заполнение обязательно. Первый такой элемент шаблона автоматически заполняется при выборе значения в поле выпадающего списка "Номер действующего уведомления"',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Дата издания действующего приказа',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]:
      'Заполнение обязательно. Первый такой элемент шаблона автоматически заполняется при выборе значения в поле выпадающего списка "Номер действующей приказа"',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Дата издания действующего запрещения',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]:
      'Заполнение обязательно. Первый такой элемент шаблона автоматически заполняется при выборе значения в поле выпадающего списка "Номер действующей запрещения"',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Текущая дата',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно. Значение по умолчанию - текущая дата',
  });
  fieldType = 'Время';
  description = 'Предполагает выбор значения из календаря либо ввод вручную пользователем. ' +
    'Формат значения: чч.мм'
    'Автоматически заполняется значением "связанного" поля (если есть) выбранного предшествующего ' +
    'документа в цепочке (см. выше описание поля "На документ / На приказ/запрещение")';
  tableData.push(
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Текущее время',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно. Значение по умолчанию - текущее время',
  });
  fieldType = 'Дата-время';
  description = 'Предполагает выбор значения из календаря либо ввод вручную пользователем. ' +
    'Формат значения: дд.мм.гггг чч.мм'
    'Автоматически заполняется значением "связанного" поля (если есть) выбранного предшествующего ' +
    'документа в цепочке (см. выше описание поля "На документ / На приказ/запрещение")';
  tableData.push(
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Дата-время издания действующего распоряжения',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]:
      'Заполнение обязательно. Первый такой элемент шаблона автоматически заполняется при выборе значения в поле выпадающего списка "Номер действующего распоряжения" / "Номер действующего распоряжения на закрытие перегона"',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Дата-время издания действующей заявки',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]:
      'Заполнение обязательно. Первый такой элемент шаблона автоматически заполняется при выборе значения в поле выпадающего списка "Номер действующей заявки"',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Дата-время издания действующего уведомления',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]:
      'Заполнение обязательно. Первый такой элемент шаблона автоматически заполняется при выборе значения в поле выпадающего списка "Номер действующего уведомления"',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Дата-время издания действующего приказа',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]:
      'Заполнение обязательно. Первый такой элемент шаблона автоматически заполняется при выборе значения в поле выпадающего списка "Номер действующей приказа"',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Дата-время издания действующего запрещения',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]:
      'Заполнение обязательно. Первый такой элемент шаблона автоматически заполняется при выборе значения в поле выпадающего списка "Номер действующей запрещения"',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Дата-время закрытия перегона',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Дата-время открытия перегона',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Дата-время принятия дежурства',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]:
      'Заполнение обязательно. Значение по умолчанию - 08:00 текущего дня, если текущее время между 00:00 и 12:00, в противном случае 20:00 текущего дня. ' +
      'У первого такого элемента шаблона значение автоматически меняется при изменении значения поля "Дата-время сдачи дежурства" и принимает это же значение',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Дата-время сдачи дежурства',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно. Значение по умолчанию - 08:00 текущего дня, если текущее время между 00:00 и 12:00, в противном случае 20:00 текущего дня',
  },
  {
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: 'Текущее время',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]: 'Заполнение обязательно. Значение по умолчанию - текущие дата и время',
  });
  fieldType = 'Таблица "Поезд ДР"';
  description = '';
  tableData.push({
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: '-',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: 'Таблица заполняется пользователем "вручную"',
    [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.autofill]:
      'Заполнение обязательно. При изменении данных в таблице меняется список адресатов ДСП создаваемого документа: станциям, присутствующим в таблице ДР, назначается отправка оригинала документа',
  });
  return tableData;
};
