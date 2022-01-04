<template>
  <ShowBeforeLogoutDlg
    :showDlg="state.showBeforeLogoutDlg"
    @close="hideBeforeLogoutDlg"
  >
  </ShowBeforeLogoutDlg>
  <nav-bar v-if="isUserAuthenticated && getUserCredential && getUserWorkPoligon" />
  <router-view />
  <footer-bar v-if="isUserAuthenticated && getUserCredential && getUserWorkPoligon" />
</template>


<script>
  import { onMounted, onUnmounted, watch, computed, reactive } from 'vue';
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
  } from '@/store/mutation-types';

  const WS_SERVER_ADDRESS = process.env.VUE_APP_WS_SERVER_ADDRESS;

  export default {
    name: 'dy-58-app',

    components: {
      NavBar,
      FooterBar,
      ShowBeforeLogoutDlg,
    },

    setup() {
      const store = useStore();

      const newIncomingOrdersSound = new Audio(incomingOrderSound);
      if (newIncomingOrdersSound) {
        newIncomingOrdersSound.crossOrigin = 'anonymous';
        newIncomingOrdersSound.autoplay = true;
      }

      let timerId;
      let updateDataTimerId;

      const state = reactive({
        wsClient: null,
        showBeforeLogoutDlg: false,
      });

      const getUserWorkPoligon = computed(() => store.getters.getUserWorkPoligon);
      const getUserWorkPoligonData = computed(() => store.getters.getUserWorkPoligonData);

      onMounted(() => {
        timerId = setInterval(updateCurrDateTime, 1000);
        updateDataTimerId = setInterval(updateAppState, 10000);
      });

      onUnmounted(() => {
        if (timerId) {
          clearInterval(timerId);
        }
        if (updateDataTimerId) {
          clearInterval(updateDataTimerId);
        }
      });

      const updateCurrDateTime = () => {
        store.commit(SET_CURR_DATE_TIME, new Date());
      };

      const updateAppState = () => {
        if (getUserWorkPoligonData.value) {
          store.dispatch('loadWorkOrders');
        }
      };

      watch(() => store.getters.thereAreNewIncomingOrders, (val) => {
        if (val) {
          if (newIncomingOrdersSound) {
            newIncomingOrdersSound.volume = store.getters.getSoundsVolume;
            newIncomingOrdersSound.play();
          }
          store.commit(NOTIFIED_ABOUT_NEW_INCOMING_ORDERS);
        }
      });

      /**
       *
       */
      watch(() => store.getters.getLoginDateTime, (newLoginDateTime) => {
        if (newLoginDateTime) {
          store.commit(SET_START_DATE_TO_GET_DATA, newLoginDateTime);
          store.commit(DETERMINE_LOGOUT_ITEM_ACTION);
        }
      });

      /**
       * При смене рабочего полигона пользователя подгружаем информацию о:
       * - структуре данного рабочего полигона,
       * - шаблонах разного типа распоряжений данного рабочего полигона,
       * а также открываем WebSocket-соединение между клиентом и сервером,
       */
      watch(getUserWorkPoligon, (workPoligonNew) => {
        if (!workPoligonNew) {
          store.commit(DEL_CURR_WORK_POLIGON_DATA);
          store.commit(DEL_CURR_ORDER_PATTERN_DATA);
          store.commit(DEL_ORDER_PATTERNS_ELEMENTS_REFS);
          if (state.wsClient) {
            state.wsClient.closeWSConnection();
          }
        } else {
          store.dispatch('loadCurrWorkPoligonData');
          store.dispatch('loadOrderPatterns');
          store.dispatch('loadOrderPatternsElementsRefs');
          store.dispatch('loadIncomingOrdersPerShift');
          if (!state.wsClient) {
            state.wsClient = useWebSocket({ socketUrl: WS_SERVER_ADDRESS });
          }
        }
      });

      /**
       * При смене структуры рабочего полигона пользователя подгружаем информацию о:
       * - персонале данного рабочего полигона,
       * - параметрах последних распоряжений, изданных в рамках данного полигона,
       * - входящих уведомлениях и рабочих распоряжениях
       */
      watch(getUserWorkPoligonData, (workPoligonDataNew) => {
        if (!workPoligonDataNew) {
          // ...
          store.commit(DEL_CURR_LAST_ORDERS_PARAMS);
        } else {
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
        isUserAuthenticated: computed(() => store.getters.isUserAuthenticated),
        getUserCredential: computed(() => store.getters.getUserCredential),
        getUserWorkPoligon,
        hideBeforeLogoutDlg,
      };
    },
  };
</script>


<style lang="scss">
  @import "./assets/scss/App.scss";
</style>
