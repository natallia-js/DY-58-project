import { store } from '@/store';
import {
  SHOW_APP_SETTINGS,
  SHOW_ORDER_DRAFTS,
  SET_CAN_EDIT_EXISTING_TAKE_DUTY_ORDER,
  SET_SHOW_CREATE_DSP_TAKE_DUTY_ORDER_DLG,
} from '@/store/mutation-types';
import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';
import {
  SPECIAL_CIRCULAR_ORDER_SIGN,
  SPECIAL_DR_ORDER_SIGN,
  SPECIAL_VM_ORDER_SIGN,
  SPECIAL_N_ORDER_SIGN,
  SPECIAL_PV_ORDER_SIGN,
  SPECIAL_PD_ORDER_SIGN,
  SPECIAL_PVPD_ORDER_SIGN,
  SPECIAL_SP_ORDER_SIGN,
  SPECIAL_TY_ORDER_SIGN,
} from '@/constants/orderPatterns';
import { createOrderOfGivenType, createECDOrderOfGivenType } from '@/additional/createOrderOfGivenType';


function createSpecialTrainCategoryItemCommand({ specialOrderPatterns, specialOrdersSign, itemsCommandCallback }) {
  if (!specialOrderPatterns?.length) {
    return () => {};
  }
  if (specialOrderPatterns.length == 1) {
    return () => itemsCommandCallback({ orderPatternId: null, orderSign: specialOrdersSign });
  }
  return () => specialOrderPatterns.map((pattern) => {
    return {
      label: `${pattern.category}. ${pattern.title}`,
      command: () => itemsCommandCallback({ orderPatternId: pattern._id, orderSign: specialOrdersSign}),
    };
  });
}


