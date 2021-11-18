<template>
  <Dialog
    :header="`Выбор получателя среди ${personalPost} ${sector}`"
    v-model:visible="dlgVisible"
    style="width:auto; maxWidth:50%"
    :modal="true"
    @hide="closeDialog"
  >
    <Listbox v-model="selectedUser" :options="personal" optionLabel="fio" :multiple="false">
      <template #option="slotProps">
        <div>
          <span :class="{'dy58-info': slotProps.option.online}">{{ slotProps.option.fio }}</span>
        </div>
      </template>
    </Listbox>
    <template #footer>
      <Button
        v-if="selectedUser && (!selectedPerson || selectedUser.id !== selectedPerson.id)"
        label="Выбрать"
        @click="chooseUser"
      />
      <Button v-if="selectedPerson" label="Отменить текущий выбор" @click="unChooseUser" />
      <Button label="Отмена" @click="closeDialog" />
    </template>
  </Dialog>
</template>


<script>
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
      personalPost: {
        type: String,
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
      sector: {
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
        this.$store.commit('setUserChosenStatus', { userId: this.selectedUser.id, chooseUser: true });
        this.closeDialog();
      },

      unChooseUser() {
        this.$store.commit('setUserChosenStatus', { userId: this.selectedUser.id, chooseUser: false });
        this.selectedUser = null;
        this.closeDialog();
      },

      closeDialog() {
        this.$emit('close');
        //this.dlgVisible = false;
      },
    },
  };
</script>
