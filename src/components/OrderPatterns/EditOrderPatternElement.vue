<template>
  <div>
    <div>
      <SelectButton
        v-model="selectedPatternElementType"
        :options="getOrderPatternElementTypes"
        optionLabel="value"
      >
        <template #option="slotProps">
          <div>{{ getOrderPatternElementTypeName(slotProps.option.name) }}</div>
        </template>
      </SelectButton>
    </div>
    <div>
      <div class="p-mb-2">
        <span v-if="selectedPatternElement.type === getOrderPatternElementTypesObject.TEXT">Введите текст:</span>
        <span v-else>Образец:</span>
        <selected-pattern-element-view :element="selectedPatternElement" />
      </div>
    </div>
    <div
      v-if="selectedPatternElement.type === getOrderPatternElementTypesObject.INPUT ||
        selectedPatternElement.type === getOrderPatternElementTypesObject.SELECT"
      class="p-grid"
    >
      <div class="p-col">
        <element-size-chooser :chosenSize="selectedPatternElement.size" />
      </div>
    </div>
    <div>
      <Button type="button" :label="okButtonText" />
    </div>
  </div>
</template>


<script>
  import SelectedPatternElementView from './SelectedPatternElementView';
  import ElementSizeChooser from './ElementSizeChooser';
  import { OrderPatternElementType, OrderPatternElementTypeNames } from '../../constants/orderPatterns';

  export default {
    name: 'dy58-edit-order-pattern-element',

    props: ['okButtonText'],

    components: {
      ElementSizeChooser,
      SelectedPatternElementView,
    },

    data() {
      return {
        selectedPatternElementType: null,
        selectedPatternElement: null,
      };
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
      getOrderPatternElementTypeName(type) {
        return OrderPatternElementTypeNames[type];
      },
    },
  };
</script>
