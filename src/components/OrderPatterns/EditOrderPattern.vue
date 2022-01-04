<template>
  <div class="dy58-title-small p-text-center p-mb-3">
    Редактирование шаблона
  </div>
  <div
    v-for="(array, arrayIndex) of orderPatternArrays"
    :key="arrayIndex"
    class="p-d-flex p-flex-wrap"
  >
    <template v-for="(patternElement, arrIndex) of array" :key="arrIndex">
      <Cursor
        v-if="(arrayIndex === 0 && arrIndex === 0 && insertOrderElementPos === -1) ||
              (arrIndex === 0 && patternElement.index === insertOrderElementPos)"
      />

      <ContextMenu ref="menu" :model="orderPatternElementContextMenuItems" />

      <div
        :class="{
          'dy58-outer-cursor-block p-d-flex p-jc-center p-ai-center': true,
          'dy58-not-edited-order-pattern-element-block': patternElement._id !== editedPatternElementId,
          'dy58-edited-order-pattern-element-block': patternElement._id === editedPatternElementId,
        }"
        @contextmenu="onShowOrderPatternElementContextMenu($event, patternElement)"
      >
        <order-pattern-element-view :element="patternElement" />
      </div>

      <Cursor
        v-if="(arrIndex !== array.length - 1 || arrayIndex === orderPatternArrays.length - 1) &&
              (patternElement.index === insertOrderElementPos - 1)"
      />
    </template>
  </div>

  <div
    v-if="editedPatternElementId"
    className="dy58-order-pattern-border p-p-2 dy58-edit-order-pattern-element-block"
  >
    <div class="p-mb-3 p-text-bold">Редактирование элемента шаблона</div>
    <EditOrderPatternElement
      :element="orderPattern.find((el) => el._id === editedPatternElementId)"
      @submitEditOrderPatternElement="handleSubmitEditOrderPatternElement"
      okButtonText="Применить редактирование"
    />
  </div>
</template>


<script>
  import { OrderPatternElementType } from '@/constants/orderPatterns';
  import OrderPatternElementView from './OrderPatternElementView';
  import EditOrderPatternElement from './EditOrderPatternElement';
  import Cursor from './Cursor';

  export default {
    name: 'dy58-edit-order-pattern',

    emits: [
      'deleteOrderPatternElement',
      'insertBeforeOrderPatternElement',
      'insertAfterOrderPatternElement',
      'submitEditOrderPatternElement',
    ],

    props: {
      orderPattern: {
        type: Array,
      },
      insertOrderElementPos: {
        type: Number,
      },
    },

    components: {
      Cursor,
      OrderPatternElementView,
      EditOrderPatternElement,
    },

    data() {
      return {
        // Массив элементов шаблона либо несколько массивов, если исходный шаблон содержит переносы строк
        orderPatternArrays: [],
        // id редактируемого элемента шаблона
        editedPatternElementId: null,
        // элемент шаблона, для которого пользователь вызывает контекстное меню
        orderPatternElementWithOpenContextMenu: null,
      };
    },

    computed: {
      orderPatternElementContextMenuItems() {
        return [
          {
            label: !this.orderPatternElementWithOpenContextMenu ||
                   this.orderPatternElementWithOpenContextMenu._id !== this.editedPatternElementId ?
                   'Редактировать' : 'Отменить редактирование',
            command: () => {
              if (this.orderPatternElementWithOpenContextMenu._id !== this.editedPatternElementId) {
                this.editedPatternElementId = this.orderPatternElementWithOpenContextMenu._id;
              } else {
                this.editedPatternElementId = null;
              }
            },
          },
          {
            label: 'Удалить',
            command: () => {
              this.$emit('deleteOrderPatternElement', this.orderPatternElementWithOpenContextMenu._id);
            },
          },
          {
            label: 'Вставить элемент перед',
            command: () => {
              this.$emit('insertBeforeOrderPatternElement', this.orderPatternElementWithOpenContextMenu._id);
            },
          },
          {
            label: 'Вставить элемент после',
            command: () => {
              this.$emit('insertAfterOrderPatternElement', this.orderPatternElementWithOpenContextMenu._id);
            },
          },
        ];
      },
    },

    mounted() {
      this.formOrderPatternArrays(this.orderPattern);
    },

    watch: {
      orderPattern: function(newVal) {
        this.formOrderPatternArrays(newVal);
      },
    },

    methods: {
      // Формирует массив(-ы, если шаблон содержит переносы строк) элементов шаблона,
      // которые необходимо отобразить
      formOrderPatternArrays(newOrderPattern) {
        if (!newOrderPattern || !newOrderPattern.length) {
          this.editedPatternElementId = null;
          this.orderPatternArrays = [];
          return;
        }
        if (!newOrderPattern.find((el) => el._id === this.editedPatternElementId)) {
          this.editedPatternElementId = null;
        }
        const linebreakElementsIndexes = [];
        const orderPatternForWork = [];
        newOrderPattern.forEach((element, index) => {
          if (element.type === OrderPatternElementType.LINEBREAK) {
            linebreakElementsIndexes.push(index);
          }
          orderPatternForWork.push({
            ...element,
            index,
          });
        });
        linebreakElementsIndexes.push(newOrderPattern.length);

        let prevLinebreakIndex = 0;
        const orderPatternToDraw = [];
        linebreakElementsIndexes.forEach((element) => {
          const arrayPart = orderPatternForWork.slice(prevLinebreakIndex, element + 1);
          prevLinebreakIndex = element + 1;
          if (arrayPart && arrayPart.length) {
            orderPatternToDraw.push(arrayPart);
          }
        });
        this.orderPatternArrays = orderPatternToDraw;
      },

      onShowOrderPatternElementContextMenu(event, patternElement) {
        this.orderPatternElementWithOpenContextMenu = patternElement;
        this.$refs.menu.show(event);
      },

      handleSubmitEditOrderPatternElement(editedElement) {
        this.$emit('submitEditOrderPatternElement', {
          editedPatternElementId: this.editedPatternElementId,
          editedElement,
        });
      },
    },
  };
</script>
