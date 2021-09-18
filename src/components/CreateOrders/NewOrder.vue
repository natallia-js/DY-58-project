<template>
  <div class="p-grid">
    <div class="p-col-6">
      <SelectButton v-model="state.selectedOrderInputType" :options="getOrderInputTypes" optionLabel="label" />
      <br />
      <form @submit.prevent="handleSubmit(!v$.$invalid)" class="p-grid">
        <div class="p-field p-col-4 p-d-flex p-flex-column">
          <label for="number" :class="{'p-error':v$.number.$invalid && submitted}">
            <span class="p-text-bold"><span style="color:red">*</span> Номер</span>
          </label>
          <InputText
            id="number"
            v-model="v$.number.$model"
            :class="{'p-invalid':v$.number.$invalid && submitted}"
          />
          <small
            v-if="(v$.number.$invalid && submitted) || v$.number.$pending.$response"
            class="p-error"
          >
            Не указан номер распоряжения
          </small>
        </div>
        <div class="p-field p-col-6 p-d-flex p-flex-column">
          <label for="createDateTime" :class="{'p-error':v$.createDateTime.$invalid && submitted}">
            <span class="p-text-bold"><span style="color:red">*</span> Дата и время создания</span>
          </label>
          <InputText
            id="createDateTime"
            disabled
            v-model="v$.createDateTime.$model"
            :class="{'p-invalid':v$.createDateTime.$invalid && submitted}"
          />
          <small
            v-if="(v$.createDateTime.$invalid && submitted) || v$.createDateTime.$pending.$response"
            class="p-error"
          >
            Не определены дата и время создания распоряжения
          </small>
        </div>
        <div class="p-field p-col-12 p-d-flex p-flex-column">
          <label for="place" :class="{'p-error':v$.place.$invalid && submitted}">
            <span class="p-text-bold"><span style="color:red">*</span> Место действия</span>
          </label>
          <order-place-chooser
            id="place"
            :spans="getSectorBlocks"
            :stations="getSectorStations"
            :value="v$.place.$model"
            @input="v$.place.$model = $event"
          />
          <small
            v-if="(v$.place.$invalid && submitted) || v$.place.$pending.$response"
            class="p-error"
          >
            Пожалуйста, определите место действия распоряжения
          </small>
        </div>
        <div class="p-field p-col-12 p-d-flex p-flex-column">
          <label for="timeSpan" :class="{'p-error':v$.timeSpan.$invalid && submitted}">
            <span class="p-text-bold"><span style="color:red">*</span> Время действия</span>
          </label>
          <order-time-span-chooser
            id="timeSpan"
            :value="v$.timeSpan.$model"
            @input="v$.timeSpan.$model = $event"
          />
          <small
            v-if="(v$.timeSpan.$invalid && submitted) || v$.timeSpan.$pending.$response"
            class="p-error"
          >
            Пожалуйста, корректно определите время действия распоряжения
          </small>
        </div>
        <div class="p-field p-col-12 p-d-flex p-flex-column">
          <label for="orderText" :class="{'p-error':v$.orderText.$invalid && submitted}">
            <span class="p-text-bold"><span style="color:red">*</span> Текст распоряжения</span>
          </label>
          <order-text
            id="orderText"
            :value="v$.orderText.$model"
            :orderPatterns="state.allOrderPatterns"
            @input="v$.orderText.$model = $event"
          />
          <small
            v-if="(v$.orderText.$invalid && submitted) || v$.orderText.$pending.$response"
            class="p-error"
          >
            Пожалуйста, определите все параметры текста распоряжения
          </small>
        </div>
        <div class="p-d-flex p-ai-center p-mt-2 p-flex-wrap">
          <div class="p-text-bold p-mr-3">
            {{ getUserPostFIO }}
          </div>
          <div>
            <Button type="submit" label="Передать" />
          </div>
        </div>
      </form>
    </div>
    <div class="p-col-6">
      <!-- Таблица ДСП -->
      <DSPToSendOrderDataTable
        :value="v$.dspSectorsToSendOrder.$model"
        @input="v$.dspSectorsToSendOrder.$model = $event"
      />
      <!-- Таблица ДНЦ -->
      <DNCToSendOrderDataTable
        :value="v$.dncSectorsToSendOrder.$model"
        @input="v$.dncSectorsToSendOrder.$model = $event"
      />
    </div>
  </div>
</template>


