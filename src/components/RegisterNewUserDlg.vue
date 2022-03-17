<template>
  <Dialog
    header="Оформление заявки на регистрацию нового пользователя"
    v-model:visible="state.dlgVisible"
    style="width:auto; maxWidth:600px"
    :modal="true"
    @hide="closeDialog"
  >
    <form @submit.prevent="handleSubmit(!v$.$invalid)" class="p-grid">

      <!-- ЛОГИН -->

      <div class="p-field p-col-6 p-d-flex p-flex-column p-m-0">
        <label
          for="new-user-login"
          :class="{'p-error':(v$.login.$invalid && submitted) || state.fieldsErrorsFromServer.login}"
        >
          <span class="p-text-bold"><span class="dy58-required-field">*</span> Логин</span>
        </label>
        <InputText
          id="new-user-login"
          v-model="v$.login.$model"
          :class="{'p-invalid':(v$.login.$invalid && submitted) || state.fieldsErrorsFromServer.login}"
        />
        <small
          v-if="(v$.login.$invalid && submitted) || v$.login.$pending.$response || state.fieldsErrorsFromServer.login"
          class="p-error"
        >
          {{ state.fieldsErrorsFromServer.login || 'Не задан логин' }}
        </small>
      </div>

      <!-- ПАРОЛЬ -->

      <div class="p-field p-col-6 p-d-flex p-flex-column p-m-0">
        <label
          for="new-user-password"
          :class="{'p-error':(v$.password.$invalid && submitted) || state.fieldsErrorsFromServer.password}"
        >
          <span class="p-text-bold"><span class="dy58-required-field">*</span> Пароль</span>
        </label>
        <InputText
          id="new-user-password"
          v-model="v$.password.$model"
          :class="{'p-invalid':(v$.password.$invalid && submitted) || state.fieldsErrorsFromServer.password}"
        />
        <small
          v-if="(v$.password.$invalid && submitted) || v$.password.$pending.$response || state.fieldsErrorsFromServer.password"
          class="p-error"
        >
          {{ state.fieldsErrorsFromServer.password || 'Не задан пароль' }}
        </small>
      </div>

      <!-- ИМЯ -->

      <div class="p-field p-col-4 p-d-flex p-flex-column p-m-0">
        <label
          for="new-user-name"
          :class="{'p-error':(v$.name.$invalid && submitted) || state.fieldsErrorsFromServer.name}"
        >
          <span class="p-text-bold"><span class="dy58-required-field">*</span> Имя</span>
        </label>
        <InputText
          id="new-user-name"
          v-model="v$.name.$model"
          :class="{'p-invalid':(v$.name.$invalid && submitted) || state.fieldsErrorsFromServer.name}"
        />
        <small
          v-if="(v$.name.$invalid && submitted) || v$.name.$pending.$response || state.fieldsErrorsFromServer.name"
          class="p-error"
        >
          {{ state.fieldsErrorsFromServer.name || 'Не указано имя' }}
        </small>
      </div>

      <!-- ОТЧЕСТВО -->

      <div class="p-field p-col-4 p-d-flex p-flex-column p-m-0">
        <label
          for="new-user-father-name"
          :class="{'p-error':(v$.fatherName.$invalid && submitted) || state.fieldsErrorsFromServer.fatherName}"
        >
          <span class="p-text-bold">Отчество</span>
        </label>
        <InputText
          id="new-user-father-name"
          v-model="v$.fatherName.$model"
          :class="{'p-invalid':(v$.fatherName.$invalid && submitted) || state.fieldsErrorsFromServer.fatherName}"
        />
        <small
          v-if="(v$.fatherName.$invalid && submitted) || v$.fatherName.$pending.$response || state.fieldsErrorsFromServer.fatherName"
          class="p-error"
        >
          {{ state.fieldsErrorsFromServer.fatherName || 'Неверно указано отчество' }}
        </small>
      </div>

      <!-- ФАМИЛИЯ -->

      <div class="p-field p-col-4 p-d-flex p-flex-column p-m-0">
        <label
          for="new-user-surname"
          :class="{'p-error':(v$.surname.$invalid && submitted) || state.fieldsErrorsFromServer.surname}"
        >
          <span class="p-text-bold"><span class="dy58-required-field">*</span> Фамилия</span>
        </label>
        <InputText
          id="new-user-surname"
          v-model="v$.surname.$model"
          :class="{'p-invalid':(v$.surname.$invalid && submitted) || state.fieldsErrorsFromServer.surname}"
        />
        <small
          v-if="(v$.surname.$invalid && submitted) || v$.surname.$pending.$response || state.fieldsErrorsFromServer.surname"
          class="p-error"
        >
          {{ state.fieldsErrorsFromServer.surname || 'Не указана фамилия' }}
        </small>
      </div>

      <!-- СЛУЖБА -->

      <div class="p-field p-col-6 p-d-flex p-flex-column p-m-0">
        <label
          for="new-user-service"
          :class="{'p-error':(v$.service.$invalid && submitted) || state.fieldsErrorsFromServer.service}"
        >
          <span class="p-text-bold"><span class="dy58-required-field">*</span> Служба</span>
        </label>
        <Dropdown
          id="new-user-service"
          v-model="v$.service.$model"
          :options="state.services"
          optionLabel="title"
          optionValue="title"
          dataKey="id"
          :class="{'p-invalid':(v$.service.$invalid && submitted) || state.fieldsErrorsFromServer.service}"
          :loading="state.loadingServices"
        />
        <small
          v-if="(v$.service.$invalid && submitted) || v$.service.$pending.$response || state.fieldsErrorsFromServer.service"
          class="p-error"
        >
          {{ state.fieldsErrorsFromServer.service || 'Не определена служба' }}
        </small>
      </div>

     <!-- ДОЛЖНОСТЬ -->

      <div class="p-field p-col-6 p-d-flex p-flex-column p-m-0">
        <label
          for="new-user-post"
          :class="{'p-error':(v$.post.$invalid && submitted) || state.fieldsErrorsFromServer.post}"
        >
          <span class="p-text-bold"><span class="dy58-required-field">*</span> Должность</span>
        </label>
        <Dropdown
          id="new-user-post"
          v-model="v$.post.$model"
          :options="state.posts"
          optionLabel="title"
          optionValue="id"
          dataKey="id"
          :class="{'p-invalid':(v$.post.$invalid && submitted) || state.fieldsErrorsFromServer.post}"
          :loading="state.loadingPosts"
        />
        <small
          v-if="(v$.post.$invalid && submitted) || v$.post.$pending.$response || state.fieldsErrorsFromServer.post"
          class="p-error"
        >
          {{ state.fieldsErrorsFromServer.post || 'Не определена должность' }}
        </small>
      </div>

      <!-- УЧАСТКИ ДНЦ -->

      <div class="p-field p-col-12 p-d-flex p-flex-column p-m-0">
        <label
          for="new-user-dnc-sectors"
          :class="{'p-error':(v$.dncSectors.$invalid && submitted) || state.fieldsErrorsFromServer.dncSectors}"
        >
          <span class="p-text-bold">Участки ДНЦ</span>
        </label>
        <MultiSelect
          id="new-user-dnc-sectors"
          v-model="v$.dncSectors.$model"
          :options="state.allDNCSectors"
          optionLabel="title"
          optionValue="id"
          dataKey="id"
          :class="{'p-invalid':(v$.dncSectors.$invalid && submitted) || state.fieldsErrorsFromServer.dncSectors}"
          :loading="state.loadingDNCSectors"
        />
        <small
          v-if="(v$.dncSectors.$invalid && submitted) || v$.dncSectors.$pending.$response || state.fieldsErrorsFromServer.dncSectors"
          class="p-error"
        >
          {{ state.fieldsErrorsFromServer.dncSectors || 'Не определены участки ДНЦ' }}
        </small>
      </div>

      <!-- УЧАСТКИ ЭЦД -->

      <div class="p-field p-col-12 p-d-flex p-flex-column p-m-0">
        <label
          for="new-user-ecd-sectors"
          :class="{'p-error':(v$.ecdSectors.$invalid && submitted) || state.fieldsErrorsFromServer.ecdSectors}"
        >
          <span class="p-text-bold">Участки ЭЦД</span>
        </label>
        <MultiSelect
          id="new-user-ecd-sectors"
          v-model="v$.ecdSectors.$model"
          :options="state.allECDSectors"
          optionLabel="title"
          optionValue="id"
          dataKey="id"
          :class="{'p-invalid':(v$.ecdSectors.$invalid && submitted) || state.fieldsErrorsFromServer.ecdSectors}"
          :loading="state.loadingECDSectors"
        />
        <small
          v-if="(v$.ecdSectors.$invalid && submitted) || v$.ecdSectors.$pending.$response || state.fieldsErrorsFromServer.ecdSectors"
          class="p-error"
        >
          {{ state.fieldsErrorsFromServer.ecdSectors || 'Не определены участки ЭЦД' }}
        </small>
      </div>

      <div
        v-if="!state.loadingDataErrors.length && !state.waitingForServerResponse"
        class="p-col-12 p-mt-2 p-text-right"
      >
        <Button type="submit" class="p-mr-2" label="Отправить" />
        <Button label="Закрыть" @click="closeDialog" />
      </div>
      <div v-else-if="state.loadingDataErrors.length" class="p-col-12 p-d-flex p-flex-column">
        <p v-for="error in state.loadingDataErrors" :key="error" class="p-error">
          {{ error }}
        </p>
      </div>
      <div v-else class="p-col-12 p-mt-2">
        <ProgressSpinner />
      </div>
    </form>
  </Dialog>
