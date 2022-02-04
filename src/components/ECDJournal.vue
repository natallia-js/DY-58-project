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
        <div v-if="col.field === getECDJournalTblColumnsTitles.orderContent" v-html="slotProps.data[col.field]">
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
  import { formOrderText } from '@/additional/formOrderText';

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

      const prepareDataForDisplay = (responseData) => {
        if (data.value.length) {
          data.value = [];
        }
        responseData.forEach((order, index) => {
          data.value.push({
            id: order._id,
            seqNum: index + 1,
            toWhom: 'toWhom',
            orderAssertDateTime: 'orderAssertDateTime', // дата, время утверждения
            orderNum: order.number,
            orderContent: formOrderText({
              orderTextArray: order.orderText.orderText,
              dncToSend: order.dncToSend,
              dspToSend: order.dspToSend,
              ecdToSend: order.ecdToSend,
              otherToSend: order.otherToSend,
            }),
            orderAcceptor: 'orderAcceptor',
            orderSender: 'orderSender',
            orderNotificationDateTime: 'orderNotificationDateTime', // время уведомления (на приказ/запрещение)
            notificationNumber: 'notificationNumber', // номер уведомления
          });
        });
      };

      watch(() => props.searchParams, (newVal) => {
        if (!newVal || searchInProgress.value) {
          return;
        }
        searchInProgress.value = true;
        getOrdersFromServer({ datetimeStart: newVal.timeSpan.start, datetimeEnd: newVal.timeSpan.end })
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
      };
    },
  }
</script>
