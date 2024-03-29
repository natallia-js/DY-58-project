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
        <div class="p-d-flex p-jc-center">Документы не найдены.</div>
      </template>

      <template #loading>
        <div class="p-d-flex p-jc-center">Идет загрузка данных. Подождите...</div>
      </template>

      <Column
        selectionMode="multiple"
        headerStyle="minWidth:3em"
        bodyStyle="minWidth:3em"
        headerClass="dy58-table-header-cell-class"
        bodyClass="dy58-table-top-content-cell-class"
      >
      </Column>

      <Column v-for="col of getECDJournalTblColumns"
        :field="col.field"
        :key="col.field"
        :header="col.title"
        :style="{ width: col.width, textAlign: col.align }"
        headerClass="dy58-table-header-cell-class"
        bodyClass="dy58-table-top-content-cell-class"
        :sortable="!workingWithCachedOrders && [
          getECDJournalTblColumnsTitles.assertDateTime,
          getECDJournalTblColumnsTitles.orderNotificationDateTime].includes(col.field)"
        filterMatchMode="contains"
        :showFilterMatchModes="false"
      >
        <template #body="slotProps">
          <div
            v-if="[
              getECDJournalTblColumnsTitles.toWhom,
              getECDJournalTblColumnsTitles.orderContent,
              getECDJournalTblColumnsTitles.orderSender,
              getECDJournalTblColumnsTitles.orderAcceptor].includes(col.field)"
            v-html="slotProps.data[col.field]"
            :class="journalTableCellStyleClasses(slotProps.data)"
            style="overflow-wrap:break-word"
          ></div>
          <div
            v-else-if="col.field === getECDJournalTblColumnsTitles.number && !slotProps.data.sendOriginal"
            :class="journalTableCellStyleClasses(slotProps.data)"
          >
            {{ slotProps.data[col.field] }}<br/>(копия)
          </div>
          <div
            v-else-if="col.field === getECDJournalTblColumnsTitles.notificationNumber"
            :class="journalTableCellStyleClasses(slotProps.data)"
          >
            {{ slotProps.data[col.field] }}
            <div v-if="slotProps.data.notificationText">
              <br/>
              <div v-html="slotProps.data.notificationText" />
            </div>
          </div>
          <div v-else :class="journalTableCellStyleClasses(slotProps.data)">
            {{ slotProps.data[col.field] }}
          </div>
        </template>

        <template #filter="{filterModel,filterCallback}" v-if="!workingWithCachedOrders &&
        [ getECDJournalTblColumnsTitles.toWhom,
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
  import { getJournalOrdersFromServer } from '@/serverRequests/orders.requests';
  import { FilterMatchMode } from 'primevue/api';
  import prepareDataForDisplayInECDJournal from '@/additional/prepareDataForDisplayInECDJournal';
  import CreateRevisorCheckRecordDlg from '@/components/CreateOrders/CreateRevisorCheckRecordDlg';
  import { ORDER_PATTERN_TYPES } from '@/constants/orderPatterns';
  import isElectron from '@/additional/isElectron';
  import { GET_ALL_LOCALLY_SAVED_ORDERS } from '@/store/action-types';
  import journalTableCellStyleClasses from '@/additional/styleClasses/journalTableCellStyleClasses';

  const DEF_ROWS_PER_PAGE = 20;

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
      loadCachedOrders: {
        type: Number,
      },
    },

    setup(props, { emit }) {
      const store = useStore();
      const router = useRouter();

      const data = ref([]);
      const dataFromCache = ref([]);
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
      const workingWithCachedOrders = ref(false);

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

      const loadCachedDataForCurrentPage = () => {
        data.value = dataFromCache.value.slice((currentPage.value - 1) * rowsPerPage.value, currentPage.value * rowsPerPage.value);
      };

      const loadLazyData = () => {
        searchInProgress.value = true;
        getJournalOrdersFromServer({
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
          .catch((error) => {
            errMessage.value = error;
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
        if (!workingWithCachedOrders.value) {
          loadLazyData();
        } else {
          loadCachedDataForCurrentPage();
        }
      };

      const onSort = (event) => {
        if (workingWithCachedOrders.value) {
          return;
        }
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
        if (workingWithCachedOrders.value) {
          return;
        }
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
            datetimeStart: props.printParams?.timeSpan?.start,
            datetimeEnd: props.printParams?.timeSpan?.end,
            includeDocsCriteria: props.printParams.includeDocsCriteria,
            sortFields: sortFields.value,
            filterFields: filterFields.value,
          };
        const route = router.resolve({
          name: 'PrintECDJournalPreviewPage',
          params: { offline: Boolean(props.printParams.offline) },
        });
        const printWindow = window.open(route.href, '_blank', 'nodeIntegration=yes');
        if (!isElectron()) {
          printWindow.addEventListener('ready', () => {
            const event = new CustomEvent('data', { detail: JSON.stringify(params) });
            printWindow.dispatchEvent(event);
          });
        } else {
          window.printJournalWindowReady = () => {
            printWindow.eval(`printJournal(${JSON.stringify(params)})`);
          };
        }
      });

      watch(() => props.checkDocs, (newVal) => {
        if (newVal === true) {
          showCreateRevisorCheckRecordDlg.value = true;
        }
      });

      watch(() => props.loadCachedOrders, async () => {
        try {
          const cachedOrders = await store.dispatch(GET_ALL_LOCALLY_SAVED_ORDERS);
          if (!cachedOrders) {
            totalRecords.value = 0;
            data.value = [];
            return;
          }
          // У ЭЦД каждое уведомление/отмена запрещения должно отображаться в строке таблицы
          // напротив соответствующего приказа/запрещения, а не как отдельная строка.
          // Следовательно, необходимо переформировать исходный набор данных перед его отрисовкой
          const dataArrayToDisplay = [];
          cachedOrders
            .map((order) => JSON.parse(order.serializedData))
            .forEach((order) => {
              if (order.type !== ORDER_PATTERN_TYPES.ECD_NOTIFICATION) {
                dataArrayToDisplay.push(order);
              } else {
                // Ищем приказ/запрещение
                const correspOrder = dataArrayToDisplay.find((el) =>
                  el.orderChainId === order.orderChainId &&
                  [ORDER_PATTERN_TYPES.ECD_ORDER, ORDER_PATTERN_TYPES.ECD_PROHIBITION].includes(el.type)
                );
                if (correspOrder) {
                  correspOrder.connectedOrder = {
                    number: order.number,
                    creator: order.creator,
                    startDate: order.timeSpan.start,
                  };
                }
              }
            });
          dataFromCache.value = prepareDataForDisplayInECDJournal(dataArrayToDisplay, getOrderSeqNumber);
          totalRecords.value = cachedOrders.length;
          workingWithCachedOrders.value = true;
          loadCachedDataForCurrentPage();
        } catch (error) {
          errMessage.value = error;
        }
      });

      const hideCreateRevisorCheckRecordDlg = () => {
        showCreateRevisorCheckRecordDlg.value = false;
        emit('finishedCreatingCheckRecord');
      };

      return {
        ORDER_PATTERN_TYPES,
        data,
        workingWithCachedOrders,
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
        journalTableCellStyleClasses,
      };
    },
  }
</script>


<style lang="scss" scoped>
  :deep(.p-datatable-responsive-scroll > .p-datatable-wrapper > table) {
    table-layout: fixed;
  }

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
