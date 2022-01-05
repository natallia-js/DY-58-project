<template>
  <Toast />

  <PreviewNewOrderDlg
    :showDlg="state.showPreviewNewOrderDlg"
    :type="orderType"
    :number="+state.number"
    :prevRelatedOrder="relatedOrderObject"
    :place="getIssuedOrderPlaceObject"
    :timeSpan="getPreviewOrderTimeSpanObject"
    :orderText="state.orderText"
    :dncToSend="dncSectorsToSendOrderNoDupl"
    :dspToSend="dspSectorsToSendOrderNoDupl"
    :ecdToSend="ecdSectorsToSendOrderNoDupl"
    :otherToSend="state.otherSectorsToSendOrder"
    :createdOnBehalfOf="state.createdOnBehalfOf"
    :specialTrainCategories="state.specialTrainCategories"
    @dispatch="dispatchOrder"
    @close="hidePreviewNewOrderDlg"
  />

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

        <!-- СВЯЗАННОЕ РАСПОРЯЖЕНИЕ -->

        <div
          v-if="(orderType !== ORDER_PATTERN_TYPES.ECD_ORDER) && (orderType !== ORDER_PATTERN_TYPES.ECD_PROHIBITION)"
          class="p-field p-col-12 p-d-flex p-flex-column p-m-0"
        >
          <label for="prevRelatedOrder" :class="{'p-error':v$.prevRelatedOrder.$invalid && submitted}">
            <span v-if="orderType === ORDER_PATTERN_TYPES.ECD_NOTIFICATION" class="p-text-bold">
              <span style="color:red">*</span> На приказ/запрещение
            </span>
            <span v-else class="p-text-bold">На распоряжение</span>
          </label>
          <TreeSelect
            placeholder="Выберите действующее распоряжение"
            v-model="v$.prevRelatedOrder.$model"
            :options="getActiveOrdersToDisplayInTreeSelect"
            style="width:100%"
          />
          <div v-if="relatedOrderObject" class="p-mt-2">
            <p v-if="getSectorStationOrBlockTitleById">
              Станция/Перегон действия: {{ getSectorStationOrBlockTitleById }}
            </p>
            <p v-if="relatedOrderObjectStartDateTimeString">
              Время начала действия: {{ relatedOrderObjectStartDateTimeString }}
            </p>
            <div v-if="orderType === ORDER_PATTERN_TYPES.ECD_NOTIFICATION" class="p-mb-2 p-mt-2">
              <label for="cancelOrderDateTime" :class="{'p-error':v$.cancelOrderDateTime.$invalid && submitted}">
                <span class="p-text-bold">Отменяется с &#160;</span>
              </label>
              <Calendar
                :showTime="true"
                hourFormat="24"
                :hideOnDateTimeSelect="true"
                :showIcon="true"
                :manualInput="true"
                v-model="v$.cancelOrderDateTime.$model"
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

        <div v-if="orderType === ORDER_PATTERN_TYPES.ORDER" class="p-field p-col-12 p-m-0">
          <SelectButton v-model="state.showOnGID" :options="showOnGIDOptions" optionLabel="name" />
        </div>

        <!-- МЕСТО ДЕЙСТВИЯ РАСПОРЯЖЕНИЯ -->

        <div
          v-if="(orderType === ORDER_PATTERN_TYPES.ORDER && state.showOnGID.value) ||
            (orderType === ORDER_PATTERN_TYPES.ECD_ORDER) ||
            (orderType === ORDER_PATTERN_TYPES.ECD_PROHIBITION)"
          class="p-field p-col-12 p-d-flex p-flex-column p-m-0"
        >
          <label for="orderPlace" :class="{'p-error':v$.orderPlace.$invalid && submitted}">
            <span class="p-text-bold">
              <span
                v-if="![ORDER_PATTERN_TYPES.ECD_ORDER, ORDER_PATTERN_TYPES.ECD_PROHIBITION].includes(orderType)"
                style="color:red">
                *
              </span> Место действия
            </span>
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

        <div
          v-if="[ORDER_PATTERN_TYPES.ORDER, ORDER_PATTERN_TYPES.ECD_ORDER, ORDER_PATTERN_TYPES.ECD_PROHIBITION].includes(orderType)"
          class="p-field p-col-12 p-m-0"
        >
          <SelectButton
            v-model="state.defineOrderTimeSpan"
            :options="defineOrderTimeSpanOptions"
            optionLabel="name"
          />
        </div>

        <!-- ВРЕМЯ ДЕЙСТВИЯ РАСПОРЯЖЕНИЯ -->

        <div
          v-if="[ORDER_PATTERN_TYPES.ORDER, ORDER_PATTERN_TYPES.ECD_ORDER, ORDER_PATTERN_TYPES.ECD_PROHIBITION].includes(orderType) && state.defineOrderTimeSpan.value"
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

        <!-- ОТМЕТКИ ОБ ОСОБОЙ КАТЕГОРИИ ПОЕЗДА -->

        <div
          v-if="state.specialTrainCategories && state.specialTrainCategories.length"
          class="p-field p-col-12 p-d-flex p-flex-column p-m-0"
        >
          <label>
            <span class="p-text-bold">Особая категория поезда</span>
          </label>
          {{ state.specialTrainCategories.join(', ') }}
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
            Пожалуйста, корректно определите все параметры текста распоряжения
          </small>
        </div>

        <!-- ЛИЦО, СОЗДАЮЩЕЕ РАСПОРЯЖЕНИЕ -->

        <div class="p-col-12 p-d-flex p-mt-2 p-flex-wrap">
          <div class="p-text-bold p-grid" style="width:70%">
            <div class="p-col-12">
              {{ getUserPostFIO }}
            </div>
            <div
              v-if="[ORDER_PATTERN_TYPES.REQUEST, ORDER_PATTERN_TYPES.NOTIFICATION].includes(orderType)"
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
        <AccordionTab v-if="orderType !== ORDER_PATTERN_TYPES.NOTIFICATION">
          <template #header>
            <span><b>ДСП:</b> <span v-html="selectedDSPString"></span></span>
          </template>
          <!-- Таблица ДСП -->
          <DSPToSendOrderDataTable
            :value="v$.dspSectorsToSendOrder.$model"
            @input="v$.dspSectorsToSendOrder.$model = $event"
          />
        </AccordionTab>
        <AccordionTab v-if="!isDNC || !(orderType === ORDER_PATTERN_TYPES.REQUEST || orderType === ORDER_PATTERN_TYPES.NOTIFICATION)">
          <template #header>
            <span><b>ДНЦ:</b> <span v-html="selectedDNCString"></span></span>
          </template>
          <!-- Таблица ДНЦ -->
          <DNCToSendOrderDataTable
            :value="v$.dncSectorsToSendOrder.$model"
            @input="v$.dncSectorsToSendOrder.$model = $event"
          />
        </AccordionTab>
        <AccordionTab v-if="orderType === ORDER_PATTERN_TYPES.ORDER || orderType === ORDER_PATTERN_TYPES.NOTIFICATION">
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
  import { useVuelidate } from '@vuelidate/core';
  import DSPToSendOrderDataTable from '@/components/CreateOrders/DSPToSendOrderDataTable';
  import DNCToSendOrderDataTable from '@/components/CreateOrders/DNCToSendOrderDataTable';
  import ECDToSendOrderDataTable from '@/components/CreateOrders/ECDToSendOrderDataTable';
  import OtherToSendOrderDataTable from '@/components/CreateOrders/OtherToSendOrderDataTable';
  import PreviewNewOrderDlg from '@/components/CreateOrders/PreviewNewOrderDlg';
  import OrderPlaceChooser from '@/components/CreateOrders/OrderPlaceChooser';
  import OrderTimeSpanChooser from '@/components/CreateOrders/OrderTimeSpanChooser';
  import OrderText from '@/components/CreateOrders/OrderText';
  import { OrderInputTypes } from '@/constants/orderInputTypes';
  import { ORDER_PATTERN_TYPES } from '@/constants/orderPatterns';
  import showMessage from '@/hooks/showMessage.hook';
  import isValidDateTime from '@/additional/isValidDateTime';
  import { CLEAR_SHIFT_FOR_SENDING_DATA, CHOOSE_ONLY_ONLINE_PERSONAL } from '@/store/mutation-types';
  import { useWatchCurrentDateTime } from './watchCurrentDateTime';
  import { useDispatchOrder } from './dispatchOrder';
  import { useSectorsToSendOrder } from './sectorsToSendOrder';
  import { useRelatedOrder } from './relatedOrder';
  import { useNewOrderValidationRules } from './validationRules';

  export default {
    name: 'dy58-new-order-block',

    props: {
      orderType: {
        type: String,
        required: true,
      },
      prevOrderId: {
        type: String,
        required: false,
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

      // Уточнять время действия издаваемого распоряжения либо не уточнять
      const defineOrderTimeSpanOptions = ([
        { name: 'Время действия по умолчанию', value: false },
        { name: 'Уточнить время действия', value: true },
      ]);
      // Отображать издаваемое распоряжение на ГИД, или не отображать
      const showOnGIDOptions = ([
        { name: 'Не отображать на ГИД', value: false },
        { name: 'Отобразить на ГИД', value: true },
      ]);

      const state = reactive({
        selectedOrderInputType: OrderInputTypes[0],
        number: store.getters.getNextOrdersNumber(props.orderType),
        createDateTime: store.getters.getCurrDateTimeWithoutMilliseconds,
        createDateTimeString: store.getters.getCurrDateString,
        prevRelatedOrder: props.prevOrderId ? { [props.prevOrderId]: true } : null,
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
        defineOrderTimeSpan: defineOrderTimeSpanOptions[0],
        showOnGID: showOnGIDOptions[0],
        specialTrainCategories: null,
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

      useWatchCurrentDateTime(state, props, store);

      const {
        dspSectorsToSendOrderNoDupl,
        dncSectorsToSendOrderNoDupl,
        ecdSectorsToSendOrderNoDupl,
        selectedDSPString,
        selectedDNCString,
        selectedECDString,
        selectedOtherAddresseesString,
      } = useSectorsToSendOrder(state, store);

      const {
        relatedOrderObject,
        relatedOrderObjectStartDateTimeString,
      } = useRelatedOrder(state, store);

      const dispatchOrderObject = useDispatchOrder({
        state,
        props,
        store,
        showSuccessMessage,
        showErrMessage,
        dspSectorsToSendOrderNoDupl,
        dncSectorsToSendOrderNoDupl,
        ecdSectorsToSendOrderNoDupl,
        relatedOrderObject,
      });

      const {
        orderTextRules,
        placeRules,
        timeSpanRules,
        rules,
      } = useNewOrderValidationRules(state, props, relatedOrderObject);

      const submitted = ref(false);
      const v$ = useVuelidate(rules, state);

      // Номер распоряжения заданного типа рассчитывается автоматически и отображается пользователю
      watch(() => store.getters.getNextOrdersNumber(props.orderType), (newVal) => state.number = newVal);

      const getSectorStationOrBlockTitleById = computed(() => {
        if (relatedOrderObject.value && relatedOrderObject.value.place) {
          return store.getters.getSectorStationOrBlockTitleById({
            placeType: relatedOrderObject.value.place.place,
            id: relatedOrderObject.value.place.value,
          });
        }
        return null;
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

      /**
       * После загрузки компонента отображаем online-пользователей станций и участков в секции "Кому"
       */
      onMounted(() => {
        store.commit(CLEAR_SHIFT_FOR_SENDING_DATA);
        store.commit(CHOOSE_ONLY_ONLINE_PERSONAL);
      });

      /**
       * Обнуляем значения секунд и миллисекунд у выбранного значения времени отмены действия распоряжения
       * (чтобы не было проблем при сравнении с датой начала действия соответствующего распоряжения,
       * например, когда необходимо отменить в то же время, когда оно начало действовать, если издано
       * было случайно).
       */
      watch(() => state.cancelOrderDateTime, (value) => {
        if (value && isValidDateTime(value)) {
          state.cancelOrderDateTime.setSeconds(0, 0);
        }
      });

      /**
       * Скрытие диалогового окна просмотра информации об издаваемом распоряжении.
       */
      const hidePreviewNewOrderDlg = () => {
        state.showPreviewNewOrderDlg = false;
      };

      /**
       * При смене шаблона распоряжения извлекает отметки об особой категории поезда,
       * закрепленные за данным шаблоном.
       */
      watch(() => state.orderText.patternId, (newVal) => {
        if (!newVal) {
          state.specialTrainCategories = null;
        }
        state.specialTrainCategories = store.getters.getOrderPatternSpecialTrainCategories(state.orderText.patternId)
      });

      /**
       * Для выбранного шаблона распоряжения возвращает строку с особыми категориями поезда,
       * которыми отмечен данный шаблон. Если за шаблоном не закреплены отметки об особых категориях
       * поезда, то возвращается null.
       */
      const getOrderPatternSpecialTrainCategoriesString = computed(() => {
        const specialTrainCategoriesArray = store.getters.getOrderPatternSpecialTrainCategories(state.orderText.patternId)
        if (!specialTrainCategoriesArray || !specialTrainCategoriesArray.length) {
          return null;
        }
        return specialTrainCategoriesArray.join(', ');
      });

      /**
       * Данный метод осуществляет проверку корректности указания значений полей создаваемого
       * распоряжения перед его изданием.
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

      const newNumberOverlayPanel = ref();
      const changeOrderNumber = (event) => {
        newNumberOverlayPanel.value.toggle(event);
      };

      return {
        state,
        showOnGIDOptions,
        defineOrderTimeSpanOptions,
        ORDER_PATTERN_TYPES,
        isDNC: computed(() => store.getters.isDNC),
        v$,
        submitted,
        getUserPostFIO: computed(() => store.getters.getUserPostFIO),
        getOrderInputTypes: OrderInputTypes,
        handleSubmit,
        dispatchOrder: dispatchOrderObject.dispatchOrder,
        getActiveOrdersToDisplayInTreeSelect: computed(() => store.getters.getActiveOrdersToDisplayInTreeSelect),
        relatedOrderObject,
        relatedOrderObjectStartDateTimeString,
        getSectorStationOrBlockTitleById,
        getSectorStations,
        getSectorBlocks,
        selectedDSPString,
        selectedDNCString,
        selectedECDString,
        selectedOtherAddresseesString,
        getDispatchOrdersBeingProcessed: dispatchOrderObject.getDispatchOrdersBeingProcessed,
        hidePreviewNewOrderDlg,
        getIssuedOrderPlaceObject: dispatchOrderObject.getIssuedOrderPlaceObject,
        getPreviewOrderTimeSpanObject: dispatchOrderObject.getPreviewOrderTimeSpanObject,
        dspSectorsToSendOrderNoDupl,
        dncSectorsToSendOrderNoDupl,
        ecdSectorsToSendOrderNoDupl,
        getOrderPatternSpecialTrainCategoriesString,
        newNumberOverlayPanel,
        changeOrderNumber,
      };
    },
  };
</script>
