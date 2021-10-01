<template>
  <TabView>
    <TabPanel v-if="isDNC || isECD" :header="isDNC ? getOrderTypes.ORDER : getOrderTypes.ECD_ORDER">
      <new-order v-if="isDNC" :orderType="getOrderTypes.ORDER" />
      <new-order v-if="isECD" :orderType="getOrderTypes.ECD_ORDER" />
    </TabPanel>
    <TabPanel v-if="isDNC || isDSP" :header="getOrderTypes.REQUEST">
      <new-order :orderType="getOrderTypes.REQUEST" />
    </TabPanel>
    <TabPanel
      v-if="isDNC || isECD || isDSP"
      :header="isDNC || isDSP ? getOrderTypes.NOTIFICATION : getOrderTypes.ECD_NOTIFICATION"
    >
      <new-order v-if="isDNC || isDSP" :orderType="getOrderTypes.NOTIFICATION" />
      <new-order v-if="isECD" :orderType="getOrderTypes.ECD_NOTIFICATION" />
    </TabPanel>
  </TabView>
</template>


<script>
  import { mapGetters } from 'vuex';
  import NewOrder from '../components/CreateOrders/NewOrder';
  import { MainMenuItemsKeys } from '../store/modules/mainMenuItems';
  import { ORDER_PATTERN_TYPES } from '../constants/orderPatterns';

  export default {
    name: 'dy58-new-order-page',

    components: {
      NewOrder,
    },

    computed: {
      ...mapGetters([
        'isDSP',
        'isDNC',
        'isECD',
      ]),

      getMainMenuItemsKeys() {
        return MainMenuItemsKeys;
      },

      getOrderTypes() {
        return ORDER_PATTERN_TYPES;
      },
    },

    mounted() {
      this.$store.commit('setActiveMainMenuItem', this.getMainMenuItemsKeys.createOrder);
    },
  }
</script>


<style scoped>
</style>
