<template>
  <Toast />

  <Dialog
    :header="!editExistingTakeDutyOrder ? 'Новая запись о принятии дежурства' : 'Редактирование текущей записи о принятии дежурства'"
    v-model:visible="state.dlgVisible"
    style="width:auto; maxWidth:800px"
    :modal="true"
    @hide="closeDialog"
  >
    <form @submit.prevent="handleSubmit(!v$.$invalid)" class="p-grid">

      <!-- НОМЕР РАСПОРЯЖЕНИЯ -->

      <div class="p-field p-col-4 p-d-flex p-flex-column p-m-0">
        <OverlayPanel
          v-if="!editExistingTakeDutyOrder"
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
            v-if="!editExistingTakeDutyOrder"
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
        <label for="adjacent-station-shift" :class="{'p-error':v$.adjacentStationShift.$invalid && submitted}">
          <span class="p-text-bold">Персонал станции, принимающий дежурство</span>
        </label>
        <MultiSelect
          id="adjacent-station-shift"
          v-model="v$.adjacentStationShift.$model"
          :options="getCurrStationUsersThatDoNotBelongToCurrWorkPlace"
          optionLabel="userPostFIO"
          optionGroupLabel="groupName"
          optionGroupChildren="items"
          dataKey="key"
        >
          <template #optiongroup="slotProps">
            <div>
              <div>{{ slotProps.option.groupName }}</div>
            </div>
          </template>
        </MultiSelect>
        <small
          v-if="(v$.adjacentStationShift.$invalid && submitted) || v$.adjacentStationShift.$pending.$response"
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
  import {
    CurrShiftGetOrderStatus,
    DSP_TAKE_ORDER_TEXT_ELEMENTS,
    ORDER_TEXT_SOURCE,
  } from '@/constants/orders';
  import { useWatchCurrentDateTime } from '@/components/CreateOrders/NewOrder/watchCurrentDateTime';
  import isValidDateTime from '@/additional/isValidDateTime';
  import isNumber from '@/additional/isNumber';
  import { getLocaleDateTimeString } from '@/additional/dateTimeConvertions';

  export default {
    name: 'dy58-create-dsp-take-duty-order-dialog',

    emits: ['close'],

    props: {
      showDlg: {
        type: Boolean,
        required: true,
      },
      editExistingTakeDutyOrder: {
        type: Boolean,
        required: true,
      },
    },

    setup(props, { emit }) {
      const store = useStore();
      const confirm = useConfirm();
      const { showSuccessMessage, showErrMessage } = showMessage();

      const orderType = ORDER_PATTERN_TYPES.ORDER;

      // Существующее (ранее изданное) распоряжение о принятии дежурства
      const existingDSPTakeDutyOrder = computed(() => store.getters.getExistingDSPTakeDutyOrder);

      // Список пользователей данного рабочего полигона, которые зарегистрированы на данном рабочем месте
      const getCurrStationWorkPlaceUsers = computed(() => store.getters.getCurrStationWorkPlaceUsers);
      //
      const getCurrStationUsersThatDoNotBelongToCurrWorkPlace = computed(() => store.getters.getCurrStationUsersThatDoNotBelongToCurrWorkPlace);

      const initOrderNumber = () => {
        if (!props.editExistingTakeDutyOrder) {
          state.number = store.getters.getNextOrdersNumber(orderType);
        } else if (existingDSPTakeDutyOrder.value) {
          state.number = existingDSPTakeDutyOrder.value.number;
        } else {
          state.number = '';
        }
      };

      const initOrderCreateDateTime = () => {
        if (!props.editExistingTakeDutyOrder) {
          state.createDateTime = store.getters.getCurrDateTimeWithoutMilliseconds;
          state.createDateTimeString = store.getters.getCurrDateString;
        } else if (existingDSPTakeDutyOrder.value) {
          state.createDateTime = existingDSPTakeDutyOrder.value.createDateTime;
          state.createDateTimeString = getLocaleDateTimeString(existingDSPTakeDutyOrder.value.createDateTime, true);
        } else {
          state.createDateTime = '';
          state.createDateTimeString = '';
        }
      };

      const getOrderTextParamValue = (paramName, orderText) => {
        if (!paramName || !orderText || !orderText.length) {
          return null;
        }
        const textElement = orderText.find((el) => el.ref === paramName);
        return textElement ? textElement.value : null;
      };

      // Ищет объект пользователя текущего рабочего места, который соответствует указанному в запросе
      // параметру текста распоряжения
      const getCurrStationWorkPlaceUserObjectFromOrderText = (paramName, orderText) => {
        if (!paramName || !orderText || !orderText.length || !getCurrStationWorkPlaceUsers.value) {
          return null;
        }
        const userPostFIO = getOrderTextParamValue(paramName, orderText);
        return getCurrStationWorkPlaceUsers.value.find((user) => user.userPostFIO === userPostFIO);
      };

      const initOrderPassData = () => {
        if (!props.editExistingTakeDutyOrder) {
          if (existingDSPTakeDutyOrder.value && existingDSPTakeDutyOrder.value.orderText)
            state.passDutyUserPostFIO = getCurrStationWorkPlaceUserObjectFromOrderText(DSP_TAKE_ORDER_TEXT_ELEMENTS.TAKE_DUTY_FIO, existingDSPTakeDutyOrder.value.orderText.orderText);
          else
            state.passDutyUserPostFIO = null;
          state.passDutyDateTime = store.getters.getLastTakeDutyTime;
        } else if (existingDSPTakeDutyOrder.value && existingDSPTakeDutyOrder.value.orderText) {
          state.passDutyUserPostFIO = getCurrStationWorkPlaceUserObjectFromOrderText(DSP_TAKE_ORDER_TEXT_ELEMENTS.PASS_DUTY_FIO, existingDSPTakeDutyOrder.value.orderText.orderText);
          state.passDutyDateTime = getOrderTextParamValue(DSP_TAKE_ORDER_TEXT_ELEMENTS.PASS_DUTY_DATETIME, existingDSPTakeDutyOrder.value.orderText.orderText);
        } else {
          state.passDutyUserPostFIO = null;
          state.passDutyDateTime = '';
        }
      };

      const initOrderTakeData = () => {
        if (!props.editExistingTakeDutyOrder) {
          state.takeDutyUserPostFIO = !store.getters.getUserId ? null :
            { userId: store.getters.getUserId, userPostFIO: store.getters.getUserPostFIO };
          state.takeDutyDateTime = store.getters.getLastTakeDutyTime;
        } else if (existingDSPTakeDutyOrder.value && existingDSPTakeDutyOrder.value.orderText) {
          state.takeDutyUserPostFIO = getCurrStationWorkPlaceUserObjectFromOrderText(DSP_TAKE_ORDER_TEXT_ELEMENTS.TAKE_DUTY_FIO, existingDSPTakeDutyOrder.value.orderText.orderText);
          state.takeDutyDateTime = getOrderTextParamValue(DSP_TAKE_ORDER_TEXT_ELEMENTS.TAKE_DUTY_DATETIME, existingDSPTakeDutyOrder.value.orderText.orderText);
        } else {
          state.takeDutyUserPostFIO = null;
          state.takeDutyDateTime = '';
        }
      };

      // Действия на показ/скрытие диалога
      watch(() => props.showDlg, (newVal) => {
        if (newVal) {
          // Инициализация элементов формы диалога в зависимости от того, хочет пользователь
          // создать новое распоряжение либо отредактировать существующее
          initOrderNumber();
          initOrderCreateDateTime();
          state.updateCreateDateTimeRegularly = !props.editExistingTakeDutyOrder;
          initOrderPassData();
          initOrderTakeData();

          console.log(store.getters.getCurrStationUsersThatDoNotBelongToCurrWorkPlace)
        }
      });

      const state = reactive({
        dlgVisible: false,
        number: '',
        createDateTime: '',
        createDateTimeString: '',
        updateCreateDateTimeRegularly: true,
        passDutyUserPostFIO: null,
        passDutyDateTime: '',
        takeDutyUserPostFIO: null,
        takeDutyDateTime: '',
        waitingForServerResponse: false,
        adjacentStationShift: null,
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
        adjacentStationShift: { minLength: minLength(1) },
        additionalOrderText: {},
      });

      const textarea = ref(null);

      const submitted = ref(false);
      const v$ = useVuelidate(rules, state);

      // Номер распоряжения заданного типа рассчитывается автоматически и отображается пользователю
      //watch(() => store.getters.getNextOrdersNumber(props.orderType), (newVal) => state.number = newVal);

      // Изменение значения времени сдачи дежурства приводит к установке такого же значения в поле
      // принятия дежурства
      watch(() => state.passDutyDateTime, (newVal) => state.takeDutyDateTime = newVal);

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
          { type: OrderPatternElementType.DATETIME, ref: DSP_TAKE_ORDER_TEXT_ELEMENTS.TAKE_DUTY_DATETIME, value: state.takeDutyDateTime },
          { type: OrderPatternElementType.TEXT, ref: null, value: 'дежурство принял' },
          { type: OrderPatternElementType.INPUT, ref: DSP_TAKE_ORDER_TEXT_ELEMENTS.TAKE_DUTY_FIO, value: state.takeDutyUserPostFIO.userPostFIO },
          { type: OrderPatternElementType.DATETIME, ref: DSP_TAKE_ORDER_TEXT_ELEMENTS.PASS_DUTY_DATETIME, value: state.passDutyDateTime },
          { type: OrderPatternElementType.TEXT, ref: null, value: 'дежурство сдал' },
          { type: OrderPatternElementType.INPUT, ref: DSP_TAKE_ORDER_TEXT_ELEMENTS.PASS_DUTY_FIO, value: state.passDutyUserPostFIO.userPostFIO },
        ];

        if (state.adjacentStationShift && state.adjacentStationShift[1] && state.adjacentStationShift[1].length) {
          orderText.push(
            {
              type: OrderPatternElementType.TEXT,
              ref: null,
              value: `На дежурство заступили: ${state.adjacentStationShift[1].map((item) => `${item.userFIO} (${item.workPlaceName})`).join(', ')}`,
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
        getCurrStationWorkPlaceUsers,
        getCurrStationUsersThatDoNotBelongToCurrWorkPlace,
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
