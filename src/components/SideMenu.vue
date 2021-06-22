<template>
  <PanelMenu :model="getLeftMenuItems" />
</template>


<script>
  import { mapGetters } from 'vuex';

  export default {
    name: 'dy58-side-menu',

    computed: {
      ...mapGetters([
        'getLeftMenuItems',
      ]),
    },
  };
</script>


<style scoped>
</style>
