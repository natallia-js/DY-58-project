import { createRouter, createWebHistory } from 'vue-router';
import AuthPage from '@/views/AuthPage';
import SectorStructurePage from '@/views/SectorStructurePage';
import ConfirmAuthDataPage from '@/views/ConfirmAuthDataPage';
import MainPage from '@/views/MainPage';
import NewOrderPage from '@/views/NewOrderPage';
import OrderPatternsPage from '@/views/OrderPatternsPage';
import OrdersJournalPage from '@/views/OrdersJournalPage';
import ShiftPage from '@/views/ShiftPage';
import HelpPage from '@/views/HelpPage';
import { store } from '@/store';

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
    path: '/newOrderPage/:orderType/:prevOrderId',
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


const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});


router.beforeEach(async (to, from, next) => {
  // Вне зависимости от того, на какую страницу хочет попасть пользователь, проверяем,
  // проходил ли он уже процедуру частичной аутентификации (login + password)
  if (!store.getters.isUserAuthenticated) {
    // Нет -> пытаемся аутентифицировать пользователя через localstorage
    // (такое, в частности, возможно при перезагрузке страницы). Успешная аутентификация
    // через localstorage может привести к полной аутентификации в системе
    await store.dispatch('tryLoginViaLocalStorage');
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
