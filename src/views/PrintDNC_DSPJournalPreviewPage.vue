<template>
  <div class="p-m-2">
    <h2 class="p-text-center p-m-2">
      Журнал диспетчерских распоряжений
    </h2>
    <h3 class="p-text-center p-m-2">
      по {{ getUserWorkPoligonTypeName }} Белорусской железной дороги
    </h3>
    <h3 v-if="startDisplayDate" class="p-text-center p-m-2">
      период c {{ startDisplayDate }} по {{ endDisplayDate || 'настоящее время'}}
    </h3>
    <Button
      label="Печать"
      class="print-btn"
      @click="sendToPrinter"
    />
    <DataTable
      :value="data"
      dataKey="id"
      class="p-datatable-gridlines p-datatable-sm"
      :rowHover="false"
      :scrollable="false"
      :loading="searchInProgress"
    >
      <template #empty>
        <div class="p-d-flex p-jc-center">Документы не найдены.</div>
      </template>

      <template #loading>
        <div class="p-d-flex p-jc-center">Идет загрузка данных. Подождите...</div>
      </template>

      <Column v-for="col of getDNC_DSPJournalTblColumns"
        :field="col.field"
        :key="col.field"
        :header="col.title"
        :style="{ width: col.width, textAlign: col.align }"
        headerClass="dy58-table-header-cell-class"
        bodyClass="dy58-table-top-content-cell-class"
      >
        <template #body="slotProps">
          <div
            v-if="[
              getDNC_DSPJournalTblColumnsTitles.assertDateTime,
              getDNC_DSPJournalTblColumnsTitles.orderContent,
              getDNC_DSPJournalTblColumnsTitles.orderAcceptor].includes(col.field)"
            v-html="slotProps.data[col.field]"
          ></div>
          <div v-else-if="col.field === getDNC_DSPJournalTblColumnsTitles.number && !slotProps.data.sendOriginal">
            {{ slotProps.data[col.field] }}<br/>(копия)
          </div>
          <div v-else>
            {{ slotProps.data[col.field] }}
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>


