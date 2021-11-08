import { createRouter, createWebHistory } from 'vue-router';
import AuthPage from '../views/AuthPage.vue';
import SectorStructurePage from '../views/SectorStructurePage.vue';
import ConfirmAuthDataPage from '../views/ConfirmAuthDataPage.vue';
import MainPage from '../views/MainPage.vue';
import NewOrderPage from '../views/NewOrderPage.vue';
import OrderPatternsPage from '../views/OrderPatternsPage.vue';
import CurrJournalPage from '../views/CurrJournalPage.vue';
import ShiftPage from '../views/ShiftPage.vue';
import HelpPage from '../views/HelpPage.vue';
import Logout from '../views/Logout.vue';
import { store } from '../store';

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
    path: '/newOrderPage',
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
  {
    path: '/logout',
    name: 'Logout',
    component: Logout,
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
      store.commit('tryLoginViaLocalStorage');
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
      store.commit('tryLoginViaLocalStorage');
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
