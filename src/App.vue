<template>
  <nav-bar v-if="isUserAuthenticated && getUserCredential && getUserWorkPoligon" />
  <router-view />
  <footer-bar v-if="isUserAuthenticated && getUserCredential && getUserWorkPoligon" />
</template>


<script>
  import NavBar from './components/NavBar';
  import FooterBar from './components/FooterBar';
  import { mapGetters, mapMutations } from 'vuex';

  export default {
    name: 'dy-58-app',

    components: {
      NavBar,
      FooterBar,
    },

    computed: mapGetters([
      'isUserAuthenticated',
      'getUserCredential',
      'getUserWorkPoligon',
    ]),

    mounted() {
      setInterval(this.updateCurrDateTime, 1000);
    },

    methods: {
      ...mapMutations([
        'setCurrDateTime',
      ]),

      updateCurrDateTime() {
        this.setCurrDateTime(new Date());
      },
    },
  };
</script>


<style lang="scss">
  @import "./assets/scss/App.scss";
</style>
