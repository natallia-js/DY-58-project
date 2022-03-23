import { store } from '@/store';
import {
  SHOW_APP_SETTINGS,
  SHOW_ORDER_DRAFTS,
  SET_CAN_EDIT_EXISTING_TAKE_DUTY_ORDER,
  SET_SHOW_CREATE_DSP_TAKE_DUTY_ORDER_DLG,
} from '@/store/mutation-types';
import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';


export const leftMenuItems = {
  getters: {
    getCommonLeftMenuItemsAtTheBeginning(_state, getters) {
      return [
        {
          label: 'Входящие за смену',
          info: getters.getNumberOfIncomingOrdersPerShift,
          error: getters.getErrorGettingIncomingOrdersPerShift,
          icon: getters.getGettingIncomingOrdersPerShiftStatus ? 'pi pi-spin pi-spinner' : null,
          imgURL: require('@/assets/img/incomingOrdersPerShift.png'),
          tagPosition: 'top',
        },
        {
          label: 'Не подтверждено',
          itemClass: 'dy58-important-item',
          dangerInfo: getters.getIncomingOrdersNumber,
          imgURL: require('@/assets/img/notConfirmed.png'),
          tagPosition: 'top',
        },
        {
          label: 'Документы в работе',
          info: getters.getWorkingOrdersNumber,
          imgURL: require('@/assets/img/ordersInWork.png'),
          tagPosition: 'top',
        },
      ];
    },

    getCommonLeftMenuItemsAtTheEnd() {
      return [
        {
          label: 'Настройки программы',
          imgURL: require('@/assets/img/settings.png'),
          command: (event) => {
            store.commit(SHOW_APP_SETTINGS, { show: !store.getters.appSettingsVisible, target: event });
          },
        },
      ];
    },

    getDSPLeftMenuItems(_state, getters) {
      const items = [];
      if (getters.canUserDispatchDSPTakeDutyOrder) {
        items.push({
          label: 'Запись о приеме/сдаче дежурства',
          imgURL: require('@/assets/img/takePassDuty.png'),
          command: () => {
            store.commit(SET_CAN_EDIT_EXISTING_TAKE_DUTY_ORDER, false);
            store.commit(SET_SHOW_CREATE_DSP_TAKE_DUTY_ORDER_DLG, true);
          },
        });
      }
      if (getters.canUserDispatchDSPTakeDutyOrder && getters.getExistingDSPTakeDutyOrder) {
        items.push({
          label: 'Редактировать текущую запись о приеме/сдаче дежурства',
          imgURL: require('@/assets/img/editTakePassDuty.png'),
          command: () => {
            store.commit(SET_CAN_EDIT_EXISTING_TAKE_DUTY_ORDER, true);
            store.commit(SET_SHOW_CREATE_DSP_TAKE_DUTY_ORDER_DLG, true);
          },
        });
      }
      return [
        ...items,
        ...getters.getCommonLeftMenuItemsAtTheBeginning,
        ...getters.getCommonLeftMenuItemsAtTheEnd,
      ];
    },

    getDNCLeftMenuItems(_state, getters) {
      return [
        ...getters.getCommonLeftMenuItemsAtTheBeginning,
        {
          label: 'Поезда ДР',
          itemClass: 'dy58-subitem',
          info: getters.getWorkingOrdersNumberReferringSpecialTrainCategories(['ДР']),
          imgURL: require('@/assets/img/DR.png'),
          tagPosition: 'bottom',
        },
        {
          label: 'Поезда Н',
          itemClass: 'dy58-subitem',
          info: getters.getWorkingOrdersNumberReferringSpecialTrainCategories(['Н']),
          imgURL: require('@/assets/img/N.png'),
          tagPosition: 'bottom',
        },
        {
          label: 'Поезда ПВ, ПД, ПВПД',
          itemClass: 'dy58-subitem',
          info: getters.getWorkingOrdersNumberReferringSpecialTrainCategories(['ПВ', 'ПД', 'ПВПД']),
          imgURL: require('@/assets/img/P.png'),
          tagPosition: 'bottom',
        },
        {
          label: 'Поезда ВМ',
          itemClass: 'dy58-subitem',
          info: getters.getWorkingOrdersNumberReferringSpecialTrainCategories(['ВМ']),
          imgURL: require('@/assets/img/VM.png'),
          tagPosition: 'bottom',
        },
        ...getters.getCommonLeftMenuItemsAtTheEnd,
      ];
    },

    getECDLeftMenuItems(_state, getters) {
      return [
        ...getters.getCommonLeftMenuItemsAtTheBeginning,
        {
          label: 'Черновики документов',
          info: getters.getAllOrderDraftsNumber,
          imgURL: require('@/assets/img/drafts.png'),
          command: (event) => {
            store.commit(SHOW_ORDER_DRAFTS, { show: !store.getters.orderDraftsPanelVisible, target: event });
          },
        },
        ...getters.getCommonLeftMenuItemsAtTheEnd,
      ];
    },

    getLeftMenuItems(_state, getters) {
      if (getters.isDSP_or_DSPoperator || (getters.isRevisor && getters.getUserWorkPoligon.type === WORK_POLIGON_TYPES.STATION)) {
        return getters.getDSPLeftMenuItems;
      } else if (getters.isDNC || (getters.isRevisor && getters.getUserWorkPoligon.type === WORK_POLIGON_TYPES.DNC_SECTOR)) {
        return getters.getDNCLeftMenuItems;
      } else if (getters.isECD || (getters.isRevisor && getters.getUserWorkPoligon.type === WORK_POLIGON_TYPES.ECD_SECTOR)) {
        return getters.getECDLeftMenuItems;
      }
      return [];
    },
  },
};
