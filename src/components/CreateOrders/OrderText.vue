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
        :value="state.orderPatternText"
        @input="handleChangeOrderPatternElementValue"
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
        // источник текста распоряжения (шаблон либо не шаблон)
        orderTextSource: '',
        // для шаблонного распоряжения
        orderPattern: null,
        orderPatternText: null,
        // для распоряжения без шаблона
        orderTitle: '',
        orderText: '',
      });

      const getSelectedOrderPattern = computed(() =>
        state.orderPattern ? store.getters.getOrderPatternById(Object.keys(state.orderPattern)[0]) : {}
      );

      const getCurrentOrderText = computed(() => state.orderText);

      watch(getCurrentOrderText, (newVal) =>
        emit('input', {
          orderTextSource: ORDER_TEXT_SOURCE.nopattern,
          orderTitle: state.orderTitle,
          orderText: newVal,
        })
      );

      const handleFocusDropdown = () => {
        if (state.orderTextSource !== ORDER_TEXT_SOURCE.pattern) {
          state.orderTextSource = ORDER_TEXT_SOURCE.pattern;
          emit('input', {
            orderTextSource: ORDER_TEXT_SOURCE.pattern,
            orderTitle: getSelectedOrderPattern.value.title,
            orderText: state.orderPatternText,
          });
        }
      };

      const handleChooseOrderPattern = () => {
        state.orderPatternText = getSelectedOrderPattern.value.elements.map((element) => {
          return { ...element };
        });
        emit('input', {
          orderTextSource: ORDER_TEXT_SOURCE.pattern,
          orderTitle: getSelectedOrderPattern.value.title,
          orderText: getSelectedOrderPattern.value.elements,
        });
      };

      const handleFocusInput = () => {
        if (state.orderTextSource !== ORDER_TEXT_SOURCE.nopattern) {
          state.orderTextSource = ORDER_TEXT_SOURCE.nopattern;
          emit('input', {
            orderTextSource: ORDER_TEXT_SOURCE.nopattern,
            orderTitle: state.orderTitle,
            orderText: state.orderText,
          });
        }
      };

      const handleChangeOrderTitle = (event) => {
        emit('input', {
          orderTextSource: ORDER_TEXT_SOURCE.nopattern,
          orderTitle: event.target.value,
          orderText: state.orderText,
        });
      };

      const handleChangeOrderPatternElementValue = (event) => {
        state.orderPatternText.forEach((element) => {
          if (element._id === event.elementId) {
            element.value = event.value;
          }
        });
        emit('input', {
          orderTextSource: ORDER_TEXT_SOURCE.pattern,
          orderTitle: getSelectedOrderPattern.value.title,
          orderText: state.orderPatternText,
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
        handleChangeOrderPatternElementValue,
      };
    },
  };
</script>
