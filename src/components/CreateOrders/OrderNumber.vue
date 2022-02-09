<template>
  <OverlayPanel
    v-if="canEditOrderNumber"
    ref="newNumberOverlayPanel"
    appendTo="body"
    :showCloseIcon="true"
    id="new-number-overlay_panel"
    style="width:200px"
    :breakpoints="{'960px':'75vw'}"
  >
    <div class="p-d-flex p-flex-column">
      <label for="new-number" :class="{'p-error':wrongOrderNumber,'p-mb-2':true}">
        <span class="p-text-bold"><span class="dy58-required-field">*</span> Новый номер</span>
      </label>
      <InputText
        id="new-number"
        v-model="state.number"
        :class="{'p-invalid':wrongOrderNumber}"
      />
    </div>
  </OverlayPanel>

  <label for="number" :class="{'p-error':wrongOrderNumber}">
    <span class="p-text-bold"><span class="dy58-required-field">*</span> Номер</span>
  </label>
  <div class="p-inputgroup">
    <InputText
      id="number"
      disabled
      v-model="state.number"
      :class="{'p-invalid':wrongOrderNumber}"
    />
    <Button
      v-if="canEditOrderNumber"
      icon="pi pi-times-circle"
      class="p-button-outlined dy58-addon-button"
      v-tooltip.bottom="'Нарушить текущую нумерацию'"
      @click="changeOrderNumber"
      aria:haspopup="true"
      aria-controls="new-number-overlay_panel"
    />
    <Button
      v-if="canEditOrderNumber"
      icon="pi pi-refresh"
      class="p-button-outlined dy58-addon-button"
      v-tooltip.bottom="'Получить последний номер у сервера'"
      @click="refreshOrderNumber"
      aria:haspopup="true"
      aria-controls="new-number-overlay_panel"
    />
  </div>
  <small v-if="loadingLastOrdersParamsStatus">
    Получаю данные с сервера...
  </small>
</template>

<script>
  import { computed, reactive, ref, watch } from 'vue';
  import { useStore } from 'vuex';

  export default {
    name: 'dy58-order-number',

    emits: ['input'],

    props: {
      canEditOrderNumber: {
        type: Boolean,
        required: true,
      },
      wrongOrderNumber: {
        type: Boolean,
        required: true,
      },
      value: {
        type: Number,
        required: true,
      },
    },

    setup(props, { emit }) {
      const store = useStore();

      const state = reactive({
        number: props.value,
      });

      watch(() => props.value, (newVal) => state.number = newVal);

      watch(() => state.number, (newVal) => { emit('input', newVal) });

      const newNumberOverlayPanel = ref();
      const changeOrderNumber = (event) => {
        newNumberOverlayPanel.value.toggle(event);
      };

      // Обновление номеров ВСЕХ типов распоряжений путем выполнения запроса на сервер
      // с целью получения последних сведений о номерах распоряжений.
      const refreshOrderNumber = () => {
        store.dispatch('loadLastOrdersParams');
      };

      return {
        state,
        newNumberOverlayPanel,
        changeOrderNumber,
        refreshOrderNumber,
        loadingLastOrdersParamsStatus: computed(() => store.getters.getLoadingLastOrdersParamsStatus),
      };
    },
  }
</script>
