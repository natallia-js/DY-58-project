<template>
  <Dialog
    header="Предварительный просмотр"
    v-model:visible="dlgVisible"
    style="width:auto; maxWidth:800px"
    :modal="true"
    @hide="closeDialog"
  >
    <p class="p-text-center p-text-bold p-text-capitalize p-mb-2">
      {{ getCurrDateTimeString }} &#160; {{ type }} &#160; {{ number ? '№ ' + number : '№ ?' }}
    </p>
    <p v-if="prevRelatedOrder"><span class="p-text-bold">На документ:</span> &#160;
      №{{ prevRelatedOrder.number }} от {{ prevRelatedOrderCreateDateTime }} -
      {{ prevRelatedOrder.orderText ? prevRelatedOrder.orderText.orderTitle : '?' }}
    </p>
    <p v-if="place"><span class="p-text-bold">Место действия:</span> &#160;
      {{ getSectorStationOrBlockTitleById({ placeType: place.place, id: place.value }) }}
    </p>
    <p><span class="p-text-bold">Время действия:</span> &#160; {{ orderTimeSpanString }}</p>
    <p v-if="specialTrainCategories && specialTrainCategories.length">
      <span class="p-text-bold">Особые отметки:</span> &#160; {{ specialTrainCategories.join(', ') }}
    </p>
    <p>
      <span class="p-text-bold">Наименование:</span> &#160;
      {{ (orderText && orderText.orderTitle) ? orderText.orderTitle : '?' }}
    </p>
    <p><span v-html="getOrderText"></span></p>
    <p>Передал: &#160;
      {{ getUserPost }} &#160; {{ getUserFIO }} &#160;
      <span v-if="createdOnBehalfOf">(от имени {{ createdOnBehalfOf }}) &#160; </span>
      {{ getUserWorkPoligonName }}
    </p>
    <template #footer>
      <div v-if="draftId" class="p-mb-2 p-mr-2">
        <Checkbox id="if-del-order-draft" v-model="delOrderDraft" :binary="true" />
        <label for="if-del-order-draft">&#160; Удалить черновик</label>
      </div>
      <Button label="Издать" @click="dispatchOrder" />
      <Button label="Отмена" @click="closeDialog" class="p-button-secondary" />
    </template>
  </Dialog>
</template>


<script>
  import { mapGetters } from 'vuex';
  import { getLocaleDateTimeString, getTimeSpanString } from '@/additional/dateTimeConvertions';
  import { formOrderText } from '@/additional/formOrderText';

  export default {
    name: 'dy58-preview-new-order-dialog',

    emits: ['close', 'dispatch'],

    data() {
      return {
        dlgVisible: false,
        delOrderDraft: true,
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
      specialTrainCategories: {
        type: Array,
      },
      draftId: {
        type: String,
      },
    },

    computed: {
      ...mapGetters([
        'getCurrDateTimeString',
        'getSectorStationOrBlockTitleById',
        'getUserPost',
        'getUserFIO',
        'getUserWorkPoligonName',
        'isECD',
      ]),

      getOrderText() {
        if (this.orderText && this.orderText.orderText) {
          return formOrderText({
            orderTextArray: this.orderText.orderText,
            dncToSend: (!this.dncToSend || !this.dncToSend.length) ? [] : this.dncToSend.map((el) => ({ ...el, placeTitle: el.sector })),
            dspToSend: (!this.dspToSend || !this.dspToSend.length) ? [] : this.dspToSend.map((el) => ({ ...el, placeTitle: el.station })),
            ecdToSend: (!this.ecdToSend || !this.ecdToSend.length) ? [] : this.ecdToSend.map((el) => ({ ...el, placeTitle: el.sector })),
            otherToSend: this.otherToSend,
            insertEmptyLineBeforeText: true,
          });
        }
        return '?';
      },

      prevRelatedOrderCreateDateTime() {
        return this.prevRelatedOrder ? getLocaleDateTimeString(this.prevRelatedOrder.createDateTime, false) : null;
      },

      orderTimeSpanString() {
        if (!this.timeSpan) {
          return 'Время издания';
        }
        return getTimeSpanString(this.type, this.timeSpan, this.isECD, this.specialTrainCategories);
      },
    },

    watch: {
      showDlg: function (val) {
        if (this.dlgVisible !== val)
          this.dlgVisible = val;
        if (this.dlgVisible === true && this.delOrderDraft === false)
          this.delOrderDraft = true;
      },
    },

    methods: {
      dispatchOrder() {
        this.$emit('dispatch', { orderDraftIdToDelete: this.delOrderDraft ? this.draftId : null });
        this.closeDialog();
      },

      closeDialog() {
        this.$emit('close');
      },
    },
  };
</script>
