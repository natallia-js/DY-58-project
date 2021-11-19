<template>
  <Dialog
    :header="dlgTitle"
    v-model:visible="dlgVisible"
    style="width:auto; maxWidth:50%"
    :modal="true"
    @hide="closeDialog"
  >
    <p style="textAlign:center" class="p-mb-2">
      <span class="p-text-bold">{{(order && order.sendOriginal) ? 'Оригинал' : 'Копия'}}</span>
    </p>
    <p><span class="p-text-bold">Отправитель:</span> &#160;
      {{ (order && order.place) ? order.place : '?' }} &#160;
      {{ (order && order.post) ? order.post : '?' }} &#160;
      {{ (order && order.fio) ? order.fio : '?' }}
    </p>
    <p><span class="p-text-bold">Тип:</span> &#160; {{ (order && order.type) ? order.type : '?' }}</p>
    <p><span class="p-text-bold">Номер:</span> &#160; {{ (order && order.orderNum) ? order.orderNum : '?' }}</p>
    <p><span class="p-text-bold">Время издания:</span> &#160; {{ (order && order.time) ? order.time : '?' }}</p>
    <p><span class="p-text-bold">Время действия:</span> &#160; {{ (order && order.timeSpan) ? order.timeSpan : '?' }}</p>
    <p><span class="p-text-bold">Наименование:</span> &#160; {{ (order && order.orderTitle) ? order.orderTitle : '?' }}</p>
    <p>
      <span class="p-text-bold">Текст:</span>
      <br />
      <span v-if="order" v-html="order.orderText"></span>
    </p>
    <template #footer>
      <Button v-if="orderNeedsToBeConfirmed" label="Подтвердить" @click="confirmOrder" />
      <Button label="Закрыть" @click="closeDialog" />
    </template>
  </Dialog>
</template>


<script>
  export default {
    name: 'dy58-show-incoming-order-dialog',

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
      dlgTitle: {
        type: String,
        required: true,
      },
      order: {
        type: Object,
      },
      orderNeedsToBeConfirmed: {
        type: Boolean,
        required: true,
      },
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
      },
    },
  };
</script>
