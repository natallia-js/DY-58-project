<template>
  <PanelMenu :model="getLeftMenuItems">
    <template #item="{item}">
      <div class="p-panelmenu-panel p-mb-2">
        <div class="p-component p-panelmenu-header">
          <a class="p-panelmenu-header-link dy58-item-link">
            <div :class="['p-grid',item.itemClass]" style="width:100%;margin:0;">
              <div class="p-col-10 p-pt-0 p-pb-0 p-pl-0 p-pr-1" style="height:100%">
                {{ item.label }}
              </div>
              <div class="p-col-2" style="height:100%;padding:0;">
                <Badge v-if="item.error" severity="danger" value="!" v-tooltip="item.error"></Badge>
                <Badge v-else-if="item.info" :value="item.info"></Badge>
                <Badge v-else-if="item.dangerInfo" severity="danger" :value="item.dangerInfo"></Badge>
              </div>
            </div>
          </a>
        </div>
      </div>
    </template>
  </PanelMenu>
</template>


<script>
  import { computed } from 'vue';
  import { useStore } from 'vuex';

  export default {
    name: 'dy58-side-menu',

    setup() {
      const store = useStore();

      return {
        getLeftMenuItems: computed(() => store.getters.getLeftMenuItems),
      };
    },
  };
</script>


<style lang="scss" scoped>
  .p-panelmenu :deep(.p-panelmenu-header-link) {
    cursor: default;
  }
</style>
