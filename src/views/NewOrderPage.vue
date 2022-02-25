<template>
  <TabView v-if="canUserDispatchOrders" :activeIndex="activeIndex" lazy>
    <TabPanel v-if="isDNC" :header="ORDER_PATTERN_TYPES.ORDER">
      <new-order
        :orderType="ORDER_PATTERN_TYPES.ORDER"
        :prevOrderId="this.$route.params.prevOrderId"
        :orderDraftType="this.$route.params.orderDraftType"
        :orderDraftId="this.$route.params.orderDraftId"
      />
    </TabPanel>
    <TabPanel v-if="isECD" :header="ORDER_PATTERN_TYPES.ECD_ORDER">
      <new-order
        :orderType="ORDER_PATTERN_TYPES.ECD_ORDER"
        :prevOrderId="this.$route.params.prevOrderId"
        :orderDraftType="this.$route.params.orderDraftType"
        :orderDraftId="this.$route.params.orderDraftId"
      />
    </TabPanel>
    <TabPanel v-if="isECD" :header="ORDER_PATTERN_TYPES.ECD_PROHIBITION">
      <new-order
        :orderType="ORDER_PATTERN_TYPES.ECD_PROHIBITION"
        :prevOrderId="this.$route.params.prevOrderId"
        :orderDraftType="this.$route.params.orderDraftType"
        :orderDraftId="this.$route.params.orderDraftId"
      />
    </TabPanel>
    <TabPanel v-if="isDNC || isDSP_or_DSPoperator" :header="ORDER_PATTERN_TYPES.REQUEST">
      <new-order
        :orderType="ORDER_PATTERN_TYPES.REQUEST"
        :prevOrderId="this.$route.params.prevOrderId"
        :orderDraftType="this.$route.params.orderDraftType"
        :orderDraftId="this.$route.params.orderDraftId"
      />
    </TabPanel>
    <TabPanel
      v-if="isDNC || isECD || isDSP_or_DSPoperator"
      :header="isDNC || isDSP_or_DSPoperator ? ORDER_PATTERN_TYPES.NOTIFICATION : ORDER_PATTERN_TYPES.ECD_NOTIFICATION"
    >
      <new-order
        v-if="isDNC || isDSP_or_DSPoperator"
        :orderType="ORDER_PATTERN_TYPES.NOTIFICATION"
        :prevOrderId="this.$route.params.prevOrderId"
        :orderDraftType="this.$route.params.orderDraftType"
        :orderDraftId="this.$route.params.orderDraftId"
      />
      <new-order
        v-if="isECD"
        :orderType="ORDER_PATTERN_TYPES.ECD_NOTIFICATION"
        :prevOrderId="this.$route.params.prevOrderId"
        :orderDraftType="this.$route.params.orderDraftType"
        :orderDraftId="this.$route.params.orderDraftId"
      />
    </TabPanel>
  </TabView>
  <div v-else class="dy58-user-cannot-create-order-block">
    Вы не на дежурстве либо у вас нет прав на издание распоряжений
  </div>
</template>


<script>
  import { computed, ref } from 'vue';
  import { useStore } from 'vuex';
  import { useRoute } from 'vue-router';
  import NewOrder from '@/components/CreateOrders/NewOrder/index';
  import { MainMenuItemsKeys } from '@/store/modules/mainMenuItems';
  import { SET_ACTIVE_MAIN_MENU_ITEM } from '@/store/mutation-types';
  import { ORDER_PATTERN_TYPES } from '@/constants/orderPatterns';

  const TABS_INDEXES = {
    FIRST_TAB: 0,
    SECOND_TAB: 1,
    THIRD_TAB: 2,
  };

  export default {
    name: 'dy58-new-order-page',

    components: {
      NewOrder,
    },

    setup() {
      const store = useStore();
      const route = useRoute();

      store.commit(SET_ACTIVE_MAIN_MENU_ITEM, MainMenuItemsKeys.createOrder);

      const activeIndex = ref(TABS_INDEXES.FIRST_TAB);

      const isDNC = computed(() => store.getters.isDNC);
      const isECD = computed(() => store.getters.isECD);
      const isDSP_or_DSPoperator = computed(() => store.getters.isDSP_or_DSPoperator);

      switch (route.params.orderType) {
        case ORDER_PATTERN_TYPES.ORDER:
          // Ничего не делаем, т.к. индекс соответствующей закладки у ДНЦ = 0
          break;
        case ORDER_PATTERN_TYPES.REQUEST:
          // У ДСП ничего не делаем, т.к. индекс соответствующей закладки у ДСП = 0
          if (isDNC.value) {
            activeIndex.value = TABS_INDEXES.SECOND_TAB;
          }
          break;
        case ORDER_PATTERN_TYPES.NOTIFICATION:
          if (isDSP_or_DSPoperator.value) {
            activeIndex.value = TABS_INDEXES.SECOND_TAB;
          }
          else if (isDNC.value) {
            activeIndex.value = TABS_INDEXES.THIRD_TAB;
          }
          break;
        case ORDER_PATTERN_TYPES.ECD_ORDER:
          // Ничего не делаем, т.к. индекс соответствующей закладки у ЭЦД = 0
          break;
        case ORDER_PATTERN_TYPES.ECD_PROHIBITION:
          activeIndex.value = TABS_INDEXES.SECOND_TAB;
          break;
        case ORDER_PATTERN_TYPES.ECD_NOTIFICATION:
          activeIndex.value = TABS_INDEXES.THIRD_TAB;
          break;
      }

      return {
        activeIndex,
        canUserDispatchOrders: computed(() => store.getters.canUserDispatchOrders),
        isDSP_or_DSPoperator,
        isDNC,
        isECD,
        ORDER_PATTERN_TYPES,
        TABS_INDEXES,
      };
    },
  }
</script>
