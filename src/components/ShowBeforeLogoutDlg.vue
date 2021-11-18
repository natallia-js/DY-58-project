<template>
  <Dialog
    header="Выход из системы"
    v-model:visible="dlgVisible"
    style="width:auto; maxWidth:50%"
    :modal="true"
    @hide="handleCloseDialog"
  >
    <div v-if="!getLogoutStarted && !getLogoutFinished">
      <span v-if="!getlogoutWithDutyPass">Вы уверены, что хотите выйти из системы?</span>
      <span v-else-if="getlogoutWithDutyPass">Вы уверены, что хотите выйти из системы со сдачей дежурства?</span>
    </div>
    <div v-else-if="getLogoutStarted && !getLogoutFinished">
      <span>Идет процесс выхода из системы...</span>
    </div>
    <div v-else-if="getLogoutError" style="color:red;fontSize:1rem;fontWeight:500">
      {{ getLogoutError }}
    </div>
    <template #footer>
      <Button v-if="!getLogoutStarted && !getLogoutFinished" label="Выйти" @click="handleConfirmLogout" />
      <Button v-if="(!getLogoutStarted && !getLogoutFinished) || getLogoutError" label="Закрыть" @click="handleCloseDialog" />
    </template>
  </Dialog>
</template>


<script>
  import { mapGetters } from 'vuex';

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
        'getLogoutStarted',
        'getLogoutFinished',
        'getLogoutError',
      ]),
    },

    watch: {
      showDlg: function (val) {
        this.dlgVisible = val;
        if (!val) {
          this.$store.commit('cancelLogout');
          //this.handleCloseDialog();
        }
      },

      getLogoutFinished: function (val) {
        if (val && !this.getLogoutError) {
          this.$router.push({ name: 'AuthPage' });
          this.handleCloseDialog();
        }
      },
    },

    methods: {
      handleConfirmLogout() {
        this.$store.commit('logout');
      },

      handleCloseDialog() {
        this.$emit('close');
        //this.dlgVisible = false;
      },
    },
  };
</script>
