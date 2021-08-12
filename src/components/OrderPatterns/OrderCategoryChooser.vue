<template>
  <div class="p-grid">
    <div class="p-inputgroup p-col-12">
      <span class="p-inputgroup-addon">
        <RadioButton
          class="dy58-addon-button"
          :value="ORDER_CATEGORY_VALUES.existing"
          v-model="state.orderCategoryEnterMode"
          @change="handleFocusDropdown"
        />
      </span>
      <Dropdown
        placeholder="Выберите существующую категорию"
        style="width:100%"
        :options="!existingOrderCategories ? [] : existingOrderCategories.map((category) => { return { label: category }; })"
        optionLabel="label"
        optionValue="label"
        v-model="state.dropdownValue"
        @focus="handleFocusDropdown"
        @change="handleChooseOrderCategory"
      />
    </div>
    <div class="p-inputgroup p-col-12">
      <span class="p-inputgroup-addon">
        <RadioButton
          class="dy58-addon-button"
          :value="ORDER_CATEGORY_VALUES.new"
          v-model="state.orderCategoryEnterMode"
          @change="handleFocusInput"
        />
      </span>
      <InputText
        placeholder="Либо создайте новую"
        style="width:100%"
        v-model="state.inputValue"
        @focus="handleFocusInput"
        @input="handleChangeOrderCategory"
      />
    </div>
  </div>
</template>


<script>
  import { reactive } from 'vue';

  export default {
    name: 'dy58-order-category-chooser',

    emits: ['input'],

    props: {
      existingOrderCategories: {
        type: Array,
      },
      value: {
        type: String,
      },
    },

    setup(_props, { emit }) {
      const ORDER_CATEGORY_VALUES = {
        existing: 'existing',
        new: 'new',
      };

      const state = reactive({
        dropdownValue: '',
        inputValue: '',
        orderCategoryEnterMode: '',
      });

      const handleFocusDropdown = () => {
        if (state.orderCategoryEnterMode !== ORDER_CATEGORY_VALUES.existing) {
          state.orderCategoryEnterMode = ORDER_CATEGORY_VALUES.existing;
          emit('input', state.dropdownValue);
        }
      };

      const handleChooseOrderCategory = (event) => {
        emit('input', event.value);
      };

      const handleFocusInput = () => {
        if (state.orderCategoryEnterMode !== ORDER_CATEGORY_VALUES.new) {
          state.orderCategoryEnterMode = ORDER_CATEGORY_VALUES.new;
          emit('input', state.inputValue);
        }
      };

      const handleChangeOrderCategory = (event) => {
        emit('input', event.target.value);
      };

      return {
        state,
        ORDER_CATEGORY_VALUES,
        handleFocusDropdown,
        handleChooseOrderCategory,
        handleFocusInput,
        handleChangeOrderCategory,
      };
    },
  };
</script>
