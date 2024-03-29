<template>
  <Dialog
    :header="dlgTitle"
    v-model:visible="dlgVisible"
    style="width:auto; maxWidth:800px"
    :modal="true"
    @hide="closeDialog"
  >
    <p class="p-text-bold p-text-uppercase" style="text-align:center">
      {{ (order && order.sendOriginal) ? 'Оригинал' : 'Копия' }}
    </p>
    <p class="p-text-bold p-text-capitalize" style="text-align:center">
      {{ (order && order.time) ? order.time : '?' }} &#160;
      {{ (order && order.type) ? order.type : '?' }} &#160;
      {{ (order && order.orderNum) ? '№ ' + order.orderNum : '№ ?' }}
    </p>
    <p style="text-align:center;overflow-wrap:break-word">
      {{ (order && order.orderTitle) ? order.orderTitle : '?' }}
    </p>
    <p v-if="order && order.specialTrainCategories && order.specialTrainCategories.length">
      Особые отметки: &#160; {{ order.specialTrainCategories.join(', ') }}
    </p>
    <p v-if="order" style="overflow-wrap:break-word">
      <span v-html="order.orderText"></span>
    </p>
    <p>Передал: &#160;
      {{ (order && order.post) ? order.post : '?' }} &#160;
      {{ (order && order.fio) ? order.fio : '?' }} &#160;
      {{ (order && order.place) ? order.place : '?' }}
    </p>
    <p>
      <span class="p-text-bold">Утверждение:</span> &#160;
      {{ (order && order.assertDateTime) ? order.assertDateTime : '?' }}
    </p>
    <template #footer>
      <Button
        v-if="canUserConfirmOrder && orderNeedsToBeConfirmed && !orderIsBeingConfirmed"
        label="Подтвердить"
        @click="confirmOrder"
      />
      <span
        v-if="orderNeedsToBeConfirmed && orderIsBeingConfirmed"
        class="p-mr-2"
      >
        Документ подтверждается...
      </span>
      <Button class="p-button-secondary" label="Закрыть" @click="closeDialog" />
    </template>
  </Dialog>
</template>


<script>
  import { mapGetters } from 'vuex';
  import { CONFIRM_ORDER_ACTION } from '@/store/action-types';

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
      orderIsBeingConfirmed: {
        type: Boolean,
        required: true,
      },
    },

    computed: {
      ...mapGetters([
        'canUserConfirmOrder',
        'getLastDNC_ECDTakeDutyOrderAdditionalWorkers',
      ]),
    },

    watch: {
      showDlg: function (val) {
        this.dlgVisible = val;
      },

      /**
       * Может оказаться такая ситуация. Пользователь нажал кнопку "Подтвердить", окно автоматически закрылось,
       * но процесс подтверждения еще не завершился. Пользователь повторно открывает окно с информацией о
       * распоряжении, видит надпись "Документ подтверждается...". И тут вдруг процесс подтверждения
       * завершается успешно. Если бы не было кода ниже, то по окончании процесса подтверждения (успешно)
       * диалоговое окно оказалось бы висеть с одними вопросами вместо информации о распоряжении, ведь
       * распоряжения уже в таблице входящих уведомлений нет.
       */
      order: function (val) {
        if (!val) {
          this.closeDialog();
        }
      },
    },

    methods: {
      confirmOrder() {
        if (this.order && this.orderNeedsToBeConfirmed && !this.orderIsBeingConfirmed) {
          this.$store.dispatch(CONFIRM_ORDER_ACTION, {
            orderId: this.order.id,
            additionalConfirmPeople: this.getLastDNC_ECDTakeDutyOrderAdditionalWorkers,
          });
        }
        this.closeDialog();
      },

      closeDialog() {
        this.$emit('close');
      },
    },
  };
</script>
