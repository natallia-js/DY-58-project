<template>
  <Menubar class="dy58-1" :model="getMainMenuItems" />
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
  .dy58-1 {
    z-index: 900000 !important;
  }
</style>
