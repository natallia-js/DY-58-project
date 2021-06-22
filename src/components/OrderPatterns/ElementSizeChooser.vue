<template>
  <Dropdown
    style="width:120"
    v-model="selectedSize"
    :options="getPossibleElementSizes"
    placeholder="Выберите размер элемента"
    @change="handleChangeSize"
  />
</template>


<script>
  import { PossibleElementSizes } from '../../constants/orderPatterns';

  export default {
    name: 'dy58-element-size-chooser',

    props: ['chosenSize'],

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

    methods: {
      handleChangeSize(e) {
        console.log(e)
      },
    },
  };
</script>
