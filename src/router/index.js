import { createRouter, createWebHistory } from 'vue-router';
import AuthPage from '@/views/AuthPage';
import SectorStructurePage from '@/views/SectorStructurePage';
import ConfirmAuthDataPage from '@/views/ConfirmAuthDataPage';
import MainPage from '@/views/MainPage';
import NewOrderPage from '@/views/NewOrderPage';
import OrderPatternsPage from '@/views/OrderPatternsPage';
import CurrJournalPage from '@/views/CurrJournalPage';
import ShiftPage from '@/views/ShiftPage';
import HelpPage from '@/views/HelpPage';
import { store } from '@/store';
import { TRY_LOGIN_VIA_LOCAL_STORAGE } from '@/store/mutation-types';

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
      requiresAuth: true,
    },
  },
  {
    path: '/sectorStructure',
    name: 'SectorStructurePage',
    component: SectorStructurePage,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/shiftPage',
    name: 'ShiftPage',
    component: ShiftPage,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/currJournalPage',
    name: 'CurrJournalPage',
    component: CurrJournalPage,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/newOrderPage/:orderType/:prevOrderId',
    name: 'NewOrderPage',
    component: NewOrderPage,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/orderPatternsPage',
    name: 'OrderPatternsPage',
    component: OrderPatternsPage,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '/helpPage',
    name: 'HelpPage',
    component: HelpPage,
    meta: {
      requiresAuth: true,
    },
  },
];


const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});


router.beforeEach((to, from, next) => {
  // Страница, куда осуществляется переход, требует аутентификации?
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Да, аутентификация требуется

    // Пользователь уже аутентифицирован?
    if (!store.getters.isUserAuthenticated) {
      // Нет -> пытаемся аутентифицировать пользователя через localstorage
      // (такое, в частности, возможно при перезагрузке страницы)
      store.commit(TRY_LOGIN_VIA_LOCAL_STORAGE);
    }

    // Пользователь аутентифицирован?
    if (store.getters.isUserAuthenticated) {
      // Да
      // Если определен рабочий полигон пользователя, то направляем пользователя туда, куда он хотел попасть,
      // за исключением страницы /confirmAuthDataPage: на данную страницу у него нет пути
      if (store.getters.getUserWorkPoligon) {
        if (to.path !== '/confirmAuthDataPage') {
          next();
        } else {
          next({
            path: from.path,
          });
        }
      } else {
        // В противном случае перенаправляем на страницу, где он сможет определить свой рабочий полигон
        if (to.path !== '/confirmAuthDataPage') {
          next({
            path: '/confirmAuthDataPage',
          });
        } else {
          next();
        }
      }
    } else {
      // Нет -> переходим на страницу аутентификации
      next({
        path: '/',
      });
    }

  } else { // if (to.matched.some(record => record.meta.guest)) {
    // Страница не требует аутентификации

    // Пользователь не аутентифицирован?
    if (!store.getters.isUserAuthenticated) {
      // Не аутентифицирован -> пытаемся аутентифицировать пользователя через localstorage
      store.commit(TRY_LOGIN_VIA_LOCAL_STORAGE);
    }

    // Пользователь аутентифицирован?
    if (store.getters.isUserAuthenticated) {
      // Да
      // Если пользователь хочет попасть на страницу, связанную с аутентификацией, то
      // сделать он этого не сможет, пока не выйдет из системы, за исключением случая, когда
      // не определен его рабочий полигон
      if ((to.path === '/') && store.getters.getUserWorkPoligon) {
        next({
          path: (from.path !== '/') ? from.path : '/mainPage',
        });
      } else {
        next();
      }
    } else {
      // Нет
      // Перенаправляем пользователя туда, куда он хотел попасть
      next();
    }
  }
});


export default router;
