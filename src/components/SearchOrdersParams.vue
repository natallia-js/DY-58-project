<template>
<Accordion>
    <AccordionTab>
      <template #header>
        Определить параметры поиска информации
      </template>
      <div class="dy58-search-params-panel">
        <form @submit.prevent="handleSubmit()" class="p-grid">
          <div class="p-field p-col-6 p-d-flex p-flex-column">
            <label class="p-text-bold">
              Получить данные за:
            </label>
            <find-orders-time-span-chooser
              :value="v$.timeSpan.$model"
              @input="v$.timeSpan.$model = $event"
            />
            <small
              v-if="(v$.timeSpan.$invalid && submitted) || v$.timeSpan.$pending.$response"
              class="p-error"
            >
              Пожалуйста, корректно определите время поиска информации
            </small>
          </div>
          <div class="p-field p-col-6 p-d-flex p-flex-column">
            <label class="p-text-bold">Включать:</label>
            <div class="p-mb-2">
              <Checkbox
                id="include-only-outgoing-docs"
                name="includeDocsCriteria"
                :value="INCLUDE_DOCUMENTS_CRITERIA.ONLY_OUTGOUING"
                v-model="state.includeDocsCriteria"
              />
              <label for="include-only-outgoing-docs">&#160;только исходящие документы</label>
            </div>
            <div>
              <Checkbox
                id="include-active-docs"
                name="includeDocsCriteria"
                :value="INCLUDE_DOCUMENTS_CRITERIA.INCLUDE_ACTIVE"
                v-model="state.includeDocsCriteria"
              />
              <label for="include-active-docs">&#160;действующие цепочки документов</label>
            </div>
          </div>
          <div class="p-col-6">
            <Button
              type="submit"
              label="Найти"
              style="maxWidth:100px"
            />
          </div>
        </form>
      </div>
    </AccordionTab>
  </Accordion>
</template>

<script>
  import { onMounted, reactive, ref } from 'vue';
  import { required  } from '@vuelidate/validators';
  import { useVuelidate } from '@vuelidate/core';
  import FindOrdersTimeSpanChooser from '@/components/FindOrdersTimeSpanChooser';
  import isValidDateTime from '@/additional/isValidDateTime';

  const INCLUDE_DOCUMENTS_CRITERIA = {
    ONLY_OUTGOUING: 'ONLY_OUTGOUING',
    INCLUDE_ACTIVE: 'INCLUDE_ACTIVE',
  };

  export default {
    name: 'dy58-search-orders-params',

    components: {
      FindOrdersTimeSpanChooser,
    },

    emits: ['input'],

    setup(_props, { emit }) {
      const state = reactive({
        timeSpan: {
          start: null,
          end: null,
        },
        includeDocsCriteria: [INCLUDE_DOCUMENTS_CRITERIA.INCLUDE_ACTIVE],
      });

      const endDateNoLessStartDate = (value) => {
        return !value ? true :
          !state.timeSpan.start ? true : (isValidDateTime(value) && value >= state.timeSpan.start);
      };

      const timeSpanRules = {
        start: { required, isValidDateTime },
        end: { endDateNoLessStartDate },
      };

      const rules = reactive({
        timeSpan: timeSpanRules,
      });

      const submitted = ref(false);
      const v$ = useVuelidate(rules, state);

      const handleSubmit = () => {
        submitted.value = true;
        emit('input', { timeSpan: state.timeSpan, includeDocsCriteria: state.includeDocsCriteria });
      };

      onMounted(() => {
        // Хотим, чтобы сразу по загрузке страницы отображались те распоряжения, которые были изданы
        // в текущем месяце
        handleSubmit();
      });

      return {
        state,
        INCLUDE_DOCUMENTS_CRITERIA,
        v$,
        submitted,
        handleSubmit,
      };
    },
  }
</script>
