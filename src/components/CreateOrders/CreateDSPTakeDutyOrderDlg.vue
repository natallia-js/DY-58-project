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
            <label for="new-number" :class="{'p-error':v$.number.$invalid && submitted,'p-mb-2':true}">
              <span class="p-text-bold"><span style="color:red">*</span> Новый номер</span>
            </label>
            <InputText
              id="new-number"
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
        <label for="create-date-time-string" :class="{'p-error':v$.createDateTimeString.$invalid && submitted}">
          <span class="p-text-bold"><span style="color:red">*</span> Дата и время создания</span>
        </label>
        <InputText
          id="create-date-time-string"
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

      <!-- КТО И ВО СКОЛЬКО СДАЛ ДЕЖУРСТВО -->

      <div class="p-field p-col-6 p-d-flex p-flex-column p-m-0">
        <label for="pass-duty-user-post-fio" :class="{'p-error':v$.passDutyUserPostFIO.$invalid && submitted}">
          <span class="p-text-bold"><span style="color:red">*</span> Дежурство сдал</span>
        </label>
        <Dropdown
          id="pass-duty-user-post-fio"
          v-model="v$.passDutyUserPostFIO.$model"
          :options="getCurrStationWorkPlaceUsers"
          optionLabel="userPostFIO"
          dataKey="userId"
          :class="{'p-invalid':v$.passDutyUserPostFIO.$invalid && submitted}"
        >
        </Dropdown>
        <small
          v-if="(v$.passDutyUserPostFIO.$invalid && submitted) || v$.passDutyUserPostFIO.$pending.$response"
          class="p-error"
        >
          Определите ФИО работника, сдавшего дежурство
        </small>
      </div>
      <div class="p-field p-col-6 p-d-flex p-flex-column p-m-0">
        <label for="pass-duty-date-time" :class="{'p-error':v$.passDutyDateTime.$invalid && submitted}">
          <span class="p-text-bold"><span style="color:red">*</span> Время сдачи дежурства</span>
        </label>
        <Calendar
          id="pass-duty-date-time"
          :showTime="true"
          hourFormat="24"
          :hideOnDateTimeSelect="true"
          :showIcon="true"
          :manualInput="true"
          v-model="v$.passDutyDateTime.$model"
          :class="{'p-invalid':v$.passDutyDateTime.$invalid && submitted}"
        />
        <small
          v-if="(v$.passDutyDateTime.$invalid && submitted) || v$.passDutyDateTime.$pending.$response"
          class="p-error"
        >
          Не определено/неверно определено время сдачи дежурства
        </small>
      </div>

      <!-- КТО И ВО СКОЛЬКО ПРИНЯЛ ДЕЖУРСТВО -->

      <div class="p-field p-col-6 p-d-flex p-flex-column p-m-0">
        <label for="take-duty-user-post-fio" :class="{'p-error':v$.takeDutyUserPostFIO.$invalid && submitted}">
          <span class="p-text-bold"><span style="color:red">*</span> Дежурство принял</span>
        </label>
        <Dropdown
          id="take-duty-user-post-fio"
          v-model="v$.takeDutyUserPostFIO.$model"
          :options="getCurrStationWorkPlaceUsers"
          optionLabel="userPostFIO"
          dataKey="userId"
          :class="{'p-invalid':v$.takeDutyUserPostFIO.$invalid && submitted}"
        >
        </Dropdown>
        <small
          v-if="(v$.takeDutyUserPostFIO.$invalid && submitted) || v$.takeDutyUserPostFIO.$pending.$response"
          class="p-error"
        >
          Определите ФИО работника, принявшего дежурство
        </small>
      </div>
      <div class="p-field p-col-6 p-d-flex p-flex-column p-m-0">
        <label for="take-duty-date-time" :class="{'p-error':v$.takeDutyDateTime.$invalid && submitted}">
          <span class="p-text-bold"><span style="color:red">*</span> Время принятия дежурства</span>
        </label>
        <Calendar
          id="take-duty-date-time"
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

      <!-- СМЕННЫЙ ПЕРСОНАЛ, С КОТОРЫМ ДСП ЗАСТУПАЕТ НА ДЕЖУРСТВО -->

      <div class="p-field p-col-12 p-d-flex p-flex-column p-m-0">
        <label for="dsp-operators" :class="{'p-error':v$.dspOperators.$invalid && submitted}">
          <span class="p-text-bold">Определите персонал, принимающий смену</span>
        </label>
        <PickList v-model="state.dspOperators" dataKey="id" id="dsp-operators">
          <!--<template #sourceheader>
            Допустимый перечень лиц
          </template>
          <template #targetheader>
            Выбранные лица
          </template>-->
          <template #item="slotProps">
            <div>
              <p>{{slotProps.item.workPlaceName}}:</p>
              <p>{{slotProps.item.userFIO}}</p>
            </div>
          </template>
        </PickList>
        <small
          v-if="(v$.takeDutyDateTime.$invalid && submitted) || v$.takeDutyDateTime.$pending.$response"
          class="p-error"
        >
          Проверьте правильность определения сменного персонала
        </small>
      </div>

      <!-- ДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ -->

      <div class="p-field p-col-12 p-d-flex p-flex-column p-m-0">
        <label for="additional-order-text" :class="{'p-error':v$.additionalOrderText.$invalid && submitted}">
          <span class="p-text-bold">Дополнительная информация</span>
        </label>
        <div>
          <Button
            label="Вставить перенос строки"
            @click="handleInsertRowbreak"
          />
        </div>
        <textarea
          id="additional-order-text"
          v-model="state.additionalOrderText"
          rows="5"
          :style="{ width: '100%', minWidth: '100%', maxWidth: '100%' }"
          class="p-component p-p-2"
          ref="textarea"
        />
        <small
          v-if="(v$.additionalOrderText.$invalid && submitted) || v$.additionalOrderText.$pending.$response"
          class="p-error"
        >
          Проверьте правильность указания дополнительной информации
        </small>
      </div>

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
  import { required, minLength } from '@vuelidate/validators';
  import { useConfirm } from 'primevue/useconfirm';
  import showMessage from '@/hooks/showMessage.hook';
  import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';
  import {
    ORDER_PATTERN_TYPES,
    SPECIAL_ORDER_DSP_TAKE_DUTY_SIGN,
    SPECIAL_ORDER_DSP_TAKE_DUTY_TITLE,
    OrderPatternElementType,
  } from '@/constants/orderPatterns';
  import { CurrShiftGetOrderStatus, ORDER_TEXT_SOURCE } from '@/constants/orders';
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
        passDutyUserPostFIO: '',
        passDutyDateTime: store.getters.getLastTakeDutyTime,
        takeDutyUserPostFIO: !store.getters.getUserId ? null :
          { userId: store.getters.getUserId, userPostFIO: store.getters.getUserPostFIO },
        takeDutyDateTime: store.getters.getLastTakeDutyTime,
        waitingForServerResponse: false,
        dspOperators: [store.getters.getCurrStationWorkPlaceUsers, []],
        additionalOrderText: null,
      });

      const takeDutyTimeNoLessPassDutyTime = (value) => {
        return value >= state.passDutyDateTime;
      };

      const rules = reactive({
        number: { required, isNumber },
        createDateTime: { required, isValidDateTime },
        createDateTimeString: { required },
        passDutyUserPostFIO: { required },
        passDutyDateTime: { required, isValidDateTime },
        takeDutyUserPostFIO: { required },
        takeDutyDateTime: { required, isValidDateTime, takeDutyTimeNoLessPassDutyTime },
        // ! <minLength: minLength(1)> означает, что минимальная длина массива должна быть равна нулю
        dspOperators: { minLength: minLength(1) },
        additionalOrderText: {},
      });

      const textarea = ref(null);

      const submitted = ref(false);
      const v$ = useVuelidate(rules, state);

      // Номер распоряжения заданного типа рассчитывается автоматически и отображается пользователю
      watch(() => store.getters.getNextOrdersNumber(props.orderType), (newVal) => state.number = newVal);

      // Изменение значения времени сдачи дежурства приводит к установке такого же значения в поле
      // принятия дежурства
      watch(() => state.passDutyDateTime, (newVal) => state.takeDutyDateTime = newVal);

      watch(() => store.getters.getCurrStationWorkPlaceUsers, (newVal) => {
        state.dspOperators = [newVal, []];
      });

      useWatchCurrentDateTime(state, props, store);

      const newNumberOverlayPanel = ref();
      const changeOrderNumber = (event) => {
        newNumberOverlayPanel.value.toggle(event);
      };

      watch(() => props.showDlg, (newVal) => state.dlgVisible = newVal);

      const closeDialog = () => { emit('close') };

      //
      const handleInsertRowbreak = () => {
        state.additionalOrderText += '<br />';
        textarea.value.focus();
      };

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

      const getOrderTextObject = () => {
        const orderText = [
          { type: OrderPatternElementType.DATETIME, ref: null, value: state.takeDutyDateTime },
          { type: OrderPatternElementType.TEXT, ref: null, value: 'дежурство принял' },
          { type: OrderPatternElementType.INPUT, ref: null, value: state.takeDutyUserPostFIO.userPostFIO },
          { type: OrderPatternElementType.DATETIME, ref: null, value: state.passDutyDateTime },
          { type: OrderPatternElementType.TEXT, ref: null, value: 'дежурство сдал' },
          { type: OrderPatternElementType.INPUT, ref: null, value: state.passDutyUserPostFIO.userPostFIO },
        ];

        if (state.dspOperators && state.dspOperators[1] && state.dspOperators[1].length) {
          orderText.push(
            {
              type: OrderPatternElementType.TEXT,
              ref: null,
              value: `На дежурство заступили: ${state.dspOperators[1].map((item) => `${item.userFIO} (${item.workPlaceName})`).join(', ')}`,
            },
          );
        }
        if (state.additionalOrderText) {
          orderText.push(
            {
              type: OrderPatternElementType.TEXT,
              ref: null,
              value: orderText.length ? '<br />' + state.additionalOrderText : state.additionalOrderText,
            }
          );
        }
        return {
          orderTextSource: ORDER_TEXT_SOURCE.nopattern,
          orderTitle: SPECIAL_ORDER_DSP_TAKE_DUTY_TITLE,
          orderText,
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
          timeSpan: { start: state.takeDutyDateTime, end: null, tillCancellation: true },
          orderText: getOrderTextObject(),
          dncToSend: [],
          // Данное поле нужно обязательно заполнить, чтобы когда распоряжение появится во входящих,
          // его можно было подтвердить
          dspToSend: [{
            id: store.getters.getUserWorkPoligon.code,
            type: WORK_POLIGON_TYPES.STATION,
            station: store.getters.getSectorStations.find((st) =>
              String(st.St_ID) === String(store.getters.getUserWorkPoligon.code)).St_Title,
            post: null,
            fio: null,
            sendOriginal: CurrShiftGetOrderStatus.sendOriginal,
          }],
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
        textarea,
        handleInsertRowbreak,
        getCurrStationWorkPlaceUsers: computed(() => store.getters.getCurrStationWorkPlaceUsers),
        newNumberOverlayPanel,
        changeOrderNumber,
        closeDialog,
        handleSubmit,
      };
    },
  };
</script>

<style>
  .p-picklist {
    min-height: 15rem !important;
    max-height: 15rem !important;
  }
  .p-picklist-list-wrapper {
    height: 100% !important;
  }
  .p-picklist-list {
    min-height: 100% !important;
    max-height: 100% !important;
  }
  @media screen and (max-width: 960px) {
    .p-picklist[pv_id_6] {
      max-height: 100% !important;
    }
    .p-picklist-list-wrapper {
      min-height: 10rem !important;
      max-height: 10rem !important;
    }
  }
</style>
