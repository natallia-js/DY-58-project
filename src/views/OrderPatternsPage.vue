<template>
  <TabView>
    <TabPanel header="Шаблоны по категориям">
      <order-patterns-tree />
    </TabPanel>
    <TabPanel v-if="!isDNC && !isECD" header="Создать шаблон">
      <create-order-pattern />
    </TabPanel>
  </TabView>
</template>


<script>
  import { mapGetters } from 'vuex';
  import { MainMenuItemsKeys } from '../store/modules/mainMenuItems';
  import OrderPatternsTree from '../components/OrderPatterns/OrderPatternsTree';
  import CreateOrderPattern from '../components/OrderPatterns/CreateOrderPattern';

  export default {
    name: 'dy58-order-patterns-page',

    components: {
      OrderPatternsTree,
      CreateOrderPattern,
    },

    computed: {
      ...mapGetters([
        'isDNC',
        'isECD',
      ]),

      getMainMenuItemsKeys() {
        return MainMenuItemsKeys;
      },
    },

    mounted() {
      this.$store.commit('setActiveMainMenuItem', this.getMainMenuItemsKeys.orderPatterns);
    },
  }
</script>
