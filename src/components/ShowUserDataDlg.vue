<template>
  <Dialog
    header="Информация о текущем пользователе"
    v-model:visible="dlgVisible"
    style="width:auto; maxWidth:50%"
    :modal="true"
    @hide="closeDialog"
  >
    <p><span class="p-text-bold">Фамилия:</span> &#160; {{ getUserSurname || '?' }}</p>
    <p><span class="p-text-bold">Имя:</span> &#160; {{ getUserName || '?' }}</p>
    <p><span class="p-text-bold">Отчество:</span> &#160; {{ getUserFatherName || '?' }}</p>
    <p><span class="p-text-bold">Должность:</span> &#160; {{ getUserPost || '?' }}</p>
    <p><span class="p-text-bold">Служба:</span> &#160; {{ getUserService || '?' }}</p>
    <p><span class="p-text-bold">Полномочие:</span> &#160; {{ getUserCredential || '?' }}</p>
    <p>
      <span class="p-text-bold">Рабочий полигон:</span> &#160;
      {{ getUserWorkPoligon ? getUserWorkPoligon.type : '?' }} &#160;
      {{ getUserWorkPoligonName }}
    </p>
    <p><span class="p-text-bold">Время последнего приема дежурства:</span> &#160; {{ getUserLastTakeDutyTimeString }}</p>
    <p><span class="p-text-bold">Время последней сдачи дежурства:</span> &#160; {{ getUserLastPassDutyTimeString }}</p>
    <p><span class="p-text-bold">Время входя в систему:</span> &#160; {{ getUserLoginDateTimeString }}</p>

    <template #footer>
      <Button label="Закрыть" @click="closeDialog" />
    </template>
  </Dialog>
</template>


<script>
  import { mapGetters } from 'vuex';
  import { getLocaleDateTimeString } from '../additional/dateTimeConvertions';

  export default {
    name: 'dy58-user-info-dialog',

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
        'getUserPost',
        'getUserName',
        'getUserSurname',
        'getUserFatherName',
        'getUserService',
        'getUserCredential',
        'getUserWorkPoligon',
        'getUserWorkPoligonName',
        'getLoginDateTime',
        'getLastTakeDutyTime',
        'getLastPassDutyTime',
      ]),

      getUserLoginDateTimeString() {
        return this.getLoginDateTime ? getLocaleDateTimeString(this.getLoginDateTime, true) : '?';
      },

      getUserLastTakeDutyTimeString() {
        return this.getLastTakeDutyTime ? getLocaleDateTimeString(this.getLastTakeDutyTime, true) : '?';
      },

      getUserLastPassDutyTimeString() {
        return this.getLastPassDutyTime ? getLocaleDateTimeString(this.getLastPassDutyTime, true) : '?';
      },
    },

    watch: {
      showDlg: function (val) {
        this.dlgVisible = val;
      },
    },

    methods: {
      closeDialog() {
        this.$emit('close');
      },
    },
  };
</script>


<style scoped>
</style>
