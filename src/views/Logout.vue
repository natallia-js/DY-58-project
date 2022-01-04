<template>
  <div>Осуществляется выход из системы...</div>
</template>


<script>
  export default {
    name: 'dy58-logout',

    mounted() {
      this.$store.dispatch('logout');
      this.$router.push({ name: 'AuthPage' });
    },
  };
</script>
