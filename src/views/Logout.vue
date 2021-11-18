<template>
  <div>Осуществляется выход из системы...</div>
</template>


<script>
  import { mapMutations } from 'vuex';

  export default {
    name: 'dy58-logout',

    props: {
      //
    },

    mounted() {
      this.logout();
      this.$router.push({ name: 'AuthPage' });
    },

    methods: {
      ...mapMutations([
        'logout',
      ]),
    },
  };
</script>
