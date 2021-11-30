<template>
  <PanelMenu :model="getLeftMenuItems">
    <template #item="{item}">
      <div class="p-panelmenu-panel" style="marginBottom:0.5rem">
        <div class="p-component p-panelmenu-header">
          <a
            class="p-panelmenu-header-link dy58-item-link"
          >
            <div :class="['p-grid',item.itemClass]" style="width:100%;margin:0;">
              <div class="p-col-10" style="height:100%;padding:0;">
                {{ item.label }}
              </div>
              <div class="p-col-2" style="height:100%;padding:0;">
                <Badge v-if="item.error" severity="danger" value="!" v-tooltip="item.error"></Badge>
                <Badge v-else-if="item.info" :value="item.info"></Badge>
              </div>
            </div>
          </a>
        </div>
      </div>
    </template>
  </PanelMenu>
</template>


<script>
  import { mapGetters } from 'vuex';

  export default {
    name: 'dy58-side-menu',

    computed: {
      ...mapGetters([
        'getLeftMenuItems',
      ]),
    },
  };
</script>


<style scoped>
</style>
