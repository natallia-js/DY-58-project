<template>
  <Dialog
    :header="`Смысловые значения элемента ${elementType}`"
    v-model:visible="state.dlgVisible"
    style="width:auto; maxWidth:1000px"
    :modal="true"
    @hide="handleCloseDialog"
  >
    <div>
      <div class="dy58-curr-work-poligon-comment-block"></div>
      - смысловое значение принадлежит текущему рабочему полигону
      <br/>
      <div class="dy58-other-work-poligon-comment-block"></div>
      - смысловое значение принадлежит рабочему полигону, отличному от текущего
    </div>
    <DataTable
      :value="elementRefs"
      class="p-datatable-gridlines p-datatable-sm"
      :rowClass="rowClass"
      v-model:expandedRows="state.expandedRows"
      dataKey="_id"
      responsiveLayout="scroll"
    >
      <Column
        :expander="true"
        headerStyle="width: 3rem"
        headerClass="dy58-table-header-cell-class"
      />
      <Column
        field="refName"
        header="Наименование"
        sortable
        headerClass="dy58-table-header-cell-class"
      />
      <Column
        field="additionalOrderPlaceInfoForGID"
        header="Доп. инфо о месте действия для ГИД"
        sortable
        headerClass="dy58-table-header-cell-class"
      >
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
  import { computed, reactive, watch } from 'vue';
  import { useStore } from 'vuex';

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
      const store = useStore();

      watch(() => props.showDlg, (newVal) => state.dlgVisible = newVal);

      const state = reactive({
        dlgVisible: false,
        expandedRows: [],
      });

      const handleCloseDialog = () => {
        emit('close');
      };

      const userWorkPoligon = computed(() => store.getters.getUserWorkPoligon);

      const rowClass = (data) => {
        const defaultClass = 'dy58-table-top-content-cell-class';
        return (!data.workPoligon || !data.workPoligon.type || !data.workPoligon.id || !userWorkPoligon.value)
          ? defaultClass :
            (data.workPoligon.type === userWorkPoligon.value.type && data.workPoligon.id === userWorkPoligon.value.code)
            ? defaultClass + ' dy58-belongs-only-to-this-sector'
            : defaultClass + ' dy58-belongs-to-other-sectors';
      };

      return {
        state,
        handleCloseDialog,
        rowClass,
      };
    },
  };
</script>


<style lang="scss" scoped>
  :deep(.p-listbox .p-listbox-list .p-listbox-item) {
    padding: 0.1rem;
  }
  :deep(.dy58-belongs-to-other-sectors) {
    background-color: var(--orange-100) !important;
  }
  :deep(.dy58-belongs-only-to-this-sector) {
    background-color: var(--teal-100) !important;
  }

  @mixin dy58-table-color-comment-block() {
    width: 25px;
    height: 20px;
    display: inline-block;
  }

  .dy58-curr-work-poligon-comment-block {
    @include dy58-table-color-comment-block();
    background-color:var(--teal-100);
  }

  .dy58-other-work-poligon-comment-block {
    @include dy58-table-color-comment-block();
    background-color:var(--orange-100);
  }
</style>