<script>
  import { computed, onMounted, ref } from 'vue';
  import { useStore } from 'vuex';
  import { getJournalOrdersFromServer } from '@/serverRequests/orders.requests';
  import prepareDataForDisplayInDNC_DSPJournal from '@/additional/prepareDataForDisplayInDNC_DSPJournal';
  import { SET_PRINT_PREVIEW } from '@/store/mutation-types';
  import { GET_ALL_LOCALLY_SAVED_ORDERS } from '@/store/action-types';
  import { getLocaleDateTimeString } from '@/additional/dateTimeConvertions';
  import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';
  import isElectron from '@/additional/isElectron';

  export default {
    name: 'dy58-print-dnc-dsp-journal-preview-page',

    setup() {
      const store = useStore();

      const data = ref([]);
      const errMessage = ref(null);
      const searchInProgress = ref(false);
      const startDisplayDate = ref(null);
      const endDisplayDate = ref(null);

      const getOrderSeqNumber = (index) => index + 1;

      // Позволяет сформировать массив данных для отображения в таблице.
      const prepareDataForDisplay = (responseData) => {
        if (data.value.length) {
          data.value = [];
        }
        data.value = prepareDataForDisplayInDNC_DSPJournal(responseData, getOrderSeqNumber);
      };

      const loadData = (params) => {
        const { datetimeStart, datetimeEnd, includeDocsCriteria, filterFields, sortFields } = params;
        searchInProgress.value = true;
        getJournalOrdersFromServer({ datetimeStart, datetimeEnd, includeDocsCriteria, filterFields, sortFields })
          .then((responseData) => {
            errMessage.value = null;
            prepareDataForDisplay(responseData.data);
          })
          .catch((error) => {
            errMessage.value = error;
          })
          .finally(() => {
            searchInProgress.value = false;
          });
      };

      const loadCachedOrders = async () => {
        searchInProgress.value = true;
        try {
          const cachedOrders = await store.dispatch(GET_ALL_LOCALLY_SAVED_ORDERS);
          if (!cachedOrders) {
            data.value = [];
          } else {
            data.value = prepareDataForDisplayInDNC_DSPJournal(
              cachedOrders.map((order) => JSON.parse(order.serializedData)), getOrderSeqNumber);
          }
        } catch (error) {
          errMessage.value = error;
        } finally {
          searchInProgress.value = false;
        }
      };

      const viewJournal = (params) => {
        startDisplayDate.value = params.datetimeStart && params.datetimeStart !== 'null' ? getLocaleDateTimeString(new Date(params.datetimeStart), false) : null;
        endDisplayDate.value = params.datetimeEnd && params.datetimeEnd !== 'null' ? getLocaleDateTimeString(new Date(params.datetimeEnd), false) : null;

        if (params.selectedRecords && params.selectedRecords.length) {
          // будем отображать выбранные пользователем записи, предварительно их отсортировав по
          // номеру, под которым они отображались в исходной таблице и присвоив им новую нумерацию
          data.value = params.selectedRecords
            .sort((a, b) => a.seqNum - b.seqNum)
            .map((el, index) => ({ ...el, seqNum: index + 1 }));
        } else if (params.offline) {
          loadCachedOrders();
        } else {
          // будем отображать данные, которые подгрузим с сервера
          loadData({
            datetimeStart: params.datetimeStart,
            datetimeEnd: params.datetimeEnd,
            includeDocsCriteria: params.includeDocsCriteria,
            filterFields: params.filterFields,
            sortFields: params.sortFields,
          });
        }
      };

      onMounted(() => {
        // Не хотим отображения главного меню и футера
        store.commit(SET_PRINT_PREVIEW, true);

        if (!isElectron()) {
          window.addEventListener('data', (event) => {
            if (event.detail) {
              const params = JSON.parse(event.detail);
              viewJournal(params);
            }
          });
          // Сообщаем о готовности к отображению данных
          const event = new CustomEvent('ready');
          window.dispatchEvent(event);
        } else {
          window.printJournal = (params) => viewJournal(params);
          window.opener.eval('printJournalWindowReady()');
        }
      });

      const sendToPrinter = () => {
        window.print();
      };

      const getUserWorkPoligonName = computed(() => {
        if (store.getters.ifAllDataLoadedOnApplicationReload)
          return store.getters.getUserWorkPoligonName();
        return null;
      });

      return {
        data,
        errMessage,
        searchInProgress,
        getDNC_DSPJournalTblColumnsTitles: computed(() => store.getters.getDNC_DSPJournalTblColumnsTitles),
        getDNC_DSPJournalTblColumns: computed(() => store.getters.getDNC_DSPJournalTblColumns),
        startDisplayDate,
        endDisplayDate,

        getUserWorkPoligonTypeName: computed(() => {
          switch (store.getters.getUserWorkPoligon.type) {
            case WORK_POLIGON_TYPES.STATION:
              return `станции ${getUserWorkPoligonName.value}`;
            case WORK_POLIGON_TYPES.DNC_SECTOR:
            case WORK_POLIGON_TYPES.ECD_SECTOR:
              return `участку ${getUserWorkPoligonName.value}`;
            default:
              return '?';
          }
        }),
        sendToPrinter,
      };
    },
  }
</script>


<style lang="scss" scoped>
  @media print {
    table { page-break-after: auto }
    tr    { page-break-inside: avoid; page-break-after: auto }
    td    { page-break-inside: avoid; page-break-after: auto }
    thead { display: table-header-group }
    tfoot { display: table-footer-group }
    .print-btn { display: none }
  }

  :deep(th) {
    border-width: 2px !important;
  }

  :deep(td) {
    border-width: 2px !important;
  }
</style>
