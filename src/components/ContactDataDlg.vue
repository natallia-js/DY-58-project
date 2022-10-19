<template>
  <Dialog
    header="Контактные данные"
    v-model:visible="dlgVisible"
    style="width:auto; maxWidth:800px"
    :modal="true"
    @hide="handleCloseDialog"
  >
    <div class="p-grid p-mb-4">
      <div class="p-text-bold">
        Семенова Елена Александровна
      </div>
      <div class="p-pl-2">
        <span class="p-text-italic">телефон:</span> 7-400-38-12
        <span class="p-text-italic">городской:</span> 8-0232-95-38-12
        <span class="p-text-italic">e-mail:</span> semionova@ktc.rw
      </div>
    </div>
    <div class="p-grid">
      <div class="p-text-bold">
        Черепковская Ирина Викентьевна
      </div>
      <div class="p-pl-2">
        <span class="p-text-italic">телефон:</span> 7-400-38-12
        <span class="p-text-italic">городской:</span> 8-0232-95-38-12
        <span class="p-text-italic">e-mail:</span> cherepkovskaya@ktc.rw
      </div>
    </div>
    <template #footer>
      <Button label="Закрыть" @click="handleCloseDialog" />
    </template>
  </Dialog>
</template>


<script>
  export default {
    name: 'dy58-contact-data-dialog',

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

    watch: {
      showDlg: function (val) {
        this.dlgVisible = val;
      },
    },

    methods: {
      handleCloseDialog() {
        this.$emit('close');
      },
    },
  };
</script>
