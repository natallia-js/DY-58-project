<template>
  <Toast />

  <Dialog
    header="Издание распоряжения о принятии дежурства"
    v-model:visible="state.dlgVisible"
    style="width:auto; maxWidth:800px"
    :modal="true"
    @hide="closeDialog"
  >
    <form @submit.prevent="handleSubmit(!v$.$invalid)" class="p-grid">

      <!-- НОМЕР РАСПОРЯЖЕНИЯ -->

      <div class="p-field p-col-4 p-d-flex p-flex-column p-m-0">
        <OverlayPanel
          ref="newNumberOverlayPanel"
          appendTo="body"
          :showCloseIcon="true"
          id="new-number-overlay_panel"
          style="width:200px"
          :breakpoints="{'960px':'75vw'}"
        >
          <div class="p-d-flex p-flex-column">
            <label for="newNumber" :class="{'p-error':v$.number.$invalid && submitted,'p-mb-2':true}">
              <span class="p-text-bold"><span style="color:red">*</span> Новый номер</span>
            </label>
            <InputText
              id="newNumber"
              v-model="v$.number.$model"
              :class="{'p-invalid':v$.number.$invalid && submitted}"
            />
          </div>
        </OverlayPanel>
        <label for="number" :class="{'p-error':v$.number.$invalid && submitted}">
          <span class="p-text-bold"><span style="color:red">*</span> Номер</span>
        </label>
        <div class="p-inputgroup">
          <InputText
            id="number"
            disabled
            v-model="v$.number.$model"
            :class="{'p-invalid':v$.number.$invalid && submitted}"
          />
          <Button
            icon="pi pi-times-circle"
            class="p-button-outlined dy58-addon-button"
            v-tooltip.bottom="'Нарушить текущую нумерацию'"
            @click="changeOrderNumber"
            aria:haspopup="true"
            aria-controls="new-number-overlay_panel"
          />
        </div>
        <small
          v-if="(v$.number.$invalid && submitted) || v$.number.$pending.$response"
          class="p-error"
        >
          Не указан/неверно указан номер распоряжения
        </small>
      </div>

      <!-- ДАТА И ВРЕМЯ СОЗДАНИЯ РАСПОРЯЖЕНИЯ -->

      <div class="p-field p-col-6 p-d-flex p-flex-column p-m-0">
        <label for="createDateTimeString" :class="{'p-error':v$.createDateTimeString.$invalid && submitted}">
          <span class="p-text-bold"><span style="color:red">*</span> Дата и время создания</span>
        </label>
        <InputText
          id="createDateTimeString"
          disabled
          v-model="v$.createDateTimeString.$model"
          :class="{'p-invalid':v$.createDateTimeString.$invalid && submitted}"
        />
        <small
          v-if="(v$.createDateTimeString.$invalid && submitted) || v$.createDateTimeString.$pending.$response"
          class="p-error"
        >
          Не определены/неверно определены дата и время создания распоряжения
        </small>
      </div>

      <!-- ДАТА И ВРЕМЯ ПРИНЯТИЯ ДЕЖУРСТВА -->

      <div class="p-field p-col-12 p-d-flex p-flex-column p-m-0">
        <label for="takeDutyDateTime" :class="{'p-error':v$.takeDutyDateTime.$invalid && submitted}">
          <span class="p-text-bold"><span style="color:red">*</span> Время принятия дежурства</span>
        </label>
        <Calendar
          id="takeDutyDateTime"
          :showTime="true"
          hourFormat="24"
          :hideOnDateTimeSelect="true"
          :showIcon="true"
          :manualInput="true"
          v-model="v$.takeDutyDateTime.$model"
          :class="{'p-invalid':v$.takeDutyDateTime.$invalid && submitted}"
        />
        <small
          v-if="(v$.takeDutyDateTime.$invalid && submitted) || v$.takeDutyDateTime.$pending.$response"
          class="p-error"
        >
          Не определено/неверно определено время принятия дежурства
        </small>
      </div>
{{JSON.stringify(getCurrStationDSPOperators)}}
      <!--<div>
        <PickList v-model="cars" dataKey="vin">
          <template #sourceheader>
            Допустимый перечень лиц
          </template>
          <template #targetheader>
            Выбранные лица
          </template>
          <template #item="slotProps">
            <div v-for="person of getCurrStationDSPOperators" class="p-caritem">
              <div>
                <span class="p-caritem-vin">{{slotProps.item.vin}}</span>
              </div>
            </div>

          </template>
        </PickList>
      </div>-->

      <div class="p-col-12 p-mt-2 p-text-right">
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
  import { required  } from '@vuelidate/validators';
  import { useConfirm } from 'primevue/useconfirm';
  import showMessage from '@/hooks/showMessage.hook';
  import {
    ORDER_PATTERN_TYPES,
    SPECIAL_ORDER_DSP_TAKE_DUTY_SIGN,
    SPECIAL_ORDER_DSP_TAKE_DUTY_TITLE,
    OrderPatternElementType,
  } from '@/constants/orderPatterns';
  import { ORDER_TEXT_SOURCE, FILLED_DSP_TAKE_DUTY_ORDER_INPUT_ELEMENTS } from '@/constants/orders';
  import { useWatchCurrentDateTime } from '@/components/CreateOrders/NewOrder/watchCurrentDateTime';
  import isValidDateTime from '@/additional/isValidDateTime';
  import isNumber from '@/additional/isNumber';

  export default {
    name: 'dy58-create-dsp-take-duty-order-dialog',

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

      const orderType = ORDER_PATTERN_TYPES.ORDER;

      const state = reactive({
        dlgVisible: false,
        number: store.getters.getNextOrdersNumber(orderType),
        createDateTime: store.getters.getCurrDateTimeWithoutMilliseconds,
        createDateTimeString: store.getters.getCurrDateString,
        takeDutyDateTime: store.getters.getLastTakeDutyTime,
        waitingForServerResponse: false,
      });

      const rules = reactive({
        number: { required, isNumber },
        createDateTime: { required, isValidDateTime },
        createDateTimeString: { required },
        takeDutyDateTime: { required, isValidDateTime },
      });

      const submitted = ref(false);
      const v$ = useVuelidate(rules, state);

      // Номер распоряжения заданного типа рассчитывается автоматически и отображается пользователю
      watch(() => store.getters.getNextOrdersNumber(props.orderType), (newVal) => state.number = newVal);

      useWatchCurrentDateTime(state, props, store);

      const newNumberOverlayPanel = ref();
      const changeOrderNumber = (event) => {
        newNumberOverlayPanel.value.toggle(event);
      };

      watch(() => props.showDlg, (newVal) => state.dlgVisible = newVal);

      const closeDialog = () => { emit('close') };

      const handleSubmit = (isFormValid) => {
        submitted.value = true;

        if (!isFormValid) {
            return;
        }

        confirm.require({
          message: 'Сохранить распоряжение?',
          header: 'Подтверждение действия',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            dispatchOrder();
          },
        });
      };

      const getOrderText = () => {
        return {
          orderTextSource: ORDER_TEXT_SOURCE.nopattern,
          orderTitle: SPECIAL_ORDER_DSP_TAKE_DUTY_TITLE,
          orderText: [
            { type: OrderPatternElementType.TEXT, ref: null, value: 'На дежурство заступили: ' },
            { type: OrderPatternElementType.SELECT, ref: FILLED_DSP_TAKE_DUTY_ORDER_INPUT_ELEMENTS.DSP_OPERATOR_FIO, value: '' },
          ],
        };
      };

      /**
       * Издание распоряжения (отправка на сервер).
       */
      const dispatchOrder = () => {
        state.waitingForServerResponse = true;

        store.dispatch('dispatchOrder', {
          type: orderType,
          number: +state.number,
          createDateTime: state.createDateTime,
          place: null,
          timeSpan: { start: state.takeDutyDateTime, end: state.takeDutyDateTime, tillCancellation: false },
          orderText: getOrderText(),
          dncToSend: [],
          dspToSend: [],
          ecdToSend: [],
          otherToSend: [],
          orderChainId: null,
          createdOnBehalfOf: null,
          showOnGID: false,
          specialTrainCategories: [SPECIAL_ORDER_DSP_TAKE_DUTY_SIGN],
        });
      };

      /**
       * Для отображения результата операции издания распоряжения (отправки на сервер).
       */
      watch(() => store.getters.getDispatchOrderResult, (newVal) => {
        if (!newVal || newVal.orderType !== orderType) {
          return;
        }
        state.waitingForServerResponse = false;
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
        getCurrStationDSPOperators: computed(() => store.getters.getCurrStationDSPOperators),
        newNumberOverlayPanel,
        changeOrderNumber,
        closeDialog,
        handleSubmit,
      };
    },
  };
</script>
