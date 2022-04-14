<template>
  <div>
    <h3 id="create-order-page-description" class="dy58-help-contents-item">Страница "Создать"</h3>
    <p class="dy58-help-paragraph">
      Типы документов, которые позволяет создавать ДУ-58:
    </p>
    <p class="dy58-help-paragraph">
      <i><b>распоряжение</b></i> - может создавать только ДНЦ
    </p>
    <p class="dy58-help-paragraph">
      <i><b>заявка</b></i> - может создавать ДСП и ДНЦ
    </p>
    <p class="dy58-help-paragraph">
      <i><b>уведомление</b></i> - может создавать ДСП и ДНЦ
    </p>
    <p class="dy58-help-paragraph">
      <i><b>приказ ЭЦД</b></i> - может создавать только ЭЦД
    </p>
    <p class="dy58-help-paragraph">
      <i><b>запрещение ЭЦД</b></i> - может создавать только ЭЦД
    </p>
    <p class="dy58-help-paragraph">
      <i><b>уведомление ЭЦД</b></i> - может создавать только ЭЦД
    </p>
    <p class="dy58-help-paragraph">
      Для создания каждого из указанных типов документов на странице существует отдельная вкладка с
      одноименным названием. Страница создания каждого типа документа разделена на два блока:
      левый содержит поля для ввода всей информации о документе, кроме его адресатов, правый блок
      предназначен для определения адресатов создаваемого документа. Рассмотрим их подробнее.
    </p>
    <p class="dy58-help-paragraph">
      Поля <i><b>левого блока</b></i>:
    </p>
    <p class="dy58-help-paragraph">
      - <i><b>Номер</b></i> - номер создаваемого документа. Система генерирует его автоматически, увеличивая
      на 1 номер последнего изданного документа этого же типа. С наступлением нового месяца происходит сброс
      нумерации: все создаваемые типы документов будут нумероваться с 1. Поле номера документа недоступно
      для редактирования. Однако если понадобится создать документ с номером, отличным от того, который
      система предлагает по умолчанию, можно нарушить текущую нумерацию документов данного типа, нажав на
      кнопку <Button icon="pi pi-times-circle" class="p-button-outlined dy58-addon-button" />, расположенную
      рядом с полем номера документа. Введенный в выпадающем окне номер будет присвоен создаваемому документу.
      Система запомнит этот номер как последний номер, присвоенный документу данного типа. При издании
      следующего документа этого же типа она по умолчанию присвоит ему номер, который будет на 1 больше.
    </p>
    <p class="dy58-help-paragraph">
      Если на полигоне управления оборудовано более 1 рабочего места с ДУ-58, при этом необходимо вести
      единый журнал документов, с единой нумерацией, то при создании документа необходимо производить
      синхронизацию номеров с сервером. Для этой цели служит кнопка
      <Button icon="pi pi-refresh" class="p-button-outlined dy58-addon-button" />, расположенная справа от
      поля ввода номера документа. При нажатии на эту кнопку ДУ-58 запрашивает у сервера номера последних
      изданных на текущем рабочем полигоне распоряжений (всех типов), запоминает их и при формировании
      нового документа использует их для автоматического присвоения ему номера по вышеупомянутому
      алгоритму (с увеличением на 1).
    </p>
    <p class="dy58-help-paragraph">
      - <i><b>Дата и время создания</b></i> - время создания документа. Данное поле недоступно для
      редактирования. ДУ-58 фиксирует в нем текущее системное время и использует его для передачи
      серверу времени отправки запроса о создании документа.
    </p>
    <p class="dy58-help-paragraph">
      - <i><b>Текущий черновик документа</b></i> - только для ЭЦД: позволяет выбрать ранее созданный
      черновик документа для его редактирования / издания на основании его документа.
      После выбора черновика происходит автоматическое заполнение полей формы соответствующими значениями,
      хранящимися в черновике (кроме поля "На документ" - см. ниже).
    </p>
    <p class="dy58-help-paragraph">
      - <i><b>На документ</b></i> / <i><b>На приказ/запрещение</b></i> - позволяет связать создаваемый
      документ с ранее изданным документом.
      Ниже приведена таблица, в которой содержится информация о возможностях пользователей с конкретными
      полномочиями создавать документы в связке с ранее созданными документами.
    </p>
    <br />
    <DataTable
      :value="orderConnectionsTableData"
      rowGroupMode="rowspan"
      :groupRowsBy="ORDER_CONNECTIONS_TABLE_COLUMNS.baseOrder"
      class="p-datatable-sm"
    >
      <template #header>
        <div>Таблица 1</div>
      </template>
      <Column :field="ORDER_CONNECTIONS_TABLE_COLUMNS.baseOrder" header="Тип исходного документа"></Column>
      <Column :field="ORDER_CONNECTIONS_TABLE_COLUMNS.whoCanCreate" header="Полномочия пользователя"></Column>
      <Column :field="ORDER_CONNECTIONS_TABLE_COLUMNS.childOrder" header="Тип документа, который можно создать в связке с исходным документом"></Column>
    </DataTable>
    <br />
    <p class="dy58-help-text">
      Связанные документы объединяются в так называемую цепочку документов.
    </p>
    <div class="dy58-help-definition">
      <i><b>Цепочка документов</b></i> - произвольное число логически и хронологически связанных документов.
    </div>
    <p class="dy58-help-text">
      В простейшем случае, цепочка состоит из одного документа (когда он не связан ни с каким другим документом).
      Время начала действия первого документа цепочки определяет время начала действия самой цепочки,
      время окончания действия последнего документа цепочки определяет время окончания действия этой цепочки.
      В рамках цепочки одни документы могут быть действующими, другие - нет. Общее правило системы по определению
      действующего документа:
    </p>
    <div class="dy58-help-definition">
      <p class="dy58-help-text">
        <i><b>Действующий документ</b></i> - такой документ, для которого выполняются следующие условия:
        <ol class="dy58-help-list">
          <li>
            <span>
              действует до отмены, либо дата окончания его действия еще не наступила, либо дата начала действия
              документа еще не наступила;
            </span>
          </li>
          <li>
            <span>
              в рамках цепочки распоряжений только последнее распоряжение ДНЦ может рассматриваться как
              действующее / недействующее (см. п.1), все предшествующие ему распоряжения ДНЦ автоматически
              становятся недействующими;
            </span>
          </li>
          <li>
            <span>
              в рамках цепочки распоряжений только 1 заявка (последняя) считается действующей при условии, что
              в цепочке документов за ней (не обязательно сразу) не следует уведомление;
            </span>
          </li>
          <li>
            <span>
              приказы ЭЦД и запрещения ЭЦД, за которыми следует уведомление ЭЦД, считаются недействующими;
            </span>
          </li>
          <li>
            <span>
              уведомление / уведомление ЭЦД считается действующим только если оно в цепочке распоряжений является
              последним документом.
            </span>
          </li>
        </ol>
      </p>
    </div>
    <p class="dy58-help-text">
      При издании уведомления ЭЦД заполнение поля "На приказ/запрещение" обязательно, при этом после выбора
      приказа / запрещения необходимо определить дату-время, начиная с которых отменяется действие соответствующего
      документа.
    </p>
    <p class="dy58-help-paragraph">
      Если текст документа, определяемого для связи с новым документом, создан по шаблону и текст
      нового документа тоже создается по шаблону, причем между элементами этих шаблонов есть взамосвязь, то
      значения полей "связанного" документа устанавливаются в качестве значений соответствующих "связанных"
      полей шаблона создаваемого документа.
    </p>
    <p class="dy58-help-paragraph">
      - <i><b>Место действия</b></i> - в явном виде определить место действия документа можно только у приказов ЭЦД
      и запрещений ЭЦД (по умолчанию место действия не указывается).
      Неявно место действия документа определяется самой системой для распоряжений о закрытии и открытии перегона.
      Для этих типов распоряжений указание места действия является обязательным!
      Поэтому важно, чтобы распоряжение издавалось по шаблону.
      Если шаблон документа содержит элемент со смысловым значением 'Станция', 'Станция отправления' либо
      'Станция прибытия', то значение первого такого элемента шаблона полагается местом действия распоряжения.
      Если в шаблоне распоряжения нет ни одного элемента с указанными выше смысловыми значениями, то ищется элемент
      со смысловым значением 'Перегон' либо 'Перегон станции отправления'. Если он будет найден, то значение
      первого такого элемента шаблона полагается местом действия распоряжения. Если найден не будет, то место действия
      документа полагается неизвестным.
    </p>
    <p class="dy58-help-paragraph">
      - <i><b>Время действия</b></i> - в явном виде определить время действия документа в системе нельзя.
      Неявно время действия документа определяется самой системой и зависит от типа документа:
    </p>
    <p class="dy58-help-paragraph">
      для <i><b>распоряжений</b></i> время начала действия документа в системе по умолчанию полагается равным времени издания
      документа, время окончания действия равно времени начала действия; исключение составляют лишь распоряжения
      о закрытии и открытии перегона; для распоряжения о закрытии перегона время начала действия берется из
      шаблона документа (элемент со смысловым значением 'Дата-время закрытия перегона'), время окончания действия -
      "до отмены"; для распоряжения об открытии перегона времена начала и окончания действия определяются значением,
      указанным в элементе шаблона, имеющем смысловое значение 'Дата-время открытия перегона';
    </p>
    <p class="dy58-help-paragraph">
      для <i><b>заявок</b></i>, <i><b>уведомлений</b></i>, <i><b>приказов ЭЦД</b></i>, <i><b>запрещений ЭЦД</b></i>
      время начала действия документа в системе по умолчанию полагается равным времени
      издания документа, время окончания действия - "до отмены";
    </p>
    <p class="dy58-help-paragraph">
      для <i><b>уведомлений ЭЦД</b></i> время начала действия документа в системе равно времени окончания
      действия и определяется датой-временем отмены соответствующего приказа / запрещения.
    </p>
    <p class="dy58-help-paragraph">
      - <i><b>Текст документа</b></i> - его основное содержание. Система предоставляет возможность выбрать
      существующий шаблон документа либо определить наименование и текст документа самостоятельно. Для этих
      целей в соответствующем блоке необходимо установить нужный переключатель.
    </p>
    <p class="dy58-help-paragraph">
      Рассмотрим вначале текст документа, формируемый без шаблона. Данный текст вводится в соответствующее
      поле, высоту которого можно менять вручную (мышью, с помощью правого нижнего угла поля). Чтобы текст
      "бесшаблонного" документа не представлял собою сплошную строку, над областью ввода текста присутствует
      кнопка "Вставить перенос строки", добавляющая в формируемый текст документа специальный тег, который
      в дальнейшем при отображении текста документа будет трактоваться системой как "перенос строки".
    </p>
    <p class="dy58-help-paragraph">
      Если текст документа необходимо сформировать на основании шаблона, то этот шаблон необходимо предварительно
      выбрать в соответствующем списке. Поля шаблона делятся на статические (тест и перенос строки) и
      динамические (поля ввода). Динамические поля предназначены для ввода в них определенных значений.
      За динамически полем может быть закреплено смысловое значение (отображается при наведении на поле ввода),
      которое определяет, какая конкретно информация содержится в данном поле.
      Виды динамических полей, возможные их смысловые значения, способы заполнения полей и влияние их на
      другие динамические поля шаблона представлены в таблице 2.
    </p>
    <br />
    <DataTable
      :value="dynamicOrderPatternFieldsTableData()"
      rowGroupMode="rowspan"
      :groupRowsBy="[DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType, DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]"
      class="p-datatable-sm"
    >
      <template #header>
        <div>Таблица 2</div>
      </template>
      <Column :field="DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType" header="Вид динамического поля"></Column>
      <Column :field="DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description" header="Описание"></Column>
      <Column :field="DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues" header="Смысловые значения"></Column>
      <Column :field="DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription" header="Описание смыслового значения"></Column>
    </DataTable>
    <br />
    <DataTable
      :value="orderReceiversTableData"
      rowGroupMode="rowspan"
      :groupRowsBy="ORDER_RECEIVERS_TABLE_COLUMNS.orderCreator"
      class="p-datatable-sm"
    >
      <template #header>
        <div>Таблица 3</div>
      </template>
      <Column :field="ORDER_RECEIVERS_TABLE_COLUMNS.orderCreator" header="Полномочия пользователя"></Column>
      <Column :field="ORDER_RECEIVERS_TABLE_COLUMNS.orderType" header="Тип создаваемого документа"></Column>
      <Column :field="ORDER_RECEIVERS_TABLE_COLUMNS.orderReceivers" header="Возможные получатели документа"></Column>
      <template #footer>
        <small>* данные лица не получат документ, они лишь присутствуют в тексте документа</small>
      </template>
    </DataTable>
  </div>
