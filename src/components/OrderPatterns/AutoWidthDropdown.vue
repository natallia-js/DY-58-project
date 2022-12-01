<template>
  <!-- display: 'inline-block' нужно для того чтобы этот div автоматически подстраивался
  по ширине под ширину компонента Dropdown -->
  <div :style="{ display: 'inline-block' }" ref="dropdown">
    <Dropdown
      :style="getDropdownStyle"
      :options="dropdownValues"
      optionLabel="label"
      optionValue="value"
      v-model="dropdownValue"
      v-tooltip="tooltip"
      :placeholder="placeholder"
      :editable="isDropdownEditable"
      class="dy58-auto-width-dropdown"
    />
    <div class="p-component dy58-auto-width-input-buffer" ref="inputBuffer"></div>
  </div>
</template>


<script>
  import { computed, ref, watch, onMounted } from 'vue';

  export default {
    name: 'dy58-auto-width-dropdown',

    props: {
      dropdownValues: Array,
      modelValue: String,
      width: [String, Number],
      tooltip: String,
      placeholder: String,
      isDropdownEditable: Boolean,
    },

    emits: ['update:modelValue'],

    setup(props, { emit }) {
      const dropdownValue = ref(null);
      const dropdown = ref(null);
      const inputBuffer = ref(null);
      const isMounted = ref(false);

      const getDropdownStyle = computed(() => {
        if (props.width === 'auto')
          return { minWidth: '150px' };
        return { width: props.width };
      });

      // Данный момент жизненного цикла был добавлен для того чтобы отреагировать корректно
      // на наличие значения в props.modelValue на момент создания компонента, а именно:
      // чтобы оно присвоилось в dropdownValue и автоматически сработал watch по dropdownValue.
      // Если делать { immediate: true } в watch по props.modelValue, то не попадаем в
      // watch по dropdownValue в момент создания компонента (т.к. все это происходит до onCreated)
      onMounted(() => {
        dropdownValue.value = props.modelValue;
        isMounted.value = true;
      });

      watch(() => props.modelValue, (value) => {
        dropdownValue.value = value;
      });

      watch(dropdownValue, () => {
        emit('update:modelValue', dropdownValue.value);

        // Если ширину компонента не нужно подстраивать под ширину текстового содержимого, то ничего не делаем
        if (props.width !== 'auto' || !isMounted.value)
          return;

        // Поскольку имеем дело с компонентом dropdown, который можно редактировать,
        // dropdownValue в зависимости от ситуации может содержать как значение поля value элемента из списка
        // dropdownValues, так и значение, которое пользователь вводит вручную в данный компонент.

        // Поэтому вначале смотрим, содержится ли текущее значение dropdownValue в списке dropdownValues (поиск по полю value).
        // Если да, то в элемент буфера заносим соответствующее значение поля label соответствующего элемента
        // из dropdownValues. В противном случае в элемент буфера заносим заносим то значение, которое непосредственно
        // содержится в dropdown-элементе (это значение пользователь ввел вручную)
        const label = props.dropdownValues.find((el) => el.value == dropdownValue.value)?.label;
        inputBuffer.value.innerHTML = label || dropdownValue.value || '';

        // Компонент Dropdown в html представляет собой блок (div класса p-dropdown) со вложеными элементами:
        // div (p-hidden-accessible), input (p-dropdown-label p-inputtext), div (p-dropdown-trigger).
        // Это значит, что для автоматического пересчета ширины компонента Dropdown необходимо просуммировать
        // ширину div (p-hidden-accessible) и div (p-dropdown-trigger), padding по x и border по x у div (p-dropdown),
        // div (p-hidden-accessible), input (p-dropdown-label p-inputtext) и div (p-dropdown-trigger).
        // Потом добавить к ним ширину скрытого div (dy58-auto-width-input-buffer), которая была автоматически
        // установлена выше при присвоении значения inputBuffer.value.innerHTML.

        const dropdownBlock = dropdown.value.querySelector('.p-dropdown');
        const dropdownHidden = dropdown.value.querySelector('.p-hidden-accessible');
        const dropdownInput = dropdown.value.querySelector('input.p-dropdown-label');
        const dropdownTriggerBlock = dropdown.value.querySelector('.p-dropdown-trigger');

        // Узнаем paddings и borders по X для элемента dropdownBlock (в px)
        let cs = getComputedStyle(dropdownBlock);
        let paddingX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
        let borderX = parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);

        // Узнаем paddings и borders по X, а также ширину элемента dropdownHidden (в px)
        cs = getComputedStyle(dropdownHidden);
        paddingX += parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
        borderX += parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
        let w = parseFloat(cs.width);

        // Узнаем paddings и borders по X для элемента dropdownInput (в px)
        cs = getComputedStyle(dropdownInput);
        paddingX += parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
        borderX += parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);

        // Узнаем paddings и borders по X, а также ширину элемента dropdownTriggerBlock (в px)
        cs = getComputedStyle(dropdownTriggerBlock);
        paddingX += parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
        borderX += parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
        w += parseFloat(cs.width);

        // Устанавливаем ширину компонента Dropdown, учитывая все найденные ранее paddingX, borderX и w,
        // а также ширину буфера.
        // clientWidth - это ширина блока, включая padding, но без border, margin и без scroll
        dropdownBlock.style.width = inputBuffer.value.clientWidth + w + paddingX + borderX + 'px';
      });

      return {
        dropdownValue,
        dropdown,
        inputBuffer,
        getDropdownStyle,
      };
    },
  }
</script>
