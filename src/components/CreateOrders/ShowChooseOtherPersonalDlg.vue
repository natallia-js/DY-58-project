<template>
  <Dialog
    :header="`Выберите получателей ${sectorName || ''}`"
    v-model:visible="dlgVisible"
    style="width:500px"
    :modal="true"
    @hide="closeDialog"
  >
    <MultiSelect
      style="width:100%"
      :options="personal"
      optionLabel="label"
      optionValue="value"
      dataKey="value"
      v-model="selectedPeople"
    />
    <template #footer>
      <Button
        v-if="selectedPeople"
        label="Выбрать"
        @click="choosePeople"
        class="p-mt-2"
      />
      <Button label="Отмена" @click="closeDialog" class="p-mt-2" />
    </template>
  </Dialog>
</template>


<script>
  export default {
    name: 'dy58-choose-other-personal-dialog',

    emits: ['input','close'],

    data() {
      return {
        dlgVisible: false,
        dataToSelect: null,
        selectedPeople: null,
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
      prevSelectedPeople: {
        type: Array,
        required: false,
      },
      sectorName: {
        type: String,
      },
    },

    watch: {
      showDlg: function(val) {
        this.dlgVisible = val;
        if (val) {
          this.selectedPeople = this.prevSelectedPeople;
        }
      },
    },

    methods: {
      choosePeople() {
        this.$emit('input', this.selectedPeople);
        this.closeDialog();
      },

      closeDialog() {
        this.$emit('close');
      },
    },
  };
</script>
