<template>
  <Toast />

  <Dialog
    :header="!editExistingTakeDutyOrder ? 'Новая запись о приеме/сдаче дежурства' : 'Редактирование текущей записи о приеме/сдаче дежурства'"
    v-model:visible="state.dlgVisible"
    style="width:auto; maxWidth:800px"
    :modal="true"
    @hide="closeDialog"
  >
    <form @submit.prevent="handleSubmit(!v$.$invalid)" class="p-grid">

      <!-- НОМЕР РАСПОРЯЖЕНИЯ -->

      <div class="p-field p-col-4 p-d-flex p-flex-column p-m-0">
        <order-number
          :canEditOrderNumber="!editExistingTakeDutyOrder"
          :wrongOrderNumber="v$.number.$invalid && submitted"
          :value="v$.number.$model"
          @input="v$.number.$model = $event"
        />
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
          <span class="p-text-bold"><span class="dy58-required-field">*</span> Дата и время создания</span>
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
          <span class="p-text-bold"><span class="dy58-required-field">*</span> Дежурство сдал</span>
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
          <span class="p-text-bold"><span class="dy58-required-field">*</span> Время сдачи дежурства</span>
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
          <span class="p-text-bold"><span class="dy58-required-field">*</span> Дежурство принял</span>
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
          <span class="p-text-bold"><span class="dy58-required-field">*</span> Время приема дежурства</span>
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
          Не определено/неверно определено время приема дежурства
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
  import {
    ORDER_PATTERN_TYPES,
    SPECIAL_ORDER_DSP_TAKE_DUTY_SIGN,
    SPECIAL_ORDER_DSP_TAKE_DUTY_TITLE,
    OrderPatternElementType,
    OrderPatternElementType_Future,
  } from '@/constants/orderPatterns';
  import {
    DSP_TAKE_ORDER_TEXT_ELEMENTS_REFS,
    ORDER_TEXT_SOURCE,
    FILLED_ORDER_INPUT_ELEMENTS,
  } from '@/constants/orders';
  import { useWatchCurrentDateTime } from '@/components/CreateOrders/NewOrder/watchCurrentDateTime';
  import isValidDateTime from '@/additional/isValidDateTime';
  import isNumber from '@/additional/isNumber';
  import { getLocaleDateTimeString } from '@/additional/dateTimeConvertions';
  import { getUserPostFIOString } from '@/store/modules/personal';
  import OrderNumber from '@/components/CreateOrders/OrderNumber';

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

    components: {
      OrderNumber,
    },

    setup(props, { emit }) {
      const store = useStore();
      const confirm = useConfirm();
      const { showSuccessMessage, showErrMessage } = showMessage();

      const orderType = ORDER_PATTERN_TYPES.ORDER;

      // Существующее (ранее изданное) распоряжение о принятии дежурства НА ДАННОМ РАБОЧЕМ МЕСТЕ
      const existingDSPTakeDutyOrder = computed(() => store.getters.getExistingDSPTakeDutyOrder);

      // Список пользователей данного рабочего полигона, которые зарегистрированы на данном рабочем месте
      const getCurrStationWorkPlaceUsers = computed(() =>
        store.getters.getCurrStationWorkPlaceUsers.map((item) => ({
          userId: item.userId,
          userPostFIO: getUserPostFIOString({ post: item.post, name: item.name, fatherName: item.fatherName, surname: item.surname }),
        })));

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
        return getOrderTextParamValue(paramName, orderText);
      };

      const initOrderPassData = () => {
        if (!props.editExistingTakeDutyOrder) {
          if (existingDSPTakeDutyOrder.value && existingDSPTakeDutyOrder.value.orderText) {
            const prevValue = getCurrStationWorkPlaceUserObjectFromOrderText(DSP_TAKE_ORDER_TEXT_ELEMENTS_REFS.TAKE_DUTY_FIO, existingDSPTakeDutyOrder.value.orderText.orderText);
            if (prevValue) {
              state.passDutyUserPostFIO = { userId: prevValue.userId, userPostFIO: prevValue.value };
            }
          } else {
            state.passDutyUserPostFIO = null;
          }
          state.passDutyDateTime = store.getters.getLastTakeDutyTime;

        } else if (existingDSPTakeDutyOrder.value && existingDSPTakeDutyOrder.value.orderText) {
          const prevValue = getCurrStationWorkPlaceUserObjectFromOrderText(DSP_TAKE_ORDER_TEXT_ELEMENTS_REFS.PASS_DUTY_FIO, existingDSPTakeDutyOrder.value.orderText.orderText);
          if (prevValue) {
            state.passDutyUserPostFIO = { userId: prevValue.userId, userPostFIO: prevValue.value };
          }
          state.passDutyDateTime = getOrderTextParamValue(DSP_TAKE_ORDER_TEXT_ELEMENTS_REFS.PASS_DUTY_DATETIME, existingDSPTakeDutyOrder.value.orderText.orderText);
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
          const prevValue = getCurrStationWorkPlaceUserObjectFromOrderText(DSP_TAKE_ORDER_TEXT_ELEMENTS_REFS.TAKE_DUTY_FIO, existingDSPTakeDutyOrder.value.orderText.orderText);
          if (prevValue) {
            state.takeDutyUserPostFIO = { userId: prevValue.userId, userPostFIO: prevValue.value };
          }
          state.takeDutyDateTime = getOrderTextParamValue(DSP_TAKE_ORDER_TEXT_ELEMENTS_REFS.TAKE_DUTY_DATETIME, existingDSPTakeDutyOrder.value.orderText.orderText);

        } else {
          state.takeDutyUserPostFIO = null;
          state.takeDutyDateTime = '';
        }
      };

      const initAdjacentStationShift = () => {
        if (props.editExistingTakeDutyOrder && existingDSPTakeDutyOrder.value && existingDSPTakeDutyOrder.value.orderText) {
          const prevValue = getOrderTextParamValue(DSP_TAKE_ORDER_TEXT_ELEMENTS_REFS.TAKE_DUTY_PERSONAL, existingDSPTakeDutyOrder.value.orderText.orderText);
          if (prevValue && prevValue instanceof Array) {
            state.adjacentStationShift = prevValue.map((item) => ({
              key: item.key,
              workPoligonType: item.workPoligonType,
              workPoligonId: item.workPoligonId,
              workPlaceId: item.workPlaceId,
              userId: item.userId,
              post: item.post,
              name: item.name,
              fatherName: item.fatherName,
              surname: item.surname,
              userPostFIO: item.value,
            }));
          }
        } else {
          state.adjacentStationShift = null;
        }
      };

      const initAdditionalOrderText = () => {
        if (props.editExistingTakeDutyOrder && existingDSPTakeDutyOrder.value && existingDSPTakeDutyOrder.value.orderText) {
          state.additionalOrderText = getOrderTextParamValue(FILLED_ORDER_INPUT_ELEMENTS.NOTE, existingDSPTakeDutyOrder.value.orderText.orderText);
        } else {
          state.additionalOrderText = null;
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
          initAdjacentStationShift();
          initAdditionalOrderText();
        }
      });

      // Отслеживаю изменение номера последнего изданного распоряжения заданного типа
      watch(() => store.getters.getNextOrdersNumber(orderType), (newVal) => state.number = newVal);

      // Изменение значения времени сдачи дежурства приводит к установке такого же значения в поле
      // принятия дежурства
      watch(() => state.passDutyDateTime, (newVal) => state.takeDutyDateTime = newVal);

      // Для оперативного отображения даты-времени издания распоряжения при создании нового распоряжения
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
          {
            type: OrderPatternElementType.DATETIME,
            ref: DSP_TAKE_ORDER_TEXT_ELEMENTS_REFS.TAKE_DUTY_DATETIME,
            value: state.takeDutyDateTime,
          },
          { type: OrderPatternElementType.TEXT, ref: null, value: 'дежурство принял' },
          {
            type: OrderPatternElementType_Future.OBJECT,
            ref: DSP_TAKE_ORDER_TEXT_ELEMENTS_REFS.TAKE_DUTY_FIO,
            value: { userId: state.takeDutyUserPostFIO.userId, value: state.takeDutyUserPostFIO.userPostFIO },
          },
          { type: OrderPatternElementType.LINEBREAK, ref: null, value: null },
          {
            type: OrderPatternElementType.DATETIME,
            ref: DSP_TAKE_ORDER_TEXT_ELEMENTS_REFS.PASS_DUTY_DATETIME,
            value: state.passDutyDateTime,
          },
          { type: OrderPatternElementType.TEXT, ref: null, value: 'дежурство сдал' },
          {
            type: OrderPatternElementType_Future.OBJECT,
            ref: DSP_TAKE_ORDER_TEXT_ELEMENTS_REFS.PASS_DUTY_FIO,
            value: { userId: state.passDutyUserPostFIO.userId, value: state.passDutyUserPostFIO.userPostFIO },
          },
        ];
        if (state.adjacentStationShift && state.adjacentStationShift.length) {
          orderText.push({ type: OrderPatternElementType.LINEBREAK, ref: null, value: null });
          orderText.push({ type: OrderPatternElementType.TEXT, ref: null, value: 'На дежурство заступили:' });
          orderText.push(
            {
              type: OrderPatternElementType_Future.OBJECTS_LIST,
              ref: DSP_TAKE_ORDER_TEXT_ELEMENTS_REFS.TAKE_DUTY_PERSONAL,
              value: state.adjacentStationShift.map((item) => ({
                key: item.key,
                workPoligonType: item.workPoligonType,
                workPoligonId: item.workPoligonId,
                workPlaceId: item.workPlaceId,
                userId: item.userId,
                post: item.post,
                name: item.name,
                fatherName: item.fatherName,
                surname: item.surname,
                value: item.userPostFIO,
              })),
            },
          );
        }
        if (state.additionalOrderText) {
          orderText.push({ type: OrderPatternElementType.LINEBREAK, ref: null, value: null });
          orderText.push({
            type: OrderPatternElementType.TEXT,
            ref: FILLED_ORDER_INPUT_ELEMENTS.NOTE,
            value: state.additionalOrderText,
          });
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

        if (!props.editExistingTakeDutyOrder) {
          // Издание нового распоряжения
          store.dispatch('dispatchOrder', {
            type: orderType,
            number: +state.number,
            createDateTime: state.createDateTime,
            place: null,
            timeSpan: { start: state.takeDutyDateTime, end: null, tillCancellation: true },
            orderText: getOrderTextObject(),
            dncToSend: [],
            dspToSend: [], // не адресовать текущей станции!!! (иначе придется править бэкенд)
            ecdToSend: [],
            otherToSend: [],
            orderChainId: null,
            createdOnBehalfOf: null,
            showOnGID: false,
            specialTrainCategories: [SPECIAL_ORDER_DSP_TAKE_DUTY_SIGN],
            idOfTheOrderToCancel: existingDSPTakeDutyOrder.value ? existingDSPTakeDutyOrder.value._id : null,
          });
        } else if (existingDSPTakeDutyOrder.value) {
          // Редактирование распоряжения
          store.dispatch('editDispatchedOrder', {
            type: orderType,
            id: existingDSPTakeDutyOrder.value._id,
            timeSpan: { start: state.takeDutyDateTime, end: null, tillCancellation: true },
            orderText: getOrderTextObject(),
          });
        }
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
          // если диалог не закрывать, то нужно раскомментировать выше строки для обновления номера распоряжения
          closeDialog();
        } else {
          showErrMessage(newVal.message);
        }
      });

      /**
       * Для отображения результата операции редактирования распоряжения (на сервере).
       */
      watch(() => store.getters.getEditDispatchedOrderResult, (newVal) => {
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
        // Список пользователей данного рабочего полигона, которые зарегистрированы на рабочих местах, отличных от данного
        getCurrStationUsersThatDoNotBelongToCurrWorkPlace: computed(() =>
          store.getters.getCurrStationUsersThatDoNotBelongToCurrWorkPlace.map((item) => {
            return {
              ...item,
              items: item.items.map((el) => ({
                ...el,
                userPostFIO: getUserPostFIOString({ post: el.post, name: el.name, fatherName: el.fatherName, surname: el.surname }),
              })),
            };
          })),
        newNumberOverlayPanel,
        changeOrderNumber,
        closeDialog,
        handleSubmit,
      };
    },
  };
</script>
