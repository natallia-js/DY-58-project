<template>
  <ConfirmDialog style="max-width:700px"></ConfirmDialog>
  <Dialog
    header="Оформление заявки на регистрацию нового пользователя"
    v-model:visible="state.dlgVisible"
    style="width:auto; maxWidth:1000px"
    :modal="true"
    @hide="handleCloseDialog"
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
          v-if="(v$.login.$invalid && submitted) || v$.login.$pending.$response"
          class="p-error"
        >
          {{ v$.login.$errors.length ? v$.login.$errors[0].$message : 'Неверно указан логин' }}
        </small>
        <small v-if="state.fieldsErrorsFromServer.login" class="p-error">
          {{ state.fieldsErrorsFromServer.login }}
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
        <Password
          id="new-user-password"
          v-model="v$.password.$model"
          inputStyle="width:100%"
          :class="{'p-invalid':(v$.password.$invalid && submitted) || state.fieldsErrorsFromServer.password}"
          toggleMask
        />
        <small
          v-if="(v$.password.$invalid && submitted) || v$.password.$pending.$response"
          class="p-error"
        >
          {{ v$.password.$errors.length ? v$.password.$errors[0].$message : 'Неверно указан пароль' }}
        </small>
        <small v-if="state.fieldsErrorsFromServer.password" class="p-error">
          {{ state.fieldsErrorsFromServer.password }}
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

      <!-- СЛУЖБА, КОТОРОЙ ПРИНАДЛЕЖИТ ПОЛЬЗОВАТЕЛЬ -->

      <div class="p-field p-col-6 p-d-flex p-flex-column p-m-0">
        <label
          for="new-user-service"
          :class="{'p-error':(v$.userService.$invalid && submitted) || state.fieldsErrorsFromServer.userService}"
        >
          <span class="p-text-bold">Служба</span>
        </label>
        <Dropdown
          id="new-user-service"
          v-model="v$.userService.$model"
          :options="state.allServices"
          optionLabel="title"
          optionValue="title"
          dataKey="id"
          :class="{'p-invalid':(v$.userService.$invalid && submitted) || state.fieldsErrorsFromServer.userService}"
          :loading="state.loadingServices"
        />
        <small
          v-if="(v$.userService.$invalid && submitted) || v$.userService.$pending.$response || state.fieldsErrorsFromServer.userService"
          class="p-error"
        >
          {{ state.fieldsErrorsFromServer.userService || 'Не определена служба' }}
        </small>
      </div>

      <!-- СЛУЖБА, ШАБЛОНАМИ ДОКУМЕНТОВ КОТОРОЙ БУДЕТ ПОЛЬЗОВАТЬСЯ ПОЛЬЗОВАТЕЛЬ -->

      <div class="p-field p-col-6 p-d-flex p-flex-column p-m-0">
        <label
          for="new-order-patterns-service"
          :class="{'p-error':(v$.service.$invalid && submitted) || state.fieldsErrorsFromServer.service}"
        >
          <span class="p-text-bold">Служба шаблонов документов</span>
        </label>
        <Dropdown
          id="new-order-patterns-service"
          v-model="v$.service.$model"
          :options="state.allServices"
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
          :options="state.allPosts"
          optionLabel="title"
          optionValue="title"
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

      <!-- РОЛИ -->

      <div class="p-field p-col-6 p-d-flex p-flex-column p-m-0">
        <label
          for="new-user-roles"
          :class="{'p-error':(v$.roles.$invalid && submitted) || state.fieldsErrorsFromServer.roles}"
        >
          <span class="p-text-bold">Роли</span>
        </label>
        <MultiSelect
          id="new-user-roles"
          v-model="v$.roles.$model"
          :options="state.allRoles"
          optionLabel="title"
          optionValue="id"
          dataKey="id"
          :class="{'p-invalid':(v$.roles.$invalid && submitted) || state.fieldsErrorsFromServer.roles}"
          :loading="state.loadingRoles"
          :filter="true"
        >
          <template #option="slotProps">
            <div style="overflow:auto">
              {{ slotProps.option.title }}
            </div>
          </template>
        </MultiSelect>
        <small
          v-if="(v$.roles.$invalid && submitted) || v$.roles.$pending.$response || state.fieldsErrorsFromServer.roles"
          class="p-error"
        >
          {{ state.fieldsErrorsFromServer.roles || 'Не определены роли' }}
        </small>
      </div>

      <div class="p-col-12 p-text-bold">
        Полигоны работы
      </div>

      <!-- СТАНЦИИ -->

      <div class="p-field p-col-12 p-d-flex p-flex-column p-m-0">
        <label
          for="new-user-stations"
          :class="{'p-error':(v$.stations.$invalid && submitted) || state.fieldsErrorsFromServer.stations}"
        >
          <span class="p-text-bold p-mr-2">Станции</span>
          <Button
            label="Включить рабочие места Руководителей работ всех станций"
            class="p-mt-2 p-button-secondary p-button-outlined"
            @click="includeAllWorkManagerWorkPlaces"
          />
        </label>
        <MultiSelect
          id="new-user-stations"
          v-model="v$.stations.$model"
          :options="state.allStations"
          optionLabel="title"
          optionValue="id"
          dataKey="id"
          :class="{'p-invalid':(v$.stations.$invalid && submitted) || state.fieldsErrorsFromServer.stations}"
          :loading="state.loadingStations"
          :filter="true"
        >
          <template #option="slotProps">
            <div :class="{ 'p-ml-5': Boolean(slotProps.option.id.workPlaceId) }">
              {{ slotProps.option.title }}
            </div>
          </template>
        </MultiSelect>
        <small
          v-if="(v$.stations.$invalid && submitted) || v$.stations.$pending.$response || state.fieldsErrorsFromServer.stations"
          class="p-error"
        >
          {{ state.fieldsErrorsFromServer.stations || 'Не определены станции' }}
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
          :filter="true"
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
          :filter="true"
        />
        <small
          v-if="(v$.ecdSectors.$invalid && submitted) || v$.ecdSectors.$pending.$response || state.fieldsErrorsFromServer.ecdSectors"
          class="p-error"
        >
          {{ state.fieldsErrorsFromServer.ecdSectors || 'Не определены участки ЭЦД' }}
        </small>
      </div>

      <!-- ЛОГИН -->

      <div class="p-field p-col-12 p-d-flex p-flex-column p-m-0">
        <label
          for="new-user-contact-data"
          :class="{'p-error':(v$.contactData.$invalid && submitted) || state.fieldsErrorsFromServer.contactData}"
        >
          <span class="p-text-bold">Контактные данные</span>
        </label>
        <InputText
          id="new-user-contact-data"
          v-model="v$.contactData.$model"
          :class="{'p-invalid':(v$.contactData.$invalid && submitted) || state.fieldsErrorsFromServer.contactData}"
        />
        <small
          v-if="(v$.contactData.$invalid && submitted) || v$.contactData.$pending.$response || state.fieldsErrorsFromServer.contactData"
          class="p-error"
        >
          {{ state.fieldsErrorsFromServer.contactData || 'Не указаны контактные данные' }}
        </small>
      </div>

      <div
        v-if="!state.loadingDataErrors.length && !state.waitingForServerResponse"
        class="p-col-12 p-mt-2 p-text-right"
      >
        <Button type="submit" class="p-mr-2" label="Отправить" />
        <Button class="p-mr-2 p-button-secondary" label="Очистить форму" @click="handleResetForm" />
        <Button class="p-button-secondary p-button-outlined" label="Закрыть" @click="handleCloseDialog" />
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
  import { helpers, required } from '@vuelidate/validators';
  import { useConfirm } from 'primevue/useconfirm';
  import showMessage from '@/hooks/showMessage.hook';
  import { getAllPostsFromServer } from '@/serverRequests/posts.requests';
  import { getAllServicesFromServer } from '@/serverRequests/services.requests';
  import { getAllRolesFromServer } from '@/serverRequests/roles.requests';
  import { getStationsWorkPlacesData } from '@/serverRequests/stations.requests';
  import { getAllDNCSectorsShortData } from '@/serverRequests/dncSectors.requests';
  import { getAllECDSectorsShortData } from '@/serverRequests/ecdSectors.requests';
  import { applyForRegistration } from '@/serverRequests/auth.requests';
  import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';
  import compareStrings from '@/additional/compareStrings';
  import checkAuthString from '@/additional/checkAuthString';
  import { STATION_WORKPLACE_TYPES } from '@/constants/appCredentials';

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
      const confirm = useConfirm();

      const state = reactive({
        dlgVisible: false,

        login: '',
        password: '',
        name: '',
        fatherName: null,
        surname: '',
        service: '',
        userService: '',
        post: '',
        contactData: null,
        roles: [],
        stations: [],
        dncSectors: [],
        ecdSectors: [],

        // Информация, загружаемая с сервера
        allServices: [],
        loadingServices: false,
        allPosts: [],
        loadingPosts: false,
        allRoles: [],
        loadingRoles: false,
        allStations: [],
        loadingStations: false,
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
        state.loadingPosts = true;
        getAllPostsFromServer()
          .then((responseData) => {
            state.loadingPosts = false;
            if (responseData) {
              state.allPosts = responseData
                .sort((a, b) => compareStrings(a.P_Abbrev.toLowerCase(), b.P_Abbrev.toLowerCase()))
                .map((item) => ({
                  id: item.P_ID,
                  title: item.P_Abbrev,
                }));
            }
          })
          .catch((error) => {
            state.loadingPosts = false;
            state.loadingDataErrors.push(formErrorMessageInCatchBlock(error, 'Ошибка загрузки служб'));
          });
        // Загружаем информацию обо всех службах
        state.loadingServices = true;
        getAllServicesFromServer()
          .then((responseData) => {
            state.loadingServices = false;
            if (responseData) {
              state.allServices = responseData
                .sort((a, b) => compareStrings(a.S_Abbrev.toLowerCase(), b.S_Abbrev.toLowerCase()))
                .map((item) => ({
                  id: item.S_ID,
                  title: item.S_Abbrev,
                }));
            }
          })
          .catch((error) => {
            state.loadingServices = false;
            state.loadingDataErrors.push(formErrorMessageInCatchBlock(error, 'Ошибка загрузки должностей'));
          });
        // Загружаем информацию обо всех ролях
        state.loadingRoles = true;
        getAllRolesFromServer()
          .then((responseData) => {
            state.loadingRoles = false;
            if (responseData) {
              state.allRoles = responseData
                .sort((a, b) => compareStrings(a.englAbbreviation.toLowerCase(), b.englAbbreviation.toLowerCase()))
                .map((item) => ({
                  id: item._id,
                  title: `${item.englAbbreviation} - ${item.description || '<Без описания>'}`,
                }));
            }
          })
          .catch((error) => {
            state.loadingRoles = false;
            state.loadingDataErrors.push(formErrorMessageInCatchBlock(error, 'Ошибка загрузки ролей'));
          });
        // Загружаем информацию обо всех станциях и их рабочих местах
        state.loadingStations = true;
        getStationsWorkPlacesData({ stationIds: null })
          .then((responseData) => {
            state.loadingStations = false;
            if (responseData) {
              responseData
                .sort((a, b) => compareStrings(a.St_Title.toLowerCase(), b.St_Title.toLowerCase()))
                .forEach((item) => {
                  state.allStations.push({
                    id: { id: item.St_ID, workPlaceId: null },
                    title: `${item.St_Title} (${item.St_UNMC})`,
                  });
                  if (item.TStationWorkPlaces) {
                    item.TStationWorkPlaces.forEach((wp) => {
                      state.allStations.push({
                        id: { id: item.St_ID, workPlaceId: wp.SWP_ID },
                        title: `${wp.SWP_Name} (${item.St_Title})`,
                        type: wp.SWP_Type,
                      });
                    });
                  }
              });
            }
          })
          .catch((error) => {
            state.loadingStations = false;
            state.loadingDataErrors.push(formErrorMessageInCatchBlock(error, 'Ошибка загрузки станций'));
          });
        // Загружаем информацию обо всех участках ДНЦ
        state.loadingDNCSectors = true;
        getAllDNCSectorsShortData()
          .then((responseData) => {
            state.loadingDNCSectors = false;
            if (responseData) {
              state.allDNCSectors = responseData
                .sort((a, b) => compareStrings(a.DNCS_Title.toLowerCase(), b.DNCS_Title.toLowerCase()))
                .map((item) => ({
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
              state.allECDSectors = responseData
                .sort((a, b) => compareStrings(a.ECDS_Title.toLowerCase(), b.ECDS_Title.toLowerCase()))
                .map((item) => ({
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
        login: {
          required: helpers.withMessage('Введите логин', required),
          checkAuthString: helpers.withMessage('Логин должен состоять из символов латинского алфавита, цифр и знака нижнего подчеркивания', checkAuthString),
        },
        password: {
          required: helpers.withMessage('Введите пароль', required),
          checkAuthString: helpers.withMessage('Пароль должен состоять из символов латинского алфавита, цифр и знака нижнего подчеркивания', checkAuthString),
        },
        name: { required },
        fatherName: {},
        surname: { required },
        service: { required },
        userService: {},
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
        confirm.require({
          message: 'Отправить запрос на регистрацию?',
          header: 'Подтверждение действия',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
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
              userService: state.userService,
              roles: state.roles,
              stations: state.stations,
              dncSectors: state.dncSectors,
              ecdSectors: state.ecdSectors,
              redirectOnError: false,
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
          },
        });
      };

      const resetForm = () => {
        state.login = '';
        state.password = '';
        state.name = '';
        state.fatherName = null;
        state.surname = '';
        state.service = '';
        state.userService = '';
        state.post = '';
        state.contactData = null;
        state.roles = [];
        state.stations = [];
        state.dncSectors = [];
        state.ecdSectors = [];

        state.fieldsErrorsFromServer = {};
        submitted.value = false;
      };

      const handleResetForm = () => {
        resetForm();
      };

      const handleCloseDialog = () => {
        resetForm();
        emit('close');
      };

      const includeAllWorkManagerWorkPlaces = () => {
        confirm.require({
          message: 'Добавить рабочие места?',
          header: 'Подтверждение действия',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            const newWorkPlacesArray = state.stations;
            state.allStations
              .filter((item) => item.type === STATION_WORKPLACE_TYPES.WORKS_MANAGER)
              .forEach(item => {
                if (!newWorkPlacesArray.find((el) => el.id === item.id.id && el.workPlaceId === item.id.workPlaceId))
                  newWorkPlacesArray.push({ id: item.id.id, workPlaceId: item.id.workPlaceId });
              });
            state.stations = [...newWorkPlacesArray];
          },
        });
      };

      return {
        state,
        submitted,
        v$,
        handleSubmit,
        handleResetForm,
        handleCloseDialog,
        includeAllWorkManagerWorkPlaces,
      };
    },
  };
</script>
