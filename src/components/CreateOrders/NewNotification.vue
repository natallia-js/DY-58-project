<template>
  <div class="p-grid">
    <div class="p-col-6">
      <SelectButton v-model="selectedOrderInputType" :options="getOrderInputTypes" optionLabel="label" />
    </div>
    <div class="p-col-6">
    </div>
  </div>
</template>


<script>
  import { OrderInputTypes } from '../../constants/orderInputTypes';

  export default {
    name: 'dy58-new-notification-block',

    data() {
      return {
        selectedOrderInputType: OrderInputTypes[0],
      };
    },

    computed: {
      getOrderInputTypes() {
        return OrderInputTypes;
      },
    },
  }
</script>


<style scoped>
</style>
