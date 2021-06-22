import { createRouter, createWebHistory } from 'vue-router';
import AuthPage from '../views/AuthPage.vue';
import ConfirmAuthDataPage from '../views/ConfirmAuthDataPage.vue';
import MainPage from '../views/MainPage.vue';
import NewOrderPage from '../views/NewOrderPage.vue';
import OrderPatternsPage from '../views/OrderPatternsPage.vue';
import CurrJournalPage from '../views/CurrJournalPage.vue';
import ShiftPage from '../views/ShiftPage.vue';
import ArchivePage from '../views/ArchivePage.vue';
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
    path: '/archivePage',
    name: 'ArchivePage',
    component: ArchivePage,
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


router.beforeEach((to, _from, next) => {

  // Страница, куда осуществляется переход, требует аутентификации?
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Да, аутентификация требуется

    // Пользователь уже аутентифицирован?
    if (store.getters.isUserAuthenticated) {
      // Да -> перенаправляем пользователя туда, куда он хотел попасть
      next();

    } else {
      // Нет -> пытаемся аутентифицировать пользователя через localstorage
      store.commit('tryLoginViaLocalStorage');

      // Удалось?
      if (store.getters.isUserAuthenticated) {
        // Да -> перенаправляем пользователя туда, куда он хотел попасть
        next();
      }
      else {
        // Нет -> переходим на страницу аутентификации
        next({
          path: '/',
        });
      }
    }
  } else if (to.matched.some(record => record.meta.guest)) {
    // Нет, аутентификация не требуется

    // Пользователь уже аутентифицирован?
    if (store.getters.isUserAuthenticated) {
      // Да -> перенаправляем пользователя туда, куда он хотел попасть
      next();

    } else {
      // Нет -> пытаемся аутентифицировать пользователя через localstorage
      store.commit('tryLoginViaLocalStorage');

      // При любом исходе попытки аутентификации через localstorage перенаправляем
      // пользователя туда, куда он хотел попасть

      next();
    }
  }
});


export default router;
