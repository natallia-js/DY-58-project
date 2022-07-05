<template>
  <div class="p-d-flex p-flex-row p-flex-nowrap">
    <div>
      <Checkbox id="if-inputtext-checkbox" :binary="true" v-model="state.checked" />
      <label for="if-inputtext-checkbox">
        &#160;{{ checkboxText }}<span v-if="state.checked">&#160;</span>
      </label>
    </div>
    <div v-if="state.checked">
      <InputText
        type="text"
        style="width:100%"
        v-model="state.inputTextValue"
        :placeholder="placeholder"
      />
    </div>
  </div>
</template>


<script>
  /**
   * Компонент определения значения только в случае установки "галочки" в checkbox.
   */
  import { reactive, watch } from 'vue';

  export default {
    name: 'dy58-checkbox-and-input-or-nothing-component',

    props: {
      checkboxText: {
        type: String,
        required: false,
      },
      value: {
        type: String,
        required: false,
        default: null,
      },
      placeholder: {
        type: String,
        required: false,
      },
    },

    emits: ['input'],

    setup(props, { emit }) {
      const state = reactive({
        checked: false,
        inputTextValue: null,
      });

      watch(() => props.value, (newValue) => {
        if (!newValue) {
          if (state.checked) state.checked = false;
          if (state.inputTextValue) state.inputTextValue = null;
        } else {
          if (!state.checked) state.checked = true;
          const splittedValue = newValue.split(props.checkboxText);
          const inputTextValue = (splittedValue.length >= 2) ? splittedValue[1].slice(1) : newValue;
          if (state.inputTextValue !== inputTextValue)
            state.inputTextValue = inputTextValue;
        }
      }, { immediate: true });

      const emitCurrentValue = () => {
        if (!state.checked) {
          emit('input', null);
        } else {
          emit('input', `${props.checkboxText}${state.inputTextValue ? ' ' + state.inputTextValue : ''}`);
        }
      };

      watch(() => state.checked, () => emitCurrentValue());

      watch(() => state.inputTextValue, () => emitCurrentValue());

      return {
        state,
      };
    },
  }
</script>
