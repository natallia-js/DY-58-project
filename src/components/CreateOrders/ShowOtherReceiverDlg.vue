<template>
  <Dialog
    :header="dlgTitle"
    v-model:visible="state.dlgVisible"
    style="minWidth:300px; maxWidth:500px;"
    :modal="true"
    @hide="closeDialog"
  >
    <form @submit.prevent="handleSubmit(!v$.$invalid)" class="p-grid">
      <!-- МЕСТО ОТПРАВКИ РАСПОРЯЖЕНИЯ -->
      <div class="p-field p-col-12 p-d-flex p-flex-column">
        <label for="place" :class="{'p-error':v$.place.$invalid && submitted}">
          <span class="p-text-bold"><span style="color:red">*</span> Куда</span>
        </label>
        <allow-clear-input-text
          id="place"
          :value="v$.place.$model"
          @input="v$.place.$model = $event"
          style="width:100%"
          :inputClass="{'p-invalid':v$.place.$invalid && submitted}"
        />
        <small
          v-if="(v$.place.$invalid && submitted) || v$.place.$pending.$response"
          class="p-error"
        >
          Не определено место отправки распоряжения
        </small>
      </div>
      <!-- ДОЛЖНОСТЬ ЛИЦА, КОТОРОМУ АДРЕСУЕТСЯ РАСПОРЯЖЕНИЕ -->
      <div class="p-field p-col-12 p-d-flex p-flex-column">
        <label for="post" :class="{'p-error':v$.post.$invalid && submitted}">
          <span class="p-text-bold"><span style="color:red">*</span> Должность</span>
        </label>
        <allow-clear-input-text
          id="post"
          :value="v$.post.$model"
          @input="v$.post.$model = $event"
          style="width:100%"
          :inputClass="{'p-invalid':v$.post.$invalid && submitted}"
        />
        <small
          v-if="(v$.post.$invalid && submitted) || v$.post.$pending.$response"
          class="p-error"
        >
          Не определена должность
        </small>
      </div>
      <!-- ФИО ЛИЦА, КОТОРОМУ АДРЕСУЕТСЯ РАСПОРЯЖЕНИЕ -->
      <div class="p-field p-col-12 p-d-flex p-flex-column">
        <label for="fio" :class="{'p-error':v$.fio.$invalid && submitted}">
          <span class="p-text-bold">ФИО</span>
        </label>
        <allow-clear-input-text
          id="fio"
          :value="v$.fio.$model"
          @input="v$.fio.$model = $event"
          style="width:100%"
          :inputClass="{'p-invalid':v$.fio.$invalid && submitted}"
        />
      </div>
      <div class="p-field p-col-12 p-d-flex p-jc-end">
        <Button class="p-mr-2" label="Сохранить" type="submit" />
        <Button label="Отмена" @click="closeDialog" />
      </div>
    </form>
  </Dialog>
</template>


<script>
  import { computed, reactive, ref, watch } from 'vue';
  import { required } from '@vuelidate/validators';
  import { useVuelidate } from '@vuelidate/core';
  import AllowClearInputText from '../AllowClearInputText';

  export default {
    name: 'dy58-other-order-receiver-dialog',

    emits: ['close', 'input'],

    props: {
      showDlg: {
        type: Boolean,
        required: true,
      },
      dlgTitle: {
        type: String,
        required: true,
      },
      user: {
        type: Object,
        required: false,
      },
    },

    components: {
      AllowClearInputText,
    },

    setup(props, context) {
      const state = reactive({
        dlgVisible: false,
        place: '',
        post: '',
        fio: '',
      });

      const rules = {
        place: { required },
        post: { required },
        fio: {},
      };

      const submitted = ref(false);

      const v$ = useVuelidate(rules, state);

      const showDlgProp = computed(() => props.showDlg);

      watch(showDlgProp, (val) => {
        state.dlgVisible = val;
        if (val) {
          state.place = props.user ? props.user.place : '';
          state.post = props.user ? props.user.post : '';
          state.fio = props.user ? props.user.fio : '';
          submitted.value = false;
        }
      });

      const handleSubmit = (isFormValid) => {
        submitted.value = true;
        if (!isFormValid) {
          return;
        }
        context.emit('input', {
          id: props.user ? props.user.id : null,
          place: state.place,
          post: state.post,
          fio: state.fio,
        });
      };

      const closeDialog = () => {
        state.dlgVisible = false;
        context.emit('close');
      };

      return {
        state,
        v$,
        submitted,
        handleSubmit,
        closeDialog,
      };
    },
  };
</script>


<style scoped>
</style>
