<template>
  <Dialog
    header="Информация о входящем уведомлении"
    v-model:visible="dlgVisible"
    style="width:auto; maxWidth:50%"
    :modal="true"
    @hide="closeDialog"
  >
    <p><span class="p-text-bold">Отправитель:</span> &#160;
      {{ (order && order.place) ? order.place : '?' }} &#160;
      {{ (order && order.post) ? order.post : '?' }} &#160;
      {{ (order && order.fio) ? order.fio : '?' }}
    </p>
    <p><span class="p-text-bold">Номер:</span> &#160; {{ (order && order.orderNum) ? order.orderNum : '?' }}</p>
    <p><span class="p-text-bold">Время издания:</span> &#160; {{ (order && order.time) ? order.time : '?' }}</p>
    <p><span class="p-text-bold">Наименование:</span> &#160; {{ (order && order.orderTitle) ? order.orderTitle : '?' }}</p>
    <p><span class="p-text-bold">Текст:</span>
      <br />
      {{ (order && order.orderText) ? order.orderText : '?' }}</p>
    <template #footer>
      <Button label="Подтвердить" @click="confirmOrder" />
      <Button label="Закрыть" @click="closeDialog" />
    </template>
  </Dialog>
</template>


<script>
  import { mapGetters } from 'vuex';

  export default {
    name: 'dy58-show-incoming-order-dialog',

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
      order: {
        type: Object,
      },
    },

    computed: {
      ...mapGetters([
        'getIncomingOrder',
      ]),
    },

    watch: {
      showDlg: function (val) {
        this.dlgVisible = val;
      },
    },

    methods: {
      confirmOrder() {
        if (this.order) {
          this.$store.dispatch('confirmOrder', { orderId: this.order.id });
        }
        this.closeDialog();
      },

      closeDialog() {
        this.$emit('close');
        this.dlgVisible = false;
      },
    },
  };
</script>


<style scoped>
</style>
