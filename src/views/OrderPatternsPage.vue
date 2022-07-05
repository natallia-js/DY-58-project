<template>
  <div v-if="!orderPatternsLoadedSuccessfully" class="dy58-user-action-forbidden-block">
    {{ getErrorLoadingPatterns }}
  </div>
  <TabView v-else>
    <TabPanel header="Шаблоны по категориям">
      <order-patterns-tree />
    </TabPanel>
    <TabPanel v-if="!isDNC && /*!isECD &&*/ !isDSP_or_DSPoperator" header="Создать шаблон">
      <create-order-pattern />
    </TabPanel>
  </TabView>
</template>


<script>
  import { computed } from 'vue';
  import { useStore } from 'vuex';
  import { MainMenuItemsKeys } from '@/store/modules/mainMenuItems';
  import { SET_ACTIVE_MAIN_MENU_ITEM } from '@/store/mutation-types';
  import OrderPatternsTree from '@/components/OrderPatterns/OrderPatternsTree';
  import CreateOrderPattern from '@/components/OrderPatterns/CreateOrderPattern';

  export default {
    name: 'dy58-order-patterns-page',

    components: {
      OrderPatternsTree,
      CreateOrderPattern,
    },

    setup() {
      const store = useStore();

      store.commit(SET_ACTIVE_MAIN_MENU_ITEM, MainMenuItemsKeys.orderPatterns);

      return {
        isDNC: computed(() => store.getters.isDNC),
        isECD: computed(() => store.getters.isECD),
        isDSP_or_DSPoperator: computed(() => store.getters.isDSP_or_DSPoperator),
        orderPatternsLoadedSuccessfully : computed(() => store.getters.orderPatternsLoadedSuccessfully),
        getErrorLoadingPatterns: computed(() => store.getters.getErrorLoadingPatterns),
      };
    },
  }
</script>
