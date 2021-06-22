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
  import { mapGetters } from 'vuex';
  import { OrderInputTypes } from '../constants/orderInputTypes';

  export default {
    name: 'dy58-new-request-block',

    data() {
      return {
        selectedOrderInputType: OrderInputTypes[0],
      };
    },

    computed: {
      ...mapGetters([
        'getRequestPatterns',
      ]),

      getOrderInputTypes() {
        return OrderInputTypes;
      },
    },

    created() {
      console.log(this.getRequestPatterns)
    },
  }
</script>


<style scoped>
</style>
