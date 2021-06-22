<template>
  <ConfirmPopup></ConfirmPopup>
  <div v-if="!allOrderPatterns || !allOrderPatterns.length">
    Список шаблонов распоряжений пуст
  </div>
  <div v-if="allOrderPatterns && allOrderPatterns.length" class="p-grid">
    <div class="p-col-4">
      <Tree
        :value="allOrderPatterns"
        selectionMode="single"
        v-model:selectionKeys="selectedNode"
        @nodeSelect="handleTreeNodeSelect"
        @nodeUnselect="handleTreeNodeUnselect"
      ></Tree>
    </div>
    <div class="p-col-8">
      <div v-if="recsBeingProcessed > 0" class="dy58-warning">
        На сервер отправлено {{ recsBeingProcessed }} запросов. Ожидаю ответ...
      </div>

      <div v-if="selectedOrderCategory">
        <div class="dy58-title-small p-mb-4">
          Вы можете отредактировать наименование категории распоряжений
        </div>
        <div class="p-mb-3">Наименование категории распоряжений</div>
        <div class="p-mb-3">
          <InputText
            v-model="editedOrderCategoryTitle"
            style="width:100%"
          />
        </div>
        <div v-if="editedOrderCategoryTitle !== selectedOrderCategory.category">
          <Button
            type="button"
            @click="editOrderCategoryTitle"
          >
            Сохранить
          </Button>
        </div>
      </div>

      <div v-if="selectedPattern && selectedPattern.elements">
        <div class="p-grid">
          <div className="p-col-12">
            <div class="dy58-order-pattern-border p-p-2">
              <OrderPatternPreview :orderPattern="selectedPattern.elements" />
              <div class="p-mb-4 p-mt-3">
                <Button
                  v-if="!editedPattern"
                  type="button"
                  class="p-mr-2"
                  @click="startEditOrderPattern"
                >
                  Редактировать
                </Button>
                <Button
                  type="button"
                  @click="deleteOrderPattern($event)"
                >
                  Удалить шаблон
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="editedPattern && editedPattern.elements" class="dy58-order-pattern-border p-p-2">
        <div class="dy58-title-small p-mb-4 p-text-center">
          Редактирование распоряжения
        </div>
        <div class="p-text-bold p-mb-2">Наименование распоряжения</div>
        <div class="p-mb-2">
          <InputText
            :value="editedPattern ? editedPattern.title : null"
            style="width:100%"
            @change="handleEditOrderPatternTitle"
          />
        </div>
      </div>
    </div>
  </div>
</template>


<script>
  import { mapGetters } from 'vuex';
  import { OrderPatternsNodeType } from '../../constants/orderPatterns';
  import OrderPatternPreview from './OrderPatternPreview';

  export default {
    name: 'dy58-order-patterns-tree',

    components: {
      OrderPatternPreview,
    },

    data() {
      return {
        allOrderPatterns: [],
        selectedNode: null,
        recsBeingProcessed: 0,
        selectedOrderCategory: null,
        editedOrderCategoryTitle: null,
        selectedPattern: null,
        editedPattern: null,
        patternEdited: false,
        insertOrderElementPos: 0,
      };
    },

    computed: {
      ...mapGetters([
        'getOrderPatternsToDisplayInTreeComponent',
      ]),
    },

    mounted() {
      this.allOrderPatterns = this.getOrderPatternsToDisplayInTreeComponent;
    },

    methods: {
      reset() {
        if (this.editedPattern) {
          this.editedPattern = null;
        }
        if (this.patternEdited) {
          this.patternEdited = false;
        }
        this.insertOrderElementPos = 0;
      },

      handleTreeNodeUnselect() {
        if (this.selectedOrderCategory) {
          this.changeSelectedOrderCategory(null);
        }
        if (this.selectedPattern) {
          this.selectedPattern = null;
        }
        this.reset();
      },

      changeSelectedOrderCategory(newValue) {
        this.selectedOrderCategory = newValue;
        this.editedOrderCategoryTitle = !newValue ? newValue : newValue.category;
      },

      handleTreeNodeSelect(node) {
        if (node.type === OrderPatternsNodeType.ORDER_PATTERN) {
          this.selectedPattern = {
            key: node.key,
            label: node.label,
            elements: node.pattern,
          };
          if (this.selectedOrderCategory) {
            this.changeSelectedOrderCategory(null);
          }
        } else {
          if (this.selectedPattern) {
            this.selectedPattern = null;
          }
          if (node.type === OrderPatternsNodeType.ORDER_CATEGORY) {
            this.changeSelectedOrderCategory({
              ...node.additionalInfo,
              category: node.label,
            });
          } else if (this.selectedOrderCategory) {
            this.changeSelectedOrderCategory(null);
          }
        }
        this.reset();
      },

      editOrderCategoryTitle() {
        //
      },

      deleteOrderPattern(event) {
        this.$confirm.require({
          target: event.currentTarget,
          message: 'Удалить шаблон?',
          icon: 'pi pi-exclamation-circle',
          accept: () => {
            //
          },
          reject: () => {
            //
          },
        });
      },

      startEditOrderPattern() {
        if (!this.selectedPattern || !this.selectedPattern.key) {
          return;
        }
        this.editedPattern = {
          title: this.selectedPattern.label,
          elements: [...this.selectedPattern.elements],
        };
        if (this.patternEdited) {
          this.patternEdited = false;
        }
        this.insertOrderElementPos = this.selectedPattern.elements.length;
      },

      handleEditOrderPatternTitle(e) {console.log(e)
        if (!this.editedPattern) {
          return;
        }
        this.editedPattern = {
          ...this.editedPattern,
          title: e.target.value,
        };
        console.log(this.editedPattern)
        if (!this.patternEdited) {
          this.patternEdited = true;
        }
      },
    },
  };
</script>


<style scoped>
  .dy58-order-pattern-border {
    border-width: 1px;
    border-style: solid;
    border-color: var(--surface-400);
  }
</style>
