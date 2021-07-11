<template>
  <span class="p-input-icon-right" :style="style">
    <i class="pi pi-times" @click="handleClearValue" />
    <InputText type="text" style="width:100%" v-model="elementValue" />
  </span>
</template>

<script>
  export default {
    name: 'dy58-allow-clear-input-text',

    props: {
      value: String,
      style: String,
    },

    data() {
      return {
        elementValue: null,
      };
    },

    watch: {
      value(newVal) {
        this.elementValue = newVal;
      },
      elementValue(newVal) {
        this.$emit('changeValue', newVal);
      },
    },

    methods: {
      handleClearValue() {
        this.elementValue = null;
      },
    },
  };
</script>
