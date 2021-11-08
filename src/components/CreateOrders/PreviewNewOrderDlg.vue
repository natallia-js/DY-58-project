<template>
  <Dialog
    header="Предварительный просмотр"
    v-model:visible="dlgVisible"
    style="width:auto; maxWidth:50%"
    :modal="true"
    @hide="closeDialog"
  >
    <p style="textAlign:center" class="p-text-bold p-text-uppercase">{{ type ? type : '?' }}</p>
    <p><span class="p-text-bold">Номер:</span> &#160; {{ number ? number : '?' }}</p>
    <p><span class="p-text-bold">Время издания:</span> &#160; {{ getCurrDateTimeString }}</p>
    <p v-if="prevRelatedOrder"><span class="p-text-bold">На распоряжение:</span> &#160;
      №{{ prevRelatedOrder.number }} от {{ prevRelatedOrderCreateDateTime }} -
      {{ prevRelatedOrder.orderText ? prevRelatedOrder.orderText.orderTitle : '?' }}
    </p>
    <p v-if="place"><span class="p-text-bold">Место действия:</span> &#160;
      {{ getSectorStationOrBlockTitleById({ placeType: place.place, id: place.value }) }}
    </p>
    <p><span class="p-text-bold">Время действия:</span> &#160;
      {{ timeSpan ? orderTimeSpanString : 'Время издания' }}
    </p>
    <p><span class="p-text-bold">Наименование:</span> &#160;
      {{ (orderText && orderText.orderTitle) ? orderText.orderTitle : '?' }}
    </p>
    <p>
      <span class="p-text-bold">Текст:</span>
      <br />
      <span v-html="getOrderText"></span>
    </p>
    <p><span class="p-text-bold">Издатель:</span> &#160;
      {{ getUserPostFIO }}<span v-if="createdOnBehalfOf"> (от имени {{ createdOnBehalfOf }})</span>
    </p>
    <template #footer>
      <Button label="Издать" @click="dispatchOrder" />
      <Button label="Отмена" @click="closeDialog" />
    </template>
  </Dialog>
</template>


<script>
  import { getLocaleDateTimeString, getTimeSpanString } from '../../additional/dateTimeConvertions';
  import { formOrderText } from '../../additional/formOrderText';
  import { mapGetters } from 'vuex';

  export default {
    name: 'dy58-preview-new-order-dialog',

    emits: ['close', 'dispatch'],

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
      type: {
        type: String,
        required: true,
      },
      number: {
        type: Number,
        required: true,
      },
      prevRelatedOrder: {
        type: Object,
        required: false,
      },
      place: {
        type: Object,
        required: false,
      },
      timeSpan: {
        type: Object,
        required: false,
      },
      orderText: {
        type: Object,
        required: true,
      },
      dncToSend: {
        type: Array,
        required: false,
      },
      dspToSend: {
        type: Array,
        required: false,
      },
      ecdToSend: {
        type: Array,
        required: false,
      },
      otherToSend: {
        type: Array,
        required: false,
      },
      createdOnBehalfOf: {
        type: String,
        required: false,
      },
    },

    computed: {
      ...mapGetters([
        'getCurrDateTimeString',
        'getSectorStationOrBlockTitleById',
        'getUserPostFIO',
      ]),

      getOrderText() {
        if (this.orderText && this.orderText.orderText) {
          return formOrderText({
            orderTextArray: this.orderText.orderText,
            dncToSend: (!this.dncToSend || !this.dncToSend.length) ? [] : this.dncToSend.map((el) => ({ ...el, placeTitle: el.sector })),
            dspToSend: (!this.dspToSend || !this.dspToSend.length) ? [] : this.dspToSend.map((el) => ({ ...el, placeTitle: el.station })),
            ecdToSend: (!this.ecdToSend || !this.ecdToSend.length) ? [] : this.ecdToSend.map((el) => ({ ...el, placeTitle: el.sector })),
            otherToSend: this.otherToSend,
          });
        }
        return '?';
      },

      prevRelatedOrderCreateDateTime() {
        return this.prevRelatedOrder ? getLocaleDateTimeString(this.prevRelatedOrder.createDateTime, false) : null;
      },

      orderTimeSpanString() {
        return this.timeSpan ? getTimeSpanString(this.timeSpan) : '?';
      },
    },

    watch: {
      showDlg: function (val) {
        this.dlgVisible = val;
      },
    },

    methods: {
      dispatchOrder() {
        this.$emit('dispatch');
        this.closeDialog();
      },

      closeDialog() {
        this.$emit('close');
        this.dlgVisible = false;
      },
    },
  };
</script>
