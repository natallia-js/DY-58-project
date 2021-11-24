<template>
  <Toast />
  <PreviewNewOrderDlg
    :showDlg="state.showPreviewNewOrderDlg"
    :type="orderType"
    :number="state.number"
    :prevRelatedOrder="relatedOrderObject"
    :place="getIssuedOrderPlaceObject"
    :timeSpan="getPreviewOrderTimeSpanObject"
    :orderText="state.orderText"
    :dncToSend="dncSectorsToSendOrderNoDupl"
    :dspToSend="dspSectorsToSendOrderNoDupl"
    :ecdToSend="ecdSectorsToSendOrderNoDupl"
    :otherToSend="state.otherSectorsToSendOrder"
    :createdOnBehalfOf="state.createdOnBehalfOf"
    @dispatch="dispatchOrder"
    @close="hidePreviewNewOrderDlg">
  </PreviewNewOrderDlg>

  <div class="p-grid">
    <div class="p-col-6">
      <SelectButton
        v-model="state.selectedOrderInputType"
        :options="getOrderInputTypes"
        optionLabel="label"
        disabled
      />
      <br />
      <div v-if="getDispatchOrdersBeingProcessed > 0" class="dy58-warning">
        На сервер отправлено {{ getDispatchOrdersBeingProcessed }} запросов на издание распоряжения. Ожидаю ответ...
      </div>
      <form @submit.prevent="handleSubmit()" class="p-grid">

        <!-- НОМЕР РАСПОРЯЖЕНИЯ -->

        <div class="p-field p-col-4 p-d-flex p-flex-column p-m-0">
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
            Не определены дата и время создания распоряжения
          </small>
        </div>

        <!-- СВЯЗАННОЕ РАСПОРЯЖЕНИЕ -->

        <div
          v-if="(orderType !== getOrderTypes.ECD_ORDER) && (orderType !== getOrderTypes.ECD_PROHIBITION)"
          class="p-field p-col-12 p-d-flex p-flex-column p-m-0"
        >
          <label for="prevRelatedOrder" :class="{'p-error':v$.prevRelatedOrder.$invalid && submitted}">
            <span v-if="orderType === getOrderTypes.ECD_NOTIFICATION" class="p-text-bold">
              <span style="color:red">*</span> На распоряжение/запрещение
            </span>
            <span v-else class="p-text-bold">
              Предыдущее распоряжение в цепочке
            </span>
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
                @dateSelect="handleChangeCancelOrderDateTime"
              />
              <br/>
              <small
                v-if="(v$.cancelOrderDateTime.$invalid && submitted) || v$.cancelOrderDateTime.$pending.$response"
                class="p-error"
              >
                Не определены/неверно определены дата и время отмены распоряжения
              </small>
            </div>
          </div>
        </div>

        <!-- ФЛАГ ОТОБРАЖЕНИЯ НА ГИД -->

        <div v-if="orderType === getOrderTypes.ORDER" class="p-field p-col-12 p-m-0">
          <SelectButton v-model="showOnGID" :options="showOnGIDOptions" optionLabel="name" />
        </div>

        <!-- МЕСТО ДЕЙСТВИЯ РАСПОРЯЖЕНИЯ -->

        <div
          v-if="(orderType === getOrderTypes.ORDER && showOnGID.value) ||
            (orderType === getOrderTypes.ECD_ORDER) ||
            (orderType === getOrderTypes.ECD_PROHIBITION)"
          class="p-field p-col-12 p-d-flex p-flex-column p-m-0"
        >
          <label for="orderPlace" :class="{'p-error':v$.orderPlace.$invalid && submitted}">
            <span class="p-text-bold">
              <span style="color:red">*</span> Место действия</span>
          </label>
          <order-place-chooser
            id="orderPlace"
            :spans="getSectorBlocks"
            :stations="getSectorStations"
            :value="v$.orderPlace.$model"
            @input="v$.orderPlace.$model = $event"
          />
          <small
            v-if="(v$.orderPlace.$invalid && submitted) || v$.orderPlace.$pending.$response"
            class="p-error"
          >
            Пожалуйста, определите место действия распоряжения
          </small>
        </div>

        <!-- ФЛАГ УТОЧНЕНИЯ ВРЕМЕНИ ДЕЙСТВИЯ РАСПОРЯЖЕНИЯ -->

        <div v-if="orderType === getOrderTypes.ORDER" class="p-field p-col-12 p-m-0">
          <SelectButton v-model="defineOrderTimeSpan" :options="defineOrderTimeSpanOptions" optionLabel="name" />
        </div>

        <!-- ВРЕМЯ ДЕЙСТВИЯ РАСПОРЯЖЕНИЯ -->

        <div
          v-if="(orderType === getOrderTypes.ORDER && defineOrderTimeSpan.value) ||
            (orderType === getOrderTypes.ECD_ORDER) ||
            (orderType === getOrderTypes.ECD_PROHIBITION)"
          class="p-field p-col-12 p-d-flex p-flex-column p-m-0"
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

        <div class="p-field p-col-12 p-d-flex p-flex-column p-m-0">
          <label for="orderText" :class="{'p-error':v$.orderText.$invalid && submitted}">
            <span class="p-text-bold"><span style="color:red">*</span> Текст распоряжения</span>
          </label>
          <order-text
            id="orderText"
            :orderType="orderType"
            :value="v$.orderText.$model"
            @input="v$.orderText.$model = $event"
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
              v-if="[getOrderTypes.REQUEST, getOrderTypes.NOTIFICATION].includes(orderType)"
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
            <Button type="submit" label="Просмотреть и издать" />
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
  import { CurrShiftGetOrderStatus, ORDER_ELEMENTS_CAN_BE_EMPTY } from '../../constants/orders';
  import { ORDER_PATTERN_TYPES, OrderPatternElementType } from '../../constants/orderPatterns';
  import { getLocaleDateTimeString } from '../../additional/dateTimeConvertions';
  import PreviewNewOrderDlg from './PreviewNewOrderDlg.vue';
  import showMessage from '../../hooks/showMessage.hook';

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
      PreviewNewOrderDlg,
    },

    setup(props) {
      const store = useStore();
      const { showSuccessMessage, showErrMessage } = showMessage();

      const state = reactive({
        selectedOrderInputType: OrderInputTypes[0],
        number: store.getters.getNextOrdersNumber(props.orderType),
        createDateTime: store.getters.getCurrDateTimeWithoutMilliseconds,
        createDateTimeString: store.getters.getCurrDateString,
        prevRelatedOrder: null,
        cancelOrderDateTime: null,
        orderPlace: {
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
        showPreviewNewOrderDlg: false,
      });

      // Отображать издаваемое распоряжение на ГИД, или не отображать
      const showOnGIDOptions = ref([
        { name: 'Не отображать на ГИД', value: false },
        { name: 'Отобразить на ГИД', value: true },
      ]);
      const showOnGID = ref(showOnGIDOptions.value[0]);

      // Уточнять время действия издаваемого распоряжения либо не уточнять
      const defineOrderTimeSpanOptions = ref([
        { name: 'Время действия по умолчанию', value: false },
        { name: 'Уточнить время действия', value: true },
      ]);
      const defineOrderTimeSpan = ref(defineOrderTimeSpanOptions.value[0]);

      //const getSelectedOrderInputType = computed(() => state.selectedOrderInputType);

      //watch(getSelectedOrderInputType, (newVal) => store.commit('setCurrentOrderInputType', newVal));

      const nextOrderNumber = computed(() => store.getters.getNextOrdersNumber(props.orderType));
      watch(nextOrderNumber, (newVal) => state.number = newVal);

      const getOrderTypes = computed(() => ORDER_PATTERN_TYPES);
      const isDNC = computed(() => store.getters.isDNC);

      const endDateNoLessStartDate = (value) => {
        return !value ? true :
          !state.timeSpan.start ? true : value >= state.timeSpan.start;}

      const cancelOrEndDate = (value) => value || state.timeSpan.end;

      // Проверка элементов шаблона распоряжения на наличие в них значений.
      // Значение должно присутствовать у всех элементов шаблона, кроме элемента типа
      // 'перенос строки', а также элементов, смысловые значения которых находятся в
      // определенном списке
      const orderTextFieldsNotEmpty = (orderText) => {
        for (let orderTextElement of orderText) {
          if (orderTextElement.type !== OrderPatternElementType.LINEBREAK &&
            !ORDER_ELEMENTS_CAN_BE_EMPTY.includes(orderTextElement.ref) &&
            !orderTextElement.value) {
            return false;
          }
        }
        return true;
      };

      const cancelOrderDateTimeNoLessOrderStartDate = (value) => {
        if (!relatedOrderObject.value) {
          return true;
        }
        return relatedOrderObject.value.timeSpan.start <= value;
      };

      const orderTextRules = {
        orderTextSource: { required },
        patternId: {},
        orderTitle: { required },
        orderText: { required, orderTextFieldsNotEmpty },
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

      const rules = reactive({
        number: { required },
        createDateTime: { required },
        createDateTimeString: { required },
        orderText: orderTextRules,
        // ! <minLength: minLength(1)> означает, что минимальная длина массива должна быть равна нулю
        dncSectorsToSendOrder: { minLength: minLength(1) },
        dspSectorsToSendOrder: { minLength: minLength(1) },
        ecdSectorsToSendOrder: { minLength: minLength(1) },
        otherSectorsToSendOrder: { minLength: minLength(1) },
      });

      switch (props.orderType) {
        case ORDER_PATTERN_TYPES.ORDER:
          rules.orderPlace = showOnGID.value.value ? placeRules : {};
          rules.timeSpan = defineOrderTimeSpan.value.value ? timeSpanRules : {};
          rules.prevRelatedOrder = {};
          break;
        case ORDER_PATTERN_TYPES.ECD_ORDER:
        case ORDER_PATTERN_TYPES.ECD_PROHIBITION:
          rules.orderPlace = placeRules;
          rules.timeSpan = timeSpanRules;
          rules.prevRelatedOrder = {};
          break;
        case ORDER_PATTERN_TYPES.ECD_NOTIFICATION:
          rules.prevRelatedOrder = { required };
          rules.cancelOrderDateTime = { required, cancelOrderDateTimeNoLessOrderStartDate };
          break;
        case ORDER_PATTERN_TYPES.REQUEST:
        case ORDER_PATTERN_TYPES.NOTIFICATION:
          rules.prevRelatedOrder = {};
          rules.createdOnBehalfOf = {};
          break;
        default:
          break;
      }

      watch(showOnGID, (newVal) => {
        rules.orderPlace = newVal.value ? placeRules : {};
        state.orderPlace = {
          place: null,
          value: null,
        };
      });
      watch(defineOrderTimeSpan, (newVal) => {
        rules.timeSpan = newVal.value ? timeSpanRules : {};
        state.timeSpan = {
          start: null,
          end: null,
          tillCancellation: null,
        };
      });

      const submitted = ref(false);
      const v$ = useVuelidate(rules, state);

      const getUserPostFIO = computed(() => store.getters.getUserPostFIO);

      // Дата и время
      const getCurrDateTimeWithoutMilliseconds = computed(() => store.getters.getCurrDateTimeWithoutMilliseconds);
      const getCurrDateTimeString = computed(() => store.getters.getCurrDateTimeString);
      // Каждый раз, когда происходит изменение текущего времени, производим проверку на
      // совпадение месяца и года текущего времени с месяцем и годом даты последнего изданного
      // распоряжения данного типа. Если не совпадает, то производим переход на новый "журнал"
      // путем сброса номера распоряжений заданного типа.
      watch(getCurrDateTimeWithoutMilliseconds, (newVal) => {
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

      const dspSectorsToSendOrderNoDupl = computed(() => {
        if (!state.dspSectorsToSendOrder || !state.dspSectorsToSendOrder.length) {
          return [];
        }
        return state.dspSectorsToSendOrder.filter((item, index) => {
          return state.dspSectorsToSendOrder.findIndex((el) => el.id === item.id) === index;
        });
      });

      const dncSectorsToSendOrderNoDupl = computed(() => {
        if (!state.dncSectorsToSendOrder || !state.dncSectorsToSendOrder.length) {
          return [];
        }
        return state.dncSectorsToSendOrder.filter((item, index) => {
          return state.dncSectorsToSendOrder.findIndex((el) => el.id === item.id) === index;
        });
      });

      const ecdSectorsToSendOrderNoDupl = computed(() => {
        if (!state.ecdSectorsToSendOrder || !state.ecdSectorsToSendOrder.length) {
          return [];
        }
        return state.ecdSectorsToSendOrder.filter((item, index) => {
          return state.ecdSectorsToSendOrder.findIndex((el) => el.id === item.id) === index;
        });
      });

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
        let sendCopyTo = personalArray.filter((el) => el.sendOriginal === CurrShiftGetOrderStatus.sendCopy);
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
      const selectedDSPString = computed(() => formSelectedPersonalString(dspSectorsToSendOrderNoDupl.value, 'station'));

      // Строка для отображения информации о выбранных ДНЦ
      const selectedDNCString = computed(() => formSelectedPersonalString(dncSectorsToSendOrderNoDupl.value, 'sector'));

      // Строка для отображения информации о выбранных ДСП
      const selectedECDString = computed(() => formSelectedPersonalString(ecdSectorsToSendOrderNoDupl.value, 'sector'));

      // Строка для отображения информации о выбранных иных адресатах
      const selectedOtherAddresseesString = computed(() => formSelectedPersonalString(state.otherSectorsToSendOrder, 'placeTitle'));

      /**
       *
       */
      onMounted(() => {
        store.commit('chooseOnlyOnlinePersonal');
      });

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
       * Обнуляем значения секунд и миллисекунд у выбранного значения времени
       * (чтобы не было проблем при сравнении с датой начала действия соответствующего распоряжения,
       * например, когда необходимо отменить в то же время, когда оно начало действовать, если издано
       * было случайно)
       */
      const handleChangeCancelOrderDateTime = (value) => {
        if (value) {
          state.cancelOrderDateTime.setSeconds(0, 0);
        }
      };

      /**
       *
       */
      const hidePreviewNewOrderDlg = () => {
        state.showPreviewNewOrderDlg = false;
      };

      /**
       *
       */
      const handleSubmit = () => {
        // Здесь я столкулась с такой проблемой: у текущего компонента есть вложенный компонент
        // OtherToSendOrderDataTable, у которого, в свою очередь, есть вложенная форма (в диалоговом
        // окне). Попытка валидации текущей формы (т.е. текущего компонента) приводит к автоматической
        // валидации формы того диалогового окна. Справится с этим простым переименованием переменных и
        // методов не получается. Потому идея такова: если форма признана невалидной в результате
        // валидации, то ищу те поля, на которые форма "ругается", и смотрю, есть ли они в списке тех
        // полей, которые я заявила ранее на проверку. Если нет - то полагаю, что форма валидна.
        submitted.value = true;
        v$.value.$touch();
        v$.value.$validate();
        let isFormValid = !v$.value.$invalid;
        if (!isFormValid) {
          const invalidProperties = v$.value.$errors.map((err) => err.$property);
          const rulesProperties = Object.keys(rules);
          if (rulesProperties.includes('orderText')) {
            rulesProperties.push(...Object.keys(orderTextRules));
          }
          if (rulesProperties.includes('orderPlace')) {
            rulesProperties.push(...Object.keys(placeRules));
          }
          if (rulesProperties.includes('timeSpan')) {
            rulesProperties.push(...Object.keys(timeSpanRules));
          }
          const intersection = rulesProperties.filter((el) => invalidProperties.includes(el));
          if (!intersection.length) {
            isFormValid = true;
          }
        }

        if (!isFormValid) {
          showErrMessage('Не могу отправить созданный документ на сервер: не заполнены / неверно заполнены его поля');
          return;
        }

        state.showPreviewNewOrderDlg = true;
      };

      /**
       *
      */
      const getIssuedOrderPlaceObject = computed(() => {
        return (
          (props.orderType === ORDER_PATTERN_TYPES.ORDER && showOnGID.value.value) ||
          (props.orderType === ORDER_PATTERN_TYPES.ECD_ORDER) ||
          (props.orderType === ORDER_PATTERN_TYPES.ECD_PROHIBITION)
        ) ? state.orderPlace : null;
      });

      // Время действия издаваемого распоряжения:
      //   1. если установлен флаг "Уточнить время действия распоряжения" либо издается распоряжение ЭЦД,
      // то полагаем, что пользователь определил временной интервал действия распоряжения;
      //   2. если п.1. не выполняется, то смотрим, указаны ли дата-время отмены действия
      // предшествующего распоряжения; если определены дата-время отмены действия предшествующего
      // распоряжения, то полагаем, что издаваемое распоряжение действует одномоментно и время его
      // действия равно указанной дате-времени отмены действия предшествующего распоряжения;
      //   3. если п.1 и п.2 не выполняются, то дату-время действия распоряжения определяем по следующему
      // алгоритму:
      //     3.1. если издается заявка либо уведомление, то время начала его действия равно дате-времени
      //          его издания, а время окончания действия - до отмены (это нужно для того, чтобы завка /
      //          уведомление не исчезло из списка рабочих распоряжений до тех пор, пока на основании его
      //          не будет издано распоряжение)
      //     3.2. в противном случае время начала и окончания действия распоряжения равны дате и времени
      //          его издания
      const getPreviewOrderTimeSpanObject = computed(() => {
        if (
          (props.orderType === ORDER_PATTERN_TYPES.ORDER && defineOrderTimeSpan.value.value) ||
          (props.orderType === ORDER_PATTERN_TYPES.ECD_ORDER) ||
          (props.orderType === ORDER_PATTERN_TYPES.ECD_PROHIBITION)
        ) {
          return state.timeSpan;
        }
        if (state.cancelOrderDateTime) {
          return { start: state.cancelOrderDateTime, end: state.cancelOrderDateTime, tillCancellation: false };
        }
        if (props.orderType === ORDER_PATTERN_TYPES.REQUEST || props.orderType === ORDER_PATTERN_TYPES.NOTIFICATION) {
          return { start: state.createDateTime, end: null, tillCancellation: true };
        }
        return null; // этот момент нужен для отслеживания пункта 3.2 разными компонентами
      });

      const getIssuedOrderTimeSpanObject = computed(() => {
        const tso = getPreviewOrderTimeSpanObject.value;
        return tso ? tso : { start: state.createDateTime, end: state.createDateTime, tillCancellation: false };
      });

      /**
       * Издание распоряжения (отправка и сервер и передача всем причастным).
       */
      const dispatchOrder = () => {
        state.waitingForServerResponse = true;

        store.dispatch('dispatchOrder', {
          type: props.orderType,
          number: state.number,
          createDateTime: state.createDateTime,
          place: getIssuedOrderPlaceObject.value,
          timeSpan: getIssuedOrderTimeSpanObject.value,
          orderText: state.orderText,
          dncToSend: dncSectorsToSendOrderNoDupl.value,
          dspToSend: dspSectorsToSendOrderNoDupl.value,
          ecdToSend: ecdSectorsToSendOrderNoDupl.value,
          otherToSend: state.otherSectorsToSendOrder,
          prevOrderId: relatedOrderId.value,
          createdOnBehalfOf: state.createdOnBehalfOf,
          showOnGID: showOnGID.value.value,
        });
      };

      return {
        state,
        showOnGID,
        showOnGIDOptions,
        defineOrderTimeSpan,
        defineOrderTimeSpanOptions,
        getOrderTypes,
        isDNC,
        v$,
        submitted,
        getUserPostFIO,
        getCurrDateTimeString,
        getOrderInputTypes,
        handleSubmit,
        dispatchOrder,
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
        handleChangeCancelOrderDateTime,
        hidePreviewNewOrderDlg,
        getIssuedOrderPlaceObject,
        getPreviewOrderTimeSpanObject,
        getIssuedOrderTimeSpanObject,
        dspSectorsToSendOrderNoDupl,
        dncSectorsToSendOrderNoDupl,
        ecdSectorsToSendOrderNoDupl,
      };
    },
  };
</script>
