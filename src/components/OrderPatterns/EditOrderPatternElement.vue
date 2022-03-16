<template>
  <div>
    <div>
      <SelectButton
        v-model="selectedPatternElementType"
        :options="getOrderPatternElementTypes"
      >
        <template #option="slotProps">
          <div>{{ getOrderPatternElementTypeNames[slotProps.option.name] }}</div>
        </template>
      </SelectButton>
    </div>
    <div v-if="selectedPatternElement" class="p-mt-2">
      <div class="p-mb-2">
        <div
          v-if="selectedPatternElement.type === getOrderPatternElementTypesObject.TEXT"
          class="p-mb-1"
        >
          Введите текст:
        </div>
        <div v-else class="p-mb-1">Образец</div>
        <selected-pattern-element-view
          :element="selectedPatternElement"
          @changePatternElementValue="handleChangePatternElementValue"
        />
      </div>
      <div class="p-grid">
        <div v-if="[getOrderPatternElementTypesObject.INPUT, getOrderPatternElementTypesObject.SELECT].includes(selectedPatternElement.type)"
          class="p-col-fixed"
          style="width:200px"
        >
          <div class="p-mb-1">Размер</div>
          <element-size-chooser
            :chosenSize="selectedPatternElement.size"
            @changeSize="(value) => handleChangePatternElementSize(value)"
          />
        </div>
        <div v-if="![getOrderPatternElementTypesObject.TEXT, getOrderPatternElementTypesObject.TEXT_AREA,
          getOrderPatternElementTypesObject.DR_TRAIN_TABLE, getOrderPatternElementTypesObject.LINEBREAK].includes(selectedPatternElement.type)"
          class="p-col"
        >
          <div class="p-mb-1">Смысловое значение</div>
          <element-ref-chooser
            :chosenRef="selectedPatternElement.ref"
            :elementType="selectedPatternElement.type"
            @changeRef="(value) => handleChangePatternElementRef(value)"
          />
        </div>
      </div>
      <div class="p-mt-2">
        <Button type="button" :label="okButtonText" @click="handleSubmitOrderPatternElement" />
      </div>
    </div>
  </div>
</template>


