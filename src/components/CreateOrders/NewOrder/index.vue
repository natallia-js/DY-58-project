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
    :previewNewOrder="state.createOrder"
    @dispatch="dispatchOrder"
    @close="hidePreviewNewOrderDlg"
  />

  <ConfirmPopup group="confirmSaveOrderDraft"></ConfirmPopup>

  <div class="dy58-create-order-block">
    <div class="dy58-create-order-subblock">
      <!-- Данная кнопка-переключатель пока не используется -->
      <SelectButton
        v-if="false"
        v-model="state.selectedOrderInputType"
        :options="OrderInputTypes"
        optionLabel="label"
        disabled
      />
      <div v-if="getDispatchOrdersBeingProcessed > 0" class="dy58-warning p-mb-2">
        На сервер отправлено {{ getDispatchOrdersBeingProcessed }} запросов на издание документа текущего типа. Ожидаю ответ...
      </div>
      <div v-if="(isDSP_or_DSPoperator || isDNC || isStationWorksManager) && orderType === ORDER_PATTERN_TYPES.REQUEST" class="p-mb-2">
        <Accordion class="dy58-oknas-accordion">
          <AccordionTab>
            <template #header>
              <div class="p-grid p-ml-1" style="margin:0;overflow-x:auto">
                <div class="p-col-fixed dy58-okna-accord-title-block" style="width:45px">
                  <Button
                    v-if="!state.gettingOknasData"
                    icon="pi pi-refresh"
                    class="p-button-rounded p-button-success"
                    v-tooltip.right="'Обновить список окон'"
                    @click="refreshOknas"
                  />
                </div>
                <div class="p-col p-d-flex p-ai-center dy58-okna-accord-title-block">
                  <span>Текущие "окна" ({{ state.oknaData.length }})</span>
                </div>
                <div v-if="selectedOkno" class="p-col-12 dy58-okna-accord-title-block">
                  Выбрано окно: <br />
                  <span v-for="col in getOknaTblColumns" :key="col.field">
                    {{ col.title }}: {{ selectedOkno[col.field] }} <br />
                  </span>
                </div>
              </div>
            </template>
            <div>
              <DataTable
                :value="state.oknaData"
                class="p-datatable-responsive p-datatable-gridlines p-datatable-sm"
                :rowHover="true"
                :loading="state.gettingOknasData"
                breakpoint="200px"
                dataKey="id"
                v-model:selection="state.selectedOknoInDataTable"
                selectionMode="single"
              >
                <Column v-for="col of getOknaTblColumns"
                  :field="col.field"
                  :key="col.field"
                  :header="col.title"
                  :style="{ width: col.width, textAlign: col.align }"
                  headerClass="dy58-table-header-cell-class"
                  bodyClass="dy58-table-top-content-cell-class"
                >
                </Column>
                <template #empty>
                  <div class="p-d-flex p-jc-center">{{ state.getOknaDataError || 'Данных нет' }}</div>
                </template>
                <template #footer>
                  <small>
                    Для снятия выделения со строки таблицы необходимо удерживать клавишу Ctrl
                  </small>
                </template>
              </DataTable>
            </div>
          </AccordionTab>
        </Accordion>
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
            <span v-else class="p-text-bold">На документ</span>
          </label>
          <TreeSelect
            placeholder="Выбранный действующий документ"
            v-model="v$.prevRelatedOrder.$model"
            :options="getActiveOrdersToDisplayInTreeSelect"
            style="width:100%"
            disabled="true"
          />
          <div v-if="relatedOrderObject" class="p-mt-2">
            <p v-if="getSectorStationOrBlockTitleById">
              Станция/Перегон действия: {{ getSectorStationOrBlockTitleById }}
            </p>
            <p v-if="relatedOrderObjectStartDateTimeString">
              Время начала действия: {{ relatedOrderObjectStartDateTimeString }}
            </p>
            <!-- Этот кусок кода использовался поначалу для указания даты и времени отмены действия
            предыдущего распоряжения текущим распоряжением. В дальнейшем временем отмены действия
            предыдущего распоряжения стала дата-время утверждения издаваемого распоряжения
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
            </div>-->
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
          v-if="state.specialTrainCategories?.length"
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
            :applyDefaultOrderPatternElementValues="state.createOrder"
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
              {{ getUserPostFIO({ additionalInfo: getLastDNC_ECDTakeDutyOrderAdditionalWorkers }) }}
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
          <div class="p-grid" style="width:30%">
            <div class="p-col-12">
              <Button
                type="submit"
                :label="state.createOrder ? 'Просмотреть и издать' : 'Просмотреть и сохранить изменения'"
                class="p-mb-2"
                :disabled="getDispatchOrdersBeingProcessed >= 1"
              />
            </div>
            <div class="p-col-12">
              <Button v-if="isECD || isDNC"
                label="Сохранить черновик"
                class="p-button-secondary"
                @click="handleSaveOrderDraft($event)"
                :disabled="getDispatchOrdersBeingProcessed >= 1"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
