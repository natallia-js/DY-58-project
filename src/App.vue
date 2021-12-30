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

      const isUserAuthenticated = computed(() => store.getters.isUserAuthenticated);
      const getUserCredential = computed(() => store.getters.getUserCredential);
      const getUserWorkPoligon = computed(() => store.getters.getUserWorkPoligon);
      const getUserWorkPoligonData = computed(() => store.getters.getUserWorkPoligonData);
      const getLoginDateTime = computed(() => store.getters.getLoginDateTime);
      const getStartLogout = computed(() => store.getters.getStartLogout);

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
        store.commit('setCurrDateTime', new Date());
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
          store.commit('notifiedAboutNewIncomingOrders');
        }
      });

      /**
       *
       */
      watch(getLoginDateTime, (newLoginDateTime) => {
        if (newLoginDateTime) {
          store.commit('setStartDateToGetData', newLoginDateTime);
          store.commit('determineLogoutItemAction');
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
          store.commit('delCurrWorkPoligonData');
          store.commit('delCurrOrderPatternsData');
          store.commit('delOrderPatternsElementsRefs');
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
          store.commit('delCurrLastOrdersParams');
        } else {
          store.dispatch('loadCurrSectorsShift');
          store.dispatch('loadLastOrdersParams');
          store.dispatch('loadWorkOrders');
        }
      });

      watch(getStartLogout, (startLogoutVal) => {
        if (startLogoutVal) {
          state.showBeforeLogoutDlg = true;
        }
      });

      const hideBeforeLogoutDlg = () => {
        state.showBeforeLogoutDlg = false;
      };

      return {
        state,
        isUserAuthenticated,
        getUserCredential,
        getUserWorkPoligon,
        hideBeforeLogoutDlg,
      };
    },
  };
</script>


<style lang="scss">
  @import "./assets/scss/App.scss";
</style>
