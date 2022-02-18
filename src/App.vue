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
  } from '@/store/mutation-types';
  import { WS_SERVER_ADDRESS } from '@/constants/servers';
  import {
    UPDATE_CURR_DATE_TIME_INTERVAL,
    REQUEST_NEW_ORDERS_FROM_SERVER_INTERVAL,
  } from '@/constants/appSettings';

  export default {
    name: 'dy-58-app',

    components: {
      NavBar,
      FooterBar,
      ShowBeforeLogoutDlg,
    },

    setup() {
      const store = useStore();
      // для общения с сервером по протоколу WebSocket
      const wsClient = useWebSocket({ socketUrl: WS_SERVER_ADDRESS });

      // для звукового уведомления о входящих распоряжениях
      const newIncomingOrdersSound = new Audio(incomingOrderSound);
      if (newIncomingOrdersSound) {
        newIncomingOrdersSound.crossOrigin = 'anonymous';
        newIncomingOrdersSound.autoplay = true;
      }

      // для отображения текущих даты и времени
      let timerId;
      // для запроса новой информации о распоряжениях с сервера
      let updateDataTimerId;

      const state = reactive({
        showBeforeLogoutDlg: false,
      });

      const canUserWorkWithSystem = computed(() => store.getters.canUserWorkWithSystem);
      watch(canUserWorkWithSystem, (userCanWork) => {
        if (userCanWork) {
          // При входе пользователя в систему (с принятием либо без принятия дежурства) устанавливаем
          // default-дату-время начала временного интервала извлечения информации о рабочих распоряжениях
          if (store.getters.getLoginDateTime) {
            store.commit(SET_START_DATE_TO_GET_DATA, store.getters.getLoginDateTime);
          }
          //
          if (!timerId) {
            timerId = setInterval(() => store.commit(SET_CURR_DATE_TIME, new Date()), UPDATE_CURR_DATE_TIME_INTERVAL);
          }
          //
          if (!updateDataTimerId) {
            updateDataTimerId = setInterval(() => store.dispatch('loadWorkOrders'), REQUEST_NEW_ORDERS_FROM_SERVER_INTERVAL);
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
          // Удаляем все данные приложения, загруженные с сервера
          store.commit(DEL_CURR_WORK_POLIGON_DATA);
          store.commit(DEL_CURR_ORDER_PATTERN_DATA);
          store.commit(DEL_ORDER_PATTERNS_ELEMENTS_REFS);
          store.commit(RESET_INCOMING_ORDERS_PER_SHIFT);
          store.commit(DEL_ALL_WS_SERVER_MESSAGES);
          store.commit(DEL_CURR_SECTORS_SHIFT);
          store.commit(DEL_CURR_LAST_ORDERS_PARAMS);
          store.commit(DEL_WORK_ORDERS);
        }
      });

      /**
       * Уведомление о приходе новых входящих уведомлений (распоряжений)
       */
      watch(() => store.getters.thereAreNewIncomingOrders, (thereAreNewOrders) => {
        if (thereAreNewOrders) {
          if (newIncomingOrdersSound) {
            newIncomingOrdersSound.volume = store.getters.getSoundsVolume;
            newIncomingOrdersSound.play();
          }
          store.commit(NOTIFIED_ABOUT_NEW_INCOMING_ORDERS);
        }
      });

      /**
       * Пункт меню "Выход" может быть просто выходом из системы (если пользователь не на дежурстве)
       * либо просто выходом из системы и выходом из системы со сдачей дежурства (если пользователь
       * на дежурстве)
       */
      watch(() => store.getters.isUserOnDuty, () => store.commit(DETERMINE_LOGOUT_ITEM_ACTION));

      /**
       * При смене рабочего полигона пользователя подгружаем информацию о:
       * - структуре данного рабочего полигона,
       * - шаблонах разного типа распоряжений данного рабочего полигона,
       * а также открываем WebSocket-соединение между клиентом и сервером,
       */
      watch(() => store.getters.getUserWorkPoligon, (workPoligonNew) => {
        if (workPoligonNew) {
          store.dispatch('loadCurrWorkPoligonData');
          store.dispatch('loadOrderPatterns');
          store.dispatch('loadOrderPatternsElementsRefs');
          store.dispatch('loadIncomingOrdersPerShift');
        }
      });

      /**
       * При смене структуры рабочего полигона пользователя подгружаем информацию о:
       * - персонале данного рабочего полигона,
       * - параметрах последних распоряжений, изданных в рамках данного полигона,
       * - запускаем периодическую подгрузку входящих уведомлений и рабочих распоряжений
       */
      watch(() => store.getters.getUserWorkPoligonData, (workPoligonDataNew) => {
        if (workPoligonDataNew) {
          store.dispatch('loadCurrSectorsShift');
          store.dispatch('loadLastOrdersParams');
          store.dispatch('loadWorkOrders');
        }
      });

      watch(() => store.getters.getStartLogout, (startLogoutVal) => {
        if (startLogoutVal) {
          state.showBeforeLogoutDlg = true;
        }
      });

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
