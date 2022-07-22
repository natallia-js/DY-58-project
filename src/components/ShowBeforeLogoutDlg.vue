<template>
  <Dialog
    header="Выход из системы"
    v-model:visible="dlgVisible"
    style="width:auto; maxWidth:800px"
    :modal="true"
    @hide="handleCloseDialog"
  >
    <div v-if="!isLogoutProcessUnderway">
      <span v-if="!getlogoutWithDutyPass">Вы уверены, что хотите выйти из системы?</span>
      <span v-else>Вы уверены, что хотите выйти из системы со сдачей дежурства?</span>
      <br/>
      <div v-if="getLogoutError" class="dy58-bold-error-message">
        {{ getLogoutError }}
      </div>
    </div>
    <div v-else>
      <span>Идет процесс выхода из системы...</span>
    </div>
    <template #footer>
      <Button v-if="!isLogoutProcessUnderway" label="Выйти" @click="handleConfirmLogout" />
      <Button v-if="!isLogoutProcessUnderway" label="Отмена" class="p-button-secondary" @click="handleCloseDialog" />
    </template>
  </Dialog>
</template>


<script>
  import { mapGetters } from 'vuex';
  import { CANCEL_LOGOUT } from '@/store/mutation-types';
  import { LOGOUT_ACTION } from '@/store/action-types';

  export default {
    name: 'dy58-show-before-logout-dialog',

    emits: ['close'],

    data() {
      return {
        dlgVisible: false,
      };
    },

    props: {
      showDlg: {
        type: Boolean,
        required: true,
      },
    },

    computed: {
      ...mapGetters([
        'getlogoutWithDutyPass',
        'isLogoutProcessUnderway',
        'getLogoutError',
      ]),
    },

    watch: {
      showDlg: function (val) {
        this.dlgVisible = val;
        if (!val) {
          this.$store.commit(CANCEL_LOGOUT);
        }
      },

      isLogoutProcessUnderway: function (val, prevVal) {
        if (!val && prevVal && !this.getLogoutError) {
          this.$router.push({ name: 'AuthPage' });
          this.handleCloseDialog();
        }
      },
    },

    methods: {
      handleConfirmLogout() {
        this.$store.dispatch(LOGOUT_ACTION, { onlyLocally: this.$store.getters.ifUserWorksOffline });
      },

      handleCloseDialog() {
        this.$emit('close');
      },
    },
  };
</script>
