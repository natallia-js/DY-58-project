<template>
<Accordion>
    <AccordionTab>
      <template #header>
        Определить параметры поиска информации
      </template>
      <div class="dy58-search-params-panel">
        <form @submit.prevent="handleSubmit()" class="p-grid">
          <div class="p-field p-col-6 p-d-flex p-flex-column p-m-0">
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
  import { reactive, ref } from 'vue';
  import { required  } from '@vuelidate/validators';
  import { useVuelidate } from '@vuelidate/core';
  import FindOrdersTimeSpanChooser from '@/components/FindOrdersTimeSpanChooser';
  import isValidDateTime from '@/additional/isValidDateTime';

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
        emit('input', { timeSpan: state.timeSpan });
      };

      return {
        state,
        v$,
        submitted,
        handleSubmit,
      };
    },
  }
</script>
