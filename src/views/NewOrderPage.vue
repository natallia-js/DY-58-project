<template>
  <!-- Параметр lazy должен быть обязательно, иначе придется переписывать код! -->
  <TabView v-if="canUserDispatchOrders" :activeIndex="activeIndex" lazy @tabChange="handleTabChange">
    <TabPanel v-if="isDNC" :header="ORDER_PATTERN_TYPES.ORDER">
      <new-order
        :orderType="ORDER_PATTERN_TYPES.ORDER"
        :orderPatternId="getOrderPatternIdPropValue(ORDER_PATTERN_TYPES.ORDER)"
        :prevOrderId="getPrevOrderIdPropValue(ORDER_PATTERN_TYPES.ORDER)"
        :orderDraftId="getOrderDraftIdPropValue(ORDER_PATTERN_TYPES.ORDER)"
        @changeProps="handleChangeRouteParams"
      />
    </TabPanel>
    <TabPanel v-if="isECD" :header="ORDER_PATTERN_TYPES.ECD_ORDER">
      <new-order
        :orderType="ORDER_PATTERN_TYPES.ECD_ORDER"
        :orderPatternId="getOrderPatternIdPropValue(ORDER_PATTERN_TYPES.ECD_ORDER)"
        :prevOrderId="getPrevOrderIdPropValue(ORDER_PATTERN_TYPES.ECD_ORDER)"
        :orderDraftId="getOrderDraftIdPropValue(ORDER_PATTERN_TYPES.ECD_ORDER)"
        @changeProps="handleChangeRouteParams"
      />
    </TabPanel>
    <TabPanel v-if="isECD" :header="ORDER_PATTERN_TYPES.ECD_PROHIBITION">
      <new-order
        :orderType="ORDER_PATTERN_TYPES.ECD_PROHIBITION"
        :orderPatternId="getOrderPatternIdPropValue(ORDER_PATTERN_TYPES.ECD_PROHIBITION)"
        :prevOrderId="getPrevOrderIdPropValue(ORDER_PATTERN_TYPES.ECD_PROHIBITION)"
        :orderDraftId="getOrderDraftIdPropValue(ORDER_PATTERN_TYPES.ECD_PROHIBITION)"
        @changeProps="handleChangeRouteParams"
      />
    </TabPanel>
    <TabPanel v-if="isDNC || isDSP_or_DSPoperator" :header="ORDER_PATTERN_TYPES.REQUEST">
      <new-order
        :orderType="ORDER_PATTERN_TYPES.REQUEST"
        :orderPatternId="getOrderPatternIdPropValue(ORDER_PATTERN_TYPES.REQUEST)"
        :prevOrderId="getPrevOrderIdPropValue(ORDER_PATTERN_TYPES.REQUEST)"
        :orderDraftId="getOrderDraftIdPropValue(ORDER_PATTERN_TYPES.REQUEST)"
        @changeProps="handleChangeRouteParams"
      />
    </TabPanel>
    <TabPanel
      v-if="isDNC || isECD || isDSP_or_DSPoperator"
      :header="isDNC || isDSP_or_DSPoperator ? ORDER_PATTERN_TYPES.NOTIFICATION : ORDER_PATTERN_TYPES.ECD_NOTIFICATION"
    >
      <new-order
        v-if="isDNC || isDSP_or_DSPoperator"
        :orderType="ORDER_PATTERN_TYPES.NOTIFICATION"
        :orderPatternId="getOrderPatternIdPropValue(ORDER_PATTERN_TYPES.NOTIFICATION)"
        :prevOrderId="getPrevOrderIdPropValue(ORDER_PATTERN_TYPES.NOTIFICATION)"
        :orderDraftId="getOrderDraftIdPropValue(ORDER_PATTERN_TYPES.NOTIFICATION)"
        @changeProps="handleChangeRouteParams"
      />
      <new-order
        v-if="isECD"
        :orderType="ORDER_PATTERN_TYPES.ECD_NOTIFICATION"
        :orderPatternId="getOrderPatternIdPropValue(ORDER_PATTERN_TYPES.ECD_NOTIFICATION)"
        :prevOrderId="getPrevOrderIdPropValue(ORDER_PATTERN_TYPES.ECD_NOTIFICATION)"
        :orderDraftId="getOrderDraftIdPropValue(ORDER_PATTERN_TYPES.ECD_NOTIFICATION)"
        @changeProps="handleChangeRouteParams"
      />
    </TabPanel>
  </TabView>
  <div v-else class="dy58-user-action-forbidden-block">
    Вы не на дежурстве либо у вас нет прав на издание документов
  </div>
