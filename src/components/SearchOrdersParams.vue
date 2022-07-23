<template>
  <Accordion>
    <AccordionTab>
      <template #header>
        Определить параметры поиска информации
      </template>
      <div class="dy58-search-params-panel">
        <form @submit.prevent="handleSubmit()" class="p-grid">
          <div v-if="!ifUserWorksOffline" class="p-field p-col-6 p-d-flex p-flex-column">
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
              Пожалуйста, корректно определите временной интервал поиска информации (не более трех месяцев)
            </small>
          </div>
          <div v-if="!ifUserWorksOffline" class="p-field p-col-6 p-d-flex p-flex-column">
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
          <div class="p-col-6 p-d-flex p-flex-row p-flex-wrap">
            <Button
              v-if="!ifUserWorksOffline"
              type="submit"
              icon="pi pi-search"
              label="Найти"
              class="p-mr-3 p-mb-2"
            />
            <Button
              icon="pi pi-print"
              label="Печать"
              class="p-mr-3 p-mb-2"
              @click="handlePrint"
            />
            <Button
              v-if="!ifUserWorksOffline && displayVerifyFunctions && canUserCreateCheckOrders"
              icon="pi pi-check-square"
              label="Создать запись о проверке"
              class="p-mr-3 p-mb-2"
              @click="handleCheck"
            />
          </div>
        </form>
      </div>
    </AccordionTab>
  </Accordion>
</template>

<script>
  import { computed, onMounted, reactive, ref } from 'vue';
  import { useStore } from 'vuex';
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

    emits: ['input', 'print', 'createCheckRecord', 'loadCachedOrders'],

    props: {
      displayVerifyFunctions: {
        type: Boolean,
        required: false,
      },
    },

    setup(_props, { emit }) {
      const store = useStore();

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

      const restrictedTimeInterval = (value) => {
        const daysBetweenTwoDates = (date1, date2) => {
          return Math.ceil(Math.abs(date2.getTime() - date1.getTime()) / (1000 * 3600 * 24));
        };
        let days = 0;
        if (!value) {
          days = daysBetweenTwoDates(new Date(), state.timeSpan.start);
        } else {
          days = daysBetweenTwoDates(state.timeSpan.end, state.timeSpan.start);
        }
        return days < 90;
      };

      const timeSpanRules = {
        start: { required, isValidDateTime },
        end: { endDateNoLessStartDate, restrictedTimeInterval },
      };

      const rules = reactive({
        timeSpan: timeSpanRules,
      });

      const submitted = ref(false);
      const v$ = useVuelidate(rules, state, { $scope: false });

      const ifUserWorksOffline = computed(() => store.getters.ifUserWorksOffline);

      /**
       * Поиск информации в соответствии с заданными критериями.
       * Не добавлять в параметры isFormValid, иначе при загрузке страницы не будет автоматически
       * подгружать информация за текущий месяц!
       */
      const handleSubmit = () => {
        submitted.value = true;
        // Этот кусок кода не добавлять!
        /*if (!isFormValid) {
            return;
        }*/
        if (!ifUserWorksOffline.value)
          emit('input', { timeSpan: state.timeSpan, includeDocsCriteria: state.includeDocsCriteria });
        else
          emit('loadCachedOrders');
      };

      onMounted(() => {
        // Хотим, чтобы сразу по загрузке страницы отображались те распоряжения, которые были изданы
        // в текущем месяце, либо закешированы (если пользователь работает offline)
        handleSubmit();
      });

      const handlePrint = () => {
        submitted.value = true;
        v$.value.$touch();
        v$.value.$validate();
        let isFormValid = !v$.value.$invalid;
        if (isFormValid) {
          emit('print', { timeSpan: state.timeSpan, includeDocsCriteria: state.includeDocsCriteria });
        }
      };

      const handleCheck = () => {
        emit('createCheckRecord');
      };

      return {
        state,
        INCLUDE_DOCUMENTS_CRITERIA,
        canUserCreateCheckOrders: computed(() => store.getters.canUserCreateCheckOrders),
        ifUserWorksOffline,
        v$,
        submitted,
        handleSubmit,
        handlePrint,
        handleCheck,
      };
    },
  }
</script>
