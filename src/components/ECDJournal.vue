<template>
  <div v-if="errMessage">{{ errMessage }}</div>
  <DataTable
    v-else
    :value="data"
    dataKey="id"
    :totalRecords="totalRecords"
    ref="dt"
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
        ></div>
        <div v-else-if="col.field === getECDJournalTblColumnsTitles.number && !slotProps.data.sendOriginal">
          {{ slotProps.data[col.field] }}<br/>(копия)
        </div>
        <div v-else>
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
</template>

<script>
  import { computed, ref, watch } from 'vue';
  import { useStore } from 'vuex';
  import { getECDOrdersFromServer } from '@/serverRequests/orders.requests';
  import {
    sendOriginal,
    formOrderText,
    formAcceptorsStrings,
    getExtendedOrderTitle,
  } from '@/additional/formOrderText';
  import { getLocaleDateTimeString } from '@/additional/dateTimeConvertions';
  import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';
  import { SPECIAL_TELECONTROL_ORDER_SIGN } from '@/constants/orderPatterns';
  import { FilterMatchMode } from 'primevue/api';

  const DEF_ROWS_PER_PAGE = 10;

  export default {
    name: 'dy58-ecd-journal',

    props: {
      searchParams: {
        type: Object,
      },
    },

    setup(props) {
      const store = useStore();

      const data = ref([]);
      const errMessage = ref(null);
      const searchInProgress = ref(false);
      const dt = ref();
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

      const userWorkPoligon = computed(() => store.getters.getUserWorkPoligon);

      const orderDispatchedOnThisWorkPoligon = (order) => {
        return order && order.workPoligon && userWorkPoligon.value &&
          order.workPoligon.type === userWorkPoligon.value.type &&
          String(order.workPoligon.id) === String(userWorkPoligon.value.code);
      };

      const getOrderSeqNumber = (index) => {
        return (currentPage.value - 1) * rowsPerPage.value + index + 1;
      };

      // Позволяет сформировать массив данных для отображения в таблице.
      const prepareDataForDisplay = (responseData) => {
        if (data.value.length) {
          data.value = [];
        }
        if (!responseData) {
          return;
        }
        data.value = responseData
          .map((order) => ({
            ...order,
            dncToSend: !order.dncToSend ? [] :
              order.dncToSend.map((el) => ({ ...el, confirmDateTime: !el.confirmDateTime ? null : new Date(el.confirmDateTime)})),
            dspToSend: !order.dspToSend ? [] :
              order.dspToSend.map((el) => ({ ...el, confirmDateTime: !el.confirmDateTime ? null : new Date(el.confirmDateTime)})),
            ecdToSend: !order.ecdToSend ? [] :
              order.ecdToSend.map((el) => ({ ...el, confirmDateTime: !el.confirmDateTime ? null : new Date(el.confirmDateTime)})),
            otherToSend: !order.otherToSend ? [] :
              order.otherToSend.map((el) => ({ ...el, confirmDateTime: !el.confirmDateTime ? null : new Date(el.confirmDateTime)})),
          }))
          .map((order, index) => ({
            // dataKey в таблице
            id: order._id,
            seqNum: getOrderSeqNumber(index),
            // кому адресовано распоряжение (соответствующие строки "Кому" и "Копия" формируем на
            // основании сведений, содержащихся в "Иных" адресатах - только для документов, изданных ЭЦД!
            // для документов, изданных не-ЭЦД, данное поле будет оставаться пустым)
            toWhom: formToWhomString(order),
            // дата-время утверждения распоряжения
            assertDateTime: order.assertDateTime ? getLocaleDateTimeString(new Date(order.assertDateTime), false) : '',
            number: order.number,
            orderContent: getExtendedOrderTitle(order) + '<br/>' +
              formOrderText({
                orderTextArray: order.orderText.orderText,
                dncToSend: order.dncToSend,
                dspToSend: order.dspToSend,
                ecdToSend: order.ecdToSend,
                otherToSend: order.otherToSend,
              }),
            orderAcceptor: formAcceptorsStrings({
              dncToSend: order.dncToSend,
              dspToSend: order.dspToSend,
              ecdToSend: order.ecdToSend,
              otherToSend: order.otherToSend,
              // для ряда приказов ЭЦД указывается особая отметка ТУ (для приказов, формируемых на
              // отключение/включение коммутационного аппарата по телеуправлению); эту отметку необходимо
              // отобразить в журнале в графе "Кто принял"
              isTYOrder: order.specialTrainCategories && order.specialTrainCategories.includes(SPECIAL_TELECONTROL_ORDER_SIGN),
            }),
            orderSender: `${order.creator.post} ${order.creator.fio}`,
            // время уведомления (на приказ/запрещение) - из связанного распоряжения
            orderNotificationDateTime: order.orderNotificationDateTime ? getLocaleDateTimeString(new Date(order.orderNotificationDateTime), false) : '',
            // номер уведомления - из связанного распоряжения
            notificationNumber: order.notificationNumber,
            // для работы с издателем распоряжения
            workPoligon: order.workPoligon,
            // true - оригинал распоряжения, false - его копия; для распоряжения, изданного на данном рабочем
            // полигоне, распоряжение - всегда оригинал; для распоряжения, пришедшего из вне, необходимо
            // сделать дополнительные проверки
            sendOriginal: Boolean(
              orderDispatchedOnThisWorkPoligon(order) ||
              (
                order.ecdToSend && userWorkPoligon.value &&
                order.ecdToSend.find((el) =>
                  String(el.id) === String(userWorkPoligon.value.code) &&
                  sendOriginal(el.sendOriginal))
              )
            ),
          }));
      };

      const formToWhomString = (order) => {
        // Смотрим, на какого типа полигоне издано распоряжение.
        // Если не на участке ЭЦД, то не формируем строку "Кому".
        if (order.workPoligon.type !== WORK_POLIGON_TYPES.ECD_SECTOR) {
          return '';
        }
        const otherReceivers = order.otherToSend;
        if (!otherReceivers || !otherReceivers.length) {
          return;
        }
        let toWhom = '';
        let toWhomCopy = '';
        const getToWhomData = (el) => {
          return `${el.placeTitle}${el.post ? ' ' + el.post : ''}`;
        };
        otherReceivers.forEach((el) => {
          const subString = getToWhomData(el);
          if (!subString || !subString.length) {
            return;
          }
          if (sendOriginal(el.sendOriginal)) {
            toWhom += toWhom.length > 0 ? `, ${subString}` : subString;
          } else {
            toWhomCopy += toWhomCopy.length > 0 ? `, ${subString}` : subString;
          }
        });
        let res = toWhom.length > 0 ? toWhom : '';
        if (toWhomCopy.length > 0) {
          if (res.length > 0) {
            res += '<br/>';
          }
          res += `<b>Копия:</b> ${toWhomCopy}`;
        }
        return res;
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

      return {
        data,
        dt,
        totalRecords,
        filters,
        rowsPerPage,
        errMessage,
        searchInProgress,
        getECDJournalTblColumnsTitles,
        getECDJournalTblColumns: computed(() => store.getters.getECDJournalTblColumns),
        onPage,
        onSort,
        onFilter,
      };
    },
  }
</script>


<style lang="scss" scoped>
  :deep(.p-column-header-content) {
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 100%;
    /*flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;*/
  }

  :deep(.p-column-filter-menu) {
    margin-left: 0;
    padding: 0 !important;
    justify-content: center;
    align-items: center;
    position: absolute !important;
    top: 0;
    right: 0;
    bottom: 0;
  }

  /*:deep(.p-column-filter-menu-button, .p-column-filter-clear-button) {
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
  }*/

  .p-datatable :deep(.p-sortable-column-icon) {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 0 !important;
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
  :deep(.p-sortable-column-icon) {
    font-size: 0.75rem;
  }
</style>