export const leftMenuItems = {
  getters: {
    /**
     *
     */
    getCommonLeftMenuItemsAtTheBeginning(_state, getters) {
      return [
        {
          label: 'Входящие за смену',
          info: getters.getNumberOfIncomingOrdersPerShift,
          error: getters.getErrorGettingIncomingOrdersPerShift,
          icon: getters.getGettingIncomingOrdersPerShiftStatus ? 'pi pi-spin pi-spinner' : null,
          imgURL: require('@/assets/img/incomingOrdersPerShift.png'),
        },
        {
          label: 'Не подтверждено',
          itemClass: 'dy58-important-item',
          dangerInfo: getters.getIncomingOrdersNumber,
          imgURL: require('@/assets/img/notConfirmed.png'),
        },
        {
          label: 'Документы в работе',
          info: getters.getWorkingOrdersNumber,
          imgURL: require('@/assets/img/ordersInWork.png'),
        },
      ];
    },

    /**
     *
     */
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

    /**
     *
     */
    getDSPLeftMenuItems(_state, getters) {
      const items = [];
      if (getters.canUserDispatchDSPTakeDutyOrder) {
        items.push({
          label: 'Смена',
          imgURL: require('@/assets/img/takePassDuty.png'),
          command: () => {
            store.commit(SET_CAN_EDIT_EXISTING_TAKE_DUTY_ORDER, false);
            store.commit(SET_SHOW_CREATE_DSP_TAKE_DUTY_ORDER_DLG, true);
          },
        });
      }
      // Редактировать распоряжение о приеме-сдаче дежурства может лишь его создатель
      const existingDSPTakeDutyOrder = getters.getExistingDSPTakeDutyOrder;
      if (getters.canUserDispatchDSPTakeDutyOrder && existingDSPTakeDutyOrder &&
        existingDSPTakeDutyOrder.creator && existingDSPTakeDutyOrder.creator.id === getters.getUserId) {
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

    /**
     *
     */
    getDNCLeftMenuItems(_state, getters) {
      const items = [];
      let specialOrderPatterns = [];
      if (getters.canUserDispatchDNCTakeDutyOrder) {
        specialOrderPatterns = getters.getOrderPatternsReferringSpecialTrainCategories([SPECIAL_CIRCULAR_ORDER_SIGN]);
        if (specialOrderPatterns.length > 0) {
          items.push({
            label: 'Циркулярное распоряжение',
            imgURL: require('@/assets/img/takePassDuty.png'),
            command: createSpecialTrainCategoryItemCommand({ specialOrderPatterns, specialOrdersSign: SPECIAL_CIRCULAR_ORDER_SIGN, itemsCommandCallback: createOrderOfGivenType }),
          });
        }
      }
      items.push(...getters.getCommonLeftMenuItemsAtTheBeginning);
      specialOrderPatterns = getters.getOrderPatternsReferringSpecialTrainCategories([SPECIAL_DR_ORDER_SIGN]);
      if (specialOrderPatterns.length > 0) {
        items.push({
          label: `Создать распоряжение о поезде ${SPECIAL_DR_ORDER_SIGN}`,
          info: getters.getWorkingOrdersNumberReferringSpecialTrainCategories([SPECIAL_DR_ORDER_SIGN]),
          imgURL: require('@/assets/img/DR.png'),
          command: createSpecialTrainCategoryItemCommand({ specialOrderPatterns, specialOrdersSign: SPECIAL_DR_ORDER_SIGN, itemsCommandCallback: createOrderOfGivenType }),
        });
      }
      specialOrderPatterns = getters.getOrderPatternsReferringSpecialTrainCategories([SPECIAL_N_ORDER_SIGN]);
      if (specialOrderPatterns.length > 0) {
        items.push({
          label: `Создать распоряжение о поезде ${SPECIAL_N_ORDER_SIGN}`,
          info: getters.getWorkingOrdersNumberReferringSpecialTrainCategories([SPECIAL_N_ORDER_SIGN]),
          imgURL: require('@/assets/img/N.png'),
          command: createSpecialTrainCategoryItemCommand({ specialOrderPatterns, specialOrdersSign: SPECIAL_N_ORDER_SIGN, itemsCommandCallback: createOrderOfGivenType }),
        });
      }
      specialOrderPatterns = getters.getOrderPatternsReferringSpecialTrainCategories([SPECIAL_PV_ORDER_SIGN, SPECIAL_PD_ORDER_SIGN, SPECIAL_PVPD_ORDER_SIGN, SPECIAL_SP_ORDER_SIGN]);
      if (specialOrderPatterns.length > 0) {
        items.push({
          label: `Создать распоряжение о поезде ${SPECIAL_PV_ORDER_SIGN} / ${SPECIAL_PD_ORDER_SIGN} / ${SPECIAL_PVPD_ORDER_SIGN} / ${SPECIAL_SP_ORDER_SIGN}`,
          info: getters.getWorkingOrdersNumberReferringSpecialTrainCategories([
            SPECIAL_PV_ORDER_SIGN, SPECIAL_PD_ORDER_SIGN, SPECIAL_PVPD_ORDER_SIGN]),
          imgURL: require('@/assets/img/P.png'),
          command: () => {
            return [
              { label: SPECIAL_PV_ORDER_SIGN, command: () => createOrderOfGivenType({ orderPatternId: null, orderSign: SPECIAL_PV_ORDER_SIGN }) },
              { label: SPECIAL_PD_ORDER_SIGN, command: () => createOrderOfGivenType({ orderPatternId: null, orderSign: SPECIAL_PD_ORDER_SIGN }) },
              { label: SPECIAL_PVPD_ORDER_SIGN, command: () => createOrderOfGivenType({ orderPatternId: null, orderSign: SPECIAL_PVPD_ORDER_SIGN }) },
              { label: SPECIAL_SP_ORDER_SIGN, command: () => createOrderOfGivenType({ orderPatternId: null, orderSign: SPECIAL_SP_ORDER_SIGN }) },
            ];
          },
        });
      }
      specialOrderPatterns = getters.getOrderPatternsReferringSpecialTrainCategories([SPECIAL_VM_ORDER_SIGN]);
      if (specialOrderPatterns.length > 0) {
        items.push({
          label: `Создать распоряжение о поезде ${SPECIAL_VM_ORDER_SIGN}`,
          info: getters.getWorkingOrdersNumberReferringSpecialTrainCategories([SPECIAL_VM_ORDER_SIGN]),
          imgURL: require('@/assets/img/VM.png'),
          command: createSpecialTrainCategoryItemCommand({ specialOrderPatterns, specialOrdersSign: SPECIAL_VM_ORDER_SIGN, itemsCommandCallback: createOrderOfGivenType }),
        });
      }
      items.push(...getters.getCommonLeftMenuItemsAtTheEnd);
      return items;
    },

    /**
     *
     */
    getECDLeftMenuItems(_state, getters) {
      const items = [];
      if (getters.canUserDispatchECDTakeDutyOrder) {
        const specialOrderPatterns = getters.getOrderPatternsReferringSpecialTrainCategories([SPECIAL_CIRCULAR_ORDER_SIGN]);
        if (specialOrderPatterns.length > 0) {
          items.push({
            label: 'Циркулярный приказ',
            imgURL: require('@/assets/img/takePassDuty.png'),
            command: createSpecialTrainCategoryItemCommand({ specialOrderPatterns, specialOrdersSign: SPECIAL_CIRCULAR_ORDER_SIGN, itemsCommandCallback: createECDOrderOfGivenType }),
          });
        }
      }
      items.push(...getters.getCommonLeftMenuItemsAtTheBeginning);
      if (getters.canUserDispatchOrders) {
        items.push({
          label: 'Черновики документов',
          info: getters.getAllOrderDraftsNumber,
          imgURL: require('@/assets/img/drafts.png'),
          command: (event) => {
            store.commit(SHOW_ORDER_DRAFTS, { show: !store.getters.orderDraftsPanelVisible, target: event });
          },
        });
      }
      const specialOrderPatterns = getters.getOrderPatternsReferringSpecialTrainCategories([SPECIAL_TY_ORDER_SIGN]);
      if (specialOrderPatterns.length > 0) {
        items.push({
          label: `Создать распоряжение о поезде ${SPECIAL_TY_ORDER_SIGN}`,
          info: getters.getWorkingOrdersNumberReferringSpecialTrainCategories([SPECIAL_TY_ORDER_SIGN]),
          imgURL: require('@/assets/img/TY.png'),
          command: createSpecialTrainCategoryItemCommand({ specialOrderPatterns, specialOrdersSign: SPECIAL_TY_ORDER_SIGN, itemsCommandCallback: createECDOrderOfGivenType }),
        });
      }
      items.push(...getters.getCommonLeftMenuItemsAtTheEnd);
      return items;
    },

    /**
     *
     */
    getLeftMenuItems(_state, getters) {
      if (getters.isStationWorkPoligonSpecialist || ((getters.isRevisor || getters.isViewer) && getters.getUserWorkPoligon.type === WORK_POLIGON_TYPES.STATION)) {
        return getters.getDSPLeftMenuItems;
      } else if (getters.isDNC || ((getters.isRevisor || getters.isViewer) && getters.getUserWorkPoligon.type === WORK_POLIGON_TYPES.DNC_SECTOR)) {
        return getters.getDNCLeftMenuItems;
      } else if (getters.isECD || ((getters.isRevisor || getters.isViewer) && getters.getUserWorkPoligon.type === WORK_POLIGON_TYPES.ECD_SECTOR)) {
        return getters.getECDLeftMenuItems;
      }
      return [];
    },
  },
};
