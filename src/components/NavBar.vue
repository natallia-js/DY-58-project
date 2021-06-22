<template>
  <MegaMenu :model="getMainMenuItems" class="main-menu-tool-bar" />
</template>


<script>
  import { mapGetters } from 'vuex';

  export default {
    name: 'dy58-nav-bar',

    computed: mapGetters([
      'getMainMenuItems',
    ]),
  };
</script>


<style scoped>
</style>
