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
    </div>
    <div v-else-if="isLogoutProcessUnderway">
      <span>Идет процесс выхода из системы...</span>
    </div>
    <div v-else-if="getLogoutError" style="color:red;fontSize:1rem;fontWeight:500">
      {{ getLogoutError }}
    </div>
    <template #footer>
      <Button v-if="!isLogoutProcessUnderway" label="Выйти" @click="handleConfirmLogout" />
      <Button v-if="!isLogoutProcessUnderway" label="Отмена" @click="handleCloseDialog" />
    </template>
  </Dialog>
</template>


<script>
  import { mapGetters } from 'vuex';
  import { CANCEL_LOGOUT } from '@/store/mutation-types';

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

      isLogoutProcessUnderway: function (val, prevVal) {console.log('here')
        if (!val && prevVal && !this.getLogoutError) {
          this.$router.push({ name: 'AuthPage' });
          this.handleCloseDialog();
        }
      },
    },

    methods: {
      handleConfirmLogout() {
        this.$store.dispatch('logout');
      },

      handleCloseDialog() {
        this.$emit('close');
      },
    },
  };
</script>
