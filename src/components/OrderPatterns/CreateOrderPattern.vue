<template>
  <Toast />
  <ConfirmPopup group="confirmClearOrderPattern"></ConfirmPopup>
  <div class="p-grid">
    <div class="p-col-4">
      <form @submit.prevent="handleSubmit(!v$.$invalid)" class="p-grid">
        <div v-if="getCreateOrderPatternRecsBeingProcessed === 0" class="p-col-12 p-text-right">
          <Button type="submit" label="Создать шаблон" />
        </div>
        <div v-else class="p-col-12 dy58-warning">
          На сервер отправлено {{ getCreateOrderPatternRecsBeingProcessed }} запросов на создание шаблона распоряжения. Ожидаю ответ...
        </div>
        <div class="p-field p-col-12 p-d-flex p-flex-column p-m-0">
          <label for="service" :class="{'p-error': v$.service.$invalid && submitted}">
            <span class="p-text-bold"><span style="color:red">*</span> Служба</span>
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
            Пожалуйста, определите службу
          </small>
        </div>
        <div class="p-field p-col-12 p-d-flex p-flex-column p-m-0">
          <label for="orderType" :class="{'p-error': v$.orderType.$invalid && submitted}">
            <span class="p-text-bold"><span style="color:red">*</span> Тип распоряжения</span>
          </label>
          <Dropdown
            id="orderType"
            placeholder="Выберите тип распоряжения"
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
            Пожалуйста, выберите тип распоряжения
          </small>
        </div>
        <div class="p-field p-col-12 p-d-flex p-flex-column p-m-0">
          <label for="orderCategory" :class="{'p-error': v$.orderCategory.$invalid && submitted}">
            <span class="p-text-bold"><span style="color:red">*</span> Категория распоряжения</span>
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
            Пожалуйста, определите категорию распоряжения
          </small>
        </div>
        <div class="p-field p-col-12 p-d-flex p-flex-column p-m-0">
          <label for="orderTitle" :class="{'p-error':v$.orderTitle.$invalid && submitted}">
            <span class="p-text-bold"><span style="color:red">*</span> Наименование распоряжения</span>
          </label>
          <allow-clear-input-text
            id="orderTitle"
            :value="v$.orderTitle.$model"
            @input="v$.orderTitle.$model = $event"
            style="width:100%"
            :inputClass="{'p-invalid':v$.orderTitle.$invalid && submitted}"
          />
          <small
            v-if="(v$.orderTitle.$invalid && submitted) || v$.orderTitle.$pending.$response"
            class="p-error"
          >
            Пожалуйста, введите наименование распоряжения
          </small>
        </div>
        <div class="p-field p-col-12 p-d-flex p-flex-column p-m-0">
          <label for="orderTitle" :class="{'p-error':v$.orderTitle.$invalid && submitted}">
            <span class="p-text-bold">Особая категория поезда</span>
          </label>
          <MultiSelect
            v-model="state.selectedSpecialTrainCategories"
            :options="specialTrainCategories"
            placeholder="Выберите признаки особой категории поезда"
            style="width:100%"
          />
        </div>
        <div class="p-field p-col-12 p-d-flex p-flex-column p-m-0">
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
      <div class="dy58-order-pattern-border p-p-2 p-mb-2">
        <edit-order-pattern
          :orderPattern="state.orderPattern"
          :insertOrderElementPos="state.insertOrderElementPos"
          @deleteOrderPatternElement="handleDelOrderPatternElement"
          @insertBeforeOrderPatternElement="handleSetCursorBeforeElement"
          @insertAfterOrderPatternElement="handleSetCursorAfterElement"
          @submitEditOrderPatternElement="handleSubmitEditOrderPatternElement"
        />
        <Button
          v-if="state.orderPattern && state.orderPattern.length"
          type="button"
          @click="handleClearOrderPattern($event)"
          class="p-mt-2"
        >
          Очистить шаблон
        </Button>
      </div>
      <div class="dy58-order-pattern-border p-p-2">
        <order-pattern-preview :orderPattern="state.orderPattern" />
      </div>
    </div>
  </div>
</template>

