<template>
  <footer class="dy58-footer">
    <server-conn-status></server-conn-status>
    <div class="p-text-right p-pt-3">Журнал ДУ-58 ©2021 КТЦ БелЖД</div>
  </footer>
</template>


<script>
  import ServerConnStatus from '@/components/ServerConnStatus.vue';

  export default {
    name: 'dy58-footer-bar',

    components: {
      ServerConnStatus,
    },
  };
</script>
