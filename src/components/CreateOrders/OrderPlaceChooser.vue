<template>
  <div class="p-grid">
    <div class="p-inputgroup p-col-12">
      <span class="p-inputgroup-addon">
        <RadioButton
          class="dy58-addon-button"
          :value="ORDER_PLACE_VALUES.station"
          v-model="state.orderPlaceEnterMode"
          @change="handleFocusStationDropdown"
        />
      </span>
      <Dropdown
        placeholder="Выберите станцию"
        style="width:100%"
        :options="stations"
        optionLabel="title"
        optionValue="id"
        v-model="state.stationValue"
        @focus="handleFocusStationDropdown"
        @change="handleChooseStation"
      />
    </div>
    <div class="p-inputgroup p-col-12">
      <span class="p-inputgroup-addon">
        <RadioButton
          class="dy58-addon-button"
          :value="ORDER_PLACE_VALUES.span"
          v-model="state.orderPlaceEnterMode"
          @change="handleFocusSpanDropdown"
        />
      </span>
      <Dropdown
        placeholder="Выберите перегон"
        style="width:100%"
        :options="spans"
        optionLabel="title"
        optionValue="id"
        v-model="state.spanValue"
        @focus="handleFocusSpanDropdown"
        @change="handleChooseSpan"
      />
    </div>
  </div>
</template>


<script>
  import { reactive } from 'vue';

  export default {
    name: 'dy58-order-place-chooser',

    emits: ['input'],

    props: {
      stations: {
        type: Array,
      },
      spans: {
        type: Array,
      },
    },

    setup(_props, { emit }) {
      const ORDER_PLACE_VALUES = {
        station: 'station',
        span: 'span',
      };

      const state = reactive({
        stationValue: '',
        spanValue: '',
        orderPlaceEnterMode: '',
      });

      const handleFocusStationDropdown = () => {
        if (state.orderPlaceEnterMode !== ORDER_PLACE_VALUES.station) {
          state.orderPlaceEnterMode = ORDER_PLACE_VALUES.station;
          emit('input', { place: ORDER_PLACE_VALUES.station, value: state.stationValue });
        }
      };

      const handleFocusSpanDropdown = () => {
        if (state.orderPlaceEnterMode !== ORDER_PLACE_VALUES.span) {
          state.orderPlaceEnterMode = ORDER_PLACE_VALUES.span;
          emit('input', { place: ORDER_PLACE_VALUES.span, value: state.spanValue });
        }
      };

      const handleChooseStation = (event) => {
        emit('input', { place: ORDER_PLACE_VALUES.station, value: event.value });
      };

      const handleChooseSpan = (event) => {
        emit('input', { place: ORDER_PLACE_VALUES.span, value: event.value });
      };

      return {
        state,
        ORDER_PLACE_VALUES,
        handleFocusStationDropdown,
        handleFocusSpanDropdown,
        handleChooseSpan,
        handleChooseStation,
      };
    },
  };
</script>
