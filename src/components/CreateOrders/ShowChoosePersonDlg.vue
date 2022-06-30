<template>
  <Dialog
    :header="`Выберите получателя, ${sectorName || ''}`"
    v-model:visible="dlgVisible"
    style="width:auto; maxWidth:500px"
    :modal="true"
    @hide="closeDialog"
  >
    <Listbox
      v-model="selectedUser"
      :options="personal"
      optionLabel="postFio"
      :multiple="false"
    >
      <template #option="slotProps">
        <div>
          <span>{{ slotProps.option.postFio }}</span>
        </div>
      </template>
    </Listbox>
    <template #footer>
      <Button
        v-if="selectedUser && (!selectedPerson || selectedUser.id !== selectedPerson.id)"
        label="Выбрать"
        @click="chooseUser"
        class="p-mt-2"
      />
      <Button v-if="selectedPerson" label="Отменить текущий выбор" @click="unChooseUser" class="p-mt-2" />
      <Button label="Отмена" @click="closeDialog" class="p-mt-2" />
    </template>
  </Dialog>
</template>


<script>
  import { SET_USER_CHOSEN_STATUS } from '@/store/mutation-types';

  export default {
    name: 'dy58-choose-person-dialog',

    emits: ['close'],

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
        type: Object,
        required: false,
      },
      sectorId: {
        type: Number,
        required: true,
      },
      sectorName: {
        type: String,
      },
      workPoligonType: {
        type: String,
        required: true,
      },
    },

    watch: {
      showDlg: function (val) {
        this.dlgVisible = val;
        if (val) {
          this.selectedUser = this.selectedPerson;
        }
      },
    },

    methods: {
      chooseUser() {
        this.$store.commit(SET_USER_CHOSEN_STATUS, {
          userId: this.selectedUser.id,
          chooseUser: true,
          workPoligonType: this.workPoligonType,
          workPoligonId: this.sectorId,
        });
        this.closeDialog();
      },

      unChooseUser() {
        this.$store.commit(SET_USER_CHOSEN_STATUS, {
          userId: this.selectedUser.id,
          chooseUser: false,
          workPoligonType: this.workPoligonType,
          workPoligonId: this.sectorId,
        });
        this.selectedUser = null;
        this.closeDialog();
      },

      closeDialog() {
        this.$emit('close');
      },
    },
  };
</script>
