<template>
  <Dropdown
    style="width:100%"
    v-model="selectedRef"
    :options="getPossibleElementRefs"
    placeholder="Выберите значение элемента"
  />
</template>


<script>
  import { mapGetters } from 'vuex';

  export default {
    name: 'dy58-element-ref-chooser',

    emits: ['changeRef'],

    props: {
      chosenRef: String,
      elementType: String,
    },

    data() {
      return {
        selectedRef: this.chosenRef,
      };
    },

    computed: {
      ...mapGetters([
        'getOrderPatternsElementsRefsForGivenElementType',
      ]),

      getPossibleElementRefs() {
        return this.getOrderPatternsElementsRefsForGivenElementType(this.elementType);
      },
    },

    watch: {
      chosenRef(newVal) {
        this.selectedRef = newVal;
      },
      selectedRef(newVal) {
        this.$emit('changeRef', newVal);
      },
    },
  };
</script>
