<template>
  <div class="p-grid">
    <div class="p-inputgroup p-col-12">
      <span class="p-inputgroup-addon">
        <RadioButton
          class="dy58-addon-button"
          :value="ORDER_TEXT_SOURCE.pattern"
          v-model="state.orderTextSource"
          @change="handleFocusDropdown"
        />
      </span>
      <TreeSelect
        placeholder="Выберите шаблон распоряжения"
        v-model="state.orderPattern"
        :options="orderPatterns"
        style="width:100%"
        @show="handleFocusDropdown"
        @change="handleChooseOrderPattern"
      />
    </div>
    <div class="p-inputgroup p-col-12">
      <span class="p-inputgroup-addon">
        <RadioButton
          class="dy58-addon-button"
          :value="ORDER_TEXT_SOURCE.nopattern"
          v-model="state.orderTextSource"
          @change="handleFocusInput"
        />
      </span>
      <InputText
        placeholder="Либо введите наименование распоряжения"
        style="width:100%"
        v-model="state.orderTitle"
        @focus="handleFocusInput"
        @input="handleChangeOrderTitle"
      />
    </div>
    <div v-if="state.orderTextSource === ORDER_TEXT_SOURCE.nopattern" class="p-col-12">
      <textarea
        v-model="state.orderText"
        rows="5"
        :style="{ width: '100%', minWidth: '100%', maxWidth: '100%' }"
        class="p-component p-p-2"
      />
    </div>
    <div v-else-if="state.orderPattern" class="dy58-order-pattern-border p-col-12">
      <order-pattern-text
        :orderPattern="getSelectedOrderPattern.elements"
        :value="state.orderPatternText"
        @input="state.orderPatternText = $event"
      />
    </div>
  </div>
</template>


<script>
  import { computed, reactive, watch } from 'vue';
  import { useStore } from 'vuex';
  import OrderPatternText from './OrderPatternText';

  export default {
    name: 'dy58-order-text',

    components: {
      OrderPatternText,
    },

    emits: ['input'],

    props: {
      orderPatterns: {
        type: Array,
      },
    },

    setup(_props, { emit }) {
      const store = useStore();

      const ORDER_TEXT_SOURCE = {
        pattern: 'pattern',
        nopattern: 'nopattern',
      };

      const state = reactive({
        orderTextSource: '',
        orderPattern: null,
        orderPatternText: null,
        orderTitle: '',
        orderText: '',
      });

      const getSelectedOrderPattern = computed(() =>
        state.orderPattern ? store.getters.getOrderPatternById(Object.keys(state.orderPattern)[0]) : {}
      );

      const getOrderText = computed(() => state.orderText);

      watch(getOrderText, (newVal) =>
        emit('input', {
          orderTextSource: ORDER_TEXT_SOURCE.nopattern,
          orderTitle: state.orderTitle,
          orderText: newVal,
        })
      );

      const handleFocusDropdown = () => {
        state.orderTextSource = ORDER_TEXT_SOURCE.pattern;
        emit('input', {
          orderTextSource: ORDER_TEXT_SOURCE.pattern,
          orderTitle: getSelectedOrderPattern.value.title,
          orderText: state.orderPatternText,
        });
      };

      const handleChooseOrderPattern = () => {
        emit('input', {
          orderTextSource: ORDER_TEXT_SOURCE.pattern,
          orderTitle: getSelectedOrderPattern.value.title,
          orderText: getSelectedOrderPattern.value.elements,
        });
      };

      const handleFocusInput = () => {
        state.orderTextSource = ORDER_TEXT_SOURCE.nopattern;
        emit('input', {
          orderTextSource: ORDER_TEXT_SOURCE.nopattern,
          orderTitle: state.orderTitle,
          orderText: state.orderText,
        });
      };

      const handleChangeOrderTitle = (event) => {
        emit('input', {
          orderTextSource: ORDER_TEXT_SOURCE.nopattern,
          orderTitle: event.target.value,
          orderText: state.orderText,
        });
      };

      return {
        state,
        ORDER_TEXT_SOURCE,
        getSelectedOrderPattern,
        handleFocusDropdown,
        handleChooseOrderPattern,
        handleFocusInput,
        handleChangeOrderTitle,
      };
    },
  };
</script>
