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
        bodyClass="dy58-table-content-cell-class"
      >
        <template #body="slotProps">
          <div
            v-if="[
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
  import { getLocaleDateTimeString } from '@/additional/dateTimeConvertions';
  import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';

  export default {
    name: 'dy58-print-dnc-dsp-journal-preview-page',

    setup() {
      const store = useStore();

      const data = ref([]);
      const errMessage = ref(null);
      const searchInProgress = ref(false);
      const startDisplayDate = ref(null);
      const endDisplayDate = ref(null);

      onMounted(() => {
        // Не хотим отображения главного меню и футера
        store.commit(SET_PRINT_PREVIEW, true);
        // Для приема данных
        window.addEventListener('data', (event) => {
          if (!event.detail) {
            return;
          }
          const params = JSON.parse(event.detail);

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
        });
        // Сообщаем о готовности к отображению данных
        const event = new CustomEvent('ready');
        window.dispatchEvent(event);
      });

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
          .catch((err) => {
            errMessage.value = err;
          })
          .finally(() => {
            searchInProgress.value = false;
          });
      };

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
              return `станции ${store.getters.getUserWorkPoligonName}`;
            case WORK_POLIGON_TYPES.DNC_SECTOR:
            case WORK_POLIGON_TYPES.ECD_SECTOR:
              return `участку ${store.getters.getUserWorkPoligonName}`;
            default:
              return '?';
          }
        }),
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
  }
</style>
