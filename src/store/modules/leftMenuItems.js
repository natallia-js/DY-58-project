export const leftMenuItems = {
  getters: {
    getCommonLeftMenuItems(_state, getters) {
      return [
        { label: 'Входящие за смену', info: getters.getNumberOfIncomingOrdersPerShift, error: getters.getErrorGettingIncomingOrdersPerShift },
        { label: 'Не подтверждено', itemClass: 'dy58-important-item', dangerInfo: getters.getIncomingOrdersNumber },
        { label: 'Документы в работе', info: getters.getWorkingOrdersNumber },
        { label: 'Не доставлено экземпляров', itemClass: 'dy58-subitem dy58-important-item', dangerInfo: getters.getNotDeliveredOrdersNumber },
        { label: 'Не подтверждено экземпляров', itemClass: 'dy58-subitem dy58-important-item', dangerInfo: getters.getNotConfirmedOrdersNumber },
      ];
    },

    getDSPLeftMenuItems(_state, getters) {
      return [
        ...getters.getCommonLeftMenuItems,
        /*{ label: 'Действующие' },
        { label: 'Не отмененные', itemClass: 'dy58-subitem' },
        { label: 'Черновики' },*/
      ];
    },

    getDNCLeftMenuItems(_state, getters) {
      return [
        ...getters.getCommonLeftMenuItems,
        { label: 'Поезда ДР', itemClass: 'dy58-subitem', info: getters.getWorkingOrdersNumberReferringSpecialTrainCategories(['ДР']) },
        { label: 'Поезда Н', itemClass: 'dy58-subitem', info: getters.getWorkingOrdersNumberReferringSpecialTrainCategories(['Н']) },
        { label: 'Поезда ПВ, ПД, ПВПД', itemClass: 'dy58-subitem', info: getters.getWorkingOrdersNumberReferringSpecialTrainCategories(['ПВ', 'ПД', 'ПВПД']) },
        { label: 'Поезда Т, Д, ТД', itemClass: 'dy58-subitem', info: getters.getWorkingOrdersNumberReferringSpecialTrainCategories(['Т', 'Д', 'ТД']) },
        { label: 'Поезда ВМ', itemClass: 'dy58-subitem', info: getters.getWorkingOrdersNumberReferringSpecialTrainCategories(['ВМ']) },
        /*{ label: 'Действующие' },
        { label: 'Ограничения по V', itemClass: 'dy58-subitem' },
        { label: 'Закрытие перегона', itemClass: 'dy58-subitem' },*/
      ];
    },

    getECDLeftMenuItems(_state, getters) {
      return [
        ...getters.getCommonLeftMenuItems,
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

    getLeftMenuItems(_state, getters) {
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
