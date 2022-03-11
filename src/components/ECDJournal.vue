<template>
  <div v-if="errMessage">{{ errMessage }}</div>
  <div v-else>
    <CreateRevisorCheckRecordDlg
      :showDlg="showCreateRevisorCheckRecordDlg"
      @close="hideCreateRevisorCheckRecordDlg"
    />
    <div v-if="selectedRecords && selectedRecords.length">
      Выделено: {{ selectedRecords.length }}
      {{ selectedRecords.length > 4 ? 'записей' : (selectedRecords.length > 1) ? 'записи' : 'запись' }}
      из {{ totalRecords }}
    </div>
    <DataTable
      :value="data"
      dataKey="id"
      :totalRecords="totalRecords"
      :lazy="true"
      class="p-datatable-gridlines p-datatable-sm"
      :rowHover="true"
      :scrollable="true"
      scrollHeight="flex"
      :loading="searchInProgress"
      :paginator="true"
      :rows="rowsPerPage"
      :rowsPerPageOptions="[10,20,50]"
      paginatorTemplate="CurrentPageReport JumpToPageDropdown FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      currentPageReportTemplate="Документы с {first} по {last} из {totalRecords}"
      responsiveLayout="scroll"
      v-model:filters="filters"
      v-model:selection="selectedRecords"
      filterDisplay="menu"
      :globalFilterFields="[
        getECDJournalTblColumnsTitles.toWhom,
        getECDJournalTblColumnsTitles.number,
        getECDJournalTblColumnsTitles.orderContent,
        getECDJournalTblColumnsTitles.orderAcceptor,
        getECDJournalTblColumnsTitles.orderSender,
        getECDJournalTblColumnsTitles.notificationNumber,
      ]"
      removableSort
      @page="onPage($event)"
      @sort="onSort($event)"
      @filter="onFilter($event)"
    >
      <template #empty>
        <div style="marginLeft:auto;marginRight:auto">Документы не найдены.</div>
      </template>

      <template #loading>
        <div style="marginLeft:auto;marginRight:auto">Идет загрузка данных. Подождите...</div>
      </template>

      <Column
        selectionMode="multiple"
        headerStyle="minWidth:3em"
        bodyStyle="minWidth:3em"
        headerClass="dy58-table-header-cell-class"
        bodyClass="dy58-table-content-cell-class"
      >
      </Column>

      <Column v-for="col of getECDJournalTblColumns"
        :field="col.field"
        :key="col.field"
        :header="col.title"
        :style="{ minWidth: col.width, textAlign: col.align }"
        headerClass="dy58-table-header-cell-class"
        bodyClass="dy58-table-content-cell-class"
        :sortable="[
          getECDJournalTblColumnsTitles.assertDateTime,
          getECDJournalTblColumnsTitles.orderNotificationDateTime].includes(col.field)"
        filterMatchMode="contains"
        :showFilterMatchModes="false"
      >
        <template #body="slotProps">
          <div
            v-if="[
              getECDJournalTblColumnsTitles.orderContent,
              getECDJournalTblColumnsTitles.toWhom,
              getECDJournalTblColumnsTitles.orderAcceptor].includes(col.field)"
            v-html="slotProps.data[col.field]"
            :class="`${slotProps.data.type === ORDER_PATTERN_TYPES.CONTROL ? 'dy58-control-record' : ''}`"
          ></div>
          <div
            v-else-if="col.field === getECDJournalTblColumnsTitles.number && !slotProps.data.sendOriginal"
            :class="`${slotProps.data.type === ORDER_PATTERN_TYPES.CONTROL ? 'dy58-control-record' : ''}`"
          >
            {{ slotProps.data[col.field] }}<br/>(копия)
          </div>
          <div v-else :class="`${slotProps.data.type === ORDER_PATTERN_TYPES.CONTROL ? 'dy58-control-record' : ''}`">
            {{ slotProps.data[col.field] }}
          </div>
        </template>

        <template #filter="{filterModel,filterCallback}" v-if="[
          getECDJournalTblColumnsTitles.toWhom,
          getECDJournalTblColumnsTitles.number,
          getECDJournalTblColumnsTitles.orderContent,
          getECDJournalTblColumnsTitles.orderAcceptor,
          getECDJournalTblColumnsTitles.orderSender,
          getECDJournalTblColumnsTitles.notificationNumber,
        ].includes(col.field)">
          <InputText
            type="text"
            v-model="filterModel.value"
            class="p-column-filter"
            placeholder="Введите значение для поиска в столбце"
            @keydown.enter="filterCallback()"
          />
          <small v-if="[getECDJournalTblColumnsTitles.toWhom, getECDJournalTblColumnsTitles.orderAcceptor].includes(col.field)">
            поиск ведется по информации об адресатах
          </small>
          <small v-else-if="[getECDJournalTblColumnsTitles.number, getECDJournalTblColumnsTitles.notificationNumber].includes(col.field)">
            поиск ведется по числовому значению либо его части
          </small>
          <small v-else-if="getECDJournalTblColumnsTitles.orderContent === col.field">
            поиск ведется только по элементам текста документа (наименование документа и его адресаты не рассматриваются)
          </small>
          <small v-else-if="getECDJournalTblColumnsTitles.orderSender === col.field">
            поиск ведется по информации об издателе документа
          </small>
        </template>

        <template #filterclear="{filterCallback}" v-if="[
          getECDJournalTblColumnsTitles.toWhom,
          getECDJournalTblColumnsTitles.number,
          getECDJournalTblColumnsTitles.orderContent,
          getECDJournalTblColumnsTitles.orderAcceptor,
          getECDJournalTblColumnsTitles.orderSender,
          getECDJournalTblColumnsTitles.notificationNumber,
        ].includes(col.field)">
          <Button
            type="button"
            icon="pi pi-times"
            label="Сброс"
            @click="filterCallback()"
            class="p-button-secondary">
          </Button>
        </template>

        <template #filterapply="{filterCallback}" v-if="[
          getECDJournalTblColumnsTitles.toWhom,
          getECDJournalTblColumnsTitles.number,
          getECDJournalTblColumnsTitles.orderContent,
          getECDJournalTblColumnsTitles.orderAcceptor,
          getECDJournalTblColumnsTitles.orderSender,
          getECDJournalTblColumnsTitles.notificationNumber,
        ].includes(col.field)">
          <Button
            type="button"
            icon="pi pi-check"
            label="Поиск"
            @click="filterCallback()"
            class="p-button-success">
          </Button>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script>
  import { computed, ref, watch } from 'vue';
  import { useStore } from 'vuex';
  import { useRouter } from 'vue-router';
  import { getECDOrdersFromServer } from '@/serverRequests/orders.requests';
  import { FilterMatchMode } from 'primevue/api';
  import prepareDataForDisplayInECDJournal from '@/additional/prepareDataForDisplayInECDJournal';
  import CreateRevisorCheckRecordDlg from '@/components/CreateOrders/CreateRevisorCheckRecordDlg';
  import { ORDER_PATTERN_TYPES } from '@/constants/orderPatterns';

  const DEF_ROWS_PER_PAGE = 10;

  export default {
    name: 'dy58-ecd-journal',

    components: {
      CreateRevisorCheckRecordDlg,
    },

    emits: ['finishedCreatingCheckRecord'],

    props: {
      searchParams: {
        type: Object,
      },
      printParams: {
        type: Object,
      },
      checkDocs: {
        type: Boolean,
      },
    },

    setup(props, { emit }) {
      const store = useStore();
      const router = useRouter();

      const data = ref([]);
      const errMessage = ref(null);
      const searchInProgress = ref(false);
      const totalRecords = ref(0);
      const currentPage = ref(1);
      const sortFields = ref(null);
      const filterFields = ref(null);
      const rowsPerPage = ref(DEF_ROWS_PER_PAGE);
      const getECDJournalTblColumnsTitles = computed(() => store.getters.getECDJournalTblColumnsTitles);
      const filters = ref({
        [getECDJournalTblColumnsTitles.value.toWhom]: { value: null, matchMode: FilterMatchMode.CONTAINS },
        [getECDJournalTblColumnsTitles.value.number]: { value: null, matchMode: FilterMatchMode.CONTAINS },
        [getECDJournalTblColumnsTitles.value.orderContent]: { value: null, matchMode: FilterMatchMode.CONTAINS },
        [getECDJournalTblColumnsTitles.value.orderAcceptor]: { value: null, matchMode: FilterMatchMode.CONTAINS },
        [getECDJournalTblColumnsTitles.value.orderSender]: { value: null, matchMode: FilterMatchMode.CONTAINS },
        [getECDJournalTblColumnsTitles.value.notificationNumber]: { value: null, matchMode: FilterMatchMode.CONTAINS },
      });
      const selectedRecords = ref();
      const showCreateRevisorCheckRecordDlg = ref(false);

      const getOrderSeqNumber = (index) => {
        return (currentPage.value - 1) * rowsPerPage.value + index + 1;
      };

      // Позволяет сформировать массив данных для отображения в таблице.
      const prepareDataForDisplay = (responseData) => {
        if (data.value.length) {
          data.value = [];
        }
        data.value = prepareDataForDisplayInECDJournal(responseData, getOrderSeqNumber);
      };

      const loadLazyData = () => {
        searchInProgress.value = true;
        getECDOrdersFromServer({
          datetimeStart: props.searchParams.timeSpan.start,
          datetimeEnd: props.searchParams.timeSpan.end,
          includeDocsCriteria: props.searchParams.includeDocsCriteria,
          sortFields: sortFields.value,
          filterFields: filterFields.value,
          page: currentPage.value,
          docsCount: rowsPerPage.value,
        })
          .then((responseData) => {
            errMessage.value = null;
            totalRecords.value  = responseData.totalRecords;
            prepareDataForDisplay(responseData.data);
          })
          .catch((err) => {
            errMessage.value = err;
          })
          .finally(() => {
            searchInProgress.value = false;
          });
      };

      const onPage = (event) => {
        if (rowsPerPage.value !== event.rows) {
          // если пользователь меняет количество документов, которые необходимо вывести на странице
          rowsPerPage.value = event.rows;
        }
        if (currentPage.value !== event.page + 1) {
          // если меняется текущий номер страницы
          currentPage.value = event.page + 1;
        }
        loadLazyData();
      };

      const onSort = (event) => {
        // таблица при попытке что-то отсортировать производит автоматически переход на 1 страницу
        currentPage.value = 1;
        if (event.sortField) {
          sortFields.value = {
            [event.sortField]: event.sortOrder,
          };
        } else {
          sortFields.value = null;
        }
        loadLazyData();
      };

      const onFilter = () => {
        // таблица при попытке что-то отфильтровать производит автоматически переход на 1 страницу
        currentPage.value = 1;
        filterFields.value = [];
        for (let filter in filters.value) {
          if (filters.value[filter].value) {
            filterFields.value.push({ field: filter, value: filters.value[filter].value });
          }
        }
        loadLazyData();
      };

      watch(() => props.searchParams, (newVal) => {
        if (!newVal || searchInProgress.value) {
          return;
        }
        loadLazyData();
      });

      watch(() => props.printParams, (newVal) => {
        if (!newVal) {
          return;
        }
        // open print preview window
        const params = selectedRecords.value ?
          {
            selectedRecords: selectedRecords.value,
          } :
          {
            selectedRecords: selectedRecords.value,
            datetimeStart: props.printParams.timeSpan.start,
            datetimeEnd: props.printParams.timeSpan.end,
            includeDocsCriteria: props.printParams.includeDocsCriteria,
            sortFields: sortFields.value,
            filterFields: filterFields.value,
          };
        const route = router.resolve({
          name: 'PrintECDJournalPreviewPage',
          params: null,
        });
        const newWindow = window.open(route.href, '_blank');
        newWindow.addEventListener('ready', () => {
          const event = new CustomEvent('data', { detail: JSON.stringify(params) });
          newWindow.dispatchEvent(event);
        });
      });

      watch(() => props.checkDocs, (newVal) => {
        if (newVal === true) {
          showCreateRevisorCheckRecordDlg.value = true;
        }
      });

      const hideCreateRevisorCheckRecordDlg = () => {
        showCreateRevisorCheckRecordDlg.value = false;
        emit('finishedCreatingCheckRecord');
      };

      return {
        ORDER_PATTERN_TYPES,
        data,
        totalRecords,
        selectedRecords,
        filters,
        rowsPerPage,
        errMessage,
        searchInProgress,
        getECDJournalTblColumnsTitles,
        getECDJournalTblColumns: computed(() => store.getters.getECDJournalTblColumns),
        onPage,
        onSort,
        onFilter,
        showCreateRevisorCheckRecordDlg,
        hideCreateRevisorCheckRecordDlg,
      };
    },
  }
</script>


<style lang="scss" scoped>
  :deep(.p-column-header-content) {
    width: 100%;
    height: 100%;
  }

  :deep(.p-column-title) {
    overflow-wrap: break-word;
    display: block;
    padding-right: 1.5rem;
    width: 100%;
  }

  :deep(.p-column-filter-menu) {
    margin-left: 0;
    padding: 0;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
  }

  :deep(.p-column-filter-menu-button) {
    width: 1.5rem;
    height: 1.5rem;
  }

  :deep(.pi-filter) {
    font-size: 0.75rem;
  }

  .p-datatable :deep(.p-sortable-column-icon) {
    width: 1.5rem;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
  }

  :deep(.p-sortable-column-icon) {
    font-size: 0.75rem;
  }
</style>
