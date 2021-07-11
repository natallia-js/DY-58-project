<template>
  <Toast />
  <div class="p-grid">
    <div class="p-col-4">
      <order-category-chooser />
    </div>
    <div class="p-col-8">
    </div>
  </div>
</template>

<script>
  import OrderCategoryChooser from './OrderCategoryChooser';

  export default {
    components: {
      OrderCategoryChooser,
    },
  };
</script>
