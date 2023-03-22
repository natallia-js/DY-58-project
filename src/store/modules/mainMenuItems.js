import { store } from '@/store';
import router from '@/router';
import {
  DETERMINE_LOGOUT_ITEM_ACTION,
  SET_ACTIVE_MAIN_MENU_ITEM,
  PREPARE_FOR_LOGOUT,
} from '@/store/mutation-types';

export const MainMenuItemsKeys = Object.freeze({
  mainPage: 0,
  sectorStructure: 1,
  currShift: 2,
  ordersJournal: 3,
  createOrder: 4,
  orderPatterns: 5,
  help: 6,
  exit: 7,
});


export const mainMenuItems = {
  state: {
    mainMenuItems: [
      { key: MainMenuItemsKeys.mainPage, label: 'Главная страница', to: '/mainPage' },
      { key: MainMenuItemsKeys.createOrder, label: 'Создать', command: () => {
        router.push({
          name: 'NewOrderPage',
          params: {
            orderType: null,
            orderId: null,
            orderPatternId: null,
            orderPatternSpecialSign: null,
            prevOrderId: null,
            orderDraftId: null,
          }
        });
      } },
      { key: MainMenuItemsKeys.ordersJournal, label: 'Журнал', to: '/ordersJournalPage' },
      { key: MainMenuItemsKeys.sectorStructure, label: 'Рабочий полигон', to: '/sectorStructure' },
      { key: MainMenuItemsKeys.currShift, label: 'Персонал', to: '/shiftPage' },
      { key: MainMenuItemsKeys.orderPatterns, label: 'Шаблоны документов', to: '/orderPatternsPage'},
      { key: MainMenuItemsKeys.help, label: 'Помощь', to: '/helpPage' },
      // В поле 'command' определено действие по умолчанию на случай, когда пользователь не принимает
      // дежурство (именно такое состояние - isUserOnDuty = false - является состоянием по умолчанию)
      { key: MainMenuItemsKeys.exit, label: 'Выход', command: () => store.commit(PREPARE_FOR_LOGOUT, false) },
    ],
  },

  getters: {
    getMainMenuItems(state, getters) {
      return state.mainMenuItems.map((item) => {
        if (item.key === MainMenuItemsKeys.mainPage) {
          return {
            ...item,
            // На пункте меню "Главная страница" отображаем количество входящих уведомлений и количество распоряжений, находящихся в работе
            label: `${item.label} ${getters.getIncomingOrdersNumber}/${getters.getWorkingOrdersNumber}`,
          };
        }
        if (item.key === MainMenuItemsKeys.sectorStructure && getters.getLoadingCurrWorkPoligonStructureStatus) {
          return {
            ...item,
            // На пункте меню "Рабочий полигон" отображаем статус загрузки информации о структуре рабочего полигона
            icon: 'pi pi-spin pi-spinner',
          };
        }
        if (item.key === MainMenuItemsKeys.sectorStructure && getters.getErrorLoadingCurrWorkPoligonStructure) {
          return {
            ...item,
            // На пункте меню "Рабочий полигон" отображаем факт ошибки загрузки информации о структуре рабочего полигона
            icon: 'pi pi-exclamation-circle',
          };
        }
        if (item.key === MainMenuItemsKeys.currShift && getters.getLoadingCurrSectorsShiftStatus) {
          return {
            ...item,
            // На пункте меню "Персонал" отображаем статус загрузки информации о персонале рабочего полигона
            icon: 'pi pi-spin pi-spinner',
          };
        }
        if (item.key === MainMenuItemsKeys.currShift && getters.getErrorLoadingCurrSectorsShift) {
          return {
            ...item,
            // На пункте меню "Персонал" отображаем факт ошибки загрузки информации о персонале рабочего полигона
            icon: 'pi pi-exclamation-circle',
          };
        }
        if (item.key === MainMenuItemsKeys.orderPatterns && getters.getLoadingOrderPatternsStatus) {
          return {
            ...item,
            // На пункте меню "Шаблоны распоряжений" отображаем статус загрузки информации о шаблонах распоряжений
            icon: 'pi pi-spin pi-spinner',
          };
        }
        if (item.key === MainMenuItemsKeys.orderPatterns && !getters.orderPatternsLoadedSuccessfully) {
          return {
            ...item,
            // На пункте меню "Шаблоны распоряжений" отображаем факт ошибки загрузки информации о шаблонах распоряжений
            icon: 'pi pi-exclamation-circle',
          };
        }
        return item;
      });
    },
  },

  mutations: {
    [DETERMINE_LOGOUT_ITEM_ACTION] (state) {
      const logoutItem = state.mainMenuItems.find((item) => item.key === MainMenuItemsKeys.exit);
      if (!logoutItem) {
        return;
      }
      if (!store.getters.isUserOnDuty || store.getters.ifUserWorksOffline) {
        delete logoutItem.items;
        logoutItem.command = () => store.commit(PREPARE_FOR_LOGOUT, false);
      } else {
        delete logoutItem.command;
        logoutItem.items = [
          { label: 'Без сдачи дежурства', command: () => store.commit(PREPARE_FOR_LOGOUT, false) },
          { label: 'Со сдачей дежурства', command: () => store.commit(PREPARE_FOR_LOGOUT, true) },
        ];
      }
    },

    [SET_ACTIVE_MAIN_MENU_ITEM] (state, activeMainMenuItemKey) {
      state.mainMenuItems = state.mainMenuItems.map((item) => {
        if (item.key === activeMainMenuItemKey) {
          return { ...item, class: 'dy58-active-main-menu-item' };
        }
        return { ...item, class: '' };
      });
    },
  },
};
