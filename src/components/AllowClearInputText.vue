<template>
  <span class="p-input-icon-right" :style="style">
    <i class="pi pi-times" @click="handleClearInputTextValue" />
    <InputText
      type="text"
      :value="value"
      @input="handleChangeInputTextValue"
      :class="inputClass"
      :placeholder="placeholder"
      :style="style || 'width:100%'"
    />
  </span>
</template>

<script>
  export default {
    name: 'dy58-allow-clear-input-text',

    emits: ['input'],

    props: {
      value: {
        type: String,
      },
      style: {
        type: Object,
      },
      inputClass: {
        type: Object,
      },
      placeholder: {
        type: String,
      },
    },

    methods: {
      handleClearInputTextValue() {
        this.$emit('input', null);
      },
      handleChangeInputTextValue(event) {
        this.$emit('input', event.target.value);
      },
    },
  };
</script>
