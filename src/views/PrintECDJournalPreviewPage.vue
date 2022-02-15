<template>
  <div class="p-m-2">
    <h2 class="p-text-center p-m-2">Журнал приказов и запрещений ЭЦД</h2>
    <h3 class="p-text-center p-m-2">c {{ startDisplayDate }} по {{ endDisplayDate || 'настоящее время'}}</h3>
    <DataTable
      :value="data"
      dataKey="id"
      class="p-datatable-gridlines p-datatable-sm"
      :rowHover="false"
      :scrollable="false"
      :loading="searchInProgress"
    >
      <template #empty>
        <div style="marginLeft:auto;marginRight:auto">Документы не найдены.</div>
      </template>

      <template #loading>
        <div style="marginLeft:auto;marginRight:auto">Идет загрузка данных. Подождите...</div>
      </template>

      <Column v-for="col of getECDJournalTblColumns"
        :field="col.field"
        :key="col.field"
        :header="col.title"
        :style="{ minWidth: col.width, textAlign: col.align }"
        headerClass="dy58-table-header-cell-class"
        bodyClass="dy58-table-content-cell-class"
      >
        <template #body="slotProps">
          <div
            v-if="[
              getECDJournalTblColumnsTitles.orderContent,
              getECDJournalTblColumnsTitles.toWhom,
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
  import { useRoute } from 'vue-router';
  import { getECDOrdersFromServer } from '@/serverRequests/orders.requests';
  import prepareDataForDisplayInECDJournal from '@/additional/prepareDataForDisplayInECDJournal';
  import { getLocaleDateTimeString } from '@/additional/dateTimeConvertions';
  import { SET_PRINT_PREVIEW } from '@/store/mutation-types';

  export default {
    name: 'dy58-print-ecd-journal-preview-page',

    setup() {
      const store = useStore();
      const route = useRoute();

      const data = ref([]);
      const errMessage = ref(null);
      const searchInProgress = ref(false);

      onMounted(() => {
        store.commit(SET_PRINT_PREVIEW, true);
        loadData();
      });

      const getOrderSeqNumber = (index) => index + 1;

      // Позволяет сформировать массив данных для отображения в таблице.
      const prepareDataForDisplay = (responseData) => {
        if (data.value.length) {
          data.value = [];
        }
        data.value = prepareDataForDisplayInECDJournal(responseData, getOrderSeqNumber);
      };

      const loadData = () => {
        searchInProgress.value = true;
        getECDOrdersFromServer({
          datetimeStart: JSON.parse(route.params.datetimeStart),
          datetimeEnd: JSON.parse(route.params.datetimeEnd),
          includeDocsCriteria: JSON.parse(route.params.includeDocsCriteria),
          filterFields: JSON.parse(route.params.filterFields),
          sortFields: JSON.parse(route.params.sortFields),
        })
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
        getECDJournalTblColumnsTitles: computed(() => store.getters.getECDJournalTblColumnsTitles),
        getECDJournalTblColumns: computed(() => store.getters.getECDJournalTblColumns),
        startDisplayDate: getLocaleDateTimeString(new Date(JSON.parse(route.params.datetimeStart)), false),
        endDisplayDate: JSON.parse(route.params.datetimeEnd) ? getLocaleDateTimeString(new Date(JSON.parse(route.params.datetimeEnd)), false) : null,
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
