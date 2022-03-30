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
    :draftId="currentOrderDraft ? currentOrderDraft._id : null"
    @dispatch="dispatchOrder"
    @close="hidePreviewNewOrderDlg"
  />

  <ConfirmPopup group="confirmSaveOrderDraft"></ConfirmPopup>

  <div class="p-grid">
    <div class="p-col-6">
      <SelectButton
        v-model="state.selectedOrderInputType"
        :options="OrderInputTypes"
        optionLabel="label"
        disabled
      />
      <br />
      <div v-if="getDispatchOrdersBeingProcessed > 0" class="dy58-warning p-mb-2">
        На сервер отправлено {{ getDispatchOrdersBeingProcessed }} запросов на издание документа текущего типа. Ожидаю ответ...
      </div>
      <form @submit.prevent="handleSubmit(!v$.$invalid)" class="p-grid">

        <!-- НОМЕР РАСПОРЯЖЕНИЯ -->

        <div class="p-field p-col-4 p-d-flex p-flex-column p-m-0">
          <order-number
            :canEditOrderNumber="true"
            :wrongOrderNumber="v$.number.$invalid && submitted"
            :value="v$.number.$model"
            @input="v$.number.$model = $event"
          />
          <small
            v-if="(v$.number.$invalid && submitted) || v$.number.$pending.$response"
            class="p-error"
          >
            Не указан/неверно указан номер документа
          </small>
        </div>

        <!-- ДАТА И ВРЕМЯ СОЗДАНИЯ РАСПОРЯЖЕНИЯ -->

        <div class="p-field p-col-6 p-d-flex p-flex-column p-m-0">
          <label for="createDateTimeString" :class="{'p-error':v$.createDateTimeString.$invalid && submitted}">
            <span class="p-text-bold"><span class="dy58-required-field">*</span> Дата и время создания</span>
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
            Не определены/неверно определены дата и время создания документа
          </small>
        </div>

        <!-- ЧЕРНОВИКИ РАСПОРЯЖЕНИЙ ТЕКУЩЕГО ТИПА -->

        <div v-if="showOrderDrafts" class="p-field p-col-12 p-d-flex p-flex-column p-m-0">
          <label for="current-order-draft" class="p-text-bold">
            Текущий черновик документа
          </label>
          <Dropdown
            id="current-order-draft"
            v-model="state.currentOrderDraftId"
            :options="getOrderDraftsOfGivenType"
            optionLabel="displayTitle"
            optionValue="_id"
            placeholder="Выберите черновик документа"
          />
        </div>

        <!-- СВЯЗАННОЕ РАСПОРЯЖЕНИЕ -->

        <div v-if="showConnectedOrderFields" class="p-field p-col-12 p-d-flex p-flex-column p-m-0">
          <label for="prevRelatedOrder" :class="{'p-error':v$.prevRelatedOrder.$invalid && submitted}">
            <span v-if="orderType === ORDER_PATTERN_TYPES.ECD_NOTIFICATION" class="p-text-bold">
              <span class="dy58-required-field">*</span> На приказ/запрещение
            </span>
            <span v-else class="p-text-bold">
              <span v-if="orderType === ORDER_PATTERN_TYPES.NOTIFICATION" class="dy58-required-field">*</span> На документ
            </span>
          </label>
          <TreeSelect
            placeholder="Выберите действующий документ"
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
                Не определены/неверно определены дата и время отмены документа
              </small>
            </div>
          </div>
        </div>

        <!-- ФЛАГ ОТОБРАЖЕНИЯ НА ГИД -->

        <div
          v-if="showDisplayOnGIDFlag"
          class="p-field p-col-12 p-m-0"
        >
          <SelectButton v-model="state.showOnGID" :options="showOnGIDOptions" optionLabel="name" />
        </div>

        <!-- МЕСТО ДЕЙСТВИЯ РАСПОРЯЖЕНИЯ -->

        <div
          v-if="showDisplayOnGIDFields"
          class="p-field p-col-12 p-d-flex p-flex-column p-m-0"
        >
          <label for="orderPlace" :class="{'p-error':v$.orderPlace.$invalid && submitted}">
            <span class="p-text-bold">
              <span class="dy58-required-field">*</span> Место действия
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
            Пожалуйста, определите место действия документа
          </small>
        </div>

        <!-- ФЛАГ УТОЧНЕНИЯ ВРЕМЕНИ ДЕЙСТВИЯ РАСПОРЯЖЕНИЯ -->

        <div v-if="showDisplayOrderTimespanFlag" class="p-field p-col-12 p-m-0">
          <SelectButton
            v-model="state.defineOrderTimeSpan"
            :options="defineOrderTimeSpanOptions"
            optionLabel="name"
          />
        </div>

        <!-- ВРЕМЯ ДЕЙСТВИЯ РАСПОРЯЖЕНИЯ -->

        <div v-if="showDisplayOrderTimespan" class="p-field p-col-12 p-d-flex p-flex-column p-m-0">
          <label for="time-span" :class="{'p-error':v$.timeSpan.$invalid && submitted}">
            <span class="p-text-bold"><span class="dy58-required-field">*</span> Время действия</span>
          </label>
          <order-time-span-chooser
            id="time-span"
            :tickTillCancellation="[ORDER_PATTERN_TYPES.ECD_ORDER, ORDER_PATTERN_TYPES.ECD_PROHIBITION].includes(orderType)"
            :tillCancellationLabel="`До ${isDNC ? 'отмены' : 'уведомления'}`"
            :value="v$.timeSpan.$model"
            @input="v$.timeSpan.$model = $event"
          />
          <small
            v-if="(v$.timeSpan.$invalid && submitted) || v$.timeSpan.$pending.$response"
            class="p-error"
          >
            Пожалуйста, корректно определите время действия документа
          </small>
        </div>

        <!-- ОСОБЫЕ ОТМЕТКИ РАСПОРЯЖЕНИЯ -->

        <div
          v-if="state.specialTrainCategories && state.specialTrainCategories.length"
          class="p-field p-col-12 p-m-0"
        >
          <span class="p-text-bold">Особые отметки документа:</span>&#160;
          <span>{{ state.specialTrainCategories.join(', ') }}</span>
        </div>

        <!-- НАИМЕНОВАНИЕ И ТЕКСТ РАСПОРЯЖЕНИЯ -->

        <div class="p-field p-col-12 p-d-flex p-flex-column p-m-0">
          <label for="orderText" :class="{'p-error':v$.orderText.$invalid && submitted}">
            <span class="p-text-bold"><span class="dy58-required-field">*</span> Текст документа</span>
          </label>
          <order-text
            id="orderText"
            :orderType="orderType"
            :value="v$.orderText.$model"
            @input="setOrderText($event)"
            :parentOrderText="relatedOrderObject ? relatedOrderObject.orderText : null"
          />
          <small
            v-if="(v$.orderText.$invalid && submitted) || v$.orderText.$pending.$response"
            class="p-error"
          >
            Пожалуйста, корректно определите все параметры текста документа
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
          <div class="p-as-stretch p-d-flex p-ai-center p-flex-row p-flex-wrap" style="width:30%">
            <Button type="submit" label="Просмотреть и издать" class="p-mb-2" />
            <Button v-if="isECD" label="Сохранить черновик" @click="handleSaveOrderDraft($event)" />
          </div>
        </div>
      </form>
    </div>

    <!-- АДРЕСАТЫ -->

    <div class="p-col-6">
      <p class="p-mb-2">
        <span class="p-text-bold p-mr-2">Кому адресовать</span>
        <Button
          icon="pi pi-times"
          class="p-button-secondary p-button-sm dy58-order-action-button p-m-1"
          v-tooltip="'Очистить список'"
          @click="handleClearOrderAddressesLists"
        />
      </p>
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
        <AccordionTab v-if="[
          ORDER_PATTERN_TYPES.ORDER,
          ORDER_PATTERN_TYPES.NOTIFICATION,
          ORDER_PATTERN_TYPES.ECD_ORDER,
          ORDER_PATTERN_TYPES.ECD_PROHIBITION,
          ORDER_PATTERN_TYPES.ECD_NOTIFICATION,
        ].includes(orderType)">
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
  import { reactive, ref, computed, onMounted } from 'vue';
  import { useStore } from 'vuex';
  import { useVuelidate } from '@vuelidate/core';
  import { useConfirm } from 'primevue/useconfirm';
  import DSPToSendOrderDataTable from '@/components/CreateOrders/DSPToSendOrderDataTable';
  import DNCToSendOrderDataTable from '@/components/CreateOrders/DNCToSendOrderDataTable';
  import ECDToSendOrderDataTable from '@/components/CreateOrders/ECDToSendOrderDataTable';
  import OtherToSendOrderDataTable from '@/components/CreateOrders/OtherToSendOrderDataTable';
  import OrderNumber from '@/components/CreateOrders/OrderNumber';
  import PreviewNewOrderDlg from '@/components/CreateOrders/PreviewNewOrderDlg';
  import OrderPlaceChooser from '@/components/CreateOrders/OrderPlaceChooser';
  import OrderTimeSpanChooser from '@/components/CreateOrders/OrderTimeSpanChooser';
  import OrderText from '@/components/CreateOrders/OrderText';
  import { OrderInputTypes } from '@/constants/orderInputTypes';
  import {
    ORDER_PATTERN_TYPES,
    SPECIAL_CIRCULAR_ORDER_SIGN,
    SPECIAL_CLOSE_BLOCK_ORDER_SIGN,
    SPECIAL_OPEN_BLOCK_ORDER_SIGN,
  } from '@/constants/orderPatterns';
  import {
    ORDER_TEXT_SOURCE,
    ORDER_PLACE_VALUES,
    FILLED_ORDER_DATETIME_ELEMENTS,
    FILLED_ORDER_DROPDOWN_ELEMENTS,
  } from '@/constants/orders';
  import showMessage from '@/hooks/showMessage.hook';
  import { useShowFormElements } from './showFormElements';
  import { useWatchCurrentDateTime } from './watchCurrentDateTime';
  import { useWatches } from './watches';
  import { useDispatchOrder } from './dispatchOrder';
  import { useSectorsToSendOrder } from './sectorsToSendOrder';
  import { useRelatedOrder } from './relatedOrder';
  import { useNewOrderValidationRules } from './validationRules';
  import { useOrderDraft } from './orderDraft';

  export default {
    name: 'dy58-new-order-block',

    props: {
      orderType: {
        type: String,
        required: true,
      },
      orderPatternId: {
        type: String,
        required: false,
      },
      prevOrderId: {
        type: String,
        required: false,
      },
      orderDraftId: {
        type: String,
        required: false,
      },
    },

    emits: ['changeProps'],

    components: {
      OrderPlaceChooser,
      OrderTimeSpanChooser,
      OrderText,
      DSPToSendOrderDataTable,
      DNCToSendOrderDataTable,
      ECDToSendOrderDataTable,
      OtherToSendOrderDataTable,
      PreviewNewOrderDlg,
      OrderNumber,
    },

    setup(props, { emit }) {
      const store = useStore();
      const confirm = useConfirm();
      const { showSuccessMessage, showErrMessage } = showMessage();

      const isECD = computed(() => store.getters.isECD);

      // Уточнять время действия издаваемого распоряжения либо не уточнять
      const defineOrderTimeSpanOptions = ([
        { name: 'Время действия по умолчанию', value: false },
        { name: 'Уточнить время действия', value: true },
      ]);
      // Отображать издаваемое распоряжение на ГИД, или не отображать
      const showOnGIDOptions = ([
        { name: !isECD.value ? 'Не отображать на ГИД' : 'Не указывать место действия', value: false },
        { name: !isECD.value ? 'Отобразить на ГИД': 'Определить место действия', value: true },
      ]);

      const getOrderDraftsOfGivenType = computed(() =>
        [{ _id: null, displayTitle: '-' }, ...store.getters.getOrderDraftsOfGivenType(props.orderType)]);

      const defaultOrderText = {
        orderTextSource: null,
        patternId: null,
        orderTitle: null,
        orderText: null,
      };

      const initialOrderText = () => {
        const orderPattern = store.getters.getOrderPatternById(props.orderPatternId);
        if (orderPattern) {
          return {
            orderTextSource: ORDER_TEXT_SOURCE.pattern,
            patternId: orderPattern._id,
            orderTitle: orderPattern.title,
            orderText: orderPattern.elements,
          };
        }
        return defaultOrderText;
      };

      const defaultOrderPlace = {
        place: null,
        value: null,
      };

      const defaultTimeSpan = {
        start: null,
        end: null,
        tillCancellation: null,
      };

      const state = reactive({
        selectedOrderInputType: OrderInputTypes[0],
        number: store.getters.getNextOrdersNumber(props.orderType),
        createDateTime: store.getters.getCurrDateTimeWithoutMilliseconds,
        createDateTimeString: store.getters.getCurrDateString,
        updateCreateDateTimeRegularly: true,
        prevRelatedOrder: null,
        cancelOrderDateTime: null,
        orderPlace: { ...defaultOrderPlace },
        timeSpan: { ...defaultTimeSpan },
        defineOrderTimeSpan: [
          ORDER_PATTERN_TYPES.ECD_ORDER,
          ORDER_PATTERN_TYPES.ECD_PROHIBITION
        ].includes(props.orderType) ? defineOrderTimeSpanOptions[1] : defineOrderTimeSpanOptions[0],
        showOnGID: showOnGIDOptions[0],
        specialTrainCategories: null,
        orderText: { ...defaultOrderText },
        dncSectorsToSendOrder: [],
        dspSectorsToSendOrder: [],
        ecdSectorsToSendOrder: [],
        otherSectorsToSendOrder: [],
        // от имени кого издается распоряжение
        createdOnBehalfOf: null,
        // Ошибки, выявленные серверной частью в информационных полях, в процессе обработки
        // запроса об издании распоряжения
        orderFieldsErrs: null,
        showPreviewNewOrderDlg: false,
        // Очень важная переменная! Если ее убрать, то в applySelectedOrderDraft не смогут быть установлены
        // поля времени и места действия распоряжения из черновика, т.к. происходит их автоматический
        // сброс при изменении showOnGID и defineOrderTimeSpan
        resetValueOnWatchChanges: true,
        // id текущего черновика распоряжения
        currentOrderDraftId: null,
      });

      onMounted(() => {
        state.currentOrderDraftId = props.orderDraftId;
        state.prevRelatedOrder = props.prevOrderId ? { [props.prevOrderId]: true } : null;
        state.orderText = { ...initialOrderText() };
      });

      const {
        showOrderDrafts,
        showConnectedOrderFields,
        showDisplayOnGIDFlag,
        showDisplayOnGIDFields,
        showDisplayOrderTimespanFlag,
        showDisplayOrderTimespan,
      } = useShowFormElements({ state, props, isECD, getOrderDraftsOfGivenType });

      useWatchCurrentDateTime(state, props, store);

      const {
        dspSectorsToSendOrderNoDupl,
        dncSectorsToSendOrderNoDupl,
        ecdSectorsToSendOrderNoDupl,
        selectedDSPString,
        selectedDNCString,
        selectedECDString,
        selectedOtherAddresseesString,
        handleClearOrderAddressesLists,
      } = useSectorsToSendOrder({ state, store });

      const {
        relatedOrderObject,
        relatedOrderObjectStartDateTimeString,
      } = useRelatedOrder({ state, store });

      const {
        handleSaveOrderDraft,
        currentOrderDraft,
        applySelectedOrderDraft,
        applySelectedOrderDraftPersonal,
      } = useOrderDraft({
        state,
        props,
        emit,
        store,
        confirm,
        showSuccessMessage,
        showErrMessage,
        defineOrderTimeSpanOptions,
        showOnGIDOptions,
        defaultOrderPlace,
        defaultOrderText,
        defaultTimeSpan,
      });

      const {
        getIssuedOrderPlaceObject,
        getPreviewOrderTimeSpanObject,
        dispatchOrder,
        getDispatchOrdersBeingProcessed,
      } = useDispatchOrder({
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

      // Здесь, в конце, когда выше уже все объявлено (иначе будут ошибки)
      useWatches({
        state, props, store, emit,
        showSuccessMessage, showErrMessage, initialOrderText,
        currentOrderDraft, applySelectedOrderDraft, applySelectedOrderDraftPersonal,
        relatedOrderObject, showOnGIDOptions, defineOrderTimeSpanOptions,
      });

      const { rules } = useNewOrderValidationRules(state, props, relatedOrderObject);

      const submitted = ref(false);
      // Код { $scope: false } нужен для того чтобы (цитата из справочника):
      // "collect no validation results and emit none", т.к. без этого куска кода было было поведение по
      // умолчанию: "...collect results from all and emits to all, this is the default setting.
      // This means that each component that uses useVuelidate, can collect results from validation children,
      // and emit to parent components."
      const v$ = useVuelidate(rules, state, { $scope: false });

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
       * Скрытие диалогового окна просмотра информации об издаваемом распоряжении.
       */
      const hidePreviewNewOrderDlg = () => {
        state.showPreviewNewOrderDlg = false;
      };

      const addStationToSendOrder = (stationId) => {
        if (!state.dspSectorsToSendOrder.find((el) => el.type === ORDER_PLACE_VALUES.station && el.id === stationId)) {
          const stationToSendOrder = store.getters.getDSPShiftForSendingData.find((el) => el.type === ORDER_PLACE_VALUES.station && el.id === stationId);
          if (stationToSendOrder) {
            state.dspSectorsToSendOrder.push(stationToSendOrder);
          }
        }
      };

      /**
       * Позволяет зафиксировать изменения, производимые пользователм в тексте распоряжения.
       * Кроме того, для шаблонного распоряжения анализирует устанавливаемые в поля распоряжения значения.
       */
      const setOrderText = (event) => {
        state.orderText = event;

        if (!event || event.orderTextSource !== ORDER_TEXT_SOURCE.pattern || !event.orderText) {
          return;
        }
        // Если установлен флаг определения места действия распоряжения (отображения на ГИД),
        // то при изменении ряда полей в тексте шаблонного распоряжения их значения устанавливаются
        // в качестве места действия распоряжения
        if (state.showOnGID.value === true) {
          // Если в тексте распоряжения встречается поле 'Станция', 'Станция отправления' либо 'Станция прибытия',
          // то значение этого поля (первого встречающегося) устанавливается в качестве места действия
          // распоряжения
          let placeSet = false;
          const stationElement = event.orderText.find((el) =>
            [FILLED_ORDER_DROPDOWN_ELEMENTS.STATION,
             FILLED_ORDER_DROPDOWN_ELEMENTS.DPT_STATION,
             FILLED_ORDER_DROPDOWN_ELEMENTS.ARR_STATION].includes(el.ref));
          if (stationElement) {
            if (stationElement.value) {
              const stationId = store.getters.getSectorStationIdByTitle(stationElement.value);
              if (stationId) {
                state.orderPlace = { place: ORDER_PLACE_VALUES.station, value: stationId };
                placeSet = true;
                // Для отображения станции в списке "Кому" необходимо ее туда добавить, если ее там еще нет
                addStationToSendOrder(stationId);
              }
            } else {
              state.orderPlace = { place: ORDER_PLACE_VALUES.station, value: null };
            }
          }
          // Если в тексте распоряжения встречается поле 'Перегон' либо 'Перегон станции отправления',
          // то значение этого поля (первого встречающегося) устанавливается в качестве места действия
          // распоряжения. Но только при условии что ранее не было установлено место действия при анализе
          // поля станции!
          if (!placeSet) {
            const blockElement = event.orderText.find((el) =>
              [FILLED_ORDER_DROPDOWN_ELEMENTS.BLOCK,
               FILLED_ORDER_DROPDOWN_ELEMENTS.DPT_STATION_BLOCK].includes(el.ref));
            if (blockElement) {
              if (blockElement.value) {
                const blockId = store.getters.getSectorBlockIdByTitle(blockElement.value);
                if (blockId) {
                  state.orderPlace = { place: ORDER_PLACE_VALUES.span, value: blockId };
                  placeSet = true;
                  // Для отображения перегона в списке "Кому" необходимо туда добавить обе его станции,
                  // если их там еще нет
                  const stationsIds = store.getters.getSectorBlockStationsIds(blockId);
                  if (stationsIds) {
                    addStationToSendOrder(stationsIds[0]);
                    addStationToSendOrder(stationsIds[1]);
                  }
                }
              } else {
                state.orderPlace = { place: ORDER_PLACE_VALUES.span, value: null };
              }
            }
          }
        }
        // Если установлен флаг определения времени действия распоряжения, то при изменении ряда полей
        // в тексте шаблонного распоряжения их значения устанавливаются в качестве времени действия распоряжения
        if (state.defineOrderTimeSpan.value === true) {
          // Если в тексте распоряжения встречается поле даты-времени 'Дата-время закрытия перегона',
          // то значение этого поля (первого встречающегося) устанавливается в качестве даты-времени
          // начала действия распоряжения
          let timeSet = false;
          const closeBlockDateTimeElement = event.orderText.find((el) =>
            el.ref === FILLED_ORDER_DATETIME_ELEMENTS.CLOSE_BLOCK_DATETIME);
          if (closeBlockDateTimeElement) {
            if (closeBlockDateTimeElement.value) {
              state.timeSpan = { start: closeBlockDateTimeElement.value, end: null, tillCancellation: true };
              timeSet = true;
            } else {
              state.timeSpan = { start: null, end: null, tillCancellation: false };
            }
          }
          // Если в тексте распоряжения встречается поле даты-времени 'Дата-время открытия перегона',
          // то значение этого поля (первого встречающегося) устанавливается в качестве даты-времени
          // начала и окончания действия распоряжения. Но только при условии что ранее не было установлено
          // время действия!
          if (!timeSet) {
            const openBlockDateTimeElement = event.orderText.find((el) =>
              el.ref === FILLED_ORDER_DATETIME_ELEMENTS.OPEN_BLOCK_DATETIME);
            if (openBlockDateTimeElement) {
              if (openBlockDateTimeElement.value) {
                state.timeSpan = {
                  start: openBlockDateTimeElement.value,
                  end: openBlockDateTimeElement.value,
                  tillCancellation: false,
                };
              } else {
                state.timeSpan = { start: null, end: null, tillCancellation: false };
              }
            }
          }
        }
        // Если в тексте распоряжения встречается поле 'Номер действующего распоряжения на закрытие перегона',
        // то значение этого поля (первого встречающегося) используется для определения связанного распоряжения
        const closeSpanActiveOrderNumberElement = event.orderText.find((el) =>
          el.ref === FILLED_ORDER_DROPDOWN_ELEMENTS.CLOSE_BLOCK_ORDER_NUMBER);
        if (closeSpanActiveOrderNumberElement) {
          if (closeSpanActiveOrderNumberElement.value) {
            const orderObject = store.getters.getActiveOrderByNumber(
              ORDER_PATTERN_TYPES.ORDER,
              closeSpanActiveOrderNumberElement.value,
              SPECIAL_CLOSE_BLOCK_ORDER_SIGN
            );
            state.prevRelatedOrder = orderObject ? { [orderObject._id]: true } : null;
          }
          // else нет, т.к. поле со связанным распоряжением видимо пользователю, он может вручную там
          // все поправить
        }
      };

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
      const handleSubmit = (isFormValid) => {
        submitted.value = true;
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
        SPECIAL_CIRCULAR_ORDER_SIGN,
        SPECIAL_CLOSE_BLOCK_ORDER_SIGN,
        SPECIAL_OPEN_BLOCK_ORDER_SIGN,
        isDNC: computed(() => store.getters.isDNC),
        isECD,
        v$,
        submitted,
        getUserPostFIO: computed(() => store.getters.getUserPostFIO),
        OrderInputTypes,
        showOrderDrafts,
        showConnectedOrderFields,
        showDisplayOnGIDFlag,
        showDisplayOnGIDFields,
        showDisplayOrderTimespanFlag,
        showDisplayOrderTimespan,
        handleSubmit,
        dispatchOrder,
        getActiveOrdersToDisplayInTreeSelect: computed(() => store.getters.getActiveOrdersToDisplayInTreeSelect(props.orderType)),
        getOrderDraftsOfGivenType,
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
        hidePreviewNewOrderDlg,
        getIssuedOrderPlaceObject,
        getPreviewOrderTimeSpanObject,
        dspSectorsToSendOrderNoDupl,
        dncSectorsToSendOrderNoDupl,
        ecdSectorsToSendOrderNoDupl,
        getOrderPatternSpecialTrainCategoriesString,
        newNumberOverlayPanel,
        changeOrderNumber,
        handleSaveOrderDraft,
        handleClearOrderAddressesLists,
        currentOrderDraft,
        setOrderText,
      };
    },
  };
</script>
