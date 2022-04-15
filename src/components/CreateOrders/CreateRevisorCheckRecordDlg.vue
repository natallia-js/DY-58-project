<template>
  <Toast />
  <ConfirmDialog style="max-width:700px"></ConfirmDialog>
  <Dialog
    header="Новая запись о проверке"
    v-model:visible="state.dlgVisible"
    style="width:auto; maxWidth:800px"
    :modal="true"
    @hide="closeDialog"
  >
    <div class="p-mb-3">
      Дата и время записи о проверке определяются моментом успешного сохранения данной записи в Журнале.
      Полагается, что все документы, которые изданы ранее этой даты, проверены.
    </div>
    <form @submit.prevent="handleSubmit(!v$.$invalid)" class="p-grid">

      <!-- ДАТА И ВРЕМЯ СОЗДАНИЯ ЗАПИСИ О ПРОВЕРКЕ -->

      <div class="p-field p-col-6 p-d-flex p-flex-column p-m-0">
        <label for="create-check-record-date-time-string" :class="{'p-error':v$.createDateTimeString.$invalid && submitted}">
          <span class="p-text-bold"><span class="dy58-required-field">*</span> Дата и время создания записи</span>
        </label>
        <InputText
          id="create-check-record-date-time-string"
          disabled
          v-model="v$.createDateTimeString.$model"
          :class="{'p-invalid':v$.createDateTimeString.$invalid && submitted}"
        />
        <small
          v-if="(v$.createDateTimeString.$invalid && submitted) || v$.createDateTimeString.$pending.$response"
          class="p-error"
        >
          Не определены/неверно определены дата и время создания записи
        </small>
      </div>

      <!-- ТЕКСТ ЗАПИСИ -->

      <div class="p-field p-col-12 p-d-flex p-flex-column p-m-0">
        <label for="order-text" :class="{'p-error':v$.orderText.$invalid && submitted}">
          <span class="p-text-bold">Содержание записи</span>
        </label>
        <div>
          <Button
            label="Вставить перенос строки"
            @click="handleInsertRowbreak"
          />
        </div>
        <textarea
          id="order-text"
          v-model="state.orderText"
          rows="5"
          :style="{ width: '100%', minWidth: '100%', maxWidth: '100%' }"
          class="p-component p-p-2"
          ref="textarea"
        />
        <small
          v-if="(v$.orderText.$invalid && submitted) || v$.orderText.$pending.$response"
          class="p-error"
        >
          Проверьте правильность указания содержания записи
        </small>
      </div>

      <div class="p-col-12 p-mt-2 p-text-right">
        <div v-if="getDispatchOrdersBeingProcessed > 0" class="dy58-warning p-mb-2">
          На сервер отправлено {{ getDispatchOrdersBeingProcessed }} запросов на издание документа текущего типа. Ожидаю ответ...
        </div>
        <Button type="submit" class="p-mr-2" label="Сохранить" />
        <Button label="Закрыть" @click="closeDialog" />
      </div>
    </form>
  </Dialog>
</template>


<script>
  import { computed, reactive, ref, watch } from 'vue';
  import { useStore } from 'vuex';
  import { useVuelidate } from '@vuelidate/core';
  import { required } from '@vuelidate/validators';
  import { useConfirm } from 'primevue/useconfirm';
  import showMessage from '@/hooks/showMessage.hook';
  import {
    ORDER_PATTERN_TYPES,
    SPECIAL_REVISOR_RECORD_TITLE,
    OrderPatternElementType,
  } from '@/constants/orderPatterns';
  import { ORDER_TEXT_SOURCE } from '@/constants/orders';
  import { useWatchCurrentDateTime } from '@/components/CreateOrders/NewOrder/watchCurrentDateTime';
  import isValidDateTime from '@/additional/isValidDateTime';

  export default {
    name: 'dy58-create-revisor-check-record-dialog',

    emits: ['close'],

    props: {
      showDlg: {
        type: Boolean,
        required: true,
      },
    },

    setup(props, { emit }) {
      const store = useStore();
      const confirm = useConfirm();
      const { showSuccessMessage, showErrMessage } = showMessage();

      const orderType = ORDER_PATTERN_TYPES.CONTROL;

      const state = reactive({
        dlgVisible: false,
        createDateTime: store.getters.getCurrDateTimeWithoutMilliseconds,
        createDateTimeString: store.getters.getCurrDateString,
        updateCreateDateTimeRegularly: true,
        orderText: null,
      });

      const rules = reactive({
        createDateTime: { required, isValidDateTime },
        createDateTimeString: { required },
        orderText: {},
      });

      const textarea = ref(null);

      const submitted = ref(false);
      const v$ = useVuelidate(rules, state, { $scope: false });

      // Для оперативного отображения даты-времени издания распоряжения при создании нового распоряжения
      useWatchCurrentDateTime({ state, props, store });

      watch(() => props.showDlg, (newVal) => state.dlgVisible = newVal);

      const closeDialog = () => { emit('close') };

      //
      const handleInsertRowbreak = () => {
        state.orderText += '<br />';
        textarea.value.focus();
      };

      const handleSubmit = (isFormValid) => {
        confirm.require({
          message: 'Сохранить запись?',
          header: 'Подтверждение действия',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            submitted.value = true;
            if (!isFormValid) {
              showErrMessage('Не могу отправить созданный документ на сервер: не заполнены / неверно заполнены его поля');
              return;
            }
            dispatchOrder();
          },
        });
      };

      const getOrderTextObject = () => {
        return {
          orderTextSource: ORDER_TEXT_SOURCE.nopattern,
          patternId: null,
          orderTitle: SPECIAL_REVISOR_RECORD_TITLE,
          orderText: [{
            type: OrderPatternElementType.TEXT,
            ref: null,
            value: state.orderText,
          }],
        };
      };

      /**
       * Издание распоряжения (отправка на сервер).
       */
      const dispatchOrder = () => {
        store.dispatch('dispatchOrder', {
          type: orderType,
          number: 1,
          createDateTime: state.createDateTime,
          place: null,
          timeSpan: { start: state.createDateTime, end: state.createDateTime, tillCancellation: false },
          orderText: getOrderTextObject(),
          dncToSend: [],
          dspToSend: [], // не адресовать текущей станции!!! (иначе придется править бэкенд)
          ecdToSend: [],
          otherToSend: [],
          orderChainId: null,
          createdOnBehalfOf: null,
          showOnGID: false,
          specialTrainCategories: [],
        });
      };

      /**
       * Для отображения результата операции издания распоряжения (отправки на сервер).
       */
      watch(() => store.getters.getDispatchOrderResult, (newVal) => {
        if (!newVal || newVal.orderType !== orderType) {
          return;
        }
        if (!newVal.error) {
          showSuccessMessage(newVal.message);
          closeDialog();
        } else {
          showErrMessage(newVal.message);
        }
      });

      return {
        state,
        submitted,
        v$,
        textarea,
        handleInsertRowbreak,
        closeDialog,
        handleSubmit,
        // Количество распоряжений текущего типа, для которых в настоящее время запущен процесс издания (сохранения на сервере)
        getDispatchOrdersBeingProcessed: computed(() => store.getters.getDispatchOrdersBeingProcessed(orderType)),
      };
    },
  };
</script>
