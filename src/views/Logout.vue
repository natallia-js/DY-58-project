<template>
  <div>Осуществляется выход из системы...</div>
</template>


<script>
  import { mapMutations } from 'vuex';

  export default {
    name: 'dy58-logout',

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
