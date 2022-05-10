export const ORDER_CONNECTIONS_TABLE_COLUMNS = {
  baseOrder: 'baseOrder',
  whoCanCreate: 'whoCanCreate',
  childOrder: 'childOrder',
};

export const orderConnectionsTableData = [
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
    [ORDER_CONNECTIONS_TABLE_COLUMNS.baseOrder]: 'приказ ЭЦД (кроме циркулярного)',
    [ORDER_CONNECTIONS_TABLE_COLUMNS.whoCanCreate]: 'ЭЦД',
    [ORDER_CONNECTIONS_TABLE_COLUMNS.childOrder]: 'уведомление ЭЦД',
  },
  {
    [ORDER_CONNECTIONS_TABLE_COLUMNS.baseOrder]: 'запрещение ЭЦД',
    [ORDER_CONNECTIONS_TABLE_COLUMNS.whoCanCreate]: 'ЭЦД',
    [ORDER_CONNECTIONS_TABLE_COLUMNS.childOrder]: 'уведомление ЭЦД',
  },
];