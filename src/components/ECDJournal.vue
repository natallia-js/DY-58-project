<template>
  <div v-if="errMessage">{{ errMessage }}</div>
  <DataTable
    v-else
    :value="data"
    class="p-datatable-gridlines p-datatable-sm"
    :rowHover="true"
    dataKey="id"
    :scrollable="true" scrollHeight="flex"
    :loading="searchInProgress"
    :paginator="true" :rows="10"
    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
    :rowsPerPageOptions="[10,20,50]"
    responsiveLayout="scroll"
  >
    <Column v-for="col of getECDJournalTblColumns"
      :field="col.field"
      :header="col.title"
      :key="col.field"
      :style="{ minWidth: col.width, textAlign: col.align }"
      headerClass="dy58-table-header-cell-class"
      bodyClass="dy58-table-content-cell-class"
    >
      <template #body="slotProps">
        <div
          v-if="col.field === getECDJournalTblColumnsTitles.orderContent"
          v-html="slotProps.data.orderContent.text"
        ></div>
        <div
          v-else-if="col.field === getECDJournalTblColumnsTitles.toWhom"
          v-html="getToWhomString(slotProps.data.orderContent.toWhom, slotProps.data.orderContent.toWhomCopy)"
        ></div>
        <div v-else>
          {{ slotProps.data[col.field] }}
        </div>
      </template>
    </Column>
  </DataTable>
</template>

<script>
  import { computed, ref, watch } from 'vue';
  import { useStore } from 'vuex';
  import { getOrdersFromServer } from '@/serverRequests/orders.requests';
  import { formOrderText, formAcceptorsStrings, getAssertOrderDateTime } from '@/additional/formOrderText';
  import { getLocaleDateTimeString } from '@/additional/dateTimeConvertions';
  //import { getUserPostFIOString } from '@/store/modules/personal';
  import { ORDER_PATTERN_TYPES } from '@/constants/orderPatterns';

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

      //const userWorkPoligon = computed(() => store.getters.getUserWorkPoligon);

      // Позволяет сформировать дерево распоряжений на основании имеющейся информации по распоряжениям,
      // которые нужно отобразить в таблице.
      // Для итоговой таблицы распоряжений ЭЦД нужно иметь связанную информацию "Приказ/запрещение ЭЦД -
      // уведомление ЭЦД". Никакие другие взаимосвязи документов нам не нужны. Все остальное должно идти
      // в прямом хронологическом порядке.
      // Предполагаем, что распрояжения, поданные на вход, уже отсортированы по дате их издания в прямом
      // хронологическом порядке.
      const prepareDataForDisplay = (sortedResponseData) => {
        if (data.value.length) {
          data.value = [];
        }
        if (!sortedResponseData) {
          return;
        }
        const findParentNode = (chainId) => {
          for (let group of data.value) {
            if (((group.type === ORDER_PATTERN_TYPES.ECD_ORDER) || (group.type === ORDER_PATTERN_TYPES.ECD_PROHIBITION)) &&
              (group.orderChainId === chainId)) {
              return group;
            }
          }
          return null;
        };
        sortedResponseData
          .map((order) => ({
            ...order,
            timeSpan: order.timeSpan ? {
              start: order.timeSpan.start ? new Date(order.timeSpan.start) : null,
              end: order.timeSpan.end ? new Date(order.timeSpan.end) : null,
              tillCancellation: Boolean(order.timeSpan.tillCancellation),
            } : null,
            dncToSend: !order.dncToSend ? [] :
              order.dncToSend.map((el) => ({ ...el, confirmDateTime: !el.confirmDateTime ? null : new Date(el.confirmDateTime)})),
            dspToSend: !order.dspToSend ? [] :
              order.dspToSend.map((el) => ({ ...el, confirmDateTime: !el.confirmDateTime ? null : new Date(el.confirmDateTime)})),
            ecdToSend: !order.ecdToSend ? [] :
              order.ecdToSend.map((el) => ({ ...el, confirmDateTime: !el.confirmDateTime ? null : new Date(el.confirmDateTime)})),
          }))
          .forEach((order, index) => {
          let parentNode;
          if (order.type === ORDER_PATTERN_TYPES.ECD_NOTIFICATION) {
            parentNode = findParentNode(order.orderChain.chainId);
          }
          if (parentNode) {
            // время уведомления (на приказ/запрещение)
            parentNode.orderNotificationDateTime = getLocaleDateTimeString(order.timeSpan.start, false);
            // номер уведомления
            parentNode.notificationNumber = order.number;
          } else {
            const orderCreator = order.creator;
            const assertDateTime = getAssertOrderDateTime({
              dncToSend: order.dncToSend,
              dspToSend: order.dspToSend,
              ecdToSend: order.ecdToSend,
            });console.log('assertDateTime',assertDateTime,order)
            data.value.push({
              id: order._id,
              type: order.type,
              seqNum: index + 1,
              toWhom: '', // кому адресовано распоряжение (строки "Кому" и "Копия" возьмем из orderContent - см.ниже)
              // дата-время утверждения (распоряжение считается утвержденным, если
              // все адресаты его оригинала подтвердили данное распоряжение)
              orderAssertDateTime: assertDateTime ? getLocaleDateTimeString(assertDateTime, false) : '',
              orderNum: order.number,
              orderContent: formOrderText({
                orderTextArray: order.orderText.orderText,
                dncToSend: order.dncToSend,
                dspToSend: order.dspToSend,
                ecdToSend: order.ecdToSend,
                otherToSend: order.otherToSend,
                asString: false,
                includeFIO: false,
              }),
              orderAcceptor: formAcceptorsStrings({
                dncToSend: order.dncToSend,
                dspToSend: order.dspToSend,
                ecdToSend: order.ecdToSend,
                otherToSend: order.otherToSend,
              }),
              orderSender: `${orderCreator.post} ${orderCreator.fio}`,
              orderNotificationDateTime: '', // время уведомления (на приказ/запрещение) - из связанного распоряжения
              notificationNumber: '', // номер уведомления - из связанного распоряжения
              orderChainId: order.orderChain.chainId,
            });
          }
        });
      };

      const getToWhomString = (toWhom, toWhomCopy) => {
        let res = '';
        if (toWhom) {
          res += toWhom;
        }
        if (toWhomCopy) {
          if (res) {
            res += '<br/>';
          }
          res += toWhomCopy;
        }
        return res;
      };

      watch(() => props.searchParams, (newVal) => {
        if (!newVal || searchInProgress.value) {
          return;
        }
        searchInProgress.value = true;
        getOrdersFromServer({
          datetimeStart: newVal.timeSpan.start,
          datetimeEnd: newVal.timeSpan.end,
          includeDocsCriteria: newVal.includeDocsCriteria,
        })
          .then((responseData) => {
            errMessage.value = null;
            prepareDataForDisplay(responseData);
          })
          .catch((err) => {
            errMessage.value = err;
          })
          .finally(() => {
            searchInProgress.value = false;
          });
      });

      return {
        data,
        errMessage,
        searchInProgress,
        getECDJournalTblColumnsTitles: computed(() => store.getters.getECDJournalTblColumnsTitles),
        getECDJournalTblColumns: computed(() => store.getters.getECDJournalTblColumns),
        getToWhomString,
      };
    },
  }
</script>
