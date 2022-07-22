import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router';
import AuthPage from '@/views/AuthPage';
import SectorStructurePage from '@/views/SectorStructurePage';
import ConfirmAuthDataPage from '@/views/ConfirmAuthDataPage';
import MainPage from '@/views/MainPage';
import NewOrderPage from '@/views/NewOrderPage';
import OrderPatternsPage from '@/views/OrderPatternsPage';
import OrdersJournalPage from '@/views/OrdersJournalPage';
import PrintECDJournalPreviewPage from '@/views/PrintECDJournalPreviewPage';
import PrintDNC_DSPJournalPreviewPage from '@/views/PrintDNC_DSPJournalPreviewPage';
import ShiftPage from '@/views/ShiftPage';
import HelpPage from '@/views/HelpPage';
import { store } from '@/store';
import isElectron from '@/additional/isElectron';
import { TRY_LOGIN_VIA_SESSION_ACTION, LOGIN_VIA_LOCAL_STORAGE_ACTION } from '@/store/action-types';

const routes = [
  {
    path: '/',
    name: 'AuthPage',
    component: AuthPage,
    meta: {
      guest: true,
    },
  },
  {
    path: '/confirmAuthDataPage',
    name: 'ConfirmAuthDataPage',
    component: ConfirmAuthDataPage,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/mainPage',
    name: 'MainPage',
    component: MainPage,
    meta: {
      requiresFullAuth: true,
    },
  },
  {
    path: '/sectorStructure',
    name: 'SectorStructurePage',
    component: SectorStructurePage,
    meta: {
      requiresFullAuth: true,
    },
  },
  {
    path: '/shiftPage',
    name: 'ShiftPage',
    component: ShiftPage,
    meta: {
      requiresFullAuth: true,
    },
  },
  {
    path: '/ordersJournalPage',
    name: 'OrdersJournalPage',
    component: OrdersJournalPage,
    meta: {
      requiresFullAuth: true,
    },
  },
  {
    path: '/printECDJournalPreviewPage',
    name: 'PrintECDJournalPreviewPage',
    component: PrintECDJournalPreviewPage,
    meta: {
      requiresFullAuth: true,
    },
  },
  {
    path: '/printDNC_DSPJournalPreviewPage',
    name: 'PrintDNC_DSPJournalPreviewPage',
    component: PrintDNC_DSPJournalPreviewPage,
    meta: {
      requiresFullAuth: true,
    },
  },
  {
    path: '/newOrderPage/:orderType/:orderPatternId/:orderPatternSpecialSign/:prevOrderId/:orderDraftId',
    name: 'NewOrderPage',
    component: NewOrderPage,
    meta: {
      requiresFullAuth: true,
    },
  },
  {
    path: '/orderPatternsPage',
    name: 'OrderPatternsPage',
    component: OrderPatternsPage,
    meta: {
      requiresFullAuth: true,
    },
  },
  {
    path: '/helpPage',
    name: 'HelpPage',
    component: HelpPage,
    meta: {
      requiresFullAuth: true,
    },
  },
];


// The hash history mode is created with createWebHashHistory().
// It uses a hash character (#) before the actual URL that is internally passed.
// Because this section of the URL is never sent to the server, it doesn't require any special treatment on the server level.
// This case we'll use for electron version of the application because Electron is a file-based environment!
//
// The HTML5 mode is created with createWebHistory() and is the recommended mode.
// When using createWebHistory(), the URL will look "normal," e.g. https://example.com/user/id.
// This case we'll use for browser version of the application.
const router = createRouter({
  history: isElectron() ? createWebHashHistory(process.env.BASE_URL) : createWebHistory(process.env.BASE_URL),
  routes,
});


router.beforeEach(async (to, from, next) => {
  // Вне зависимости от того, на какую страницу хочет попасть пользователь, проверяем,
  // проходил ли он уже процедуру частичной аутентификации (login + password)
  if (!store.getters.isUserAuthenticated) {
    if (!store.getters.ifUserWorksOffline)
      // Нет + пользователь не работает offline -> пытаемся аутентифицировать пользователя через сессию
      // (такое, в частности, возможно при перезагрузке страницы).
      // Успешная аутентификация через сессию может привести к полной аутентификации в системе.
      await store.dispatch(TRY_LOGIN_VIA_SESSION_ACTION);
    else if (store.getters.canUserWorkWithSystem) {
      // Пользователь работает offline и не осуществил выход из системы
      await store.dispatch(LOGIN_VIA_LOCAL_STORAGE_ACTION)}
  }

  // Если пользователь полностью аутентифицирован, то он не может попасть на страницы, требующие
  // частичной аутентификации либо не требующие аутентификации вовсе
  if (store.getters.canUserWorkWithSystem) {
    if (to.matched.some(record => record.meta.requiresFullAuth)) {
      next();
    } else if (to.matched.some(record => record.meta.requiresAuth)) {
      next({ path: (from.path === '/' || from.path === '/confirmAuthDataPage') ? '/mainPage' : from.path, });
    } else {
      next({ path: (from.path === '/' || from.path === '/confirmAuthDataPage') ? '/mainPage' : from.path, });
    }
  } else if (store.getters.isUserAuthenticated) {
    if (to.matched.some(record => record.meta.requiresFullAuth)) {
      next({ path: '/confirmAuthDataPage' });
    } else if (to.matched.some(record => record.meta.requiresAuth)) {
      next();
    } else {
      next();
    }
  } else {
    if (to.path !== '/') {
      next({ path: '/' });
    } else {
      next();
    }
  }
});


export default router;
