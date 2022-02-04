<template>
  <div class="p-mb-2">
    <RadioButton
      id="value1"
      name="selectDateTimeMode"
      :value="DATETIME_SELECT_MODE.THIS_MONTH"
      v-model="state.selectDateTimeMode"
    />
    <label for="value1">&#160;этот месяц</label>
  </div>
  <div class="p-mb-2">
    <RadioButton
      id="value2"
      name="selectDateTimeMode"
      :value="DATETIME_SELECT_MODE.GIVEN_PERIOD"
      v-model="state.selectDateTimeMode"
    />
    <label for="value2">&#160;промежуток времени:</label>
  </div>
  <order-time-span-chooser
    tillCancellationLabel="по настоящее время"
    :value="state.timeSpan"
    @input="state.timeSpan = $event"
  />
</template>

<script>
  import { reactive, watch } from 'vue';
  import OrderTimeSpanChooser from '@/components/CreateOrders/OrderTimeSpanChooser';

  const DATETIME_SELECT_MODE = {
    THIS_MONTH: 'THIS_MONTH',
    GIVEN_PERIOD: 'GIVEN_PERIOD',
  };

  export default {
    name: 'dy58-find-orders-time-span-chooser',

    components: {
      OrderTimeSpanChooser
    },

    props: {
      // объект информации о временном промежутке (не используется для анализа и отображения, нужен лишь
      // для того, чтобы "наверху" можно было сделать аналог v-model)
      value: {
        type: Object,
      },
    },

    emits: ['input'],

    setup(_props, { emit }) {
      const state = reactive({
        selectDateTimeMode: DATETIME_SELECT_MODE.THIS_MONTH,
        // только для принятия данных от второго radio
        timeSpan: {
          start: null,
          end: null,
          tillCancellation: null,
        },
      });

      const informAboutCurrentMonthSearch = () => {
        const now = new Date();
        emit('input', { start: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0), end: null });
      };

      informAboutCurrentMonthSearch();

      watch(() => state.selectDateTimeMode, (newVal) => {
        if (newVal === DATETIME_SELECT_MODE.THIS_MONTH) {
          informAboutCurrentMonthSearch();
        } else {
          emit('input', { start: state.timeSpan.start, end: state.timeSpan.end });
        }
      });

      watch(() => state.timeSpan, (newVal) => {
        emit('input', { start: newVal.start, end: newVal.tillCancellation ? null : newVal.end });
      });

      return {
        state,
        DATETIME_SELECT_MODE,
      };
    },
  }
</script>