<script>
  import { reactive, ref, computed, onMounted, watch } from 'vue';
  import { useStore } from 'vuex';
  import { required, minLength } from '@vuelidate/validators';
  import { useVuelidate } from '@vuelidate/core';
  import DSPToSendOrderDataTable from './DSPToSendOrderDataTable';
  import DNCToSendOrderDataTable from './DNCToSendOrderDataTable';
  import { OrderInputTypes } from '../../constants/orderInputTypes';
  import OrderPlaceChooser from './OrderPlaceChooser';
  import OrderTimeSpanChooser from './OrderTimeSpanChooser';
  import OrderText from './OrderText';
  import { ORDER_PATTERN_TYPES } from '../../constants/orderPatterns';

  export default {
    name: 'dy58-new-order-block',

    components: {
      OrderPlaceChooser,
      OrderTimeSpanChooser,
      OrderText,
      DSPToSendOrderDataTable,
      DNCToSendOrderDataTable,
    },

    computed: {
      nextOrderNumber: function() {
        return this.$store.getters.getNextOrdersNumber;
      },
    },

    watch: {
      nextOrderNumber: function(newVal) {
        this.state.number = newVal;
      },
    },

    setup() {
      const store = useStore();

      const state = reactive({
        selectedOrderInputType: OrderInputTypes[0],
        number: store.getters.getNextOrdersNumber,
        createDateTime: null,
        place: {
          place: null,
          value: null,
        },
        timeSpan: {
          start: null,
          end: null,
          tillCancellation: null,
        },
        orderText: {
          orderTextSource: null,
          orderTitle: null,
          orderText: null,
        },
        allOrderPatterns: [],
        selectedPattern: null,
        dncSectorsToSendOrder: [],
        dspSectorsToSendOrder: [],
        // true - ожидается ответ сервера на запрос об издании распоряжения, false - запроса не ожидается
        waitingForServerResponse: false,
        // Ошибки, выявленные серверной частью в информационных полях, в процессе обработки
        // запроса об издании распоряжения
        orderFieldsErrs: null,
      });

      //const getSelectedOrderInputType = computed(() => state.selectedOrderInputType);

      //watch(getSelectedOrderInputType, (newVal) => store.commit('setCurrentOrderInputType', newVal));

      const endDateNoLessStartDate = (value) =>
        !value ? true :
          !state.timeSpan.start ? true : value >= state.timeSpan.start;

      const cancelOrEndDate = (value) => value || state.timeSpan.end;

      const rules = {
        number: { required },
        createDateTime: { required },
        place: {
          place: { required },
          value: { required },
        },
        timeSpan: {
          start: { required },
          end: { endDateNoLessStartDate },
          tillCancellation: { cancelOrEndDate },
        },
        orderText: {
          orderTextSource: { required },
          orderTitle: { required },
          orderText: { required },
        },
        dncSectorsToSendOrder: { minLength: minLength(1) },
        dspSectorsToSendOrder: { minLength: minLength(1) },
      };

      const submitted = ref(false);

      const v$ = useVuelidate(rules, state);

      const getUserPostFIO = computed(() => store.getters.getUserPostFIO);
      const getCurrDateTimeString = computed(() => store.getters.getCurrDateTimeString);
      const getCurrDateTime = computed(() => store.getters.getCurrDateTime);
      const getOrderPatternsToDisplayInTreeSelect = computed(() => store.getters.getOrderPatternsToDisplayInTreeSelect(ORDER_PATTERN_TYPES.ORDER));
      const getOrderInputTypes = computed(() => OrderInputTypes);
      const getSectorStations = computed(() =>
        store.getters.getSectorStations.map((station) => {
          return {
            id: station.St_ID,
            title: `${station.St_Title} (${station.St_UNMC})`,
          };
        })
      );
      const getSectorBlocks = computed(() =>
        store.getters.getSectorBlocks.map((block) => {
          return {
            id: block.Bl_ID,
            title: block.Bl_Title,
          };
        })
      );

      watch(getCurrDateTimeString, (newVal) => {
        state.createDateTime = newVal;
      });

      onMounted(() => {
        state.allOrderPatterns = getOrderPatternsToDisplayInTreeSelect;
      });

      /**
       * Издание распоряжения (отправка и сервер и передача всем причастным).
       */
      const handleSubmit = (isFormValid) => {
        submitted.value = true;

        if (!isFormValid) {
          return;
        }

        state.waitingForServerResponse = true;
        store.dispatch('dispatchOrder', {
          type: ORDER_PATTERN_TYPES.ORDER,
          number: state.number,
          createDateTime: getCurrDateTime.value.toISOString(),
          place: state.place,
          timeSpan: state.timeSpan,
          orderText: state.orderText,
          dncToSend: state.dncSectorsToSendOrder,
          dspToSend: state.dspSectorsToSendOrder,
        });
      };

      return {
        state,
        v$,
        submitted,
        getUserPostFIO,
        getCurrDateTimeString,
        getOrderPatternsToDisplayInTreeSelect,
        getOrderInputTypes,
        handleSubmit,
        getSectorStations,
        getSectorBlocks,
      }
    },
  };
</script>


<style lang="scss" scoped>
</style>