<script>
  /**
   * Данный компонент позволяет создать новый либо отредактировать существующий элемент шаблона распоряжения
   */
  import SelectedPatternElementView from './SelectedPatternElementView';
  import ElementSizeChooser from './ElementSizeChooser';
  import ElementRefChooser from './ElementRefChooser';
  import {
    OrderPatternElementType,
    OrderPatternElementTypeNames,
    PossibleElementSizes,
  } from '@/constants/orderPatterns';

  export default {
    name: 'dy58-edit-order-pattern-element',

    emits: ['submitEditOrderPatternElement'],

    props: {
      // null (если необходимо создать новый элемент шаблона) либо объект со свойствами type, width, ref, value
      element: Object,
      // текст, отображаемый на кнопке, нажатие на которую означает согласие пользователя с произведенными изменениями
      okButtonText: String,
    },

    components: {
      ElementSizeChooser,
      ElementRefChooser,
      SelectedPatternElementView,
    },

    data() {
      return {
        // привязка к текущему выбранному значению типа элемента шаблона распоряжения
        selectedPatternElementType: null,
        // массив объектов допустимых элементов шаблона распоряжения
        availablePatternElements: null,
        // элемент шаблона, с которым работает пользователь (если element не задан, то выбирается первый допустимый элемент)
        selectedPatternElement: null,
      };
    },

    watch: {
      element: function(newVal) {
        this.selectedPatternElementType = newVal ?
          this.getOrderPatternElementTypes.find((type) => type.value === newVal.type) :
          this.getOrderPatternElementTypes.find((type) => type.value === OrderPatternElementType.TEXT);
        this.selectedPatternElement = this.getSelectedPatternElement(newVal);
      },

      // Реакция на изменение типа элемента шаблона: меняем выбранный элемент шаблона, запоминая
      // перед этим состояние текущего элемента шаблона
      selectedPatternElementType: function(newVal) {
        this.availablePatternElements = this.availablePatternElements.map((el) => {
          if (el.type !== this.selectedPatternElement.type) {
            return el;
          }
          return {
            ...this.selectedPatternElement,
          };
        });
        this.selectedPatternElement = this.availablePatternElements.find(el => el.type === newVal.value);
      },
    },

    mounted() {
      this.selectedPatternElementType = this.element ?
        this.getOrderPatternElementTypes.find((type) => type.value === this.element.type) :
        this.getOrderPatternElementTypes.find((type) => type.value === OrderPatternElementType.TEXT);
      this.availablePatternElements = this.initialPatternElements;
      this.selectedPatternElement = this.getSelectedPatternElement(this.element);
    },

    computed: {
      getOrderPatternElementTypesObject() {
        return OrderPatternElementType;
      },
      getOrderPatternElementTypes() {
        return Object.entries(OrderPatternElementType).map((type) => {
          return {
            name: type[0],
            value: type[1],
          };
        });
      },
      getOrderPatternElementTypeNames() {
        return OrderPatternElementTypeNames;
      },
      initialPatternElements() {
        return Object.values(OrderPatternElementType).map((elType) => {
          let elementSize = null;
          if (this.element && this.element.size) {
            elementSize = this.element.size;
          } else if (elType === OrderPatternElementType.INPUT || elType === OrderPatternElementType.SELECT) {
            elementSize = PossibleElementSizes.SMALL;
          } else {
            elementSize = PossibleElementSizes.AUTO;
          }
          return {
            type: elType,
            size: elementSize,
            ref: this.element && this.element.ref ? this.element.ref : null,
            value: this.element && this.element.value ? this.element.value : null,
          };
        });
      },
    },

    methods: {
      getSelectedPatternElement(el) {
        if (!el || !el.type || !Object.values(OrderPatternElementType).includes(el.type)) {
          return this.initialPatternElements[0];
        } else {
          return this.initialPatternElements.find((elem) => elem.type === el.type);
        }
      },

      // Обрабатываем событие подтверждения окончания редактирования текущего элемента шаблона
      // (передаем данный элемент "наверх")
      handleSubmitOrderPatternElement() {
        if ((this.selectedPatternElement.type === OrderPatternElementType.TEXT) &&
            (!this.selectedPatternElement.value || this.selectedPatternElement.value.trim() === '')) {
          return;
        }
        if (this.selectedPatternElement.type !== OrderPatternElementType.TEXT) {
          this.selectedPatternElement.value = null;
        }
        if ([OrderPatternElementType.DATE, OrderPatternElementType.TIME,
          OrderPatternElementType.DATETIME, OrderPatternElementType.DR_TRAIN_TABLE]
          .includes(this.selectedPatternElement.type) &&
          this.selectedPatternElement.size !== PossibleElementSizes.AUTO) {
          this.selectedPatternElement.size = PossibleElementSizes.AUTO;
        }
        this.$emit('submitEditOrderPatternElement', this.selectedPatternElement);
      },

      handleChangePatternElementValue(newVal) {
        if (this.selectedPatternElement.value === newVal) {
          return;
        }
        this.selectedPatternElement = {
          ...this.selectedPatternElement,
          value: newVal,
        };
      },

      handleChangePatternElementSize(newSize) {
        if (this.selectedPatternElement.size === newSize) {
          return;
        }
        this.selectedPatternElement = {
          ...this.selectedPatternElement,
          size: newSize,
        };
      },

      handleChangePatternElementRef(newRef) {
        if (this.selectedPatternElement.ref === newRef) {
          return;
        }
        this.selectedPatternElement = {
          ...this.selectedPatternElement,
          ref: newRef,
        };
      },
    },
  };
</script>
