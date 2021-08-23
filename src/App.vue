<template>
  <nav-bar v-if="isUserAuthenticated && getUserCredential && getUserWorkPoligon" />
  <router-view />
  <footer-bar v-if="isUserAuthenticated && getUserCredential && getUserWorkPoligon" />
</template>


<script>
  import NavBar from './components/NavBar';
  import FooterBar from './components/FooterBar';
  import { mapGetters } from 'vuex';
  import { onMounted } from 'vue';
  import { useStore } from 'vuex';
  import useWebSocketClient from './hooks/useWebSocketClient.hook';

  export default {
    name: 'dy-58-app',

    components: {
      NavBar,
      FooterBar,
    },

    computed: {
      ...mapGetters([
        'isUserAuthenticated',
        'getUserCredential',
        'getUserWorkPoligon',
        'getUserId',
      ]),
    },

    watch: {
      /**
       * При смене рабочего полигона пользователя подгружаем информацию о структуре данного рабочего полигона
       */
      getUserWorkPoligon: function(newVal) {
        if (!newVal) {
          this.$store.commit('delCurrWorkPoligonData');
        } else {
          this.$store.dispatch('loadCurrWorkPoligonData');
        }
      },

      /**
       * При смене пользователя подгружаем информацию о шаблонах распоряжений
       */
      getUserId: function(newVal) {
        if (!newVal) {
          this.$store.commit('delCurrOrderPatternsData');
        } else {
          this.$store.dispatch('loadOrderPatterns');
        }
      },
    },

    setup() {
      const store = useStore();
      const wsCient = useWebSocketClient();

      onMounted(() => {
        setInterval(updateCurrDateTime, 1000);
        wsCient.connect();
      });

      const updateCurrDateTime = () => {
        store.commit('setCurrDateTime', new Date());
      };

      return {
        //
      };
    },
  };
</script>


<style lang="scss">
  @import "./assets/scss/App.scss";
</style>
