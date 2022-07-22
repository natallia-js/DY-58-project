<template>
  <div>Осуществляется выход из системы...</div>
</template>


<script>
  import { useStore } from 'vuex';
  import { useRouter } from 'vue-router';
  import { LOGOUT_ACTION } from '@/store/action-types';

  export default {
    name: 'dy58-logout',

    setup() {
      const store = useStore();
      const router = useRouter();

      store.dispatch(LOGOUT_ACTION, { onlyLocally: store.getters.ifUserWorksOffline });
      router.push({ name: 'AuthPage' });
    },
  };
</script>
