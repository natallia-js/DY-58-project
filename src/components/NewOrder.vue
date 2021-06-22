<template>
  <div class="p-grid">
    <div class="p-col-6">
      <SelectButton v-model="selectedOrderInputType" :options="getOrderInputTypes" optionLabel="label" />
      <br />
      <form @submit.prevent="handleSubmit(!v$.$invalid)">
        <div class="p-grid">
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
              {{'Не указан номер распоряжения'}}
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
              :value="getCurrDateTimeString"
            />
            <small
              v-if="(v$.createDateTime.$invalid && submitted) || v$.createDateTime.$pending.$response"
              class="p-error"
            >
              {{'Не определены дата и время создания распоряжения'}}
            </small>
          </div>
        </div>
        <div class="p-grid">
          <div class="p-col-12">
            <span class="p-text-bold"><span style="color:red">*</span> Место действия</span>
          </div>
          <div class="p-inputgroup p-col-12">
            <span class="p-inputgroup-addon">
              <RadioButton class="dy58-addon-button" />
            </span>
            <Dropdown
              inputId="station"
              v-model="selectedStation"
              :options="stations"
              optionLabel="title"
              placeholder="Выберите станцию"
              style="width:100%"
            />
          </div>
          <div class="p-inputgroup p-col-12">
            <span class="p-inputgroup-addon">
              <RadioButton class="dy58-addon-button" />
            </span>
            <Dropdown
              inputId="block"
              placeholder="Выберите перегон"
              style="width:100%"
            />
          </div>
          <div class="p-col-12">
            <span class="p-text-bold"><span style="color:red">*</span> Время действия</span>
          </div>
          <div class="p-col-12 p-grid">
            <div class="p-col-5">
              <div class="p-inputgroup">
                <Button label="с" class="dy58-addon-button" />
                <Calendar
                  :showTime="true"
                  :showButtonBar="true"
                />
              </div>
            </div>
            <div class="p-col-5">
              <div class="p-inputgroup">
                <Button label="до" class="dy58-addon-button" />
                <Calendar
                  :showTime="true"
                  :showButtonBar="true"
                />
              </div>
            </div>
            <div class="p-col-2">
              <Checkbox id="tillCancellation" />
              <label for="tillCancellation"> До отмены</label>
            </div>
          </div>
          <div class="p-col-12">
            <span class="p-text-bold"><span style="color:red">*</span> Текст распоряжения</span>
          </div>
          <div class="p-inputgroup p-col-12">
            <span class="p-inputgroup-addon">
              <RadioButton class="dy58-addon-button" />
            </span>
            <TreeSelect
              placeholder="Выберите шаблон распоряжения"
              v-model="selectedPattern"
              :options="allOrderPatterns"
              style="width:100%"
            />
          </div>
          <div class="p-inputgroup p-col-12">
            <span class="p-inputgroup-addon">
              <RadioButton class="dy58-addon-button" />
            </span>
            <InputText
              placeholder="Введите наименование распоряжения"
              style="width:100%"
            />
          </div>
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
  import { mapGetters } from 'vuex';
  import DSPToSendOrderDataTable from './DSPToSendOrderDataTable';
  import DNCToSendOrderDataTable from './DNCToSendOrderDataTable';
  import { required } from '@vuelidate/validators';
  import { useVuelidate } from '@vuelidate/core';
  import { OrderInputTypes } from '../constants/orderInputTypes';

  export default {
    name: 'dy58-new-order-block',

    components: {
      DSPToSendOrderDataTable,
      DNCToSendOrderDataTable,
    },

    data() {
      return {
        number: null,
        createDateTime: null,
        submitted: false,
        selectedOrderInputType: OrderInputTypes[0],
        selectedStation: null,
        selectedBlock: null,
        stations: [
          { code: '111', title: 'AAA skjfh skdjfh skdjfhsdkjfh sdkfjhs dkfjsh dkfjshdkfj shdkfj sdh' },
          { code: '112', title: '<<<' },
          { code: '222', title: 'BBB' },
        ],
        allOrderPatterns: [],
        selectedPattern: null,
      };
    },

    computed: {
      ...mapGetters([
        'getUserPostFIO',
        'getCurrDateTimeString',
        'getCurrDateString',
        'getCurrTimeString',
        'getOrderPatternsToDisplayInTreeSelect',
      ]),

      getOrderInputTypes() {
        return OrderInputTypes;
      },
    },

    setup: () => ({ v$: useVuelidate() }),

    validations() {
      return {
        number: {
          required,
        },
        createDateTime: {
          required,
        },
        startDateTime: {
          required,
        },
      };
    },

    mounted() {
      this.allOrderPatterns = this.getOrderPatternsToDisplayInTreeSelect;
    },

    methods: {
      setCurrInputType(inputType) {
        this.$store.commit('setCurrentOrderInputType', inputType);
      },

      async handleSubmit(isFormValid) {
        this.submitted = true;

        if (!isFormValid) {
          return;
        }
      }
    }
  }
</script>


<style lang="scss" scoped>
</style>
