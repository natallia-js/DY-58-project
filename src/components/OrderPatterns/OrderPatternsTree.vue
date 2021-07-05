<template>
  <ConfirmPopup></ConfirmPopup>
  <Toast />
  <div v-if="getLoadingOrderPatternsStatus">
    <ProgressSpinner />
  </div>
  <div v-else-if="!allOrderPatterns || !allOrderPatterns.length">
    Список шаблонов распоряжений пуст
  </div>
  <div v-else class="p-grid">
    <div class="p-col-4 dy58-order-patterns-tree">
      <Button
        icon="pi pi-refresh"
        class="p-button-rounded p-button-success dy58-refresh-orders-list-btn"
        v-tooltip.right="'Обновить список распоряжений'"
        @click="refreshOrderPatterns"
      />
      <Tree
        :value="allOrderPatterns"
        selectionMode="single"
        v-model:selectionKeys="selectedNode"
        @nodeSelect="handleTreeNodeSelect"
        @nodeUnselect="handleTreeNodeUnselect"
      ></Tree>
    </div>
    <div class="p-col-8">
      <div v-if="getModifyOrderCategoryTitleRecsBeingProcessed > 0" class="dy58-warning">
        На сервер отправлено {{ getModifyOrderCategoryTitleRecsBeingProcessed }} запросов. Ожидаю ответ...
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
            @click="handleEditOrderCategoryTitle"
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
        <div class="dy58-title-small p-mb-3 p-text-center">
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
        <div class="p-mb-2">
          <EditOrderPattern
            :orderPattern="editedPattern.elements"
            :insertOrderElementPos="insertOrderElementPos"
            @deleteOrderPatternElement="delPatternElement"
            @insertBeforeOrderPatternElement="setCursorBeforeElement"
            @insertAfterOrderPatternElement="setCursorAfterElement"
            @submitEditOrderPatternElement="handleSubmitEditOrderPatternElement"
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
  import EditOrderPattern from './EditOrderPattern';

  export default {
    name: 'dy58-order-patterns-tree',

    components: {
      OrderPatternPreview,
      EditOrderPattern,
    },

    data() {
      return {
        allOrderPatterns: [],
        selectedNode: null,
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
        'getOrderCategoryModifyResult',
        'getOrderPatternsTreeNodeKey',
        'getModifyOrderCategoryTitleRecsBeingProcessed',
        'getLoadingOrderPatternsStatus',
      ]),
    },

    mounted() {
      this.allOrderPatterns = this.getOrderPatternsToDisplayInTreeComponent;
    },

    watch: {
      getOrderPatternsToDisplayInTreeComponent(newVal) {
        this.allOrderPatterns = newVal;
        if (this.selectedOrderCategory) {
          const selectedNodeKey = this.getOrderPatternsTreeNodeKey([
            this.selectedOrderCategory.service,
            this.selectedOrderCategory.orderType,
            this.selectedOrderCategory.category,
          ]);
          this.selectedNode = { [selectedNodeKey]: true };
        }
      },

      getOrderCategoryModifyResult(newVal) {
        if (!newVal) {
          return;
        }
        if (!newVal.error) {
          this.$toast.add({
            severity: 'success',
            summary: 'Информация',
            detail: newVal.message,
            life: 3000,
          });
          this.selectedOrderCategory = {
            ...this.selectedOrderCategory,
            category: newVal.newTitle,
          };
          this.editedOrderCategoryTitle = newVal.newTitle;
        } else {
          this.$toast.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: newVal.message,
            life: 3000,
          });
        }
      },
    },

    methods: {
      refreshOrderPatterns() {
        this.$store.dispatch('loadOrderPatterns');
        this.selectedNode = null;
        this.selectedOrderCategory = null;
        this.editedOrderCategoryTitle = null;
        this.selectedPattern = null;
        this.editedPattern = null;
        this.patternEdited = false;
        this.insertOrderElementPos = 0;
      },

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

      handleEditOrderCategoryTitle() {
        if (!this.editedOrderCategoryTitle) {
          return;
        }
        this.$store.dispatch('editOrderCategoryTitle', {
          service: this.selectedOrderCategory.service,
          orderType: this.selectedOrderCategory.orderType,
          title: this.selectedOrderCategory.category,
          newTitle: this.editedOrderCategoryTitle,
        });
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

      handleEditOrderPatternTitle(e) {
        if (!this.editedPattern) {
          return;
        }
        this.editedPattern = {
          ...this.editedPattern,
          title: e.target.value,
        };
        if (!this.patternEdited) {
          this.patternEdited = true;
        }
      },

      setCursorBeforeElement(elementId) {
        const elementIndex = this.editedPattern.elements.findIndex((element) => element._id === elementId);
        if (elementIndex === -1) {
          return;
        }
        this.insertOrderElementPos = elementIndex !== 0 ? elementIndex : -1;
      },

      setCursorAfterElement(elementId) {
        const elementIndex = this.editedPattern.elements.findIndex((element) => element._id === elementId);
        if (elementIndex === -1) {
          return;
        }
        this.insertOrderElementPos = elementIndex + 1;
      },

      delPatternElement(elementId) {
        const elementIndex = this.editedPattern.elements.findIndex((element) => element._id === elementId);
        if (elementIndex === -1) {
          return;
        }
        if (elementIndex < this.insertOrderElementPos) {
          this.insertOrderElementPos -= 1;
        }
        this.editedPattern = {
          ...this.editedPattern,
          elements: this.editedPattern.elements.filter((el) => el._id !== elementId),
        };
        if (!this.patternEdited) {
          this.patternEdited = true;
        }
      },

      handleSubmitEditOrderPatternElement({ editedPatternElementId, editedElement }) {
        const elementIndex = this.editedPattern.elements.findIndex((element) =>
          element._id === editedPatternElementId);
        if (elementIndex === -1) {
          return;
        }
        this.editedPattern = {
          ...this.editedPattern,
          elements: this.editedPattern.elements.map((el) => {
            if (el._id !== editedPatternElementId) {
              return el;
            }
            return {
              _id: editedPatternElementId,
              ...editedElement,
            };
          }),
        };
        if (!this.patternEdited) {
          this.patternEdited = true;
        }
      },
    },
  };
</script>


<style scoped>
  .dy58-order-patterns-tree {
    position: relative;
  }

  .dy58-refresh-orders-list-btn {
    position: absolute;
    left: 0;
    top: 0;
  }
</style>
