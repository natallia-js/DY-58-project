<template>
  <div>
    <h3 id="create-order-page-description" class="dy58-help-contents-item">Страница "Создать"</h3>
    <p class="dy58-help-paragraph">
      Типы документов:
    </p>
    <p class="dy58-help-paragraph">
      <i><b>распоряжение</b></i> -
    </p>
    <p class="dy58-help-paragraph">
      <i><b>заявка</b></i> -
    </p>
    <p class="dy58-help-paragraph">
      <i><b>уведомление</b></i> -
    </p>
    <p class="dy58-help-paragraph">
      <i><b>приказ ЭЦД</b></i> -
    </p>
    <p class="dy58-help-paragraph">
      <i><b>запрещение ЭЦД</b></i> -
    </p>
    <p class="dy58-help-paragraph">
      <i><b>уведомление ЭЦД</b></i> -
    </p>
    <br />
    <p class="dy58-help-paragraph">
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
      <Column :field="ORDER_CONNECTIONS_TABLE_COLUMNS.childOrder" header="Тип документа, который можно создать на основании исходного документа"></Column>
    </DataTable>
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
