export const leftMenuItems = {
  getters: {
    getCommonLeftMenuItems(_state, getters) {
      return [
        {
          label: 'Входящие за смену',
          info: getters.getNumberOfIncomingOrdersPerShift,
          error: getters.getErrorGettingIncomingOrdersPerShift,
          icon: getters.getGettingIncomingOrdersPerShiftStatus ? 'pi pi-spin pi-spinner' : null,
        },
        {
          label: 'Не подтверждено',
          itemClass: 'dy58-important-item',
          dangerInfo: getters.getIncomingOrdersNumber,
        },
        {
          label: 'Документы в работе',
          info: getters.getWorkingOrdersNumber,
        },
        {
          label: 'Не доставлено экземпляров',
          itemClass: 'dy58-subitem dy58-important-item',
          dangerInfo: getters.getNotDeliveredNotConfirmedOrdersNumber,
        },
        {
          label: 'Не доставлено, подтверждено экземпляров',
          itemClass: 'dy58-subitem',
          dangerInfo: getters.getNotDeliveredButConfirmedOrdersNumber,
        },
        {
          label: 'Не подтверждено экземпляров',
          itemClass: 'dy58-subitem dy58-important-item',
          dangerInfo: getters.getDeliveredButNotConfirmedOrdersNumber,
        },
      ];
    },

    getDSPLeftMenuItems(_state, getters) {
      return [
        ...getters.getCommonLeftMenuItems,
      ];
    },

    getDNCLeftMenuItems(_state, getters) {
      return [
        ...getters.getCommonLeftMenuItems,
        {
          label: 'Поезда ДР',
          itemClass: 'dy58-subitem',
          info: getters.getWorkingOrdersNumberReferringSpecialTrainCategories(['ДР']),
        },
        {
          label: 'Поезда Н',
          itemClass: 'dy58-subitem',
          info: getters.getWorkingOrdersNumberReferringSpecialTrainCategories(['Н']),
        },
        {
          label: 'Поезда ПВ, ПД, ПВПД',
          itemClass: 'dy58-subitem',
          info: getters.getWorkingOrdersNumberReferringSpecialTrainCategories(['ПВ', 'ПД', 'ПВПД']),
        },
        {
          label: 'Поезда ВМ',
          itemClass: 'dy58-subitem',
          info: getters.getWorkingOrdersNumberReferringSpecialTrainCategories(['ВМ']),
        },
      ];
    },

    getECDLeftMenuItems(_state, getters) {
      return [
        ...getters.getCommonLeftMenuItems,
      ];
    },

    getLeftMenuItems(_state, getters) {
      if (getters.isDSP_or_DSPoperator) {
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
