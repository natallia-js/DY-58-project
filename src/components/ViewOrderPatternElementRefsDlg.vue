<template>
  <Dialog
    :header="`Смысловые значения элемента ${elementType}`"
    v-model:visible="state.dlgVisible"
    style="width:auto; maxWidth:1000px"
    :modal="true"
    @hide="handleCloseDialog"
  >
      <DataTable
        :value="elementRefs"
        class="p-datatable-gridlines p-datatable-sm"
        v-model:expandedRows="state.expandedRows"
        dataKey="_id"
        responsiveLayout="scroll"
      >
        <Column :expander="true" headerStyle="width: 3rem" headerClass="dy58-table-header-cell-class"
        bodyClass="dy58-table-top-content-cell-class" />
        <Column field="refName" header="Наименование" sortable headerClass="dy58-table-header-cell-class"
        bodyClass="dy58-table-top-content-cell-class"></Column>
        <Column field="additionalOrderPlaceInfoForGID" header="Доп. инфо о месте действия для ГИД" sortable headerClass="dy58-table-header-cell-class"
        bodyClass="dy58-table-top-content-cell-class">
          <template #body="slotProps">
            {{slotProps.data.additionalOrderPlaceInfoForGID ? 'Да' : 'Нет'}}
          </template>
        </Column>
        <template #expansion="slotProps">
          <div class="dy58-view-order-pattern-element-refs-meanings-block">
            Допустимые значения:
            <Listbox
              :options="slotProps.data.possibleMeanings"
            >
              <template #option="slotProps">
                <div class="dy58-view-order-pattern-element-refs-meanings-list-item-block">
                  <span>{{slotProps.option}}</span>
                </div>
              </template>
            </Listbox>
          </div>
        </template>
      </DataTable>
  <template #footer>
    <Button label="Закрыть" @click="handleCloseDialog" />
  </template>
  </Dialog>
</template>


<script>
  import { reactive, watch } from 'vue';

  export default {
    name: 'dy58-view-order-pattern-element-refs-dialog',

    emits: ['close'],

    props: {
      elementType: {
        type: String,
      },
      elementRefs: {
        type: Object,
      },
      showDlg: {
        type: Boolean,
        required: true,
      },
    },

    setup(props, { emit }) {
      watch(() => props.showDlg, (newVal) => state.dlgVisible = newVal);

      const state = reactive({
        dlgVisible: false,
        expandedRows: [],
      });

      const handleCloseDialog = () => {
        emit('close');
      };

      return {
        state,
        handleCloseDialog,
      };
    },
  };
</script>


<style scoped>
  :deep(.p-listbox .p-listbox-list .p-listbox-item) {
    padding: 0.1rem;
  }
</style>
