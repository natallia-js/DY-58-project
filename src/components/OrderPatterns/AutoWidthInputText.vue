<template>
  <!-- display: 'inline-block' нужно для того чтобы этот div автоматически подстраивался
  по ширине под ширину компонента input -->
  <div :style="{ display: 'inline-block' }">
    <input
      :style="getInputStyle"
      v-model="inputValue"
      v-tooltip="tooltip"
      :placeholder="placeholder"
      class="p-component p-inputtext dy58-auto-width-input"
      ref="input"
    />
    <div class="p-component dy58-auto-width-input-buffer" ref="inputBuffer"></div>
  </div>
</template>


<script>
  import { computed, ref, watch, onMounted } from 'vue';

  export default {
    name: 'dy58-auto-width-input-text',

    props: {
      modelValue: String,
      width: [String, Number],
      tooltip: String,
      placeholder: String,
    },

    emits: ['update:modelValue'],

    setup(props, { emit }) {
      const inputValue = ref(null);
      const input = ref(null);
      const inputBuffer = ref(null);
      const isMounted = ref(false);

      const getInputStyle = computed(() => {
        if (props.width === 'auto')
          return { minWidth: '150px' };
        return { width: props.width };
      });

      // Данный момент жизненного цикла был добавлен для того чтобы отреагировать корректно
      // на наличие значения в props.modelValue на момент создания компонента, а именно:
      // чтобы оно присвоилось в inputValue и автоматически сработал watch по inputValue.
      // Если делать { immediate: true } в watch по props.modelValue, то не попадаем в
      // watch по inputValue в момент создания компонента (т.к. все это происходит до onCreated)
      onMounted(() => {
        inputValue.value = props.modelValue;
        isMounted.value = true;
      });

      watch(() => props.modelValue, (value) => {
        inputValue.value = value;
      });

      watch(inputValue, () => {
        emit('update:modelValue', inputValue.value);

        // Если ширину компонента не нужно подстраивать под ширину текстового содержимого, то ничего не делаем
        if (props.width !== 'auto' || !isMounted.value)
          return;

        // В элемент буфера заносим текст, содержащийся в элементе input
        inputBuffer.value.innerHTML = inputValue.value;
        // Узнаем paddings по X для элемента input (в px)
        const cs = getComputedStyle(input.value);
        const paddingX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
        // Узнаем borders по X для элемента input (в px)
        const borderX = parseFloat(cs.borderLeftWidth) + parseFloat(cs.borderRightWidth);
        // Устанавливаем ширину элемента input равную ширине буфера плюс текущие границы и padding по X элемента input
        // clientWidth - это ширина блока, включая padding, но без border, margin и без scroll
        input.value.style.width = inputBuffer.value.clientWidth + paddingX + borderX + 'px';
      });

      return {
        inputValue,
        input,
        inputBuffer,
        getInputStyle,
      };
    },
  }
</script>
