<template>
  <Dialog
    header="Информация о текущем пользователе"
    v-model:visible="dlgVisible"
    :style="{ width: 'auto' }"
    :modal="true"
    @hide="closeDialog"
  >
    <p><span class="p-text-bold">Фамилия:</span> {{ getUserSurname || 'Не определена' }}</p>
    <p><span class="p-text-bold">Имя:</span> {{ getUserName || 'Не определено' }}</p>
    <p><span class="p-text-bold">Отчество:</span> {{ getUserFatherName || 'Не определено' }}</p>
    <p><span class="p-text-bold">Должность:</span> {{ getUserPost || 'Не определена' }}</p>
    <p><span class="p-text-bold">Служба:</span> {{ getUserService || 'Не определена' }}</p>
    <p><span class="p-text-bold">Полномочие:</span> {{ getUserCredential || 'Не определено' }}</p>
    <p><span class="p-text-bold">Рабочий полигон:</span> {{ getUserWorkPoligon || 'Не определен' }}</p>

    <template #footer>
      <Button label="Закрыть" @click="closeDialog" autofocus />
    </template>
  </Dialog>
</template>


<script>
  import { mapGetters } from 'vuex';

  export default {
    name: 'dy58-user-info-dialog',

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
        'getUserPost',
        'getUserName',
        'getUserSurname',
        'getUserFatherName',
        'getUserService',
        'getUserCredential',
        'getUserWorkPoligon',
      ]),
    },

    watch: {
      showDlg: function (val) {
        this.dlgVisible = val;
      },
    },

    methods: {
      closeDialog() {
        this.$emit('close');
        this.dlgVisible = false;
      },
    },
  };
</script>


<style scoped>
</style>
