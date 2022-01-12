<template>
  <div>Осуществляется выход из системы...</div>
</template>


<script>
  import { useStore } from 'vuex';
  import router from '@/router';

  export default {
    name: 'dy58-logout',

    setup() {
      const store = useStore();

      store.dispatch('logout');
      router.push({ name: 'AuthPage' });
    },
  };
</script>
