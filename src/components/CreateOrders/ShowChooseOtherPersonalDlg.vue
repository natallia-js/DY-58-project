<template>
  <Dialog
    :header="`Выберите получателя ${sectorName || ''}`"
    v-model:visible="dlgVisible"
    style="width:auto; maxWidth:500px"
    :modal="true"
    @hide="closeDialog"
  >
    <Listbox
      v-model="selectedUser"
      :options="personal"
      optionValue="value"
      optionLabel="label"
      :multiple="false"
    >
      <template #option="slotProps">
        <div v-on:dblclick="() => chooseUser(slotProps.option.value)">
          <span>{{ slotProps.option.label }}</span>
        </div>
      </template>
    </Listbox>
    <template #footer>
      <Button
        v-if="selectedUser && (!selectedPerson || selectedPerson === -1 || selectedUser !== selectedPerson)"
        v-tooltip="'Выбрать'"
        icon="pi pi-check"
        @click="chooseUser"
        class="p-mt-2 p-button p-p-1"
      />
      <Button
        v-if="selectedPerson && selectedPerson !== -1"
        v-tooltip="'Отменить текущий выбор'"
        icon="pi pi-times"
        @click="unChooseUser"
        class="p-mt-2 p-button p-p-1"
      />
      <Button label="Отмена" @click="closeDialog" class="p-mt-2" />
    </template>
  </Dialog>
</template>


<script>
  import { mapGetters } from 'vuex';
  import {
    REWRITE_OTHER_GET_ORDER_RECORD,
    DEL_OTHER_GET_ORDER_RECORD_BY_ADDITIONAL_ID,
    SET_GET_ORDER_STATUS_TO_DEFINIT_OTHER_SHIFT,
  } from '@/store/mutation-types';
  import { CurrShiftGetOrderStatus } from '@/constants/orders';

  export default {
    name: 'dy58-choose-other-personal-dialog',

    emits: ['input','close'],

    data() {
      return {
        dlgVisible: false,
        selectedUser: null,
      };
    },

    props: {
      showDlg: {
        type: Boolean,
        required: true,
      },
      personal: {
        type: Array,
        required: true,
      },
      selectedPerson: {
        type: Number,
        required: false,
      },
      sectorName: {
        type: String,
      },
    },

    computed: {
      ...mapGetters([
        'getStructuralDivisions',
      ]),
    },

    watch: {
      showDlg: function(val) {
        this.dlgVisible = val;
        if (val) {
          this.selectedUser = this.selectedPerson;
        }
      },
    },

    methods: {
      chooseUser(userId) {
        const id = this.selectedUser || userId;
        if (id) {
          const person = this.getStructuralDivisions.find((el) => el.additionalId === id);
          if (person) {
            this.$store.commit(REWRITE_OTHER_GET_ORDER_RECORD, { ...person, existingStructuralDivision: true });
            const otherId = this.$store.getters.getOtherPersonId(person.placeTitle, person.additionalId);
            if (otherId) {
              this.$store.commit(SET_GET_ORDER_STATUS_TO_DEFINIT_OTHER_SHIFT,
                { otherId, getOrderStatus: CurrShiftGetOrderStatus.sendOriginal });
            }
          }
        }
        this.closeDialog();
      },

      unChooseUser() {
        this.$store.commit(DEL_OTHER_GET_ORDER_RECORD_BY_ADDITIONAL_ID, this.selectedPerson);
        this.selectedUser = null;
        this.closeDialog();
      },

      closeDialog() {
        this.$emit('close');
      },
    },
  };
</script>
