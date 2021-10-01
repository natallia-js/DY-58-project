export const MainMenuItemsKeys = Object.freeze({
  mainPage: 0,
  sectorStructure: 1,
  currShift: 2,
  currJournal: 3,
  createOrder: 4,
  orderPatterns: 5,
  report: 6,
  archive: 7,
  help: 8,
  exit: 9,
});


export const mainMenuItems = {
  state: {
    mainMenuItems: [
      { key: MainMenuItemsKeys.mainPage, label: 'Главная страница', to: '/mainPage' },
      { key: MainMenuItemsKeys.sectorStructure, label: 'Рабочий полигон', to: 'sectorStructure' },
      { key: MainMenuItemsKeys.currShift, label: 'Персонал', to: '/shiftPage' },
      { key: MainMenuItemsKeys.currJournal, label: 'Журнал', to: '/currJournalPage' },
      { key: MainMenuItemsKeys.createOrder, label: 'Создать', to: '/newOrderPage' },
      { key: MainMenuItemsKeys.orderPatterns, label: 'Шаблоны распоряжений', to: '/orderPatternsPage'},
      { key: MainMenuItemsKeys.report, label: 'Отчет', to: '#!' },
      { key: MainMenuItemsKeys.archive, label: 'Архив', to: '/archivePage' },
      { key: MainMenuItemsKeys.help, label: 'Помощь', to: '/helpPage' },
      { key: MainMenuItemsKeys.exit, label: 'Выход', to: '/logout' },
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
        return item;
      });
    },
  },

  mutations: {
    setActiveMainMenuItem(state, activeMainMenuItemKey) {
      state.mainMenuItems.forEach((item) => {
        if (item.key === activeMainMenuItemKey) {
          item.class = 'dy58-active-main-menu-item';
        } else {
          item.class = '';
        }
      });
    },
  },
};
