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
        :options="getOrderInputTypes"
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

        <div
          v-if="isECD && getOrderDraftsOfGivenType.length"
          class="p-field p-col-12 p-d-flex p-flex-column p-m-0"
        >
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

        <div
          v-if="orderType !== ORDER_PATTERN_TYPES.ECD_ORDER"
          class="p-field p-col-12 p-d-flex p-flex-column p-m-0"
        >
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
          v-if="[ORDER_PATTERN_TYPES.ORDER, ORDER_PATTERN_TYPES.ECD_ORDER, ORDER_PATTERN_TYPES.ECD_PROHIBITION].includes(orderType)"
          class="p-field p-col-12 p-m-0"
        >
          <SelectButton v-model="state.showOnGID" :options="showOnGIDOptions" optionLabel="name" />
        </div>

        <!-- МЕСТО ДЕЙСТВИЯ РАСПОРЯЖЕНИЯ -->

        <div
          v-if="[ORDER_PATTERN_TYPES.ORDER, ORDER_PATTERN_TYPES.ECD_ORDER, ORDER_PATTERN_TYPES.ECD_PROHIBITION].includes(orderType)
            && state.showOnGID.value"
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
          class="p-field p-col-12 p-d-flex p-flex-column p-m-0"
        >
          <label>
            <span class="p-text-bold">Особые отметки документа</span>
          </label>
          {{ state.specialTrainCategories.join(', ') }}
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
  import { reactive, ref, computed, watch, onMounted } from 'vue';
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
  import { ORDER_PATTERN_TYPES } from '@/constants/orderPatterns';
  import showMessage from '@/hooks/showMessage.hook';
  import isValidDateTime from '@/additional/isValidDateTime';
  import { useWatchCurrentDateTime } from './watchCurrentDateTime';
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

      const defaultOrderText = {
        orderTextSource: null,
        patternId: null,
        orderTitle: null,
        orderText: null,
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
        handleClearOrderAddressesLists,
      } = useSectorsToSendOrder(state, store);

      const {
        relatedOrderObject,
        relatedOrderObjectStartDateTimeString,
      } = useRelatedOrder(state, { props, store, emit });

      const orderDraftObject = useOrderDraft({
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

      const { rules } = useNewOrderValidationRules(state, props, relatedOrderObject);

      const submitted = ref(false);
      // Код { $scope: false } нужен для того чтобы (цитата из справочника):
      // "collect no validation results and emit none", т.к. без этого куска кода было было поведение по
      // умолчанию: "...collect results from all and emits to all, this is the default setting.
      // This means that each component that uses useVuelidate, can collect results from validation children,
      // and emit to parent components."
      const v$ = useVuelidate(rules, state, { $scope: false });

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
       * Позволяет зафиксировать изменения, производимые пользователм в тексте распоряжения.
       */
      const setOrderText = (event) => {
        state.orderText = event ?
          { ...event, orderText: event.orderText ? event.orderText.map((el) => ({ ... el})) : null } :
          { ...defaultOrderText };
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
        isDNC: computed(() => store.getters.isDNC),
        isECD,
        v$,
        submitted,
        getUserPostFIO: computed(() => store.getters.getUserPostFIO),
        getOrderInputTypes: OrderInputTypes,
        handleSubmit,
        dispatchOrder: dispatchOrderObject.dispatchOrder,
        getActiveOrdersToDisplayInTreeSelect: computed(() => store.getters.getActiveOrdersToDisplayInTreeSelect(props.orderType)),
        getOrderDraftsOfGivenType: computed(() => [{ _id: null, displayTitle: '-' }, ...store.getters.getOrderDraftsOfGivenType(props.orderType)]),
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
        handleSaveOrderDraft: orderDraftObject.handleSaveOrderDraft,
        handleClearOrderAddressesLists,
        currentOrderDraft: orderDraftObject.currentOrderDraft,
        setOrderText,
      };
    },
  };
</script>
