export const leftMenuItems = {
  getters: {
    getDSPLeftMenuItems(_state, getters) {
      return [
        { label: 'Входящие за смену' },
        { label: 'Не подтверждено', itemClass: 'dy58-subitem dy58-important-item', info: getters.getIncomingOrdersNumber },
        { label: 'Документы в работе' },
        { label: 'В доставке', itemClass: 'dy58-subitem dy58-important-item' },
        { label: 'Не доставленные', itemClass: 'dy58-subitem dy58-important-item' },
        /*{ label: 'Действующие' },
        { label: 'Не отмененные', itemClass: 'dy58-subitem' },
        { label: 'Черновики' },*/
      ];
    },

    getDNCLeftMenuItems(_state, getters) {
      return [
        { label: 'Входящие за смену' },
        { label: 'Не подтверждено', itemClass: 'dy58-subitem dy58-important-item', info: getters.getIncomingOrdersNumber },
        { label: 'Распоряжения в работе' },
        { label: 'В доставке', itemClass: 'dy58-subitem dy58-important-item' },
        { label: 'Не доставленные', itemClass: 'dy58-subitem dy58-important-item' },
        /*{ label: 'Поезда ВМ' },
        { label: 'Поезда ПВ' },
        { label: 'Поезда ПД' },
        { label: 'Поезда Н' },
        { label: 'Поезда ДР' },
        { label: 'Действующие' },
        { label: 'Ограничения по V', itemClass: 'dy58-subitem' },
        { label: 'Закрытие перегона', itemClass: 'dy58-subitem' },*/
      ];
    },

    getECDLeftMenuItems(_state, getters) {
      return [
        { label: 'Входящие за смену' },
        { label: 'Не подтверждено', itemClass: 'dy58-subitem dy58-important-item', info: getters.getIncomingOrdersNumber },
        { label: 'Распоряжения в работе' },
        { label: 'В доставке', itemClass: 'dy58-subitem dy58-important-item' },
        { label: 'Не доставленные', itemClass: 'dy58-subitem dy58-important-item' },
        /*{ label: 'Действующие' },
        { label: 'Разрешение', itemClass: 'dy58-subitem' },
        { label: 'Запрещение на ЭПС', itemClass: 'dy58-subitem' },
        { label: 'Подготовка рабочего места', itemClass: 'dy58-subitem' },
        { label: 'Переключение', itemClass: 'dy58-subitem' },
        { label: 'Черновики' },
        { label: 'Разрешение', itemClass: 'dy58-subitem' },
        { label: 'Запрещение на ЭПС', itemClass: 'dy58-subitem' },*/
      ];
    },

    getLeftMenuItems(state, getters) {
      if (getters.isDSP) {
        return getters.getDSPLeftMenuItems;
      } else if (getters.isDNC) {
        return getters.getDNCLeftMenuItems;
      } else if (getters.isECD) {
        return getters.getECDLeftMenuItems;
      }
      return [];
    },
  },
};
