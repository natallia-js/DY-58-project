<template>
  <div class="p-d-flex p-flex-row">
    <view-order-pattern-element-refs-dlg
      :elementType="elementType"
      :elementRefs="getPossibleElementRefsFullData"
      :showDlg="showViewOrderPatternElementRefsDlg"
      @close="closeViewOrderPatternElementRefsDlg"
    />
    <Dropdown
      style="width:100%"
      v-model="selectedRef"
      :options="getPossibleElementRefsStrings"
      placeholder="Выберите значение элемента"
    />
    <Button
      type="button"
      icon="pi pi-list"
      class="p-button-primary"
      v-tooltip.right="'Просмотреть список смысловых значений'"
      @click="openViewOrderPatternElementRefsDlg"
    >
    </Button>
  </div>
</template>


<script>
  import { mapGetters } from 'vuex';
  import ViewOrderPatternElementRefsDlg from '../ViewOrderPatternElementRefsDlg';
  import compareStrings from '@/additional/compareStrings';

  export default {
    name: 'dy58-element-ref-chooser',

    emits: ['changeRef'],

    components: {
      ViewOrderPatternElementRefsDlg,
    },

    props: {
      chosenRef: String,
      elementType: String,
    },

    data() {
      return {
        selectedRef: this.chosenRef,
        showViewOrderPatternElementRefsDlg: false,
      };
    },

    computed: {
      ...mapGetters([
        'getOrderPatternsElementsRefsForGivenElementType',
      ]),

      // Для отображения наименований смысловых значений в выпадающем списке
      getPossibleElementRefsStrings() {
        return this.getOrderPatternsElementsRefsForGivenElementType({
          elementType: this.elementType,
          onlyRefStrings: true,
          includeEmptyString: true,
        })
        .sort((a, b) => compareStrings(a.toLowerCase(), b.toLowerCase()));
      },

      // Для отображения таблицы смысловых значений
      getPossibleElementRefsFullData() {
        return this.getOrderPatternsElementsRefsForGivenElementType({ elementType: this.elementType })
          .sort((a, b) => compareStrings(a.refName.toLowerCase(), b.refName.toLowerCase()));
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

    methods: {
      openViewOrderPatternElementRefsDlg() {
        this.showViewOrderPatternElementRefsDlg = true;
      },
      closeViewOrderPatternElementRefsDlg() {
        this.showViewOrderPatternElementRefsDlg = false;
      },
    },
  };
</script>