<script>
  import { reactive, ref, computed, watch } from 'vue';
  import { useStore } from 'vuex';
  import { required } from '@vuelidate/validators';
  import { useVuelidate } from '@vuelidate/core';
  import { useConfirm } from 'primevue/useconfirm';
  import { ORDER_PATTERN_TYPES, SPECIAL_TRAIN_CATEGORIES } from '@/constants/orderPatterns';
  import objectId from '@/additional/objectId.generator';
  import showMessage from '@/hooks/showMessage.hook';
  import AllowClearInputText from '@/components//AllowClearInputText';
  import OrderCategoryChooser from './OrderCategoryChooser';
  import EditOrderPatternElement from './EditOrderPatternElement';
  import EditOrderPattern from './EditOrderPattern';
  import OrderPatternPreview from './OrderPatternPreview';

  export default {
    name: 'dy58-create-order-pattern',

    components: {
      OrderCategoryChooser,
      EditOrderPatternElement,
      EditOrderPattern,
      OrderPatternPreview,
      AllowClearInputText,
    },

    setup() {
      const store = useStore();
      const confirm = useConfirm();
      const { showSuccessMessage, showErrMessage } = showMessage();

      const state = reactive({
        service: computed(() => store.state.currUser.service),
        orderType: '',
        orderCategory: '',
        orderTitle: '',
        orderPattern: [],
        insertOrderElementPos: 0,
        // Ошибки, выявленные серверной частью в информационных полях, в процессе обработки
        // запроса о создании нового шаблона распоряжения
        orderPatternFieldsErrs: null,
        selectedSpecialTrainCategories: null,
      });

      const rules = {
        service: { required },
        orderType: { required },
        orderCategory: { required },
        orderTitle: { required },
      };

      const submitted = ref(false);

      const v$ = useVuelidate(rules, state);

      const orderCategories = computed(() =>
        store.getters.getCurrentUserOrderCategories
          .filter((item) => item.orderType === state.orderType)
          .map((item) => item.category)
      );

      const getCreateOrderPatternRecsBeingProcessed = computed(() => {
        return store.getters.getCreateOrderPatternRecsBeingProcessed;
      });

      const createOrderPatternResult = computed(() => {
        return store.getters.getCreateOrderPatternResult;
      });

      /**
       *
       */
      watch(createOrderPatternResult, (newVal) => {
        if (!newVal) {
          return;
        }
        if (!newVal.error) {
          showSuccessMessage(newVal.message);
        } else {
          showErrMessage(newVal.message);
        }
      });

      /**
       *
       */
      const handleSubmit = (isFormValid) => {
        submitted.value = true;
        if (!isFormValid) {
          return;
        }
        store.dispatch('createOrderPattern', {
          service: state.service,
          type: state.orderType,
          category: state.orderCategory,
          title: state.orderTitle,
          specialTrainCategories:
            state.selectedSpecialTrainCategories && state.selectedSpecialTrainCategories.length ?
            [...state.selectedSpecialTrainCategories.values()] : null,
          elements: state.orderPattern,
        });
      };

      /**
       * Добавляет заданный элемент в создаваемый шаблон распоряжения на текущую позицию
       * (т.е. позицию, на которой находится курсор).
       */
      const handleAddOrderPatternElement = (newPatternElement) => {
        if (!newPatternElement) {
          return;
        }
        const newElement = {
          _id: objectId(),
          type: newPatternElement.type,
          ref: newPatternElement.ref,
          value: newPatternElement.value,
          size: newPatternElement.size,
        };
        state.orderPattern = [
          ...state.orderPattern.slice(0, state.insertOrderElementPos < 0 ? 0 : state.insertOrderElementPos),
          newElement,
          ...state.orderPattern.slice(state.insertOrderElementPos < 0 ? 0 : state.insertOrderElementPos),
        ]
        if (state.insertOrderElementPos !== -1) {
          state.insertOrderElementPos += 1;
        } else {
          state.insertOrderElementPos = 1;
        }
      };

      /**
       * Позволяет удалить элемент шаблона с id = elementId.
       */
      const handleDelOrderPatternElement = (elementId) => {
        const elementIndex = state.orderPattern.findIndex((element) => element._id === elementId);
        if (elementIndex === -1) {
          return;
        }
        if (elementIndex < state.insertOrderElementPos) {
          state.insertOrderElementPos -= 1;
        }
        state.orderPattern = state.orderPattern.filter((el) => el._id !== elementId);
      };

      /**
       *
       */
      const handleSetCursorBeforeElement = (elementId) => {
        const elementIndex = state.orderPattern.findIndex((element) => element._id === elementId);
        if (elementIndex === -1) {
          return;
        }
        state.insertOrderElementPos = elementIndex !== 0 ? elementIndex : -1;
      };

      /**
       *
       */
      const handleSetCursorAfterElement = (elementId) => {
        const elementIndex = state.orderPattern.findIndex((element) => element._id === elementId);
        if (elementIndex === -1) {
          return;
        }
        state.insertOrderElementPos = elementIndex + 1;
      };

      /**
       *
       */
      const handleSubmitEditOrderPatternElement = ({ editedPatternElementId, editedElement }) => {
        const elementIndex = state.orderPattern.findIndex((element) => element._id === editedPatternElementId);
        if (elementIndex === -1) {
          return;
        }
        state.orderPattern = state.orderPattern.map((el) => {
          if (el._id !== editedPatternElementId) {
            return el;
          }
          return {
            _id: editedPatternElementId,
            ...editedElement,
          };
        });
      };

      /**
       *
       */
      const handleClearOrderPattern = (event) => {
        confirm.require({
          target: event.currentTarget,
          group: "confirmClearOrderPattern",
          message: 'Очистить шаблон?',
          icon: 'pi pi-exclamation-circle',
          accept: () => {
            state.orderPattern = [];
            state.insertOrderElementPos = 0;
          },
        });
      };

      return {
        state,
        orderPatternTypes: Object.values(ORDER_PATTERN_TYPES).map((name) => { return { label: name }; }),
        specialTrainCategories: SPECIAL_TRAIN_CATEGORIES,
        orderCategories,
        v$,
        submitted,
        getCreateOrderPatternRecsBeingProcessed,
        handleSubmit,
        handleAddOrderPatternElement,
        handleDelOrderPatternElement,
        handleSetCursorBeforeElement,
        handleSetCursorAfterElement,
        handleSubmitEditOrderPatternElement,
        handleClearOrderPattern,
      };
    },
  };
</script>
