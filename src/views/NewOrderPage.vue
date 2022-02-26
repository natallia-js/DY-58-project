<template>
  <TabView v-if="canUserDispatchOrders" :activeIndex="activeIndex" lazy>
    <TabPanel v-if="isDNC" :header="ORDER_PATTERN_TYPES.ORDER">
      <new-order
        :orderType="ORDER_PATTERN_TYPES.ORDER"
        :prevOrderId="this.$route.params.prevOrderId"
        :orderDraftId="currentOrderDraft && currentOrderDraft.type === ORDER_PATTERN_TYPES.ORDER ? this.$route.params.orderDraftId : null"
      />
    </TabPanel>
    <TabPanel v-if="isECD" :header="ORDER_PATTERN_TYPES.ECD_ORDER">
      <new-order
        :orderType="ORDER_PATTERN_TYPES.ECD_ORDER"
        :prevOrderId="this.$route.params.prevOrderId"
        :orderDraftId="currentOrderDraft && currentOrderDraft.type === ORDER_PATTERN_TYPES.ECD_ORDER ? this.$route.params.orderDraftId : null"
      />
    </TabPanel>
    <TabPanel v-if="isECD" :header="ORDER_PATTERN_TYPES.ECD_PROHIBITION">
      <new-order
        :orderType="ORDER_PATTERN_TYPES.ECD_PROHIBITION"
        :prevOrderId="this.$route.params.prevOrderId"
        :orderDraftId="currentOrderDraft && currentOrderDraft.type === ORDER_PATTERN_TYPES.ECD_PROHIBITION ? this.$route.params.orderDraftId : null"
      />
    </TabPanel>
    <TabPanel v-if="isDNC || isDSP_or_DSPoperator" :header="ORDER_PATTERN_TYPES.REQUEST">
      <new-order
        :orderType="ORDER_PATTERN_TYPES.REQUEST"
        :prevOrderId="this.$route.params.prevOrderId"
        :orderDraftId="currentOrderDraft && currentOrderDraft.type === ORDER_PATTERN_TYPES.REQUEST ? this.$route.params.orderDraftId : null"
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
        :orderDraftId="currentOrderDraft && currentOrderDraft.type === ORDER_PATTERN_TYPES.NOTIFICATION ? this.$route.params.orderDraftId : null"
      />
      <new-order
        v-if="isECD"
        :orderType="ORDER_PATTERN_TYPES.ECD_NOTIFICATION"
        :prevOrderId="this.$route.params.prevOrderId"
        :orderDraftId="currentOrderDraft && currentOrderDraft.type === ORDER_PATTERN_TYPES.ECD_NOTIFICATION ? this.$route.params.orderDraftId : null"
      />
    </TabPanel>
  </TabView>
  <div v-else class="dy58-user-cannot-create-order-block">
    Вы не на дежурстве либо у вас нет прав на издание распоряжений
  </div>
</template>


<script>
  import { computed, onMounted, onUnmounted, ref } from 'vue';
  import { useStore } from 'vuex';
  import { useRoute } from 'vue-router';
  import NewOrder from '@/components/CreateOrders/NewOrder/index';
  import { MainMenuItemsKeys } from '@/store/modules/mainMenuItems';
  import {
    CHOOSE_ONLY_ONLINE_PERSONAL,
    CLEAR_SHIFT_FOR_SENDING_DATA,
    SET_ACTIVE_MAIN_MENU_ITEM,
  } from '@/store/mutation-types';
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

      /**
       * После загрузки компонента выбираем online-пользователей станций и участков
       * (для автоматического отображения в списках выбора секции "Кому" создания распоряжения).
       */
      onMounted(() => {
        store.commit(CHOOSE_ONLY_ONLINE_PERSONAL);
      });

      /**
       * После выгрузки компонента чистим списки адресатов распоряжения (делаем это именно здесь,
       * а не в onMounted, т.к. если это сделать в onMounted, то сотрутся все автоматически
       * выбранные при загрузке черновика распоряжения адресаты).
       * ).
       */
      onUnmounted(() => {
        store.commit(CLEAR_SHIFT_FOR_SENDING_DATA);
      });

      return {
        activeIndex,
        canUserDispatchOrders: computed(() => store.getters.canUserDispatchOrders),
        isDSP_or_DSPoperator,
        isDNC,
        isECD,
        ORDER_PATTERN_TYPES,
        TABS_INDEXES,
        currentOrderDraft: computed(() => route.params.orderDraftId ? store.getters.getOrderDraftById(route.params.orderDraftId) : null),
      };
    },
  }
</script>
