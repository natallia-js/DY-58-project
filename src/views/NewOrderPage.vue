<template>
  <TabView v-if="canUserDispatchOrders" :activeIndex="activeIndex">
    <TabPanel v-if="isDNC" :header="getOrderTypes.ORDER">
      <new-order
        :orderType="getOrderTypes.ORDER"
        :prevOrderId="this.$route.params.prevOrderId"
      />
    </TabPanel>
    <TabPanel v-if="isECD" :header="getOrderTypes.ECD_ORDER">
      <new-order
        :orderType="getOrderTypes.ECD_ORDER"
        :prevOrderId="this.$route.params.prevOrderId"
      />
    </TabPanel>
    <TabPanel v-if="isECD" :header="getOrderTypes.ECD_PROHIBITION">
      <new-order
        :orderType="getOrderTypes.ECD_PROHIBITION"
        :prevOrderId="this.$route.params.prevOrderId"
      />
    </TabPanel>
    <TabPanel v-if="isDNC || isDSP_or_DSPoperator" :header="getOrderTypes.REQUEST">
      <new-order
        :orderType="getOrderTypes.REQUEST"
        :prevOrderId="this.$route.params.prevOrderId"
      />
    </TabPanel>
    <TabPanel
      v-if="isDNC || isECD || isDSP_or_DSPoperator"
      :header="isDNC || isDSP_or_DSPoperator ? getOrderTypes.NOTIFICATION : getOrderTypes.ECD_NOTIFICATION"
    >
      <new-order
        v-if="isDNC || isDSP_or_DSPoperator"
        :orderType="getOrderTypes.NOTIFICATION"
        :prevOrderId="this.$route.params.prevOrderId"
      />
      <new-order
        v-if="isECD"
        :orderType="getOrderTypes.ECD_NOTIFICATION"
        :prevOrderId="this.$route.params.prevOrderId"
      />
    </TabPanel>
  </TabView>
  <div v-else class="dy58-user-cannot-create-order-block">
    Вы не на дежурстве либо у вас нет прав на издание распоряжений
  </div>
</template>


<script>
  import { mapGetters } from 'vuex';
  import NewOrder from '@/components/CreateOrders/NewOrder/index';
  import { MainMenuItemsKeys } from '@/store/modules/mainMenuItems';
  import { SET_ACTIVE_MAIN_MENU_ITEM } from '@/store/mutation-types';
  import { ORDER_PATTERN_TYPES } from '@/constants/orderPatterns';

  export default {
    name: 'dy58-new-order-page',

    components: {
      NewOrder,
    },

    data() {
      return {
        activeIndex: 0,
      };
    },

    computed: {
      ...mapGetters([
        'canUserDispatchOrders',
        'isDSP_or_DSPoperator',
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
      this.$store.commit(SET_ACTIVE_MAIN_MENU_ITEM, this.getMainMenuItemsKeys.createOrder);

      switch (this.$route.params.orderType) {
        case ORDER_PATTERN_TYPES.ORDER:
          // Ничего не делаем, т.к. индекс соответствующей закладки у ДНЦ = 0
          break;
        case ORDER_PATTERN_TYPES.REQUEST:
          // У ДСП ничего не делаем, т.к. индекс соответствующей закладки у ДСП = 0
          if (this.isDNC) {
            this.activeIndex = 1;
          }
          break;
        case ORDER_PATTERN_TYPES.NOTIFICATION:
          if (this.isDSP_or_DSPoperator) {
            this.activeIndex = 1;
          }
          else if (this.isDNC) {
            this.activeIndex = 2;
          }
          break;
        case ORDER_PATTERN_TYPES.ECD_ORDER:
          // Ничего не делаем, т.к. индекс соответствующей закладки у ЭЦД = 0
          break;
        case ORDER_PATTERN_TYPES.ECD_PROHIBITION:
          this.activeIndex = 1;
          break;
        case ORDER_PATTERN_TYPES.ECD_NOTIFICATION:
          this.activeIndex = 2;
          break;
      }
    },
  }
</script>