</template>

<script>
  const ORDER_CONNECTIONS_TABLE_COLUMNS = {
    baseOrder: 'baseOrder',
    whoCanCreate: 'whoCanCreate',
    childOrder: 'childOrder',
  };
  const DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS = {
    fieldType: 'fieldType',
    description: 'description',
    senceValues: 'senceValues',
    senceValueDescription: 'senceValueDescription',
  };
  const ORDER_RECEIVERS_TABLE_COLUMNS = {
    orderCreator: 'orderCreator',
    orderType: 'orderType',
    orderReceivers: 'orderReceivers',
  };

  export default {
    name: 'dy58-create-order-page-description',

    setup() {
      const orderConnectionsTableData = [
        {
          [ORDER_CONNECTIONS_TABLE_COLUMNS.baseOrder]: 'распоряжение на закрытие перегона',
          [ORDER_CONNECTIONS_TABLE_COLUMNS.whoCanCreate]: 'ДНЦ',
          [ORDER_CONNECTIONS_TABLE_COLUMNS.childOrder]: 'распоряжение, заявка, уведомление',
        },
        {
          [ORDER_CONNECTIONS_TABLE_COLUMNS.baseOrder]: 'распоряжение на закрытие перегона',
          [ORDER_CONNECTIONS_TABLE_COLUMNS.whoCanCreate]: 'ДСП',
          [ORDER_CONNECTIONS_TABLE_COLUMNS.childOrder]: 'заявка, уведомление',
        },
        {
          [ORDER_CONNECTIONS_TABLE_COLUMNS.baseOrder]: 'распоряжение на закрытие перегона',
          [ORDER_CONNECTIONS_TABLE_COLUMNS.whoCanCreate]: 'ЭЦД',
          [ORDER_CONNECTIONS_TABLE_COLUMNS.childOrder]: 'запрещение',
        },
        {
          [ORDER_CONNECTIONS_TABLE_COLUMNS.baseOrder]: 'заявка',
          [ORDER_CONNECTIONS_TABLE_COLUMNS.whoCanCreate]: 'ДНЦ',
          [ORDER_CONNECTIONS_TABLE_COLUMNS.childOrder]: 'распоряжение, заявка, уведомление',
        },
        {
          [ORDER_CONNECTIONS_TABLE_COLUMNS.baseOrder]: 'заявка',
          [ORDER_CONNECTIONS_TABLE_COLUMNS.whoCanCreate]: 'ДСП',
          [ORDER_CONNECTIONS_TABLE_COLUMNS.childOrder]: 'заявка, уведомление',
        },
        {
          [ORDER_CONNECTIONS_TABLE_COLUMNS.baseOrder]: 'уведомление',
          [ORDER_CONNECTIONS_TABLE_COLUMNS.whoCanCreate]: 'ДНЦ',
          [ORDER_CONNECTIONS_TABLE_COLUMNS.childOrder]: 'распоряжение',
        },
        {
          [ORDER_CONNECTIONS_TABLE_COLUMNS.baseOrder]: 'приказ ЭЦД',
          [ORDER_CONNECTIONS_TABLE_COLUMNS.whoCanCreate]: 'ЭЦД',
          [ORDER_CONNECTIONS_TABLE_COLUMNS.childOrder]: 'уведомление ЭЦД',
        },
        {
          [ORDER_CONNECTIONS_TABLE_COLUMNS.baseOrder]: 'запрещение ЭЦД',
          [ORDER_CONNECTIONS_TABLE_COLUMNS.whoCanCreate]: 'ЭЦД',
          [ORDER_CONNECTIONS_TABLE_COLUMNS.childOrder]: 'уведомление ЭЦД',
        },
      ];

      const dynamicOrderPatternFieldsTableData = () => {
        const tableData = [];
        let fieldType = 'Поле ввода';
        let description = 'Значение в данное поле пользователь вводит самостоятельно, никаких проверок на корректность введенного значения нет.';
        tableData.push({
          [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
          [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
          [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: '',
          [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '',
        });
        fieldType = 'Текстовая область';
        description = 'Предполагает ввод со стороны пользователя текста произвольной длины. ' +
          'Размер поля "подстраивается" под размер содержащихся в нем данных. ' +
          'ДУ-58 позволяет не заполнять данное поле.';
        tableData.push({
          [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
          [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
          [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: '-',
          [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '-',
        });
        fieldType = 'Выпадающий список';
        description = '';
        tableData.push({
          [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
          [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
          [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: '',
          [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '',
        });
        fieldType = 'Дата';
        description = '';
        tableData.push({
          [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
          [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
          [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: '',
          [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '',
        });
        fieldType = 'Время';
        description = '';
        tableData.push({
          [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
          [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
          [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: '',
          [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '',
        });
        fieldType = 'Дата-время';
        description = '';
        tableData.push({
          [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
          [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
          [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: '',
          [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '',
        });
        fieldType = 'Таблица "Поезд ДР"';
        description = '';
        tableData.push({
          [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.fieldType]: fieldType,
          [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.description]: description,
          [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValues]: '',
          [DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS.senceValueDescription]: '',
        });
        return tableData;
      };

      const orderReceiversTableData = [
        {
          [ORDER_RECEIVERS_TABLE_COLUMNS.orderCreator]: 'ДНЦ',
          [ORDER_RECEIVERS_TABLE_COLUMNS.orderType]: 'распоряжение',
          [ORDER_RECEIVERS_TABLE_COLUMNS.orderReceivers]: 'ДСП (станций участка), ДНЦ (смежных участков), ЭЦД (ближайших участков), иные адресаты*',
        },
        {
          [ORDER_RECEIVERS_TABLE_COLUMNS.orderCreator]: 'ДНЦ',
          [ORDER_RECEIVERS_TABLE_COLUMNS.orderType]: 'заявка',
          [ORDER_RECEIVERS_TABLE_COLUMNS.orderReceivers]: 'ДСП (станций участка), иные адресаты*',
        },
        {
          [ORDER_RECEIVERS_TABLE_COLUMNS.orderCreator]: 'ДНЦ',
          [ORDER_RECEIVERS_TABLE_COLUMNS.orderType]: 'уведомление',
          [ORDER_RECEIVERS_TABLE_COLUMNS.orderReceivers]: 'ЭЦД (ближайших участков), иные адресаты*',
        },
        {
          [ORDER_RECEIVERS_TABLE_COLUMNS.orderCreator]: 'ДСП',
          [ORDER_RECEIVERS_TABLE_COLUMNS.orderType]: 'заявка',
          [ORDER_RECEIVERS_TABLE_COLUMNS.orderReceivers]: 'ДСП (смежных станций), ДНЦ (соответствующего участка), иные адресаты*',
        },
        {
          [ORDER_RECEIVERS_TABLE_COLUMNS.orderCreator]: 'ДСП',
          [ORDER_RECEIVERS_TABLE_COLUMNS.orderType]: 'уведомление',
          [ORDER_RECEIVERS_TABLE_COLUMNS.orderReceivers]: 'ДНЦ (соответствующего участка), ЭЦД (соответствующего участка), иные адресаты*',
        },
        {
          [ORDER_RECEIVERS_TABLE_COLUMNS.orderCreator]: 'ЭЦД',
          [ORDER_RECEIVERS_TABLE_COLUMNS.orderType]: 'приказ ЭЦД',
          [ORDER_RECEIVERS_TABLE_COLUMNS.orderReceivers]: 'ДСП (станций участка), ДНЦ (ближайших участков), ЭЦД (смежных участков), иные адресаты*',
        },
        {
          [ORDER_RECEIVERS_TABLE_COLUMNS.orderCreator]: 'ЭЦД',
          [ORDER_RECEIVERS_TABLE_COLUMNS.orderType]: 'запрещение ЭЦД',
          [ORDER_RECEIVERS_TABLE_COLUMNS.orderReceivers]: 'ДСП (станций участка), ДНЦ (ближайших участков), ЭЦД (смежных участков), иные адресаты*',
        },
        {
          [ORDER_RECEIVERS_TABLE_COLUMNS.orderCreator]: 'ЭЦД',
          [ORDER_RECEIVERS_TABLE_COLUMNS.orderType]: 'уведомление ЭЦД',
          [ORDER_RECEIVERS_TABLE_COLUMNS.orderReceivers]: 'ДСП (станций участка), ДНЦ (ближайших участков), ЭЦД (смежных участков), иные адресаты*',
        },
      ];

      return {
        ORDER_CONNECTIONS_TABLE_COLUMNS,
        DYNAMIC_ORDER_PATTERN_FIELDS_TABLE_COLUMNS,
        ORDER_RECEIVERS_TABLE_COLUMNS,
        orderConnectionsTableData,
        dynamicOrderPatternFieldsTableData,
        orderReceiversTableData,
      };
    }
  }
</script>
