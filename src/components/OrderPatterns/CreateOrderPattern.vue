<template>
  <Toast />
  <div class="p-grid">
    <div class="p-col-4">
      <form @submit.prevent="handleSubmit(!v$.$invalid)" class="p-grid">
        <div v-if="!waitingForServerResponse" class="p-col-12 p-text-right">
          <Button type="submit" label="Создать шаблон" />
        </div>
        <div v-if="waitingForServerResponse" class="p-col-12">
          <ProgressSpinner />
        </div>
        <div class="p-field p-col-12 p-d-flex p-flex-column">
          <label for="service" :class="{'p-error': v$.service.$invalid && submitted}">
            <span style="color:red">*</span> <span class="p-text-bold">Служба</span>
          </label>
          <InputText
            id="service"
            disabled
            v-model="v$.service.$model"
            :class="{'p-invalid':v$.service.$invalid && submitted}"
          />
          <small
            v-if="(v$.service.$invalid && submitted) || v$.service.$pending.$response"
            class="p-error"
          >
            {{'Пожалуйста, определите службу'}}
          </small>
        </div>
        <div class="p-field p-col-12 p-d-flex p-flex-column">
          <label for="orderType" :class="{'p-error': v$.orderType.$invalid && submitted}">
            <span style="color:red">*</span> <span class="p-text-bold">Тип распоряжения</span>
          </label>
          <Dropdown
            id="orderType"
            autofocus
            :options="orderPatternTypes"
            optionLabel="label"
            optionValue="label"
            v-model="v$.orderType.$model"
            :class="{'p-invalid':v$.orderType.$invalid && submitted}"
          />
          <small
            v-if="(v$.orderType.$invalid && submitted) || v$.orderType.$pending.$response"
            class="p-error"
          >
            {{'Пожалуйста, выберите тип распоряжения'}}
          </small>
        </div>
        <div class="p-field p-col-12 p-d-flex p-flex-column">
          <label for="orderCategory" :class="{'p-error': v$.orderCategory.$invalid && submitted}">
            <span style="color:red">*</span> <span class="p-text-bold">Категория распоряжения</span>
          </label>
          <order-category-chooser
            id="orderCategory"
            :existingOrderCategories="orderCategories"
            :value="v$.orderCategory.$model"
            @input="v$.orderCategory.$model = $event"
          />
          <small
            v-if="(v$.orderCategory.$invalid && submitted) || v$.orderCategory.$pending.$response"
            class="p-error"
          >
            {{'Пожалуйста, определите категорию распоряжения'}}
          </small>
        </div>
        <div class="p-field p-col-12 p-d-flex p-flex-column">
          <label for="orderTitle" :class="{'p-error':v$.orderTitle.$invalid && submitted}">
            <span style="color:red">*</span> <span class="p-text-bold">Наименование распоряжения</span>
          </label>
          <InputText
            id="orderTitle"
            v-model="v$.orderTitle.$model"
            :class="{'p-invalid':v$.orderTitle.$invalid && submitted}"
          />
          <small
            v-if="(v$.orderTitle.$invalid && submitted) || v$.orderTitle.$pending.$response"
            class="p-error"
          >
            {{'Пожалуйста, введите наименование распоряжения'}}
          </small>
        </div>
        <div class="p-field p-col-12 p-d-flex p-flex-column">
          <div class="p-text-bold p-mb-2">Определите элементы шаблона</div>
          <edit-order-pattern-element
            :element="null"
            @submitEditOrderPatternElement="handleAddOrderPatternElement"
            okButtonText="Добавить в шаблон"
          />
        </div>
      </form>
    </div>
    <div class="p-col-8">
    </div>
  </div>
</template>

<script>
  import { reactive, ref, computed } from 'vue';
  import { useStore } from 'vuex';
  import { required } from '@vuelidate/validators';
  import { useVuelidate } from '@vuelidate/core';
  import OrderCategoryChooser from './OrderCategoryChooser';
  import EditOrderPatternElement from './EditOrderPatternElement';
  import { ORDER_PATTERN_TYPES } from '../../constants/orderPatterns';

  export default {
    name: 'dy58-create-order-pattern',

    components: {
      OrderCategoryChooser,
      EditOrderPatternElement,
    },

    setup() {
      const store = useStore();

      const state = reactive({
        service: computed(() => store.state.currUser.service),
        orderType: '',
        orderCategory: '',
        orderTitle: '',
      });

      const rules = {
        service: { required },
        orderType: { required },
        orderCategory: { required },
        orderTitle: { required },
      };

      const submitted = ref(false);
      const waitingForServerResponse = ref(false);

      const v$ = useVuelidate(rules, state);

      const handleSubmit = (isFormValid) => {console.log(state)
        submitted.value = true;

        if (!isFormValid) {
            return;
        }
      };

      /**
       * Добавляет заданный элемент в создаваемый шаблон распоряжения на текущую позицию
       * (т.е. позицию, на которой находится курсор).
       */
      const handleAddOrderPatternElement = (newPatternElement) => {
        if (!newPatternElement) {
          return;
        }
      };

      return {
        state,
        orderPatternTypes: Object.values(ORDER_PATTERN_TYPES).map((name) => { return { label: name }; }),
        orderCategories: computed(() => store.getters.getCurrentUserOrderCategories),
        v$,
        handleSubmit,
        handleAddOrderPatternElement,
        submitted,
        waitingForServerResponse,
      };
    },
  };
</script>
