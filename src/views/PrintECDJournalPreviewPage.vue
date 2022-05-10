<template>
  <div class="p-m-2">
    <h2 class="p-text-center p-m-2">
      Оперативный журнал ЭЦД
    </h2>
    <h3 class="p-text-center p-m-2">
      Рабочий полигон {{ getUserWorkPoligonName }}
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

      <Column v-for="col of getECDJournalTblColumns"
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
              getECDJournalTblColumnsTitles.orderContent,
              getECDJournalTblColumnsTitles.toWhom,
              getECDJournalTblColumnsTitles.orderSender,
              getECDJournalTblColumnsTitles.orderAcceptor].includes(col.field)"
            v-html="slotProps.data[col.field]"
          ></div>
          <div v-else-if="col.field === getECDJournalTblColumnsTitles.number && !slotProps.data.sendOriginal">
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
  import prepareDataForDisplayInECDJournal from '@/additional/prepareDataForDisplayInECDJournal';
  import { SET_PRINT_PREVIEW } from '@/store/mutation-types';
  import { getLocaleDateTimeString } from '@/additional/dateTimeConvertions';
  import isElectron from '@/additional/isElectron';

  export default {
    name: 'dy58-print-ecd-journal-preview-page',

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
        data.value = prepareDataForDisplayInECDJournal(responseData, getOrderSeqNumber);
      };

      const loadData = (params) => {
        const { datetimeStart, datetimeEnd, includeDocsCriteria, filterFields, sortFields } = params;
        searchInProgress.value = true;
        getJournalOrdersFromServer({ datetimeStart, datetimeEnd, includeDocsCriteria, filterFields, sortFields })
          .then((responseData) => {
            errMessage.value = null;
            prepareDataForDisplay(responseData.data);
          })
          .catch((err) => {
            errMessage.value = err;
          })
          .finally(() => {
            searchInProgress.value = false;
          });
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
      
      if (isElectron()) {
        window.printJournal = (params) => {
          viewJournal(params);
        };
      }

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
        }
      });

      const sendToPrinter = () => {
        window.print();
      };

      return {
        data,
        errMessage,
        searchInProgress,
        getECDJournalTblColumnsTitles: computed(() => store.getters.getECDJournalTblColumnsTitles),
        getECDJournalTblColumns: computed(() => store.getters.getECDJournalTblColumns),
        startDisplayDate,
        endDisplayDate,
        getUserWorkPoligonName: computed(() => store.getters.getUserWorkPoligonName),
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
