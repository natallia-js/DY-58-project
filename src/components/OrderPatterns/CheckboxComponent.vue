<template>
  <div class="p-d-flex p-flex-row p-flex-nowrap">
    <div>
      <Checkbox id="checkbox" :binary="true" v-model="state.checked" />
      <label for="checkbox">
        &#160;{{ checkboxText }}
      </label>
    </div>
  </div>
</template>


<script>
  /**
   * Компонент установки "галочки" в checkbox.
   */
  import { reactive, watch } from 'vue';

  export default {
    name: 'dy58-checkbox-component',

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
    },

    emits: ['input'],

    setup(props, { emit }) {
      const state = reactive({
        checked: false,
      });

      watch(() => props.value, (newValue) => {
        if (!newValue) {
          if (state.checked) state.checked = false;
        } else {
          if (!state.checked) state.checked = true;
        }
      }, { immediate: true });

      const emitCurrentValue = () => {
        if (!state.checked) {
          emit('input', null);
        } else {
          emit('input', props.checkboxText);
        }
      };

      watch(() => state.checked, () => emitCurrentValue());

      return {
        state,
      };
    },
  }
</script>
