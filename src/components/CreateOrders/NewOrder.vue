<template>
  <Toast />
  <div class="p-grid">
    <div class="p-col-6">
      <SelectButton v-model="state.selectedOrderInputType" :options="getOrderInputTypes" optionLabel="label" />
      <br />
      <div v-if="getDispatchOrdersBeingProcessed > 0" class="dy58-warning">
        На сервер отправлено {{ getDispatchOrdersBeingProcessed }} запросов на издание распоряжения/заявки/уведомления. Ожидаю ответ...
      </div>
      <form @submit.prevent="handleSubmit(!v$.$invalid)" class="p-grid">
        <!-- НОМЕР РАСПОРЯЖЕНИЯ -->
        <div class="p-field p-col-4 p-d-flex p-flex-column">
          <label for="number" :class="{'p-error':v$.number.$invalid && submitted}">
            <span class="p-text-bold"><span style="color:red">*</span> Номер</span>
          </label>
          <InputText
            id="number"
            v-model="v$.number.$model"
            :class="{'p-invalid':v$.number.$invalid && submitted}"
          />
          <small
            v-if="(v$.number.$invalid && submitted) || v$.number.$pending.$response"
            class="p-error"
          >
            Не указан номер распоряжения
          </small>
        </div>
        <!-- ДАТА И ВРЕМЯ СОЗДАНИЯ РАСПОРЯЖЕНИЯ -->
        <div class="p-field p-col-6 p-d-flex p-flex-column">
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
            Не определены дата и время создания распоряжения
          </small>
        </div>
        <!-- СВЯЗАННОЕ РАСПОРЯЖЕНИЕ -->
        <div
          v-if="orderType !== getOrderTypes.ECD_ORDER"
          class="p-field p-col-12 p-d-flex p-flex-column"
        >
          <label for="prevRelatedOrder" :class="{'p-error':v$.prevRelatedOrder.$invalid && submitted}">
            <span class="p-text-bold">На распоряжение</span>
          </label>
          <TreeSelect
            placeholder="Выберите действующее распоряжение"
            v-model="v$.prevRelatedOrder.$model"
            :options="getActiveOrders"
            style="width:100%"
          />
        </div>
        <!-- МЕСТО ДЕЙСТВИЯ РАСПОРЯЖЕНИЯ -->
        <div
          v-if="[getOrderTypes.ORDER,getOrderTypes.ECD_ORDER].includes(orderType)"
          class="p-field p-col-12 p-d-flex p-flex-column"
        >
          <label for="place" :class="{'p-error':v$.place.$invalid && submitted}">
            <span class="p-text-bold"><span style="color:red">*</span> Место действия</span>
          </label>
          <order-place-chooser
            id="place"
            :spans="getSectorBlocks"
            :stations="getSectorStations"
            :value="v$.place.$model"
            @input="v$.place.$model = $event"
          />
          <small
            v-if="(v$.place.$invalid && submitted) || v$.place.$pending.$response"
            class="p-error"
          >
            Пожалуйста, определите место действия распоряжения
          </small>
        </div>
        <!-- ВРЕМЯ ДЕЙСТВИЯ РАСПОРЯЖЕНИЯ -->
        <div
          v-if="[getOrderTypes.ORDER,getOrderTypes.ECD_ORDER].includes(orderType)"
          class="p-field p-col-12 p-d-flex p-flex-column"
        >
          <label for="timeSpan" :class="{'p-error':v$.timeSpan.$invalid && submitted}">
            <span class="p-text-bold"><span style="color:red">*</span> Время действия</span>
          </label>
          <order-time-span-chooser
            id="timeSpan"
            :value="v$.timeSpan.$model"
            @input="v$.timeSpan.$model = $event"
          />
          <small
            v-if="(v$.timeSpan.$invalid && submitted) || v$.timeSpan.$pending.$response"
            class="p-error"
          >
            Пожалуйста, корректно определите время действия распоряжения
          </small>
        </div>
        <!-- НАИМЕНОВАНИЕ И ТЕКСТ РАСПОРЯЖЕНИЯ -->
        <div class="p-field p-col-12 p-d-flex p-flex-column">
          <label for="orderText" :class="{'p-error':v$.orderText.$invalid && submitted}">
            <span class="p-text-bold"><span style="color:red">*</span> Текст распоряжения</span>
          </label>
          <order-text
            id="orderText"
            :value="v$.orderText.$model"
            :orderPatterns="getOrderPatterns"
            @input="v$.orderText.$model = $event"
          />
          <small
            v-if="(v$.orderText.$invalid && submitted) || v$.orderText.$pending.$response"
            class="p-error"
          >
            Пожалуйста, определите все параметры текста распоряжения
          </small>
        </div>
        <!-- ЛИЦО, СОЗДАЮЩЕЕ РАСПОРЯЖЕНИЕ -->
        <div class="p-col-12 p-d-flex p-mt-2 p-flex-wrap">
          <div class="p-text-bold p-grid" style="width:70%">
            <div class="p-col-12">
              {{ getUserPostFIO }}
            </div>
            <div
              v-if="[getOrderTypes.REQUEST,getOrderTypes.NOTIFICATION].includes(orderType)"
              class="p-col-12"
            >
              От имени
              <InputText
                v-model="v$.createdOnBehalfOf.$model"
                :class="{'p-invalid':v$.createdOnBehalfOf.$invalid && submitted}"
              />
            </div>
          </div>
          <div class="p-as-stretch p-d-flex p-ai-center" style="width:30%">
            <Button type="submit" label="Передать" />
          </div>
        </div>
      </form>
    </div>
    <!-- АДРЕСАТЫ -->
    <div class="p-col-6">
      <p class="p-text-bold p-mb-2">Кому адресовать</p>
      <p class="p-mb-2">(адресаты, указанные в таблице "Иные адресаты", не получат создаваемый документ)</p>
      <Accordion :multiple="true">
        <AccordionTab v-if="orderType !== getOrderTypes.NOTIFICATION">
          <template #header>
            <span><b>ДСП:</b> <span v-html="selectedDSPString"></span></span>
          </template>
          <!-- Таблица ДСП -->
          <DSPToSendOrderDataTable
            :value="v$.dspSectorsToSendOrder.$model"
            @input="v$.dspSectorsToSendOrder.$model = $event"
          />
        </AccordionTab>
        <AccordionTab v-if="!isDNC || !(orderType === getOrderTypes.REQUEST || orderType === getOrderTypes.NOTIFICATION)">
          <template #header>
            <span><b>ДНЦ:</b> <span v-html="selectedDNCString"></span></span>
          </template>
          <!-- Таблица ДНЦ -->
          <DNCToSendOrderDataTable
            :value="v$.dncSectorsToSendOrder.$model"
            @input="v$.dncSectorsToSendOrder.$model = $event"
          />
        </AccordionTab>
        <AccordionTab v-if="orderType === getOrderTypes.ORDER || orderType === getOrderTypes.NOTIFICATION">
          <template #header>
            <span><b>ЭЦД:</b> <span v-html="selectedECDString"></span></span>
          </template>
          <!-- Таблица ЭЦД -->
          <ECDToSendOrderDataTable
            :value="v$.ecdSectorsToSendOrder.$model"
            @input="v$.ecdSectorsToSendOrder.$model = $event"
          />
        </AccordionTab>
        <AccordionTab>
          <template #header>
            <span><b>Иные адресаты:</b> <span v-html="selectedOtherAddresseesString"></span></span>
          </template>
          <!-- Таблица иных адресатов -->
          <OtherToSendOrderDataTable
            :value="v$.otherSectorsToSendOrder.$model"
            @input="v$.otherSectorsToSendOrder.$model = $event"
          />
        </AccordionTab>
      </Accordion>
      <small
            v-if="v$.prevRelatedOrder && ((v$.prevRelatedOrder.$invalid && submitted) || v$.prevRelatedOrder.$pending.$response)"
            class="p-error"
          >
            prevRelatedOrder
          </small>
          <small
            v-if="v$.createdOnBehalfOf && ((v$.createdOnBehalfOf.$invalid && submitted) || v$.createdOnBehalfOf.$pending.$response)"
            class="p-error"
          >
            createdOnBehalfOf
          </small>
          <small
            v-if="v$.createDateTimeString && ((v$.createDateTimeString.$invalid && submitted) || v$.createDateTimeString.$pending.$response)"
            class="p-error"
          >
            createDateTimeString
          </small>
          <small
            v-if="v$.dncSectorsToSendOrder && ((v$.dncSectorsToSendOrder.$invalid && submitted) || v$.dncSectorsToSendOrder.$pending.$response)"
            class="p-error"
          >
            dncSectorsToSendOrder
          </small>
          <small
            v-if="v$.dspSectorsToSendOrder && ((v$.dspSectorsToSendOrder.$invalid && submitted) || v$.dspSectorsToSendOrder.$pending.$response)"
            class="p-error"
          >
            dspSectorsToSendOrder
          </small>
          <small
            v-if="v$.ecdSectorsToSendOrder && ((v$.ecdSectorsToSendOrder.$invalid && submitted) || v$.ecdSectorsToSendOrder.$pending.$response)"
            class="p-error"
          >
            ecdSectorsToSendOrder
          </small>
          <small
            v-if="v$.otherSectorsToSendOrder && ((v$.otherSectorsToSendOrder.$invalid && submitted) || v$.otherSectorsToSendOrder.$pending.$response)"
            class="p-error"
          >
            otherSectorsToSendOrder
          </small>
    </div>
  </div>
