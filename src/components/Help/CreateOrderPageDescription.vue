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
    <p class="dy58-help-paragraph">
      Связанные документы объединяются в так называемую <i><b>цепочку документов</b></i>.
      Цепочка может состоять из произвольного числа логически связанных документов.
      В простейшем случае, цепочка состоит из одного документа (когда он не связан ни с каким другим документом).
      Время начала действия первого документа цепочки определяет время начала действия самой цепочки,
      время окончания действия последнего документа цепочки определяет время окончания действия этой цепочки.
      В рамках цепочки
    </p>
    <br />
    <DataTable
      :value="orderReceiversTableData"
      rowGroupMode="rowspan"
      :groupRowsBy="ORDER_RECEIVERS_TABLE_COLUMNS.orderCreator"
      class="p-datatable-sm"
    >
      <template #header>
        <div>Таблица 2</div>
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
        ORDER_RECEIVERS_TABLE_COLUMNS,
        orderConnectionsTableData,
        orderReceiversTableData,
      };
    }
  }
</script>
