<template>
  <nav-bar v-if="isUserAuthenticated && getUserCredential && getUserWorkPoligon" />
  <router-view />
  <footer-bar v-if="isUserAuthenticated && getUserCredential && getUserWorkPoligon" />
</template>


<script>
  import { onMounted, onUnmounted, watch, computed, reactive } from 'vue';
  import { useStore } from 'vuex';
  import NavBar from './components/NavBar';
  import FooterBar from './components/FooterBar';
  import useWebSocket from './hooks/useWebSocket.hook';

  const WS_SERVER_ADDRESS = process.env.VUE_APP_WS_SERVER_ADDRESS;

  export default {
    name: 'dy-58-app',

    components: {
      NavBar,
      FooterBar,
    },

    setup() {
      const store = useStore();

      let timerId;
      let updateDataTimerId;

      const state = reactive({
        wsClient: null,
      });

      const isUserAuthenticated = computed(() => store.getters.isUserAuthenticated);
      const getUserCredential = computed(() => store.getters.getUserCredential);
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
        store.commit('setCurrDateTime', new Date());
      };

      const updateAppState = () => {
        if (getUserWorkPoligonData.value) {
          //store.dispatch('loadCurrSectorsShift');
          store.dispatch('loadWorkOrders');
        }
      };

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

      return {
        isUserAuthenticated,
        getUserCredential,
        getUserWorkPoligon,
      };
    },
  };
</script>


<style lang="scss">
  @import "./assets/scss/App.scss";
</style>
