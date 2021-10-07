<template>
  <Dialog
    :header="dlgTitle"
    v-model:visible="state.dlgVisible"
    style="minWidth:300px; maxWidth:500px;"
    :modal="true"
    @hide="closeDialog"
  >
    <form @submit.prevent="handleFormSubmit(!vv$.$invalid)" class="p-grid">
      <!-- МЕСТО ОТПРАВКИ РАСПОРЯЖЕНИЯ -->
      <div class="p-field p-col-12 p-d-flex p-flex-column">
        <label for="placeTitle" :class="{'p-error':vv$.placeTitle.$invalid && submitted}">
          <span class="p-text-bold"><span style="color:red">*</span> Куда</span>
        </label>
        <allow-clear-input-text
          id="placeTitle"
          :value="vv$.placeTitle.$model"
          @input="vv$.placeTitle.$model = $event"
          style="width:100%"
          :inputClass="{'p-invalid':vv$.placeTitle.$invalid && submitted}"
        />
        <small
          v-if="(vv$.placeTitle.$invalid && submitted) || vv$.placeTitle.$pending.$response"
          class="p-error"
        >
          Не определено место отправки распоряжения
        </small>
      </div>
      <!-- ДОЛЖНОСТЬ ЛИЦА, КОТОРОМУ АДРЕСУЕТСЯ РАСПОРЯЖЕНИЕ -->
      <div class="p-field p-col-12 p-d-flex p-flex-column">
        <label for="post" :class="{'p-error':vv$.post.$invalid && submitted}">
          <span class="p-text-bold"><span style="color:red">*</span> Должность</span>
        </label>
        <allow-clear-input-text
          id="post"
          :value="vv$.post.$model"
          @input="vv$.post.$model = $event"
          style="width:100%"
          :inputClass="{'p-invalid':vv$.post.$invalid && submitted}"
        />
        <small
          v-if="(vv$.post.$invalid && submitted) || vv$.post.$pending.$response"
          class="p-error"
        >
          Не определена должность
        </small>
      </div>
      <!-- ФИО ЛИЦА, КОТОРОМУ АДРЕСУЕТСЯ РАСПОРЯЖЕНИЕ -->
      <div class="p-field p-col-12 p-d-flex p-flex-column">
        <label for="fio" :class="{'p-error':vv$.fio.$invalid && submitted}">
          <span class="p-text-bold">ФИО</span>
        </label>
        <allow-clear-input-text
          id="fio"
          :value="vv$.fio.$model"
          @input="vv$.fio.$model = $event"
          style="width:100%"
          :inputClass="{'p-invalid':vv$.fio.$invalid && submitted}"
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
        placeTitle: '',
        post: '',
        fio: '',
      });

      const rules = {
        placeTitle: { required },
        post: { required },
        fio: {},
      };

      const submitted = ref(false);

      const vv$ = useVuelidate(rules, state);

      const showDlgProp = computed(() => props.showDlg);

      watch(showDlgProp, (val) => {
        state.dlgVisible = val;
        if (val) {
          state.placeTitle = props.user ? props.user.placeTitle : '';
          state.post = props.user ? props.user.post : '';
          state.fio = props.user ? props.user.fio : '';
          submitted.value = false;
        }
      });

      const handleFormSubmit = (isFormValid) => {
        submitted.value = true;
        if (!isFormValid) {
          return;
        }
        context.emit('input', {
          _id: props.user ? props.user._id : null,
          placeTitle: state.placeTitle,
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
        vv$,
        submitted,
        handleFormSubmit,
        closeDialog,
      };
    },
  };
</script>


<style scoped>
</style>