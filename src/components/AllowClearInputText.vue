<template>
  <span class="p-input-icon-right" :style="style">
    <i class="pi pi-times" @click="handleClearValue" />
    <InputText type="text" style="width:100%" v-model="elementValue" />
  </span>
</template>

<script>
  export default {
    name: 'dy58-allow-clear-input-text',

    emits: ['changeValue'],

    props: {
      value: String,
      style: Object,
    },

    data() {
      return {
        elementValue: null,
      };
    },

    watch: {
      value(newVal) {console.log('!!!',newVal)
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
