export const ORDER_RECEIVERS_TABLE_COLUMNS = {
  orderCreator: 'orderCreator',
  orderType: 'orderType',
  orderReceivers: 'orderReceivers',
};

export const orderReceiversTableData = [
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
