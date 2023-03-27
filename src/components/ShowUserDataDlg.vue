<template>
  <Dialog
    header="Информация о текущем пользователе"
    v-model:visible="dlgVisible"
    style="width:auto; maxWidth:800px"
    :modal="true"
    @hide="closeDialog"
  >
    <p style="textAlign:center" class="p-text-bold p-text-uppercase p-mb-2">
      {{ ifUserWorksOffline ? 'не в сети' : isUserOnDuty ? 'на дежурстве' : 'не на дежурстве' }}
    </p>
    <p><span class="p-text-bold">Фамилия:</span> &#160; {{ getUserSurname || '?' }}</p>
    <p><span class="p-text-bold">Имя:</span> &#160; {{ getUserName || '?' }}</p>
    <p><span class="p-text-bold">Отчество:</span> &#160; {{ getUserFatherName || '?' }}</p>
    <p><span class="p-text-bold">Должность:</span> &#160; {{ getUserPost || '?' }}</p>
    <p><span class="p-text-bold">Служба:</span> &#160; {{ getUserService || '?' }}</p>
    <p><span class="p-text-bold">Служба шаблонов документов:</span> &#160; {{ getUserOrderPatternsService || '?' }}</p>
    <p><span class="p-text-bold">Полномочие:</span> &#160; {{ getUserCredential || '?' }}</p>
    <p>
      <span class="p-text-bold">Рабочий полигон:</span> &#160;
      {{ getUserWorkPoligon ? getUserWorkPoligon.type : '?' }}
      {{ getUserWorkPoligonName() }}
    </p>
    <p><span class="p-text-bold">Время последнего приема дежурства:</span> &#160; {{ getUserLastTakeDutyTimeString }}</p>
    <p><span class="p-text-bold">Время последней сдачи дежурства:</span> &#160; {{ getUserLastPassDutyTimeString }}</p>
    <p><span class="p-text-bold">Время входа в систему:</span> &#160; {{ getUserLoginDateTimeString }}</p>

    <template #footer>
      <Button label="Закрыть" @click="closeDialog" />
    </template>
  </Dialog>
</template>


<script>
  import { mapGetters } from 'vuex';
  import { getLocaleDateTimeString } from '@/additional/dateTimeConvertions';

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
        'isUserOnDuty',
        'ifUserWorksOffline',
        'getUserPost',
        'getUserName',
        'getUserSurname',
        'getUserFatherName',
        'getUserService',
        'getUserOrderPatternsService',
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
