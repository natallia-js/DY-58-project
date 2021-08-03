<template>
  <Dropdown
    style="width:120"
    v-model="selectedSize"
    :options="getPossibleElementSizes"
    placeholder="Выберите размер элемента"
  />
</template>


<script>
  import { PossibleElementSizes } from '../../constants/orderPatterns';

  export default {
    name: 'dy58-element-size-chooser',

    emits: ['changeSize'],

    props: {
      chosenSize: String,
    },

    data() {
      return {
        selectedSize: this.chosenSize,
      };
    },

    computed: {
      getPossibleElementSizes() {
        return Object.values(PossibleElementSizes);
      },
    },

    watch: {
      selectedSize(newVal) {
        this.$emit('changeSize', newVal);
      },
    },
  };
</script>
