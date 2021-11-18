<template>
  <div>
    <ShowIncomingOrderDlg
      :showDlg="showIncomingOrderDlg"
      dlgTitle="Информация о рабочем распоряжении"
      :order="chosenOrder"
      :orderNeedsToBeConfirmed="false"
      @close="hideOrderInfo"
    >
    </ShowIncomingOrderDlg>
    <Tree
      :value="getWorkingOrdersToDisplayAsTree"
      selectionMode="single"
      @node-select="onNodeSelect"
    >
      <template #default="slotProps">
        <b>{{ slotProps.node.type }}, №{{ slotProps.node.orderNum || '?' }}</b>,
        {{ slotProps.node.orderTitle || '?' }},
        от {{ slotProps.node.time }}
        <a
          class="dy58-send-status-btn"
          @click="() => showOrderInfo(slotProps.node.key)"
          v-tooltip="'Подробнее'"
        >
          ...
        </a>
      </template>
    </Tree>
  </div>
</template>


<script>
  import { mapGetters } from 'vuex';
  import { getLocaleDateTimeString } from '../additional/dateTimeConvertions';
  import ShowIncomingOrderDlg from '../components/ShowIncomingOrderDlg';

  export default {
    name: 'dy58-orders-in-work-tree',

    components: {
      ShowIncomingOrderDlg,
    },

    data() {
      return {
        startDateToGetData: new Date(),
        showIncomingOrderDlg: false,
        chosenOrder: null,
      };
    },

    computed: {
      ...mapGetters([
        'getWorkingOrdersToDisplayAsTree',
      ]),
    },

    methods: {
      getLocDateTimeString(datetime) {
        return getLocaleDateTimeString(datetime, true);
      },

      showOrderInfo() {
        this.showIncomingOrderDlg = true;
      },

      hideOrderInfo() {
        this.showIncomingOrderDlg = false;
      },

      onNodeSelect(node) {
        this.chosenOrder = node;
      },
    },
  }
</script>
