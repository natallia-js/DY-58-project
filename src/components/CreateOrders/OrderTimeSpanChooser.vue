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
          :manualInput="false"
          v-model="state.startDateTime"
          @dateSelect="handleChangeStartDateTime"
        />
      </div>
    </div>
    <div class="p-col-5">
      <div class="p-inputgroup">
        <Button label="до" class="dy58-addon-button" />
        <Calendar
          :showTime="true"
          hourFormat="24"
          :showIcon="true"
          :hideOnDateTimeSelect="true"
          :manualInput="false"
          v-model="state.endDateTime"
          @dateSelect="handleChangeEndDateTime"
        />
      </div>
    </div>
    <div class="p-col-2">
      <Checkbox
        id="tillCancellation"
        :binary="true"
        v-model="state.tillCancellation"
      />
      <label for="tillCancellation"> До {{ isDNC ? 'отмены' : 'уведомления' }}</label>
    </div>
  </div>
</template>


<script>
  import { computed, reactive, watch } from 'vue';
  import { useStore } from 'vuex';

  export default {
    name: 'dy58-order-timespan-chooser',

    emits: ['input'],

    setup(_props, { emit }) {
      const store = useStore();

      const state = reactive({
        startDateTime: null,
        endDateTime: null,
        tillCancellation: false,
      });

      const isDNC = computed(() => store.getters.isDNC);

      const getTillCancellation = computed(() => {
        return state.tillCancellation;
      });

      const handleChangeStartDateTime = (value) => {
        emit('input', {
          start: value,
          end: state.tillCancellation ? null : state.endDateTime,
          tillCancellation: state.tillCancellation,
        });
      };

      const handleChangeEndDateTime = (value) => {
        emit('input', {
          start: state.startDateTime,
          end: state.tillCancellation ? null : value,
          tillCancellation: state.tillCancellation,
        });
      };

      watch(getTillCancellation, (newVal) => {
        emit('input', {
          start: state.startDateTime,
          end: newVal ? null : state.endDateTime,
          tillCancellation: state.tillCancellation,
        });
      });

      return {
        state,
        isDNC,
        handleChangeStartDateTime,
        handleChangeEndDateTime,
      };
    },
  };
</script>