</template>


<script>
  import { onMounted, reactive, ref, watch } from 'vue';
  import { useVuelidate } from '@vuelidate/core';
  import { required } from '@vuelidate/validators';
  import showMessage from '@/hooks/showMessage.hook';
  import { getAllPostsFromServer } from '@/serverRequests/posts.requests';
  import { getAllServicesFromServer } from '@/serverRequests/services.requests';
  import { getAllDNCSectorsShortData } from '@/serverRequests/dncSectors.requests';
  import { getAllECDSectorsShortData } from '@/serverRequests/ecdSectors.requests';
  import { applyForRegistration } from '@/serverRequests/auth.requests';
  import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';

  export default {
    name: 'dy58-register-new-user-dialog',

    emits: ['close'],

    props: {
      showDlg: {
        type: Boolean,
        required: true,
      },
    },

    setup(props, { emit }) {
      const { showSuccessMessage, showErrMessage } = showMessage();

      const state = reactive({
        dlgVisible: false,

        login: '',
        password: '',
        name: '',
        fatherName: null,
        surname: '',
        service: '',
        post: '',
        contactData: null,
        roles: [],
        stations: [],
        dncSectors: [],
        ecdSectors: [],

        // Информация, загружаемая с сервера
        services: [],
        loadingServices: false,
        posts: [],
        loadingPosts: false,
        allDNCSectors: [],
        loadingDNCSectors: false,
        allECDSectors: [],
        loadingECDSectors: false,
        loadingDataErrors: [],

        waitingForServerResponse: false,
        fieldsErrorsFromServer: {},
      });

      watch(() => props.showDlg, (newVal) => state.dlgVisible = newVal);

      onMounted(() => {
        // Загружаем информацию обо всех должностях
        state.loadingServices = true;
        getAllPostsFromServer()
          .then((responseData) => {
            state.loadingServices = false;
            if (responseData) {
              state.posts = responseData.map((item) => ({
                id: item.P_ID,
                title: item.P_Abbrev,
              }));
            }
          })
          .catch((error) => {
            state.loadingServices = false;
            state.loadingDataErrors.push(formErrorMessageInCatchBlock(error, 'Ошибка загрузки служб'));
          });
        // Загружаем информацию обо всех службах
        state.loadingPosts = true;
        getAllServicesFromServer()
          .then((responseData) => {
            state.loadingPosts = false;
            if (responseData) {
              state.services = responseData.map((item) => ({
                id: item.S_ID,
                title: item.S_Abbrev,
              }));
            }
          })
          .catch((error) => {
            state.loadingPosts = false;
            state.loadingDataErrors.push(formErrorMessageInCatchBlock(error, 'Ошибка загрузки должностей'));
          });
        // Загружаем информацию обо всех участках ДНЦ
        state.loadingDNCSectors = true;
        getAllDNCSectorsShortData()
          .then((responseData) => {
            state.loadingDNCSectors = false;
            if (responseData) {
              state.allDNCSectors = responseData.map((item) => ({
                id: item.DNCS_ID,
                title: item.DNCS_Title,
              }));
            }
          })
          .catch((error) => {
            state.loadingDNCSectors = false;
            state.loadingDataErrors.push(formErrorMessageInCatchBlock(error, 'Ошибка загрузки участков ДНЦ'));
          });
        // Загружаем информацию обо всех участках ЭЦД
        state.loadingECDSectors = true;
        getAllECDSectorsShortData()
          .then((responseData) => {
            state.loadingECDSectors = false;
            if (responseData) {
              state.allECDSectors = responseData.map((item) => ({
                id: item.ECDS_ID,
                title: item.ECDS_Title,
              }));
            }
          })
          .catch((error) => {
            state.loadingECDSectors = false;
            state.loadingDataErrors.push(formErrorMessageInCatchBlock(error, 'Ошибка загрузки участков ЭЦД'));
          });
      });

      const rules = reactive({
        login: { required },
        password: { required },
        name: { required },
        fatherName: {},
        surname: { required },
        service: { required },
        post: { required },
        contactData: {},
        roles: {},
        stations: {},
        dncSectors: {},
        ecdSectors: {},
      });

      const submitted = ref(false);
      // Код { $scope: false } нужен для того чтобы (цитата из справочника):
      // "collect no validation results and emit none", т.к. без этого куска кода было было поведение по
      // умолчанию: "...collect results from all and emits to all, this is the default setting.
      // This means that each component that uses useVuelidate, can collect results from validation children,
      // and emit to parent components."
      const v$ = useVuelidate(rules, state, { $scope: false });

      const handleSubmit = (isFormValid) => {
        submitted.value = true;
        state.fieldsErrorsFromServer = {};
        if (!isFormValid) {
          showErrMessage('Не могу отправить запрос на сервер: не заполнены / неверно заполнены его поля');
          return;
        }
        state.waitingForServerResponse = true;
        applyForRegistration({
          login: state.login,
          password: state.password,
          name: state.name,
          fatherName: state.fatherName,
          surname: state.surname,
          post: state.post,
          contactData: state.contactData,
          service: state.service,
          roles: state.roles,
          stations: state.stations,
          dncSectors: state.dncSectors,
          ecdSectors: state.ecdSectors,
        })
        .then((responseData) => {
          state.waitingForServerResponse = false;
          showSuccessMessage(responseData.message);
        })
        .catch((error) => {
          state.waitingForServerResponse = false;
          if (error && error.response && error.response.data && error.response.data.errors) {
            error.response.data.errors.forEach((err) => {
              state.fieldsErrorsFromServer[err.param] = err.msg;
            });
          }
          const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка регистрации пользователя');
          showErrMessage(errMessage);
        });
      };

      const resetForm = () => {
        state.login = '';
        state.password = '';
        state.name = '';
        state.fatherName = null;
        state.surname = '';
        state.service = '';
        state.post = '';
        state.contactData = null;
        state.roles = [];
        state.stations = [];
        state.dncSectors = [];
        state.ecdSectors = [];
      };

      const closeDialog = () => {
        resetForm();
        state.fieldsErrorsFromServer = {};
        submitted.value = false;
        emit('close');
      };

      return {
        state,
        submitted,
        v$,
        handleSubmit,
        closeDialog,
      };
    },
  };
</script>
