<template>
  <ShowBeforeLogoutDlg
    :showDlg="state.showBeforeLogoutDlg"
    @close="hideBeforeLogoutDlg"
  >
  </ShowBeforeLogoutDlg>
  <nav-bar v-if="canUserWorkWithSystem && !isPrintPreview" />
  <router-view />
  <footer-bar v-if="canUserWorkWithSystem && !isPrintPreview" />
</template>


<script>
  import { watch, computed, reactive } from 'vue';
  import { useStore } from 'vuex';
  import router from '@/router';
  import NavBar from '@/components/NavBar';
  import FooterBar from '@/components/FooterBar';
  import ShowBeforeLogoutDlg from '@/components/ShowBeforeLogoutDlg';
  import useWebSocket from '@/hooks/useWebSocket.hook';
  import incomingOrderSound from '@/assets/sounds/incomingOrder.mp3';
  import {
    DETERMINE_LOGOUT_ITEM_ACTION,
    DEL_CURR_LAST_ORDERS_PARAMS,
    DEL_ORDER_PATTERNS_ELEMENTS_REFS,
    SET_START_DATE_TO_GET_DATA,
    NOTIFIED_ABOUT_NEW_INCOMING_ORDERS,
    SET_CURR_DATE_TIME,
    DEL_CURR_WORK_POLIGON_DATA,
    DEL_CURR_ORDER_PATTERN_DATA,
    RESET_INCOMING_ORDERS_PER_SHIFT,
    DEL_CURR_SECTORS_SHIFT,
    RETRY_ON_CLOSE_WS_CONNECTION,
    DO_NOT_RETRY_ON_CLOSE_WS_CONNECTION,
    DEL_WORK_ORDERS,
    DEL_ALL_WS_SERVER_MESSAGES,
    DEL_ORDERS_DRAFTS,
    DELETE_ALL_SYSTEM_MESSAGES,
    SET_SELECTED_OKNO,
    SET_USER_OFFLINE_STATUS,
    SET_ALL_DATA_LOADED_ON_APP_RELOAD,
  } from '@/store/mutation-types';
  import {
    LOAD_CURR_SECTORS_SHIFT_ACTION,
    LOAD_WORK_ORDERS_ACTION,
    LOAD_INCOMING_ORDERS_PER_SHIFT_ACTION,
    LOAD_CURR_WORK_POLIGON_DATA_ACTION,
    LOAD_LAST_ORDERS_PARAMS_ACTION,
    LOAD_ORDER_DRAFTS_ACTION,
    LOAD_ORDER_PATTERNS_ACTION,
    LOAD_ORDER_PATTERNS_ELEMENTS_REFS_ACTION,
    CHECK_CLIPBOARD,
    STORE_ORDERS_LOCALLY,
  } from '@/store/action-types';
  import { WS_SERVER_ADDRESS } from '@/constants/servers';
  import {
    UPDATE_CURR_DATE_TIME_INTERVAL,
    REQUEST_NEW_ORDERS_FROM_SERVER_INTERVAL,
  } from '@/constants/appSettings';
  //import { createOrderOfGivenType } from '@/additional/createOrderOfGivenType';
  //import { SPECIAL_DR_ORDER_SIGN } from '@/constants/orderPatterns';
  import wait from '@/additional/wait';
  import useNotifications from '@/hooks/useNofitications.hook';

  export default {
    name: 'dy-58-app',

    components: {
      NavBar,
      FooterBar,
      ShowBeforeLogoutDlg,
    },

    setup() {
      const store = useStore();
      const pushNotifications = useNotifications();

      if (router.currentRoute.offline === 'true') {
        store.commit(SET_USER_OFFLINE_STATUS, true);
      }

      // для общения с сервером по протоколу WebSocket
      const wsClient = useWebSocket({ socketUrl: WS_SERVER_ADDRESS });

      // для звукового уведомления о новых входящих документах
      const newIncomingOrdersSound = new Audio(incomingOrderSound);
      if (newIncomingOrdersSound) {
        newIncomingOrdersSound.crossOrigin = 'anonymous';
        newIncomingOrdersSound.autoplay = true;
      }

      // для отображения текущих даты и времени
      let timerId;
      // для запроса новой информации о документах с сервера +
      // для ДНЦ: для проверки буфера обмена на содержание в нем таблицы для создания распоряжения о поезде ДР
      let updateDataTimerId;

      const state = reactive({
        showBeforeLogoutDlg: false,
      });

      const canUserWorkWithSystem = computed(() => store.getters.canUserWorkWithSystem);
      watch(canUserWorkWithSystem, (userCanWork) => {
        if (userCanWork) {
          // При входе пользователя в систему (с принятием либо без принятия дежурства) устанавливаем
          // default-дату-время начала временного интервала извлечения информации о рабочих документах
          if (store.getters.getLoginDateTime) {
            store.commit(SET_START_DATE_TO_GET_DATA, store.getters.getLoginDateTime);
          }
          //
          if (!timerId) {
            timerId = setInterval(() => store.commit(SET_CURR_DATE_TIME, new Date()), UPDATE_CURR_DATE_TIME_INTERVAL);
          }
          //
          if (!updateDataTimerId) {
            updateDataTimerId = setInterval(() => {
              store.dispatch(LOAD_WORK_ORDERS_ACTION);
              // Для распоряжения ДНЦ о поезде идущем ДР
              if (store.getters.isDNC) {
                store.dispatch(CHECK_CLIPBOARD);
              }
            },
            REQUEST_NEW_ORDERS_FROM_SERVER_INTERVAL);
          }
          //
          if (wsClient) {
            store.commit(RETRY_ON_CLOSE_WS_CONNECTION);
            wsClient.startWork();
          }
        } else {
          //
          if (timerId) {
            clearInterval(timerId);
            timerId = null;
          }
          //
          if (updateDataTimerId) {
            clearInterval(updateDataTimerId);
            updateDataTimerId = null;
          }
          //
          if (wsClient) {
            store.commit(DO_NOT_RETRY_ON_CLOSE_WS_CONNECTION);
            wsClient.stopWork();
          }
          // Удаляем все данные приложения, загруженные с сервера и сгенерированные в самой программе
          store.commit(DEL_CURR_WORK_POLIGON_DATA);
          store.commit(DEL_CURR_ORDER_PATTERN_DATA);
          store.commit(DEL_ORDER_PATTERNS_ELEMENTS_REFS);
          store.commit(RESET_INCOMING_ORDERS_PER_SHIFT);
          store.commit(DEL_ALL_WS_SERVER_MESSAGES);
          store.commit(DEL_CURR_SECTORS_SHIFT);
          store.commit(DEL_CURR_LAST_ORDERS_PARAMS);
          store.commit(DEL_WORK_ORDERS);
          store.commit(DEL_ORDERS_DRAFTS);
          store.commit(DELETE_ALL_SYSTEM_MESSAGES);
          store.commit(SET_SELECTED_OKNO, { okno: null });
          // Если пользователь еще не на странице авторизации, то его необходимо туда перенаправить
          if (router.currentRoute.value.name !== 'AuthPage') {
            router.push({ name: 'AuthPage' });
          }
        }
      });

      /**
       * Уведомление о приходе новых входящих документов
       */
      watch(() => store.getters.thereAreNewIncomingOrders, (thereAreNewOrders) => {
        if (thereAreNewOrders) {
          // звуковое уведомление
          if (newIncomingOrdersSound) {
            newIncomingOrdersSound.volume = store.getters.getSoundsVolume;
            newIncomingOrdersSound.play();
          }
          // push-уведомление
          pushNotifications.showNotification('', 'Новые входящие документы');
          store.commit(NOTIFIED_ABOUT_NEW_INCOMING_ORDERS);
        }
      });

      // Когда окно программы ДУ-58 получает фокус, все активные push-уведомления автоматически закрываются
      window.addEventListener('focus', () => pushNotifications.closeAllNotifications());

      /**
       * При появлении каких-либо изменений в рабочих документах принимаем меры по
       * сохранению данных в локальном хранилище
       */
      watch(() => store.getters.getAllCurrentOrders, (newData) => {
        store.dispatch(STORE_ORDERS_LOCALLY, newData);
      });

      /**
       * Пункт меню "Выход" может быть просто выходом из системы (если пользователь не на дежурстве)
       * либо просто выходом из системы и выходом из системы со сдачей дежурства (если пользователь
       * на дежурстве)
       */
      watch(() => store.getters.isUserOnDuty, () => store.commit(DETERMINE_LOGOUT_ITEM_ACTION));

      /**
       * Если сокет-соединение неактивно, то полагаем, что пользователь работает offline.
       */
      watch(() => store.getters.isWebSocketConnectionActive, (newValue) => {
        store.commit(SET_USER_OFFLINE_STATUS, !newValue);
      });

      const ifUserWorksOffline = computed(() => store.getters.ifUserWorksOffline);

      const isLocalStoreServerCreated = computed(() => store.getters.isLocalStoreServerCreated);
      const localStoreServerCreateError = computed(() => store.getters.localStoreServerCreateError);

      /**
       * При смене рабочего полигона пользователя подгружаем информацию о:
       * - структуре данного рабочего полигона,
       * - шаблонах разного типа документов данного рабочего полигона,
       * - количестве входящих документов за смену (если пользователь на дежурстве),
       * а также открываем WebSocket-соединение между клиентом и сервером,
       */
      watch(() => store.getters.getUserWorkPoligon,
        async (workPoligonNew) => {
          // Если пользователь работает в режиме offline, то прежде чем продолжать, нужно подождать
          // окончание загрузки сервера, отвечающего за работу с локальным хранилищем
          if (ifUserWorksOffline.value && !isLocalStoreServerCreated.value) {
            while (!isLocalStoreServerCreated.value && !localStoreServerCreateError.value) {
              await wait(100);
            }
          }
          if (workPoligonNew && (!ifUserWorksOffline.value || isLocalStoreServerCreated)) {
            store.dispatch(LOAD_CURR_WORK_POLIGON_DATA_ACTION);
            store.dispatch(LOAD_ORDER_PATTERNS_ACTION);
            store.dispatch(LOAD_ORDER_PATTERNS_ELEMENTS_REFS_ACTION);
            store.dispatch(LOAD_INCOMING_ORDERS_PER_SHIFT_ACTION);
          }
      });

      /**
       * При смене СТРУКТУРЫ рабочего полигона пользователя подгружаем информацию о:
       * - персонале данного рабочего полигона,
       * - параметрах последних документов, изданных в рамках данного полигона (номера документов всех типов),
       * - черновиках документов, изданных в рамках рабочего полигона,
       * - запускаем периодическую подгрузку входящих уведомлений и рабочих документов
       */
      watch(() => store.getters.getUserWorkPoligonData, async (workPoligonDataNew) => {
        if (workPoligonDataNew) {
          await store.dispatch(LOAD_CURR_SECTORS_SHIFT_ACTION);
          await store.dispatch(LOAD_LAST_ORDERS_PARAMS_ACTION);
          if (store.getters.isECD || store.getters.isDNC)
            await store.dispatch(LOAD_ORDER_DRAFTS_ACTION);
          await store.dispatch(LOAD_WORK_ORDERS_ACTION);
          store.commit(SET_ALL_DATA_LOADED_ON_APP_RELOAD);
        }
      });

      watch(() => store.getters.getStartLogout, (startLogoutVal) => {
        if (startLogoutVal) {
          state.showBeforeLogoutDlg = true;
        }
      });

      /*
      // Если пользователь копирует в буфер обмена расписание плановой нитки, то система полагает, что
      // он хочет издать распоряжение о проследовании поезда диспетчерским расписанием (ДР) и автоматичеки
      // открывает страницу издания распоряжения по соответствующему шаблону
      watch(() => store.getters.getDataForDROrderFromClipboard, (newDRTrainData) => {
        if (newDRTrainData) {
          createOrderOfGivenType({ orderPatternId: null, orderSign: SPECIAL_DR_ORDER_SIGN });
        }
      });
      */

      const hideBeforeLogoutDlg = () => {
        state.showBeforeLogoutDlg = false;
      };

      return {
        state,
        isPrintPreview: computed(() => store.getters.isPrintPreview),
        canUserWorkWithSystem,
        hideBeforeLogoutDlg,
      };
    },
  };
</script>


<style lang="scss">
  @import "./assets/scss/App.scss";
</style>
