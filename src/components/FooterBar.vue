<template>
  <footer class="dy58-footer">
    <last-system-messages class="p-mb-2"></last-system-messages>
    <server-conn-status></server-conn-status>
    <div class="p-text-right p-pt-3 p-pr-3">Журнал ДУ-58 ©2021 КТЦ БелЖД</div>
  </footer>
</template>


<script>
  import ServerConnStatus from '@/components/ServerConnStatus';
  import LastSystemMessages from '@/components/LastSystemMessages';

  export default {
    name: 'dy58-footer-bar',

    components: {
      ServerConnStatus,
      LastSystemMessages,
    },
  };
</script>
