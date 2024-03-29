<template>
  <!-- Параметр lazy должен быть обязательно, иначе придется переписывать код! -->
  <TabView v-if="canUserDispatchOrders"
    v-model:activeIndex="activeIndex"
    lazy
    @tabClick="handleTabClick"
    @tabChange="handleTabChange"
    :key="tabViewKey"
  >
    <TabPanel v-if="isDNC" :header="ORDER_PATTERN_TYPES.ORDER">
      <new-order
        :orderType="ORDER_PATTERN_TYPES.ORDER"
        :orderId="getOrderIdPropValue(ORDER_PATTERN_TYPES.ORDER)"
        :orderPatternId="getOrderPatternIdPropValue(ORDER_PATTERN_TYPES.ORDER)"
        :prevOrderId="getPrevOrderIdPropValue(ORDER_PATTERN_TYPES.ORDER)"
        :orderDraftId="getOrderDraftIdPropValue(ORDER_PATTERN_TYPES.ORDER)"
        @changeProps="handleChangeRouteParams"
      />
    </TabPanel>
    <TabPanel v-if="isECD" :header="ORDER_PATTERN_TYPES.ECD_ORDER">
      <new-order
        :orderType="ORDER_PATTERN_TYPES.ECD_ORDER"
        :orderId="getOrderIdPropValue(ORDER_PATTERN_TYPES.ECD_ORDER)"
        :orderPatternId="getOrderPatternIdPropValue(ORDER_PATTERN_TYPES.ECD_ORDER)"
        :prevOrderId="getPrevOrderIdPropValue(ORDER_PATTERN_TYPES.ECD_ORDER)"
        :orderDraftId="getOrderDraftIdPropValue(ORDER_PATTERN_TYPES.ECD_ORDER)"
        @changeProps="handleChangeRouteParams"
      />
    </TabPanel>
    <TabPanel v-if="isECD" :header="ORDER_PATTERN_TYPES.ECD_PROHIBITION">
      <new-order
        :orderType="ORDER_PATTERN_TYPES.ECD_PROHIBITION"
        :orderId="getOrderIdPropValue(ORDER_PATTERN_TYPES.ECD_PROHIBITION)"
        :orderPatternId="getOrderPatternIdPropValue(ORDER_PATTERN_TYPES.ECD_PROHIBITION)"
        :prevOrderId="getPrevOrderIdPropValue(ORDER_PATTERN_TYPES.ECD_PROHIBITION)"
        :orderDraftId="getOrderDraftIdPropValue(ORDER_PATTERN_TYPES.ECD_PROHIBITION)"
        @changeProps="handleChangeRouteParams"
      />
    </TabPanel>
    <TabPanel v-if="isDNC || isDSP_or_DSPoperator || isStationWorksManager" :header="ORDER_PATTERN_TYPES.REQUEST">
      <new-order
        :orderType="ORDER_PATTERN_TYPES.REQUEST"
        :orderId="getOrderIdPropValue(ORDER_PATTERN_TYPES.REQUEST)"
        :orderPatternId="getOrderPatternIdPropValue(ORDER_PATTERN_TYPES.REQUEST)"
        :prevOrderId="getPrevOrderIdPropValue(ORDER_PATTERN_TYPES.REQUEST)"
        :orderDraftId="getOrderDraftIdPropValue(ORDER_PATTERN_TYPES.REQUEST)"
        @changeProps="handleChangeRouteParams"
      />
    </TabPanel>
    <TabPanel
      v-if="isDNC || isECD || isDSP_or_DSPoperator || isStationWorksManager"
      :header="isDNC || isDSP_or_DSPoperator || isStationWorksManager ? ORDER_PATTERN_TYPES.NOTIFICATION : ORDER_PATTERN_TYPES.ECD_NOTIFICATION"
    >
      <new-order
        v-if="isDNC || isDSP_or_DSPoperator || isStationWorksManager"
        :orderType="ORDER_PATTERN_TYPES.NOTIFICATION"
        :orderId="getOrderIdPropValue(ORDER_PATTERN_TYPES.NOTIFICATION)"
        :orderPatternId="getOrderPatternIdPropValue(ORDER_PATTERN_TYPES.NOTIFICATION)"
        :prevOrderId="getPrevOrderIdPropValue(ORDER_PATTERN_TYPES.NOTIFICATION)"
        :orderDraftId="getOrderDraftIdPropValue(ORDER_PATTERN_TYPES.NOTIFICATION)"
        @changeProps="handleChangeRouteParams"
      />
      <new-order
        v-if="isECD"
        :orderType="ORDER_PATTERN_TYPES.ECD_NOTIFICATION"
        :orderId="getOrderIdPropValue(ORDER_PATTERN_TYPES.ECD_NOTIFICATION)"
        :orderPatternId="getOrderPatternIdPropValue(ORDER_PATTERN_TYPES.ECD_NOTIFICATION)"
        :prevOrderId="getPrevOrderIdPropValue(ORDER_PATTERN_TYPES.ECD_NOTIFICATION)"
        :orderDraftId="getOrderDraftIdPropValue(ORDER_PATTERN_TYPES.ECD_NOTIFICATION)"
        @changeProps="handleChangeRouteParams"
      />
    </TabPanel>
  </TabView>
  <div v-else class="dy58-user-action-forbidden-block dy58-error-message">
    <span v-if="!ifUserWorksOffline">Вы не на дежурстве либо у вас нет прав на издание документов</span>
    <span v-else class="dy58-error-message">Издание документов при автономной работе с системой невозможно</span>
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
  import requireConfirmOnDataLoss from '@/additional/requireConfirmOnDataLoss';

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
      const isStationWorksManager = computed(() => store.getters.isStationWorksManager);
      let tabViewKey = ref(0);

      const getOrderTypeByTabIndex = (tabIndex) => {
        switch (tabIndex) {
          case TABS_INDEXES.FIRST_TAB:
            return isDNC.value
              ? ORDER_PATTERN_TYPES.ORDER
              : (isDSP_or_DSPoperator.value || isStationWorksManager.value)
                ? ORDER_PATTERN_TYPES.REQUEST
                : isECD.value
                  ? ORDER_PATTERN_TYPES.ECD_ORDER
                  : null;
          case TABS_INDEXES.SECOND_TAB:
            return isDNC.value
              ? ORDER_PATTERN_TYPES.REQUEST
              : (isDSP_or_DSPoperator.value || isStationWorksManager.value)
                ? ORDER_PATTERN_TYPES.NOTIFICATION
                : isECD.value
                  ? ORDER_PATTERN_TYPES.ECD_PROHIBITION
                  : null;
          case TABS_INDEXES.THIRD_TAB:
            return isDNC.value
              ? ORDER_PATTERN_TYPES.NOTIFICATION
              : isECD.value
                ? ORDER_PATTERN_TYPES.ECD_NOTIFICATION
                : null;
        }
        return null;
      };

      const getTabIndexByOrderType = () => {
        switch (route.params.orderType) {
          case ORDER_PATTERN_TYPES.ORDER:
            return TABS_INDEXES.FIRST_TAB;
          case ORDER_PATTERN_TYPES.REQUEST:
            return isDNC.value ? TABS_INDEXES.SECOND_TAB : TABS_INDEXES.FIRST_TAB;
          case ORDER_PATTERN_TYPES.NOTIFICATION:
            return isDNC.value ? TABS_INDEXES.THIRD_TAB : TABS_INDEXES.SECOND_TAB;
          case ORDER_PATTERN_TYPES.ECD_ORDER:
            return TABS_INDEXES.FIRST_TAB;
          case ORDER_PATTERN_TYPES.ECD_PROHIBITION:
            return TABS_INDEXES.SECOND_TAB;
          case ORDER_PATTERN_TYPES.ECD_NOTIFICATION:
            return TABS_INDEXES.THIRD_TAB;
          default:
            return TABS_INDEXES.FIRST_TAB;
        }
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
            if (isDSP_or_DSPoperator.value || isStationWorksManager.value) {
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
              orderId: null,
              orderPatternId: null,
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
       */
      onUnmounted(() => {
        store.commit(CLEAR_SHIFT_FOR_SENDING_DATA);
      });

      /**
       * Если пользователь переходит с закладки на закладку, при этом есть несохраненные изменения,
       * предупреждаем его о потере данных.
       */
      const handleTabClick = (event) => {
        const goToNextTab = () => { activeIndex.value = event.index };
        if (!store.getters.ifAllowApplicationNavigation) {
          if (requireConfirmOnDataLoss())
            goToNextTab();
        } else {
          goToNextTab();
        }
      };

      /**
       * При смене закладок меняем url.
       */
      const handleTabChange = (event) => {
        router.replace({
          name: 'NewOrderPage',
          params: {
            orderType: getOrderTypeByTabIndex(event.index),
            orderId: null,
            orderPatternId: null,
            orderPatternSpecialSign: null,
            prevOrderId: null,
            orderDraftId: null,
          },
        });
      };

      const handleChangeRouteParams = ({ newRouteParams, rerender }) => {
        router.replace({ name: 'NewOrderPage', params: { ...newRouteParams } })
          .then(() => {
            if (rerender) {
              tabViewKey.value += 1;
              activeIndex.value = getTabIndexByOrderType();
            }
          });
      };

      const getOrderIdPropValue = (orderType) =>
        (route.params.orderType === orderType && route.params.orderId !== 'null') ? route.params.orderId : null;

      const getOrderPatternIdPropValue = (orderType) =>
        (
          (route.params.orderType === orderType) &&
          (route.params.orderPatternId !== 'null' || route.params.orderPatternSpecialSign !== 'null')
        )
        ? store.getters.getSpecialOrderPatternId(
          orderType,
          route.params.orderPatternId === 'null' ? null : route.params.orderPatternId,
          route.params.orderPatternSpecialSign === 'null' ? null : route.params.orderPatternSpecialSign)
        : null;

      const getPrevOrderIdPropValue = (orderType) =>
        (route.params.orderType === orderType && route.params.prevOrderId !== 'null') ? route.params.prevOrderId : null;

      const getOrderDraftIdPropValue = (orderType) =>
        (route.params.orderType === orderType && route.params.orderDraftId !== 'null') ? route.params.orderDraftId : null;

      return {
        activeIndex,
        tabViewKey,
        canUserDispatchOrders: computed(() => store.getters.canUserDispatchOrders),
        ifUserWorksOffline: computed(() => store.getters.ifUserWorksOffline),
        isDSP_or_DSPoperator,
        isDNC,
        isECD,
        isStationWorksManager,
        ORDER_PATTERN_TYPES,
        TABS_INDEXES,
        handleTabClick,
        handleTabChange,
        handleChangeRouteParams,
        getOrderIdPropValue,
        getOrderPatternIdPropValue,
        getPrevOrderIdPropValue,
        getOrderDraftIdPropValue,
      };
    },
  }
</script>
