<template>
  <div v-if="!orderPatternsLoadedSuccessfully" class="dy58-user-action-forbidden-block dy58-error-message">
    {{ getErrorLoadingPatterns }}
  </div>
  <TabView v-else
    v-model:activeIndex="activeIndex"
    @tabClick="(event) => activeIndex = event.index"
  >
    <TabPanel header="Шаблоны по категориям">
      <order-patterns-tree />
    </TabPanel>
    <TabPanel v-if="/*!isDNC && !isECD && !isDSP_or_DSPoperator && !isStationWorksManager*/true" header="Создать шаблон">
      <create-order-pattern />
    </TabPanel>
  </TabView>
</template>


<script>
  import { computed, ref } from 'vue';
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

      // Вынужденная необходимость, т.к. в main.js присутствует TabView.methods.onTabClick
      const activeIndex = ref(0);

      store.commit(SET_ACTIVE_MAIN_MENU_ITEM, MainMenuItemsKeys.orderPatterns);

      return {
        activeIndex,
        isDNC: computed(() => store.getters.isDNC),
        isECD: computed(() => store.getters.isECD),
        isDSP_or_DSPoperator: computed(() => store.getters.isDSP_or_DSPoperator),
        isStationWorksManager: computed(() => store.getters.isStationWorksManager),
        orderPatternsLoadedSuccessfully : computed(() => store.getters.orderPatternsLoadedSuccessfully),
        getErrorLoadingPatterns: computed(() => store.getters.getErrorLoadingPatterns),
      };
    },
  }
</script>
