<template>
  <TabView>
    <TabPanel header="Шаблоны по категориям">
      <order-patterns-tree />
    </TabPanel>
    <TabPanel header="Создать шаблон">
    </TabPanel>
  </TabView>
</template>


<script>
  import { MainMenuItemsKeys } from '../store/modules/mainMenuItems';
  import OrderPatternsTree from '../components/OrderPatterns/OrderPatternsTree';

  export default {
    name: 'dy58-order-patterns-page',

    components: {
      OrderPatternsTree,
    },

    computed: {
      getMainMenuItemsKeys() {
        return MainMenuItemsKeys;
      },
    },

    mounted() {
      this.$store.commit('setActiveMainMenuItem', this.getMainMenuItemsKeys.orderPatterns);
    },
  }
</script>
