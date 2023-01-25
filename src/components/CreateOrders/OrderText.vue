<template>
  <div class="p-grid">
    <div class="p-inputgroup p-col-12">
      <span class="p-inputgroup-addon">
        <RadioButton
          class="dy58-addon-button"
          :value="ORDER_TEXT_SOURCE.pattern"
          v-model="state.orderTextSource"
          @change="handleFocusDropdown"
        />
      </span>
      <TreeSelect
        placeholder="Выберите шаблон"
        v-model="state.orderPattern"
        :options="getOrderPatterns"
        style="width:100%"
        @show="handleFocusDropdown"
        @change="handleChooseOrderPattern"
      />
    </div>
    <div class="p-inputgroup p-col-12">
      <span class="p-inputgroup-addon">
        <RadioButton
          class="dy58-addon-button"
          :value="ORDER_TEXT_SOURCE.nopattern"
          v-model="state.orderTextSource"
          @change="handleFocusInput"
        />
      </span>
      <InputText
        placeholder="Создание нового документа"
        style="width:100%"
        v-model="state.orderTitle"
        @focus="handleFocusInput"
        @input="handleChangeOrderTitle"
      />
    </div>
    <div v-if="state.orderTextSource === ORDER_TEXT_SOURCE.nopattern" class="p-col-12">
      <textarea
        v-model="state.orderText"
        rows="5"
        :style="{ width: '100%', minWidth: '100%', maxWidth: '100%' }"
        class="p-component p-p-2"
      />
    </div>
    <div v-else-if="state.orderPattern" class="dy58-order-pattern-border p-col-12" style="overflow-x:scroll;">
      <order-pattern-text
        :value="state.orderPatternText"
        @input="handleChangeOrderPatternElementValue"
      />
    </div>
  </div>
</template>