</template>


<script>
  import { computed, onMounted, onUnmounted, ref } from 'vue';
  import { useStore } from 'vuex';
  import { useRoute, useRouter } from 'vue-router';
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
      const router = useRouter();

      store.commit(SET_ACTIVE_MAIN_MENU_ITEM, MainMenuItemsKeys.createOrder);

      const activeIndex = ref(TABS_INDEXES.FIRST_TAB);

      const isDNC = computed(() => store.getters.isDNC);
      const isECD = computed(() => store.getters.isECD);
      const isDSP_or_DSPoperator = computed(() => store.getters.isDSP_or_DSPoperator);

      const getOrderTypeByTabIndex = (tabIndex) => {
        switch (tabIndex) {
          case TABS_INDEXES.FIRST_TAB:
            return isDNC.value ? ORDER_PATTERN_TYPES.ORDER :
              isDSP_or_DSPoperator.value ? ORDER_PATTERN_TYPES.REQUEST :
              isECD.value ? ORDER_PATTERN_TYPES.ECD_ORDER : null;
          case TABS_INDEXES.SECOND_TAB:
            return isDNC.value ? ORDER_PATTERN_TYPES.REQUEST :
              isDSP_or_DSPoperator.value ? ORDER_PATTERN_TYPES.NOTIFICATION :
              isECD.value ? ORDER_PATTERN_TYPES.ECD_PROHIBITION : null;
          case TABS_INDEXES.THIRD_TAB:
            return isDNC.value ? ORDER_PATTERN_TYPES.NOTIFICATION :
              isECD.value ? ORDER_PATTERN_TYPES.ECD_NOTIFICATION : null;
        }
        return null;
      };

      onMounted(() => {
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
        // Если тип распоряжения не указан в адресной строке в момент загрузки, то определяем его
        if (route.params.orderType === 'null') {
          router.replace({
            name: 'NewOrderPage',
            params: {
              orderType: getOrderTypeByTabIndex(activeIndex.value),
              orderPatternSpecialSign: null,
              prevOrderId: null,
              orderDraftId: null,
            },
          });
        }
        // Выбираем online-пользователей станций и участков
        // (для автоматического отображения в списках выбора секции "Кому" создания распоряжения).
        store.commit(CHOOSE_ONLY_ONLINE_PERSONAL);
      });

      /**
       * После выгрузки компонента чистим списки адресатов распоряжения (делаем это именно здесь,
       * а не в onMounted, т.к. если это сделать в onMounted, то сотрутся все автоматически
       * выбранные при загрузке черновика распоряжения - и не только - адресаты).
       * ).
       */
      onUnmounted(() => {
        store.commit(CLEAR_SHIFT_FOR_SENDING_DATA);
      });

      /**
       * При смене закладок меняем url.
       */
      const handleTabChange = (event) => {
        router.replace({
          name: 'NewOrderPage',
          params: {
            orderType: getOrderTypeByTabIndex(event.index),
            orderPatternSpecialSign: null,
            prevOrderId: null,
            orderDraftId: null,
          },
        });
      };

      const handleChangeRouteParams = (newRouteParams) => {
        router.replace({ name: 'NewOrderPage', params: { ...newRouteParams } });
      };

      const getOrderPatternIdPropValue = (orderType) =>
        (route.params.orderType === orderType && route.params.orderPatternSpecialSign !== 'null') ?
        store.getters.getOrderPatternIdBySpecialSign(route.params.orderPatternSpecialSign) : null;

      const getPrevOrderIdPropValue = (orderType) =>
        (route.params.orderType === orderType && route.params.prevOrderId !== 'null') ? route.params.prevOrderId : null;

      const getOrderDraftIdPropValue = (orderType) =>
        (route.params.orderType === orderType && route.params.orderDraftId !== 'null') ? route.params.orderDraftId : null;

      return {
        activeIndex,
        canUserDispatchOrders: computed(() => store.getters.canUserDispatchOrders),
        isDSP_or_DSPoperator,
        isDNC,
        isECD,
        ORDER_PATTERN_TYPES,
        TABS_INDEXES,
        handleTabChange,
        handleChangeRouteParams,
        getOrderPatternIdPropValue,
        getPrevOrderIdPropValue,
        getOrderDraftIdPropValue,
      };
    },
  }
</script>
