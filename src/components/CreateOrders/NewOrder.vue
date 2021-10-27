<template>
  <Toast />
  <div class="p-grid">
    <div class="p-col-6">
      <SelectButton v-model="state.selectedOrderInputType" :options="getOrderInputTypes" optionLabel="label" />
      <br />
      <div v-if="getDispatchOrdersBeingProcessed > 0" class="dy58-warning">
        На сервер отправлено {{ getDispatchOrdersBeingProcessed }} запросов на издание распоряжения/заявки/уведомления. Ожидаю ответ...
      </div>
      <form @submit.prevent="handleSubmit()" class="p-grid">
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
            <span class="p-text-bold">На распоряжение{{orderType === getOrderTypes.ECD_NOTIFICATION ? '/запрещение' : ''}}</span>
          </label>
          <TreeSelect
            placeholder="Выберите действующее распоряжение"
            v-model="v$.prevRelatedOrder.$model"
            :options="getActiveOrders"
            style="width:100%"
          />
          <div v-if="relatedOrderObject" class="p-mt-2">
            <p v-if="getSectorStationOrBlockTitleById">
              Станция/Перегон действия: {{ getSectorStationOrBlockTitleById }}
            </p>
            <p v-if="relatedOrderObjectStartDateTimeString">
              Время начала действия: {{ relatedOrderObjectStartDateTimeString }}
            </p>
            <div v-if="orderType === getOrderTypes.ECD_NOTIFICATION" class="p-mb-2 p-mt-2">
              <label for="cancelOrderDateTime" :class="{'p-error':v$.cancelOrderDateTime.$invalid && submitted}">
                <span class="p-text-bold">Отменяется с &#160;</span>
              </label>
              <Calendar
                :showTime="true"
                hourFormat="24"
                :hideOnDateTimeSelect="true"
                :showIcon="true"
                :manualInput="false"
                v-model="v$.cancelOrderDateTime.$model"
              />
              <br/>
              <small
                v-if="(v$.cancelOrderDateTime.$invalid && submitted) || v$.cancelOrderDateTime.$pending.$response"
                class="p-error"
              >
                Не определены дата и время отмены распоряжения
              </small>
            </div>
          </div>
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
            @input="v$.orderText.$model = $event"
            :orderPatterns="getOrderPatterns"
            :parentOrderText="relatedOrderObject ? relatedOrderObject.orderText : null"
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
      <p class="p-mb-2">! адресаты, указанные в таблице "Иные адресаты", не получат создаваемый документ</p>
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
  import { ORDER_PATTERN_TYPES, OrderPatternElementType } from '../../constants/orderPatterns';
  import { useToast } from 'primevue/usetoast';
  import { getLocaleDateTimeString } from '../../additional/dateTimeConvertions';

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
        cancelOrderDateTime: null,
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
          patternId: null,
          orderTitle: null,
          orderText: null,
        },
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

      const orderTextFieldsNotEmpty = (orderText) => {
        for (let orderTextElement of orderText) {
          if (orderTextElement.type !== OrderPatternElementType.LINEBREAK && !orderTextElement.value) {
            return false;
          }
        }
        return true;
      };

      let rules = {
        number: { required },
        createDateTime: { required },
        createDateTimeString: { required },
        orderText: {
          orderTextSource: { required },
          patternId: {},
          orderTitle: { required },
          orderText: { required, orderTextFieldsNotEmpty },
        },
        // ! <minLength: minLength(1)> означает, что минимальная длина массива должна быть равна нулю
        dncSectorsToSendOrder: { minLength: minLength(1) },
        dspSectorsToSendOrder: { minLength: minLength(1) },
        ecdSectorsToSendOrder: { minLength: minLength(1) },
        otherSectorsToSendOrder: { minLength: minLength(1) },
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
          rules.prevRelatedOrder = { required };
          rules.cancelOrderDateTime = { required };
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

      const relatedOrderId = computed(() => {
        const chosenRelatedOrderKey = state.prevRelatedOrder ? Object.keys(state.prevRelatedOrder)[0] : 'null';
        return chosenRelatedOrderKey !== 'null' ? chosenRelatedOrderKey : null;
      });

      const relatedOrderObject = computed(() => {
        if (!relatedOrderId.value) {
          return null;
        }
        return store.getters.getActiveOrders.find((order) => order._id === relatedOrderId.value);
      });

      const relatedOrderObjectStartDateTimeString = computed(() => {
        if (!relatedOrderObject.value || !relatedOrderObject.value.timeSpan) {
          return null;
        }
        return getLocaleDateTimeString(relatedOrderObject.value.timeSpan.start);
      });

      const getOrderInputTypes = computed(() => OrderInputTypes);

      const getSectorStationOrBlockTitleById = computed(() => {
        if (relatedOrderObject.value && relatedOrderObject.value.place) {
          return store.getters.getSectorStationOrBlockTitleById({
            placeType: relatedOrderObject.value.place.place,
            id: relatedOrderObject.value.place.value,
          });
        }
        return '?';
      });

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
      const handleSubmit = () => {
        // Здесь я столкулась с такой проблемой: у текущего компонента есть вложенный компонент
        // OtherToSendOrderDataTable, у которого, в свою очередь, есть вложенная форма (в диалоговом
        // окне). Попытка валидации текущей формы (т.е. текущего компонента) приводит к автоматической
        // валидации формы того диалогового окна. Справится с этим простым переименованием переменных и
        // методов не получается. Потому идея такова: если форма признана невалидной в результате
        // валидации, то ищу те поля, на которые форма "ругается", и смотрю, есть ли они в списке тех
        // полей, которые я заявила ранее на проверку. Если нет - то полагаю, что форма валидна.
        v$.value.$touch();
        v$.value.$validate();
        let isFormValid = !v$.value.$invalid;
        if (!isFormValid) {
          const invalidProperties = v$.value.$errors.map((err) => err.$property);
          const rulesProperties = Object.keys(rules);
          const intersection = rulesProperties.filter((el) => invalidProperties.includes(el));
          if (!intersection.length) {
            isFormValid = true;
          }
        }

        submitted.value = true;

        if (!isFormValid) {
          showErrMessage('Не могу отправить созданный документ на сервер: не заполнены / неверно заполнены его поля');
          return;
        }

        state.waitingForServerResponse = true;
        store.dispatch('dispatchOrder', {
          type: props.orderType,
          number: state.number,
          createDateTime: state.createDateTime,
          place: state.place.place ? state.place : null,
          timeSpan: state.timeSpan.start
            ? state.timeSpan
            : state.cancelOrderDateTime
              ? { start: state.cancelOrderDateTime, end: state.cancelOrderDateTime, tillCancellation: false}
              : null,
          orderText: state.orderText,
          dncToSend: state.dncSectorsToSendOrder,
          dspToSend: state.dspSectorsToSendOrder,
          ecdToSend: state.ecdSectorsToSendOrder,
          otherToSend: state.otherSectorsToSendOrder,
          prevOrderId: relatedOrderId.value,
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
        relatedOrderObject,
        relatedOrderObjectStartDateTimeString,
        getSectorStationOrBlockTitleById,
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

  /*navigator.clipboard.readText()
    .then(text => {
      const obj = JSON.parse(text)
      console.log('TEXT',obj);
    })
    .catch(err => {
      console.log('Something went wrong', err);
    })*/
</script>


<style lang="scss" scoped>
</style>
