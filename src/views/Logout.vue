<template>
  <div>Осуществляется выход из системы...</div>
</template>


<script>
  import { useStore } from 'vuex';
  import { useRouter } from 'vue-router';

  export default {
    name: 'dy58-logout',

    setup() {
      const store = useStore();
      const router = useRouter();

      store.dispatch('logout');
      router.push({ name: 'AuthPage' });
    },
  };
</script>
