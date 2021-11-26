<template>
  <ConfirmPopup></ConfirmPopup>
  <Toast />
  <div v-if="getLoadingOrderPatternsStatus">
    <ProgressSpinner />
  </div>
  <div v-else-if="!allOrderPatterns || !allOrderPatterns.length">
    <Button
      icon="pi pi-refresh"
      class="p-button-rounded p-button-success"
      v-tooltip.right="'Обновить список распоряжений'"
      @click="refreshOrderPatterns"
    />
    Список шаблонов распоряжений пуст
  </div>
  <div v-else class="p-grid">
    <div class="p-col-4 dy58-order-patterns-tree">
      <Tree
        :value="allOrderPatterns"
        selectionMode="single"
        v-model:selectionKeys="selectedNode"
        :filter="true"
        filterMode="lenient"
        @nodeSelect="handleTreeNodeSelect"
        @nodeUnselect="handleTreeNodeUnselect"
        @nodeExpand="expandAll"
        @nodeCollapse="collapseAll"
      >
      </Tree>
      <Button
        icon="pi pi-refresh"
        class="p-button-rounded p-button-success dy58-refresh-orders-list-btn"
        v-tooltip.right="'Обновить список распоряжений'"
        @click="refreshOrderPatterns"
      />
    </div>
    <div class="p-col-8">
      <div v-if="getModifyOrderCategoryTitleRecsBeingProcessed > 0" class="dy58-warning">
        На сервер отправлено {{ getModifyOrderCategoryTitleRecsBeingProcessed }} запросов на редактирование наименования категории распоряжений. Ожидаю ответ...
      </div>
      <div v-if="getDelOrderPatternRecsBeingProcessed > 0" class="dy58-warning">
        На сервер отправлено {{ getDelOrderPatternRecsBeingProcessed }} запросов на удаление шаблона распоряжения. Ожидаю ответ...
      </div>
      <div v-if="getModOrderPatternRecsBeingProcessed > 0" class="dy58-warning">
        На сервер отправлено {{ getModOrderPatternRecsBeingProcessed }} запросов на редактирование шаблона распоряжения. Ожидаю ответ...
      </div>
      <div v-if="getCreateOrderPatternRecsBeingProcessed > 0" class="dy58-warning">
        На сервер отправлено {{ getCreateOrderPatternRecsBeingProcessed }} запросов на создание шаблона распоряжения. Ожидаю ответ...
      </div>

      <div v-if="selectedOrderCategory && selectedOrderCategory.personalCategory">
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
              <order-pattern-preview :orderPattern="selectedPattern.elements" />
              <div v-if="selectedPattern.personalPattern" class="p-mb-3 p-mt-3">
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
            @input="handleEditOrderPatternTitle"
          />
        </div>
        <div class="p-mb-2">
          <edit-order-pattern
            :orderPattern="editedPattern.elements"
            :insertOrderElementPos="insertOrderElementPos"
            @deleteOrderPatternElement="delPatternElement"
            @insertBeforeOrderPatternElement="setCursorBeforeElement"
            @insertAfterOrderPatternElement="setCursorAfterElement"
            @submitEditOrderPatternElement="handleSubmitEditOrderPatternElement"
          />
        </div>
        <div class="p-mb-4">
          <div class="p-text-bold p-mb-2">Определите элементы шаблона</div>
          <edit-order-pattern-element
            :element="null"
            @submitEditOrderPatternElement="handleAddOrderPatternElement"
            okButtonText="Добавить в шаблон"
          />
        </div>
        <div v-if="patternEdited">
          <Button
            type="button"
            @click="handleEditOrderPattern"
            class="p-mr-2"
          >
            Сохранить изменения
          </Button>
          <Button
            type="button"
            @click="handleCancelEditOrderPattern"
          >
            Отменить все изменения
          </Button>
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
  import EditOrderPatternElement from './EditOrderPatternElement';
  import objectId from '../../additional/objectId.generator';

  export default {
    name: 'dy58-order-patterns-tree',

    components: {
      OrderPatternPreview,
      EditOrderPattern,
      EditOrderPatternElement,
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
        expandedKeys: {},
      };
    },

    computed: {
      ...mapGetters([
        'getOrderPatternsToDisplayInTreeComponent',
        'getOrderCategoryModifyResult',
        'getOrderPatternsTreeNodeKey',
        'getModifyOrderCategoryTitleRecsBeingProcessed',
        'getLoadingOrderPatternsStatus',
        'getDelOrderPatternResult',
        'getDelOrderPatternRecsBeingProcessed',
        'getModOrderPatternResult',
        'getModOrderPatternRecsBeingProcessed',
        'getCreateOrderPatternRecsBeingProcessed',
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
          this.showSuccessMessage(newVal.message);
          this.selectedOrderCategory = {
            ...this.selectedOrderCategory,
            category: newVal.newTitle,
          };
          this.editedOrderCategoryTitle = newVal.newTitle;
        } else {
          this.showErrMessage(newVal.message);
        }
      },

      getDelOrderPatternResult(newVal) {
        if (!newVal) {
          return;
        }
        if (!newVal.error) {
          this.showSuccessMessage(newVal.message);
          this.selectedPattern = null;
          this.editedPattern = null;
          this.patternEdited = false;
          this.insertOrderElementPos = 0;
        } else {
          this.showErrMessage(newVal.message);
        }
      },

      getModOrderPatternResult(newVal) {
        if (!newVal) {
          return;
        }
        if (!newVal.error) {
          this.showSuccessMessage(newVal.message);
          this.selectedPattern = {
            ...this.selectedPattern,
            label: newVal.orderPattern.title,
            elements: newVal.orderPattern.elements,
          };
          this.editedPattern = null;
          this.patternEdited = false;
          this.insertOrderElementPos = 0;
        } else {
          this.showErrMessage(newVal.message);
        }
      },
    },

    methods: {
      /**
       *
       */
      showSuccessMessage(message) {
        this.$toast.add({
          severity: 'success',
          summary: 'Информация',
          detail: message,
          life: 3000,
        });
      },

      /**
       *
       */
      showErrMessage(message) {
        this.$toast.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: message,
          life: 3000,
        });
      },

      /**
       *
       */
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

      /**
       *
       */
      reset() {
        if (this.editedPattern) {
          this.editedPattern = null;
        }
        if (this.patternEdited) {
          this.patternEdited = false;
        }
        this.insertOrderElementPos = 0;
      },

      /**
       *
       */
      handleTreeNodeUnselect() {
        if (this.selectedOrderCategory) {
          this.changeSelectedOrderCategory(null);
        }
        if (this.selectedPattern) {
          this.selectedPattern = null;
        }
        this.reset();
      },

      /**
       *
       */
      changeSelectedOrderCategory(newValue) {
        this.selectedOrderCategory = newValue;
        this.editedOrderCategoryTitle = !newValue ? newValue : newValue.category;
      },

      /**
       *
       */
      handleTreeNodeSelect(node) {
        if (node.type === OrderPatternsNodeType.ORDER_PATTERN) {
          this.selectedPattern = {
            key: node.key,
            label: node.label,
            elements: node.pattern,
            personalPattern: node.personalPattern,
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
              personalCategory: node.personalCategory,
            });
          } else if (this.selectedOrderCategory) {
            this.changeSelectedOrderCategory(null);
          }
        }
        this.reset();
      },

      /**
       *
       */
      expandAll() {
        for (let node of this.allOrderPatterns) {
          this.expandNode(node);
        }
        this.expandedKeys = { ...this.expandedKeys };
      },

      /**
       *
       */
      collapseAll() {
        this.expandedKeys = {};
      },

      /**
       *
       */
      expandNode(node) {
        this.expandedKeys[node.key] = true;
        if (node.children && node.children.length) {
          for (let child of node.children) {
            this.expandNode(child);
          }
        }
      },

      /**
       *
       */
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

      /**
       *
       */
      deleteOrderPattern(event) {
        this.$confirm.require({
          target: event.currentTarget,
          message: 'Удалить шаблон?',
          icon: 'pi pi-exclamation-circle',
          accept: () => {
            if (!this.selectedPattern || !this.selectedPattern.key) {
              return;
            }
            this.$store.dispatch('delOrderPattern', this.selectedPattern.key);
          },
        });
      },

      /**
       *
       */
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

      /**
       *
       */
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

      /**
       *
       */
      setCursorBeforeElement(elementId) {
        const elementIndex = this.editedPattern.elements.findIndex((element) => element._id === elementId);
        if (elementIndex === -1) {
          return;
        }
        this.insertOrderElementPos = elementIndex !== 0 ? elementIndex : -1;
      },

      /**
       *
       */
      setCursorAfterElement(elementId) {
        const elementIndex = this.editedPattern.elements.findIndex((element) => element._id === elementId);
        if (elementIndex === -1) {
          return;
        }
        this.insertOrderElementPos = elementIndex + 1;
      },

      /**
       *
       */
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

      /**
       * Добавляет заданный элемент в редактируемый шаблон распоряжения на текущую позицию
       * (т.е. позицию, на которой находится курсор).
       */
      handleAddOrderPatternElement(selectedPatternElement) {
        if (!selectedPatternElement) {
          return;
        }
        const newElement = {
          _id: objectId(),
          type: selectedPatternElement.type,
          ref: selectedPatternElement.ref,
          value: selectedPatternElement.value,
          size: selectedPatternElement.size,
        };
        this.editedPattern = {
          ...this.editedPattern,
          elements: [
            ...this.editedPattern.elements.slice(0, this.insertOrderElementPos < 0 ? 0 : this.insertOrderElementPos),
            newElement,
            ...this.editedPattern.elements.slice(this.insertOrderElementPos < 0 ? 0 : this.insertOrderElementPos)
          ],
        };
        if (this.insertOrderElementPos !== -1) {
          this.insertOrderElementPos += 1;
        } else {
          this.insertOrderElementPos = 1;
        }
        if (!this.patternEdited) {
          this.patternEdited = true;
        }
      },

      /**
       * Отправляет правки, сделанные пользователем в отношении шаблона распоряжений, на сервер.
       */
      handleEditOrderPattern() {
        if (!this.editedPattern) {
          return;
        }
        this.$store.dispatch('modOrderPattern', {
          id: this.selectedPattern.key,
          title: this.editedPattern.title,
          elements: this.editedPattern.elements,
        });
      },

      /**
       * Отменяет редактирование текущего шаблона распоряжения.
       */
      handleCancelEditOrderPattern() {
        this.editedPattern = null;
        this.patternEdited = false;
        this.insertOrderElementPos = 0;
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
