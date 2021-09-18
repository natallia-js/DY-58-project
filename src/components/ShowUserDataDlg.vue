<template>
  <Dialog
    header="Информация о текущем пользователе"
    v-model:visible="dlgVisible"
    style="width:auto; maxWidth:50%"
    :modal="true"
    @hide="closeDialog"
  >
    <p><span class="p-text-bold">Фамилия:</span> &#160; {{ getUserSurname || 'Не определена' }}</p>
    <p><span class="p-text-bold">Имя:</span> &#160; {{ getUserName || 'Не определено' }}</p>
    <p><span class="p-text-bold">Отчество:</span> &#160; {{ getUserFatherName || 'Не определено' }}</p>
    <p><span class="p-text-bold">Должность:</span> &#160; {{ getUserPost || 'Не определена' }}</p>
    <p><span class="p-text-bold">Служба:</span> &#160; {{ getUserService || 'Не определена' }}</p>
    <p><span class="p-text-bold">Полномочие:</span> &#160; {{ getUserCredential || 'Не определено' }}</p>
    <p>
      <span class="p-text-bold">Рабочий полигон:</span> &#160;
      {{ getUserWorkPoligon ? getUserWorkPoligon.type : 'Не определен тип' }} &#160;
      {{ getUserWorkPoligonName }}
    </p>

    <template #footer>
      <Button label="Закрыть" @click="closeDialog" />
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
        'getUserWorkPoligonName',
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
