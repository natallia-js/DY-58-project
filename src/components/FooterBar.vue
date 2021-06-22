<template>
  <footer class="footer">
    <server-conn-status></server-conn-status>
    <div class="p-text-center">Журнал ДУ-58 ©2021 КТЦ БелЖД</div>
  </footer>
</template>


<script>
  import ServerConnStatus from '../components/ServerConnStatus.vue';

  export default {
    name: 'dy58-footer-bar',

    components: {
      ServerConnStatus,
    },
  };
</script>


<style scoped>
</style>