<!--class="p-as-stretch p-d-flex p-ai-center p-flex-row p-flex-wrap"-->
    <!-- АДРЕСАТЫ -->

    <div class="dy58-create-order-subblock">
      <p class="p-mb-2">
        <label for="addressees" :class="{'p-error': submitted && v$.allAddressees.$invalid}">
          <span class="p-text-bold">
            <span v-if="!isECD && !(isDNC && orderType === ORDER_PATTERN_TYPES.NOTIFICATION)" class="dy58-required-field">*</span>
            Кому адресовать
          </span>
          <Button
            icon="pi pi-times"
            class="p-button-secondary p-button-sm dy58-order-action-button p-ml-1"
            v-tooltip="'Очистить список'"
            @click="handleClearOrderAddressesLists"
          />
        </label>
      </p>
      <p class="p-mb-2">! адресаты, указанные в таблице "Иные адресаты", не получат создаваемый документ</p>
      <Accordion id="addressees" :multiple="true">
        <AccordionTab>
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
  import { computed, onMounted, reactive, ref } from 'vue';
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
    ALL_ORDERS_TYPE_ECD,
  } from '@/constants/orderPatterns';
  import showMessage from '@/hooks/showMessage.hook';
  import { useDefaultAndInitialValues } from './defaultAndInitialValues';
  import { usePossibleOptions } from './possibleOptions';
  import { useWatchOrderDataChanges } from './watchOrderDataChanges';
  import { useStoreData } from './storeData';
  import { useShowFormElements } from './showFormElements';
  import { useWatchCurrentDateTime } from './watchCurrentDateTime';
  import { useWatchOrderNumber } from './watchOrderNumber';
  import { useWatchOrderPatterns } from './watchOrderPatterns';
  import { useWatchAllAppDataLoad } from './watchAllAppDataLoad';
  import { useWatchOrderDrafts } from './watchOrderDrafts';
  import { useWatchOperationsResults } from './watchOperationsResults';
  import { useDispatchOrder } from './dispatchOrder';
  import { useSectorsToSendOrder } from './sectorsToSendOrder';
  import { useRelatedOrder } from './relatedOrder';
  import { useNewOrderValidationRules } from './validationRules';
  import { useOrderDraft } from './orderDraft';
  import { useSetAndAnalyzeOrderText } from './setAndAnalyzeOrderText';
  import { useWatchRelatedOrder } from './watchRelatedOrder';
  import { useOkna } from './okna';
  import { useWatchExistingDNC_ECDTakeDutyOrder } from './watchExistingDNC_ECDTakeDutyOrder';
  import { useBeforeWindowUnload } from './beforeWindowUnload';
  import { SET_ALLOW_APPLICATION_NAVIGATION, SET_SELECTED_OKNO } from '@/store/mutation-types';

  export default {
    name: 'dy58-new-order-block',

    props: {
      orderType: {
        type: String,
        required: true,
      },
      orderId: {
        type: String,
        required: false,
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
      useBeforeWindowUnload({ store });
      const {
        defaultOrderText,
        defaultOrderPlace,
        defaultTimeSpan,
        initialOrderData,
        initialOrderText,
      } = useDefaultAndInitialValues({ store, props });

      // При загрузке компонента полагаем, что пока изменений в данных не было
      store.commit(SET_ALLOW_APPLICATION_NAVIGATION);

      const isECD = computed(() => store.getters.isECD);
      const isDNC = computed(() => store.getters.isDNC);
      const isDSP_or_DSPoperator = computed(() => store.getters.isDSP_or_DSPoperator);

      const { defineOrderTimeSpanOptions, showOnGIDOptions } = usePossibleOptions({ isECD });

      // Получение черновиков распоряжений заданного типа
      const getOrderDraftsOfGivenType = computed(() =>
        [{ _id: null, displayTitle: '-' }, ...store.getters.getOrderDraftsOfGivenType(props.orderType)]);

      const state = reactive({
        // true - создается новый документ, false - редактируется существующий документ
        createOrder: true,
        selectedOrderInputType: OrderInputTypes[0],
        number: store.getters.getNextOrdersNumber(!isECD.value ? props.orderType : ALL_ORDERS_TYPE_ECD),
        createDateTime: store.getters.getCurrDateTimeWithoutMilliseconds,
        createDateTimeString: store.getters.getCurrDateTimeString,
        updateCreateDateTimeRegularly: (isDNC.value || isDSP_or_DSPoperator.value) ? false : true,
        prevRelatedOrder: null,
        //cancelOrderDateTime: null,
        defineOrderTimeSpan: defineOrderTimeSpanOptions[0],
        showOnGID: showOnGIDOptions[0],
        specialTrainCategories: null,

        // На эти параметры идет реакция в плане отслеживания изменений по отношению к исходным данным
        orderPlace: initialOrderData.orderPlace,
        timeSpan: initialOrderData.timeSpan,
        orderText: initialOrderData.orderText,
        dncSectorsToSendOrder: initialOrderData.dncSectorsToSendOrder,
        dspSectorsToSendOrder: initialOrderData.dspSectorsToSendOrder,
        ecdSectorsToSendOrder: initialOrderData.ecdSectorsToSendOrder,
        otherSectorsToSendOrder: initialOrderData.otherSectorsToSendOrder,

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
        gettingOknasData: false,
        oknaData: [],
        getOknaDataError: null,
        selectedOknoInDataTable: null,
        // true - обновить данные в окне создания нового распоряжения из разных источников (выбранный черновик
        // документа, выбранный связанный документ, текущее циркулярное распоряжение) при монтировании компонента
        // (хук mounted), false - не обновлять
        updateFormDataOnMounted: true,
        // true - документ успешно издан, false - в противном случае;
        // данный флаг необходим для того, чтобы не спрашивать пользователя, хочет ли он покинуть страницу при наличии
        // изменений на ней, после успешного издания документа; если данный флаг не выставить после успешного издания
        // документа, то может возникнуть следующая ситуация: 1) пользователь успешно издал документ; 2) система автоматически
        // перенастроила состояние компонента, подготовив его для издания нового документа; 3) система посчитала, что были
        // произведены изменения; 4) пользователь, не дожидаясь автоматического перехода на главную страницу, инициирует этот
        // переход сам; 5) система спрашивает его, хочет ли он продолжить и потерят данные; 6) он, конечно, не хочет, думая, что
        // документ не издан (не заметил всплывающее онко об успешном издании документа) и остается на текущей странице, снова
        // издает тот же самый документ, но уже с другим номером; 7) в журнале оказывается 2 одинаковых документа
        orderDispatchedSuccessfully: false,
      });

      // Отслеживание изменений в данных распоряжения
      useWatchOrderDataChanges({ state, store, initialOrderData });

      const selectedOkno = computed(() => store.getters.getSelectedOkno);

      const {
        showOrderDrafts,
        showConnectedOrderFields,
        showDisplayOnGIDFlag,
        showDisplayOnGIDFields,
        getShowOnGidFlag,
        showDisplayOrderTimespanFlag,
        showDisplayOrderTimespan,
        getUserDutyToDefineOrderTimeSpan,
      } = useShowFormElements({
        state,
        props,
        isECD,
        isDNC,
        getOrderDraftsOfGivenType,
        showOnGIDOptions,
        defineOrderTimeSpanOptions,
      });

      const { existingDNC_ECDTakeDutyOrder } = useWatchExistingDNC_ECDTakeDutyOrder({ state, store, isDNC, isECD });

      useWatchCurrentDateTime({ state, props, store });

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
        relatedOrderId,
        relatedOrderObject,
        relatedOrderObjectStartDateTimeString,
      } = useRelatedOrder({ state, store });

      const {
        getSectorStationOrBlockTitleById,
        getSectorStations,
        getSectorBlocks,
      } = useStoreData({ store, relatedOrderObject });

      const { rules } = useNewOrderValidationRules({ state, props /*, relatedOrderObject */, isECD, isDNC });

      const submitted = ref(false);
      // Код { $scope: false } нужен для того чтобы (цитата из справочника):
      // "collect no validation results and emit none", т.к. без этого куска кода было было поведение по
      // умолчанию: "...collect results from all and emits to all, this is the default setting.
      // This means that each component that uses useVuelidate, can collect results from validation children,
      // and emit to parent components."
      const v$ = useVuelidate(rules, state, { $scope: false });

      // Этот хук после всех необходимых объявлений
      const {
        getIssuedOrderPlaceObject,
        getPreviewOrderTimeSpanObject,
        dispatchOrder,
        getDispatchOrdersBeingProcessed,
      } = useDispatchOrder({
        state,
        props,
        store,
        submitted,
        dspSectorsToSendOrderNoDupl,
        dncSectorsToSendOrderNoDupl,
        ecdSectorsToSendOrderNoDupl,
        relatedOrderObject,
      });

      // Здесь все watch, в конце, когда выше уже все объявлено (иначе будут ошибки)
      useWatchOrderNumber({ state, props, store, isECD });

/*
      //
      // Обнуляем значения секунд и миллисекунд у выбранного значения времени отмены действия распоряжения
      // (чтобы не было проблем при сравнении с датой начала действия соответствующего распоряжения,
      // например, когда необходимо отменить в то же время, когда оно начало действовать, если издано
      // было случайно).
      //
      watch(() => state.cancelOrderDateTime, (value) => {
        if (value && isValidDateTime(value)) {
          state.cancelOrderDateTime.setSeconds(0, 0);
        }
      });
*/

      const {
        setRelatedOrderNumberInOrderText,
        getOrderPatternElementValue,
        setRequestOrderTextFields,
        setOrderText,
      } = useSetAndAnalyzeOrderText({ state, props, store, relatedOrderObject /*, showConnectedOrderFields */, selectedOkno });

      const {
        currentOrderDraft,
        handleSaveOrderDraft,
      } = useOrderDraft({ state, props, store, confirm, getOrderPatternElementValue, isECD });

      const { applySelectedOrderDraft } =
        useWatchOrderDrafts({ state, store, props, emit, currentOrderDraft, defineOrderTimeSpanOptions,
        showOnGIDOptions, defaultOrderPlace, defaultOrderText, defaultTimeSpan,
      });
      const { updateFormData } =
        useWatchAllAppDataLoad({ props, state, store, relatedOrderObject, currentOrderDraft, existingDNC_ECDTakeDutyOrder,
        handleClearOrderAddressesLists, applySelectedOrderDraft });
      useWatchOperationsResults({ state, store, props, emit, isECD, showSuccessMessage, showErrMessage });

      useWatchOrderPatterns({
        state, store, props, initialOrderText, setRelatedOrderNumberInOrderText,
        getShowOnGidFlag, getUserDutyToDefineOrderTimeSpan, setRequestOrderTextFields,
      });

      useWatchRelatedOrder({
        props, emit, store, relatedOrderId, relatedOrderObject, setRelatedOrderNumberInOrderText,
      });

      const { refreshOknas } = useOkna({ store, state, setRequestOrderTextFields, selectedOkno });


      /**
       * Монтирование компонента.
       */
      onMounted(() => {
        state.currentOrderDraftId = props.orderDraftId;
        state.prevRelatedOrder = props.prevOrderId ? { [props.prevOrderId]: true } : null;
        state.orderText = initialOrderText();
        // флаг необходимости указывать место действия документа
        state.showOnGID = getShowOnGidFlag.value;
        // флаг необходимости явно определить время действия документа
        state.defineOrderTimeSpan = getUserDutyToDefineOrderTimeSpan.value;
        // Удаляем (если есть) выбранное "окно"
        store.commit(SET_SELECTED_OKNO, { okno: null });

        // данный код выполняем только в том случае, если он не был выполнен, когда поступила информация
        // об окончании загрузки всех данных приложения (соответствующий watch); т.е. данный код выполняется
        // при нормальной работе приложения, когда пользователь осуществляет переход от страницы к странице,
        // а не в случае перезагрузки приложения
        if (store.getters.ifAllDataLoadedOnApplicationReload && state.updateFormDataOnMounted) {
          updateFormData();
        }
      });

      /**
       * Скрытие диалогового окна просмотра информации об издаваемом распоряжении.
       */
      const hidePreviewNewOrderDlg = () => {
        state.showPreviewNewOrderDlg = false;
      };

      /**
       * Данный метод осуществляет проверку корректности указания значений полей создаваемого
       * распоряжения перед его изданием.
       */
      const handleSubmit = (isFormValid) => {
        submitted.value = true;
        if (!isFormValid) {
          let errMessage = 'Не могу отправить созданный документ на сервер: не заполнены / неверно заполнены его поля';
          for (let err of v$.value.$silentErrors || [])
            if (err.$message)
              errMessage = err.$message;
          showErrMessage(errMessage);
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
        isDSP_or_DSPoperator,
        isDNC,
        isECD,
        getLastDNC_ECDTakeDutyOrderAdditionalWorkers: computed(() => {
          // Для распоряжений, которые не являются циркулярами, из последнего циркуляра "подтягивается"
          // информация о дополнительных работниках, которые приняли дежурство вместе основным работником
          if (!state.specialTrainCategories?.includes(SPECIAL_CIRCULAR_ORDER_SIGN))
            return store.getters.getLastDNC_ECDTakeDutyOrderAdditionalWorkers;
          // Для циркуляров информация о дополнительных работниках не нужна, т.к. именно в них эта информация
          // зарождается
          return null;
        }),
        isStationWorksManager: computed(() => store.getters.isStationWorksManager),
        getOknaTblColumns: computed(() => store.getters.getOknaTblColumns),
        v$,
        submitted,
        getUserPostFIO: computed(() => store.getters.getUserPostFIO),
        selectedOkno,
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
        newNumberOverlayPanel,
        changeOrderNumber,
        handleSaveOrderDraft,
        handleClearOrderAddressesLists,
        currentOrderDraft,
        setOrderText,
        refreshOknas,
      };
    },
  };
</script>


<style lang="scss" scoped>
  .dy58-create-order-block {
    display: flex;
    flex-direction: row;
    gap: 20px;
  }

  .dy58-create-order-subblock {
    width: 50%;
  }

  @media screen and (max-width: 70rem) {
    .dy58-create-order-block {
      flex-direction: column;
    }

    .dy58-create-order-subblock {
      width: 100%;
    }
  }

  .p-accordion :deep(.p-accordion-content), .dy58-okna-accord-title-block {
    padding: 0;
  }

  .p-accordion.dy58-oknas-accordion :deep(.p-accordion-header-link) {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    display: flex;
    align-items: center;
  }

  .p-accordion.dy58-oknas-accordion :deep(.p-accordion-toggle-icon) {
    display: block;
  }

  .p-datatable :deep(table) {
    width: 100%;
  }
</style>
