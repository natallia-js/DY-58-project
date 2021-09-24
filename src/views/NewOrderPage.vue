<template>
  <TabView>
    <TabPanel v-if="isDNC || isECD" :header="isDNC ? getOrderTypes.ORDER : getOrderTypes.ECD_ORDER">
      <new-order v-if="isDNC" :orderType="getOrderTypes.ORDER" />
      <new-order v-if="isECD" :orderType="getOrderTypes.ECD_ORDER" />
    </TabPanel>
    <TabPanel v-if="isDNC || isDSP" :header="getOrderTypes.REQUEST">
      <new-order :orderType="getOrderTypes.REQUEST" />
    </TabPanel>
    <TabPanel v-if="isDNC || isECD || isDSP" :header="isDNC || isDSP ? getOrderTypes.NOTIFICATION : getOrderTypes.ECD_NOTIFICATION">
      <new-notification/>
    </TabPanel>
  </TabView>
</template>


<script>
  import { mapGetters } from 'vuex';
  import NewOrder from '../components/CreateOrders/NewOrder';
  import NewNotification from '../components/CreateOrders/NewNotification';
  import { MainMenuItemsKeys } from '../store/modules/mainMenuItems';
  import { OrderTypes } from '../constants/orders';

  export default {
    name: 'dy58-new-order-page',

    components: {
      NewOrder,
      NewNotification,
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
        return OrderTypes;
      },
    },

    mounted() {
      this.$store.commit('setActiveMainMenuItem', this.getMainMenuItemsKeys.createOrder);
    },
  }
</script>


<style scoped>
</style>
