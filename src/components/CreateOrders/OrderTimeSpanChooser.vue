<template>
  <div class="p-grid">
    <div class="p-col-5">
      <div class="p-inputgroup">
        <Button label="с" class="dy58-addon-button" />
        <Calendar
          :showTime="true"
          hourFormat="24"
          :hideOnDateTimeSelect="true"
          :showIcon="true"
          :manualInput="true"
          v-model="state.startDateTime"
        />
      </div>
    </div>
    <div class="p-col-5">
      <div class="p-inputgroup">
        <Button label="по" class="dy58-addon-button" />
        <Calendar
          :showTime="true"
          hourFormat="24"
          :showIcon="true"
          :hideOnDateTimeSelect="true"
          :manualInput="true"
          v-model="state.endDateTime"
        />
      </div>
    </div>
    <div class="p-col-2">
      <Checkbox
        id="tillCancellation"
        :binary="true"
        v-model="state.tillCancellation"
      />
      <label for="tillCancellation">&#160;{{ tillCancellationLabel }}</label>
    </div>
  </div>
</template>


<script>
  import { computed, reactive, watch } from 'vue';
  import { useStore } from 'vuex';
  import isValidDateTime from '@/additional/isValidDateTime';

  export default {
    name: 'dy58-order-timespan-chooser',

    emits: ['input'],

    props: {
      tickTillCancellation: {
        type: Boolean,
        required: false,
      },
      tillCancellationLabel: {
        type: String,
        required: true,
      },
    },

    setup(props, { emit }) {
      const store = useStore();

      const state = reactive({
        startDateTime: null,
        endDateTime: null,
        tillCancellation: Boolean(props.tickTillCancellation),
      });

      watch(() => state.startDateTime, (value) => {
        if (value && isValidDateTime(value)) {
          state.startDateTime.setSeconds(0, 0);
        }
        emit('input', {
          start: state.startDateTime,
          end: state.tillCancellation ? null : state.endDateTime,
          tillCancellation: state.tillCancellation,
        });
      });

      watch(() => state.endDateTime, (value) => {
        if (value && isValidDateTime(value)) {
          state.endDateTime.setSeconds(0, 0);
        }
        emit('input', {
          start: state.startDateTime,
          end: state.tillCancellation ? null : state.endDateTime,
          tillCancellation: state.tillCancellation,
        });
      });

      watch(() => state.tillCancellation, (newVal) => {
        emit('input', {
          start: state.startDateTime,
          end: newVal ? null : state.endDateTime,
          tillCancellation: newVal,
        });
      });

      return {
        state,
        isDNC: computed(() => store.getters.isDNC),
      };
    },
  };
</script>
