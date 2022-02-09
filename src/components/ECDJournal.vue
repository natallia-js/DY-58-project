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
          v-if="[
            getECDJournalTblColumnsTitles.orderContent,
            getECDJournalTblColumnsTitles.toWhom,
            getECDJournalTblColumnsTitles.orderAcceptor].includes(col.field)"
          v-html="slotProps.data[col.field]"
        ></div>
        <div v-else-if="col.field === getECDJournalTblColumnsTitles.orderNum && !slotProps.data.sendOriginal">
          {{ slotProps.data[col.field] }}<br/>(копия)
        </div>
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
  import { formOrderText, formAcceptorsStrings, sendOriginal } from '@/additional/formOrderText';
  import { getLocaleDateTimeString } from '@/additional/dateTimeConvertions';
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
            otherToSend: !order.otherToSend ? [] :
              order.otherToSend.map((el) => ({ ...el, confirmDateTime: !el.confirmDateTime ? null : new Date(el.confirmDateTime)})),
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
              data.value.push({
                id: order._id,
                // нужно для группировки распоряжений
                type: order.type,
                seqNum: index + 1,
                // кому адресовано распоряжение (соответствующие строки "Кому" и "Копия" формируем на
                // основании сведений, содержащихся в "Иных" адресатах - только для исходящих документов ЭЦД!
                // для входящих документов данное поле будет оставаться пустым)
                toWhom: formToWhomString(order),
                // дата-время утверждения распоряжения
                orderAssertDateTime: order.assertDateTime ? getLocaleDateTimeString(new Date(order.assertDateTime), false) : '',
                orderNum: order.number,
                orderContent: formOrderText({
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
                }),
                orderSender: `${order.creator.post} ${order.creator.fio}`,
                // время уведомления (на приказ/запрещение) - из связанного распоряжения
                orderNotificationDateTime: '',
                // номер уведомления - из связанного распоряжения
                notificationNumber: '',
                // нужно для группировки распоряжений
                orderChainId: order.orderChain.chainId,
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
              });
            }
          });
      };

      const userWorkPoligon = computed(() => store.getters.getUserWorkPoligon);

      const orderDispatchedOnThisWorkPoligon = (order) => {
        return order && order.workPoligon && userWorkPoligon.value &&
          order.workPoligon.type === userWorkPoligon.value.type &&
          String(order.workPoligon.id) === String(userWorkPoligon.value.code);
      };

      const formToWhomString = (order) => {
        // Смотрим, кто издатель распоряжения. Если не текущий полигон (т.е. участок ЭЦД), то не
        // формируем строку "Кому"
        if (!orderDispatchedOnThisWorkPoligon(order)) {
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
        formToWhomString,
      };
    },
  }
</script>
