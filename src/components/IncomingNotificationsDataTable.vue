<template>
  <div>
    <DataTable
      :value="getIncomingNotifications"
      class="p-datatable-gridlines p-datatable-sm"
      :rowHover="true"
      :scrollable="true" scrollHeight="110px"
    >
      <template #header>
        <div class="dy58-table-title">
          Входящие {{ showNotificationsForDSP() ? 'документы' : 'уведомления' }}
        </div>
        <p class="dy58-table-upper-comment">Количество записей: {{ getIncomingNotificationsNumber }}</p>
      </template>

      <Column v-for="col of getInputMessTblColumns"
        :field="col.field"
        :header="col.title"
        :key="col.field"
        :headerStyle="{ width: col.width }"
        headerClass="dy58-table-header-cell-class"
        :bodyStyle="{ width: col.width }"
        bodyClass="dy58-table-content-cell-class"
      >
        <template #body="slotProps">
          <span v-if="col.field !== getInputMessTblColumnsTitles.state"
          >
            {{ slotProps.data[col.field] }}
          </span>
          <img v-if="col.field === getInputMessTblColumnsTitles.state"
            :src="slotProps.data[col.field] === getIncomingNotificationsStates.cameRecently ? require('../assets/img/hourglass_black.png') :
                  (slotProps.data[col.field] === getIncomingNotificationsStates.cameLongAgo ? require('../assets/img/hourglass_red.png') : '')"
            :alt="slotProps.data[col.field]"
            class="dy58-order-state-img-style"
          />
        </template>
      </Column>
    </DataTable>
  </div>

</template>


<script>
  import { mapGetters } from 'vuex';
  import {
    IncomingNotificationsStates,
    InputMessTblColumnsTitles,
    InputMessTblColumns
  } from '../store/modules/incomingNotifications';
  import { APP_CREDENTIALS } from '../constants/appCredentials';
  import { filterObj } from '../additional/filterObject';

  export default {
    name: 'dy58-incoming-notifications-data-table',

    computed: {
      ...mapGetters([
        'getIncomingNotifications',
        'getIncomingNotificationsNumber',
        'getUserCredential',
      ]),

      getIncomingNotificationsStates() {
        return IncomingNotificationsStates;
      },

      getInputMessTblColumnsTitles() {
        if (this.showNotificationsForDSP()) {
          return InputMessTblColumnsTitles;
        }
        return filterObj(InputMessTblColumnsTitles, (key) => key !== 'title');
      },

      getInputMessTblColumns() {
        if (this.showNotificationsForDSP()) {
          return InputMessTblColumns;
        }
        return InputMessTblColumns.filter(col => col.field !== InputMessTblColumnsTitles.orderText);
      },
    },

    mounted() {
      this.$store.commit('setIncomingNotifications', []);
    },

    methods: {
      showNotificationsForDSP() {
        return this.getUserCredential === APP_CREDENTIALS.DSP_FULL;
      },
    },
  }
</script>


<style scoped>
</style>
