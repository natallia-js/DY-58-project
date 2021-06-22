export const MainMenuItemsKeys = Object.freeze({
  mainPage: 0,
  currShift: 1,
  currJournal: 2,
  createOrder: 3,
  orderPatterns: 4,
  report: 5,
  archive: 6,
  help: 7,
  exit: 8,
});


export const mainMenuItems = {
  state: {
    mainMenuItems: [
      { key: MainMenuItemsKeys.mainPage, label: 'Главная страница', to: '/mainPage' },
      { key: MainMenuItemsKeys.currShift, label: 'На смене', to: '/shiftPage' },
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
      return state.mainMenuItems.map((item) =>
        item.key !== MainMenuItemsKeys.mainPage
        ? item
        : {
          ...item,
          // На пункте меню "Главная страница" отображаем количество входящих уведомлений и количество распоряжений, находящихся в работе
          label: `${item.label} ${getters.getIncomingNotificationsNumber}/${getters.getOrdersInWorkNumber}`,
        }
      );
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
