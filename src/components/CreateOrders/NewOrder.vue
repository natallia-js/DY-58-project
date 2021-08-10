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
            disabled
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
            :spans="state.spans"
            :stations="state.stations"
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
      <DSPToSendOrderDataTable />
      <!-- Таблица ДНЦ -->
      <DNCToSendOrderDataTable />
    </div>
  </div>
</template>


<script>
  import { reactive, ref, computed, onMounted, watch } from 'vue';
  import { useStore } from 'vuex';
  import { required } from '@vuelidate/validators';
  import { useVuelidate } from '@vuelidate/core';
  import DSPToSendOrderDataTable from './DSPToSendOrderDataTable';
  import DNCToSendOrderDataTable from './DNCToSendOrderDataTable';
  import { OrderInputTypes } from '../../constants/orderInputTypes';
  import OrderPlaceChooser from './OrderPlaceChooser';
  import OrderTimeSpanChooser from './OrderTimeSpanChooser';
  import OrderText from './OrderText';

  export default {
    name: 'dy58-new-order-block',

    components: {
      OrderPlaceChooser,
      OrderTimeSpanChooser,
      OrderText,
      DSPToSendOrderDataTable,
      DNCToSendOrderDataTable,
    },

    setup() {
      const store = useStore();

      const state = reactive({
        selectedOrderInputType: OrderInputTypes[0],
        number: 8,
        createDateTime: '',
        place: {
          place: '',
          value: '',
        },
        timeSpan: {
          start: '',
          end: '',
        },
        orderText: {
          orderTextSource: '',
          orderTitle: '',
          orderText: '',
        },
        spans: [
          { id: '555', title: 'jjjjjjjjjj-dgdfgdfgdfg' },
          { id: '666', title: 'oooooooooщщщщщщщщщщщщщщooooo-fd влопр валпорв ал порвалоп рвалопвапfgdfgdfg' },
          { id: '777', title: 'BBB-dfgdfgdfgdfgdfg' },
        ],
        stations: [
          { id: '111', title: 'AAA skjfh skdjfh skdjfhsdkjfh sdkfjhs dkfjsh dkfjshdkfj shdkfj sdh' },
          { id: '112', title: '<<<' },
          { id: '222', title: 'BBB' },
        ],
        allOrderPatterns: [],
        selectedPattern: null,
        // true - ожидается ответ сервера на запрос об издании распоряжения, false - запроса не ожидается
        waitingForServerResponse: false,
        // Ошибки, выявленные серверной частью в информационных полях, в процессе обработки
        // запроса об издании распоряжения
        orderFieldsErrs: null,
      });

      const endDateNoLessStartDate = (value) =>
        !value ? true :
          !state.timeSpan.start ? true : value >= state.timeSpan.start;

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
        },
        orderText: {
          orderTextSource: { required },
          orderTitle: { required },
          orderText: { required },
        },
      };

      const submitted = ref(false);

      const v$ = useVuelidate(rules, state);

      const getUserPostFIO = computed(() => store.getters.getUserPostFIO);
      const getCurrDateTimeString = computed(() => store.getters.getCurrDateTimeString);
      const getCurrDateString = computed(() => store.getters.getCurrDateString);
      const getCurrTimeString = computed(() => store.getters.getCurrTimeString);
      const getOrderPatternsToDisplayInTreeSelect = computed(() => store.getters.getOrderPatternsToDisplayInTreeSelect);
      const getOrderInputTypes = computed(() => OrderInputTypes);

      watch(getCurrDateTimeString, (newVal) => {
        state.createDateTime = newVal;
      });

      onMounted(() => {
        state.allOrderPatterns = getOrderPatternsToDisplayInTreeSelect;
      });

      const setCurrInputType = (inputType) => {
        store.commit('setCurrentOrderInputType', inputType);
      };

      const handleSubmit = (isFormValid) => {console.log(isFormValid, state)
        submitted.value = true;

        if (!isFormValid) {
          return;
        }


      };

      return {
        state,
        v$,
        submitted,
        getUserPostFIO,
        getCurrDateTimeString,
        getCurrDateString,
        getCurrTimeString,
        getOrderPatternsToDisplayInTreeSelect,
        getOrderInputTypes,
        setCurrInputType,
        handleSubmit,
      }
    },
  };
</script>


<style lang="scss" scoped>
</style>
