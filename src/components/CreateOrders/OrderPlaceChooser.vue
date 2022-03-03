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
  import { reactive, watch } from 'vue';
  import { useStore } from 'vuex';
  import { ORDER_PLACE_VALUES } from '@/constants/orders';

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
      value: {
        type: Object,
      },
    },

    setup(props, { emit }) {
      const store = useStore();

      const state = reactive({
        stationValue: '',
        spanValue: '',
        orderPlaceEnterMode: '',
      });

      watch(() => props.value, (newVal) => {
        if (!newVal) {
          return;
        }
        let changedOrderPlaceEnterMode = false;
        let tmp = newVal.place || '';
        if (state.orderPlaceEnterMode !== tmp) {
          state.orderPlaceEnterMode = tmp;
          changedOrderPlaceEnterMode = true;
        }
        switch (state.orderPlaceEnterMode) {
          case ORDER_PLACE_VALUES.station:
            tmp = newVal.value || '';
            if (state.stationValue !== tmp) {
              // присваиваем id станции только если станция с таким id существует
              if (tmp && store.getters.getSectorStationOrBlockTitleById({ placeType: ORDER_PLACE_VALUES.station, id: tmp })) {
                state.stationValue = tmp;
              } else {
                state.stationValue = '';
              }
            }
            break;
          case ORDER_PLACE_VALUES.span:
            tmp = newVal.value || '';
            if (state.spanValue !== tmp) {
              // присваиваем id перегона только если перегон с таким id существует
              if (tmp && store.getters.getSectorStationOrBlockTitleById({ placeType: ORDER_PLACE_VALUES.span, id: tmp })) {
                state.spanValue = tmp;
              } else {
                state.spanValue = '';
              }
            }
            break;
          default:
            if (changedOrderPlaceEnterMode) {
              state.stationValue = '';
              state.spanValue = '';
              state.orderPlaceEnterMode = '';
            }
            break;
        }
      // call on page load (здесь обязательно, т.к. после перезагрузки страницы не будет отображено
      // место действия распоряжения, указанное в черновике)
      }, { immediate: true });

      const handleFocusStationDropdown = () => {
        state.orderPlaceEnterMode = ORDER_PLACE_VALUES.station;
        emit('input', { place: ORDER_PLACE_VALUES.station, value: state.stationValue });
      };

      const handleFocusSpanDropdown = () => {
        state.orderPlaceEnterMode = ORDER_PLACE_VALUES.span;
        emit('input', { place: ORDER_PLACE_VALUES.span, value: state.spanValue });
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
