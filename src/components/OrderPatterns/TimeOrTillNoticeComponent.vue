<template>
  <div class="p-d-flex p-flex-row p-flex-nowrap">
    <div>
      <Calendar
        :showTime="true"
        :timeOnly="true"
        :showIcon="true"
        :hideOnDateTimeSelect="true"
        :manualInput="true"
        :placeholder="placeholder"
        v-model="state.timeValue"
        class="dy58-datetime-element"
      >
        <template #footer>
          <Button @click="state.timeValue = new Date()" class="p-mb-2 p-ml-2">
            Текущее время
          </Button>
        </template>
      </Calendar>
    </div>
    <div class="p-ml-2 p-mr-2">/</div>
    <div>
      <Checkbox id="till-notice-checkbox" :binary="true" v-model="state.tillNotice" />
      <label for="till-notice-checkbox">&#160;уведомления</label>
    </div>
  </div>
</template>


<script>
  /**
   * Компонент определения времени либо значения "до уведомления".
   */
  import { reactive, watch } from 'vue';

  export default {
    name: 'dy58-time-or-till-notice-component',

    props: {
      value: {
        type: [Object, String, Boolean],
        required: false,
        validator: propValue => {
          if (typeof propValue === 'object' && propValue instanceof Date)
            return true;
          if (typeof propValue === 'boolean' || (typeof propValue === 'string' && ['true','false'].includes(propValue)))
            return true;
          if (typeof propValue === 'string')
            // часы:минуты в 24-часовом формате
            return new RegExp('^(2[0-3]|[01]?[0-9]):([0-5]?[0-9])$').test(propValue)
          return false;
        },
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
        timeValue: null,
        tillNotice: false,
      });

      watch(() => props.value, (newValue) => {
        if (!newValue) {
          if (state.timeValue) state.timeValue = null;
          if (state.tillNotice) state.tillNotice = false;
        } else if (newValue instanceof Date)
          state.timeValue = newValue;
        else if (typeof newValue === 'boolean')
          state.tillNotice = newValue;
        else if (typeof newValue === 'string') {
          if (['true','false'].includes(newValue))
            state.tillNotice = (newValue === 'true');
          else {
            const now = new Date().toISOString();
            state.timeValue = new Date(`${now.split('T')[0]}T${newValue}:00.000Z`);
          }
        }
      }, { immediate: true });

      // Возвращается значение одного из типов: null, boolean, Date
      const emitNewValue = () => {
        const newValue = (!state.timeValue && !state.tillNotice) ? null : (state.timeValue || state.tillNotice);
        if (newValue !== state.lastEmittedValue) {
          state.lastEmittedValue = newValue;
          emit('input', newValue);
        }
      };

      watch(() => state.timeValue, (newTimeValue) => {
        if (newTimeValue)
          state.tillNotice = false;
        emitNewValue();
      });

      watch(() => state.tillNotice, (newTillNoticeValue) => {
        if (newTillNoticeValue)
          state.timeValue = null;
        emitNewValue();
      });

      return {
        state,
      };
    },
  }
</script>