</template>


<script>
  import { reactive, ref, computed, onMounted, watch } from 'vue';
  import { useStore } from 'vuex';
  import { required, minLength } from '@vuelidate/validators';
  import { useVuelidate } from '@vuelidate/core';
  import DSPToSendOrderDataTable from './DSPToSendOrderDataTable';
  import DNCToSendOrderDataTable from './DNCToSendOrderDataTable';
  import ECDToSendOrderDataTable from './ECDToSendOrderDataTable';
  import OtherToSendOrderDataTable from './OtherToSendOrderDataTable';
  import { OrderInputTypes } from '../../constants/orderInputTypes';
  import OrderPlaceChooser from './OrderPlaceChooser';
  import OrderTimeSpanChooser from './OrderTimeSpanChooser';
  import OrderText from './OrderText';
  import { CurrShiftGetOrderStatus } from '../../constants/orders';
  import { ORDER_PATTERN_TYPES } from '../../constants/orderPatterns';
  import { useToast } from 'primevue/usetoast';

  export default {
    name: 'dy58-new-order-block',

    props: {
      orderType: {
        type: String,
        required: true,
      },
    },

    components: {
      OrderPlaceChooser,
      OrderTimeSpanChooser,
      OrderText,
      DSPToSendOrderDataTable,
      DNCToSendOrderDataTable,
      ECDToSendOrderDataTable,
      OtherToSendOrderDataTable,
    },

    setup(props) {
      const store = useStore();
      const toast = useToast();

      const state = reactive({
        selectedOrderInputType: OrderInputTypes[0],
        number: store.getters.getNextOrdersNumber(props.orderType),
        createDateTime: store.getters.getCurrDateTime,
        createDateTimeString: store.getters.getCurrDateString,
        prevRelatedOrder: null,
        place: {
          place: null,
          value: null,
        },
        timeSpan: {
          start: null,
          end: null,
          tillCancellation: null,
        },
        orderText: {
          orderTextSource: null,
          orderTitle: null,
          orderText: null,
        },
        selectedPattern: null,
        dncSectorsToSendOrder: [],
        dspSectorsToSendOrder: [],
        ecdSectorsToSendOrder: [],
        otherSectorsToSendOrder: [],
        // от имени кого издается распоряжение
        createdOnBehalfOf: null,
        // true - ожидается ответ сервера на запрос об издании распоряжения, false - запроса не ожидается
        waitingForServerResponse: false,
        // Ошибки, выявленные серверной частью в информационных полях, в процессе обработки
        // запроса об издании распоряжения
        orderFieldsErrs: null,
      });

      //const getSelectedOrderInputType = computed(() => state.selectedOrderInputType);

      //watch(getSelectedOrderInputType, (newVal) => store.commit('setCurrentOrderInputType', newVal));

      const nextOrderNumber = computed(() => store.getters.getNextOrdersNumber(props.orderType));
      watch(nextOrderNumber, (newVal) => state.number = newVal);

      const getOrderTypes = computed(() => ORDER_PATTERN_TYPES);
      const isDNC = computed(() => store.getters.isDNC);

      const endDateNoLessStartDate = (value) =>
        !value ? true :
          !state.timeSpan.start ? true : value >= state.timeSpan.start;

      const cancelOrEndDate = (value) => value || state.timeSpan.end;

      let rules = {
        number: { required },
        createDateTime: { required },
        createDateTimeString: { required },
        orderText: {
          orderTextSource: { required },
          orderTitle: { required },
          orderText: { required },
        },
        // ! <minLength: minLength(1)> означает, что минимальная длина массива должна быть равна нулю
        dncSectorsToSendOrder: { minLength: minLength(0) },
        dspSectorsToSendOrder: { minLength: minLength(0) },
        ecdSectorsToSendOrder: { minLength: minLength(0) },
        otherSectorsToSendOrder: { minLength: minLength(0) },
      };

      const placeRules = {
        place: { required },
        value: { required },
      };

      const timeSpanRules = {
        start: { required },
        end: { endDateNoLessStartDate },
        tillCancellation: { cancelOrEndDate },
      };

      switch (props.orderType) {
        case ORDER_PATTERN_TYPES.ORDER:
        case ORDER_PATTERN_TYPES.ECD_ORDER:
          rules.place = placeRules;
          rules.timeSpan = timeSpanRules;
          rules.prevRelatedOrder = {};
          break;
        case ORDER_PATTERN_TYPES.ECD_NOTIFICATION:
          rules.place = placeRules;
          rules.timeSpan = timeSpanRules;
          rules.prevRelatedOrder = { required };
          break;
        case ORDER_PATTERN_TYPES.REQUEST:
        case ORDER_PATTERN_TYPES.NOTIFICATION:
          rules.prevRelatedOrder = {};
          rules.createdOnBehalfOf = {};
          break;
        default:
          break;
      }

      const submitted = ref(false);

      const v$ = useVuelidate(rules, state);

      const getUserPostFIO = computed(() => store.getters.getUserPostFIO);

      // Дата и время
      const getCurrDateTime = computed(() => store.getters.getCurrDateTime);
      const getCurrDateTimeString = computed(() => store.getters.getCurrDateTimeString);
      // Каждый раз, когда происходит изменение текущего времени, производим проверку на
      // совпадение месяца и года текущего времени с месяцем и годом даты последнего изданного
      // распоряжения данного типа. Если не совпадает, то производим переход на новый "журнал"
      // путем сброса номера распоряжений заданного типа.
      watch(getCurrDateTime, (newVal) => {
        const lastOrderDateTime = store.getters.getLastOrderDateTime(props.orderType);
        if (lastOrderDateTime) {
          if (
            (newVal.getMonth() !== lastOrderDateTime.getMonth()) ||
            (newVal.getFullYear() !== lastOrderDateTime.getFullYear())
          ) {
            store.commit('resetOrderNumbersData', props.orderType);
          }
        }
        state.createDateTime = newVal;
      });
      // Для оперативного отображения текущих даты и времени
      watch(getCurrDateTimeString, (newVal) => {
        state.createDateTimeString = newVal;
      });

      const getOrderPatterns = computed(() => store.getters.getOrderPatternsToDisplayInTreeSelect(props.orderType));
      const getActiveOrders = computed(() => store.getters.getActiveOrdersToDisplayInTreeSelect);
      const getOrderInputTypes = computed(() => OrderInputTypes);
      const getSectorStations = computed(() =>
        store.getters.getSectorStations.map((station) => {
          return {
            id: station.St_ID,
            title: `${station.St_Title} (${station.St_UNMC})`,
          };
        })
      );
      const getSectorBlocks = computed(() =>
        store.getters.getSectorBlocks.map((block) => {
          return {
            id: block.Bl_ID,
            title: block.Bl_Title,
          };
        })
      );
      const getDispatchOrdersBeingProcessed = computed(() => store.getters.getDispatchOrdersBeingProcessed);

      // Возвращает строку для отображения персонала (конкретного типа), выбранного в качестве получателей распоряжения
      const formSelectedPersonalString = (personalArray, placeFieldName) => {
        if (!personalArray) {
          return '';
        }
        let originalToString = '';
        let copyToString = '';
        const sendOriginalTo = personalArray.filter((el) => el.sendOriginal === CurrShiftGetOrderStatus.sendOriginal);
        if (sendOriginalTo.length) {
          originalToString = '<span class="dy58-send-original">Оригинал:</span> ' +
            sendOriginalTo.reduce((accumulator, currentValue, index) =>
              accumulator + `${currentValue[placeFieldName]}${!currentValue.post ? '' : ' ' + currentValue.post}${!currentValue.fio ? '' : ' ' + currentValue.fio}` +
              `${index === sendOriginalTo.length - 1 ? '' : ', '}`, '');
        }
        const sendCopyTo = personalArray.filter((el) => el.sendOriginal === CurrShiftGetOrderStatus.sendCopy);
        if (sendCopyTo.length) {
          copyToString = '<span class="dy58-send-copy">Копия:</span> ' +
            sendCopyTo.reduce((accumulator, currentValue, index) =>
              accumulator + `${currentValue[placeFieldName]}${!currentValue.post ? '' : ' ' + currentValue.post}${!currentValue.fio ? '' : ' ' + currentValue.fio}` +
              `${index === sendCopyTo.length - 1 ? '' : ', '}`, '');
        }
        let resultString = '';
        if (originalToString) {
          resultString = originalToString;
        }
        if (copyToString) {
          resultString = !resultString ? copyToString : `${resultString}; ${copyToString}`;
        }
        return resultString;
      };

      // Строка для отображения информации о выбранных ДСП
      const selectedDSPString = computed(() => formSelectedPersonalString(state.dspSectorsToSendOrder, 'station'));

      // Строка для отображения информации о выбранных ДНЦ
      const selectedDNCString = computed(() => formSelectedPersonalString(state.dncSectorsToSendOrder, 'sector'));

      // Строка для отображения информации о выбранных ДСП
      const selectedECDString = computed(() => formSelectedPersonalString(state.ecdSectorsToSendOrder, 'sector'));

      // Строка для отображения информации о выбранных иных адресатах
      const selectedOtherAddresseesString = computed(() => formSelectedPersonalString(state.otherSectorsToSendOrder, 'placeTitle'));

      /**
       *
       */
      onMounted(() => {
        store.commit('chooseOnlyOnlinePersonal');
      });

      /**
       *
       */
      const showSuccessMessage = (message) => {
        toast.add({
          severity: 'success',
          summary: 'Информация',
          detail: message,
          life: 3000,
        });
      };

      /**
       *
       */
      const showErrMessage = (message) => {
        toast.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: message,
          life: 3000,
        });
      };

      /**
       * Для отображения результата операции издания распоряжения (отправки на сервер).
       */
      const getDispatchOrderResult = computed(() => store.getters.getDispatchOrderResult);
      watch(getDispatchOrderResult, (newVal) => {
        if (!newVal || newVal.orderType !== props.orderType) {
          return;
        }
        if (!newVal.error) {
          showSuccessMessage(newVal.message);
        } else {
          showErrMessage(newVal.message);
        }
      });

      /**
       * Издание распоряжения (отправка и сервер и передача всем причастным).
       */
      const handleSubmit = (isFormValid) => {
        console.log(v$.value.$invalid, v$.value.number ? v$.value.number.$invalid : 'v$.number',
        v$.value.createDateTime ? v$.value.createDateTime.$invalid : 'v$.createDateTime',
        v$.value.createDateTimeString ? v$.value.createDateTimeString.$invalid : 'v$.createDateTimeString',
        v$.value.orderText ? {
        1: v$.value.orderText.orderTextSource ? v$.value.orderText.orderTextSource.$invalid : 'v$.orderText.orderTextSource',
          2: v$.value.orderText.orderTitle ? v$.value.orderText.orderTitle.$invalid : 'v$.orderText.orderTitle',
          3: v$.value.orderText.orderText ? v$.value.orderText.orderText.$invalid : 'v$.orderText.orderText',
        } : 'v$.orderText',
        // ! <minLength: minLength(1)> означает, что минимальная длина массива должна быть равна нулю
        v$.value.dncSectorsToSendOrder ? v$.value.dncSectorsToSendOrder.$invalid : 'v$.dncSectorsToSendOrder',
        v$.value.dspSectorsToSendOrder ? v$.value.dspSectorsToSendOrder.$invalid : 'v$.dspSectorsToSendOrder',
        v$.value.ecdSectorsToSendOrder ? v$.value.ecdSectorsToSendOrder.$invalid : 'v$.ecdSectorsToSendOrder',
        v$.value.otherSectorsToSendOrder ? v$.value.otherSectorsToSendOrder.$invalid : 'v$.otherSectorsToSendOrder',
        v$.value.place ? {
          1: v$.value.place.place ? v$.value.place.place.$invalid : 'v$.place.place',
          2: v$.value.place.value ? v$.value.place.value.$invalid : 'v$.place.value',
        } : 'v$.place',
        v$.value.timeSpan ? {
          1: v$.value.timeSpan.start ? v$.value.timeSpan.start.$invalid : 'v$.timeSpan.start',
          2: v$.value.timeSpan.end ? v$.value.timeSpan.end.$invalid : 'v$.timeSpan.end',
          3: v$.value.timeSpan.tillCancellation ? v$.value.timeSpan.tillCancellation.$invalid : 'v$.timeSpan.tillCancellation',
        } : 'v$.timeSpan',
        v$.value.prevRelatedOrder ? v$.value.prevRelatedOrder.$invalid : 'v$.prevRelatedOrder',
        v$.value.createdOnBehalfOf ? v$.value.createdOnBehalfOf.$invalid : 'v$.createdOnBehalfOf',
        );

        submitted.value = true;

        if (!isFormValid) {
          showErrMessage('Не могу отправить созданный документ на сервер: не заполнены / неверно заполнены его поля');
          return;
        }

        const chosenRelatedOrderKey = state.prevRelatedOrder ? Object.keys(state.prevRelatedOrder)[0] : 'null';
        const relatedOrderId = chosenRelatedOrderKey !== 'null' ? chosenRelatedOrderKey : null;

        state.waitingForServerResponse = true;
        store.dispatch('dispatchOrder', {
          type: props.orderType,
          number: state.number,
          createDateTime: state.createDateTime,
          place: state.place.place ? state.place : null,
          timeSpan: state.timeSpan.start ? state.timeSpan : null,
          orderText: state.orderText,
          dncToSend: state.dncSectorsToSendOrder,
          dspToSend: state.dspSectorsToSendOrder,
          ecdToSend: state.ecdSectorsToSendOrder,
          otherToSend: state.otherSectorsToSendOrder,
          prevOrderId: relatedOrderId,
          createdOnBehalfOf: state.createdOnBehalfOf,
        });
      };

      return {
        state,
        getOrderTypes,
        isDNC,
        v$,
        submitted,
        getUserPostFIO,
        getCurrDateTimeString,
        getOrderInputTypes,
        handleSubmit,
        getOrderPatterns,
        getActiveOrders,
        getSectorStations,
        getSectorBlocks,
        selectedDSPString,
        selectedDNCString,
        selectedECDString,
        selectedOtherAddresseesString,
        getDispatchOrdersBeingProcessed,
      };
    },
  };
</script>


<style lang="scss" scoped>
</style>