<script>
  import { computed, reactive, watch } from 'vue';
  import { useStore } from 'vuex';
  import OrderPatternText from '@/components/CreateOrders/OrderPatternText';
  import { OrderPatternElementType } from '@/constants/orderPatterns';
  import { ORDER_TEXT_SOURCE, FILLED_ORDER_DROPDOWN_ELEMENTS } from '@/constants/orders';
  import getChildOrderPatternElementValueByParentElementValue from '@/additional/getChildOrderPatternElementValueByParentElementValue';

  export default {
    name: 'dy58-order-text',

    components: {
      OrderPatternText,
    },

    emits: ['input'],

    props: {
      value: {
        type: Object,
      },
      // тип распоряжения
      orderType: {
        type: String,
      },
      // объект родительского распоряжения (если указан, то его поля используются для
      // заполнения полей текущего выбранного текста распоряжения)
      parentOrderText: {
        type: Object,
      },
    },

    setup(props, { emit }) {
      const store = useStore();

      const state = reactive({
        // источник текста распоряжения (шаблон либо не шаблон)
        orderTextSource: '',
        // 1) для шаблонного распоряжения
        orderPattern: null,
        orderPatternText: null, // массив объектов - элементов текста распоряжения
        // 2) для распоряжения без шаблона
        orderTitle: '',
        orderText: '',
      });

      watch(() => props.value, (newVal) => {
        if (!newVal) {
          return;
        }
        let changedOrderTextSource = false;
        let tmp = newVal.orderTextSource || '';
        if (state.orderTextSource !== tmp) {
          state.orderTextSource = tmp;
          changedOrderTextSource = true;
        }
        switch (state.orderTextSource) {
          case ORDER_TEXT_SOURCE.pattern:
            tmp = newVal.patternId || null;
            if (state.orderPattern && !tmp) {
              state.orderPattern = tmp;
            } else if ((!state.orderPattern && tmp) ||
              (state.orderPattern && tmp && Object.keys(state.orderPattern)[0] !== tmp)) {
              state.orderPattern = { [tmp]: true };
            }
            tmp = newVal.orderText && newVal.orderText.length ? newVal.orderText.map((el) => ({ ...el })) : null;
            if (JSON.stringify(state.orderPatternText) !== JSON.stringify(tmp)) {
              state.orderPatternText = tmp;
            }
            break;
          case ORDER_TEXT_SOURCE.nopattern:
            tmp = newVal.orderTitle || '';
            if (state.orderTitle !== tmp) {
              state.orderTitle = tmp;
            }
            tmp = newVal.orderText && newVal.orderText[0] ? newVal.orderText[0].value : '';
            if (state.orderText !== tmp) {
              state.orderText = tmp;
            }
            break;
          default:
            if (changedOrderTextSource) {
              state.orderTextSource = '';
              state.orderPattern = null;
              state.orderPatternText = null;
              state.orderTitle = '';
              state.orderText = '';
            }
            break;
        }
      });

      // список шаблонов распоряжений для отображения
      const getOrderPatterns = computed(() => store.getters.getOrderPatternsToDisplayInTreeSelect(props.orderType));

      // возвращает объект выбранного из списка шаблона распоряжения
      const getSelectedOrderPattern = computed(() =>
        state.orderPattern ? (store.getters.getOrderPatternById(Object.keys(state.orderPattern)[0]) || {}) : {}
      );

      // для отслеживания изменения объекта родительского распоряжения
      const parentOrderText = computed(() => props.parentOrderText);

      // при изменении объекта родительского/дочернего распоряжения принимаем меры по заполнению
      // полей текста объекта дочернего распоряжения (из полей родительского)
      watch([parentOrderText, () => state.orderPatternText], () => {
        // если родительское либо дочернее распоряжение - бесшаблонное, то ничего не делаем
        if (!parentOrderText.value || !parentOrderText.value.orderText || (parentOrderText.value.orderTextSource !== ORDER_TEXT_SOURCE.pattern) ||
            (state.orderTextSource !== ORDER_TEXT_SOURCE.pattern) || !state.orderPatternText) {
          return;
        }
        const parentPattern = store.getters.getOrderPatternById(parentOrderText.value.patternId);
        if (!parentPattern || !parentPattern.childPatterns) {
          return;
        }
        const parentChildRelations = parentPattern.childPatterns.find((relation) => relation.childPatternId === getSelectedOrderPattern.value._id);
        if (!parentChildRelations) {
          return;
        }
        state.orderPatternText.forEach((element, index) => {
          const parentMatch = parentChildRelations.patternsParamsMatchingTable.find((match) => match.childParamId === element._id);
          if (parentMatch) {
            const parentParam = parentOrderText.value.orderText.find((el) => el._id === parentMatch.baseParamId);
            // Определяем значение параметра элемента дочернего шаблона распоряжения на основании его типа, типа соответствующего
            // элемента родительского шаблона и значения, содержащегося в этом родительском элементе.
            // Здесь берем именно editValue, а не value, т.к. значение может быть изменено пользователем;
            // к тому же, value презназначено для просмотра, а editValue - для редактирования и не содержит "лишних" символов,
            // которые используются в value для более удобного просмотра
            state.orderPatternText[index].value =
              getChildOrderPatternElementValueByParentElementValue(parentParam.type, parentParam.editValue, state.orderPatternText[index].type);
          }
        });
        // сюда попадем только в случае когда родительское и дочернее распоряжения - шаблонные
        emit('input', {
          orderTextSource: state.orderTextSource,
          patternId: getSelectedOrderPattern.value._id,
          orderTitle: getSelectedOrderPattern.value.title,
          orderText: state.orderPatternText,
        });
      });

      // реагируем на ввод текста бесшаблонного распоряжения
      watch(() => state.orderText, (newVal) =>
        emit('input', {
          orderTextSource: state.orderTextSource,
          patternId: null,
          orderTitle: state.orderTitle,
          orderText: [{
            type: OrderPatternElementType.TEXT,
            ref: null,
            value: newVal,
          }]
        })
      );

      // Срабатывает при разворачивании списка с категориями и наименованиями шаблонов распоряжений (TreeSelect)
      const handleFocusDropdown = () => {
        if (state.orderTextSource !== ORDER_TEXT_SOURCE.pattern) {
          state.orderTextSource = ORDER_TEXT_SOURCE.pattern;
        }
        emit('input', {
          orderTextSource: state.orderTextSource,
          patternId: getSelectedOrderPattern.value._id,
          orderTitle: getSelectedOrderPattern.value.title,
          orderText: state.orderPatternText,
        });

        // Для пользователя очень удобно, когда он для просмотра списка шаблонов конкретной категории
        // может не только нажать на кнопку "птичка" слева от категории распоряжений (поведение компонента
        // TreeSelect по умолчанию), а сделать то же самое путем двойного клика по наименованию категории.
        const treeSelectNodes = document.querySelectorAll('.p-treenode-label');
        for (let i = 0; i < treeSelectNodes.length; i++) {
          treeSelectNodes[i].addEventListener('dblclick', function() {
            const parent = treeSelectNodes[i].closest('.p-treenode-content');
            if (parent) {
              const arrowElement = parent.querySelectorAll('.p-tree-toggler');
              if (arrowElement?.length) {
                arrowElement[0].dispatchEvent(new Event('click'));
              }
            }
          });
        }
      };

      //
      const handleChooseOrderPattern = () => {
        state.orderPatternText = getSelectedOrderPattern.value.elements.map((element) => ({ ...element }));
        emit('input', {
          orderTextSource: state.orderTextSource,
          patternId: getSelectedOrderPattern.value._id,
          orderTitle: getSelectedOrderPattern.value.title,
          orderText: state.orderPatternText,
        });
      };

      //
      const handleFocusInput = () => {
        if (state.orderTextSource !== ORDER_TEXT_SOURCE.nopattern) {
          state.orderTextSource = ORDER_TEXT_SOURCE.nopattern;
        }
        emit('input', {
          orderTextSource: state.orderTextSource,
          patternId: null,
          orderTitle: state.orderTitle,
          orderText: [{
            type: OrderPatternElementType.TEXT,
            ref: null,
            value: state.orderText,
          }],
        });
      };

      // Изменение наименования распоряжения
      const handleChangeOrderTitle = (event) => {
        emit('input', {
          orderTextSource: state.orderTextSource,
          patternId: null,
          orderTitle: event.target.value,
          orderText: [{
            type: OrderPatternElementType.TEXT,
            ref: null,
            value: state.orderText,
          }],
        });
      };

      // При любом изменении сообщаем "наверх"! Т.к. если будем делать проверки (например, на равенство
      // нового значения предыдущему, чтобы решить, делать emit или нет), то может оказаться так, что
      // изменение в одном поле потянет изменение в другом, а это другое не отразится на исходном наборе
      // данных, останется его прежнее значение
      const handleChangeOrderPatternElementValue = (event) => {
        const orderPatternElementIndex = state.orderPatternText.findIndex((el) => el._id === event.elementId);
        if (orderPatternElementIndex >= 0) {
          if (state.orderPatternText[orderPatternElementIndex].value !== event.value) {
            state.orderPatternText[orderPatternElementIndex].value = event.value;
          }
          switch (event.elementRef) {
            case FILLED_ORDER_DROPDOWN_ELEMENTS.STATION:
            case FILLED_ORDER_DROPDOWN_ELEMENTS.STATION_ACTION_PLACE:
            case FILLED_ORDER_DROPDOWN_ELEMENTS.ARR_STATION:
            case FILLED_ORDER_DROPDOWN_ELEMENTS.DPT_STATION:
              break;
            case FILLED_ORDER_DROPDOWN_ELEMENTS.BLOCK:
            case FILLED_ORDER_DROPDOWN_ELEMENTS.BLOCK_ACTION_PLACE:
            case FILLED_ORDER_DROPDOWN_ELEMENTS.DPT_STATION_BLOCK:
              break;
          }
        }
        emit('input', {
          orderTextSource: state.orderTextSource,
          patternId: getSelectedOrderPattern.value._id,
          orderTitle: getSelectedOrderPattern.value.title,
          orderText: state.orderPatternText,
        });
      };

      return {
        state,
        ORDER_TEXT_SOURCE,
        getOrderPatterns,
        getSelectedOrderPattern,
        handleFocusDropdown,
        handleChooseOrderPattern,
        handleFocusInput,
        handleChangeOrderTitle,
        handleChangeOrderPatternElementValue,
      };
    },
  };
</script>
