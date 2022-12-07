<template>
  <!-- nowrap is default for p-d-flex -->
  <div class="p-d-flex p-flex-column dy58-auth-page-container">

    <div class="p-d-flex p-jc-center p-ai-center dy58-white-color-text dy58-title-huge" style="height:200px">
      АС Журнал ДУ-58
    </div>

    <div class="p-d-flex p-flex-column" style="flex-grow:4;">

      <div class="p-col-12 p-d-flex p-jc-center p-ai-center" style="margin-top:50px;">
        <RegisterNewUserDlg
          :showDlg="state.showRegisterNewUserDlg"
          @close="hideRegisterNewUserDlg"
        />

        <!--<ContactDataDlg
          :showDlg="state.showContactDataDlg"
          @close="hideContactDataDlg"
        />-->

        <div class="dy58-shadowed-block" style="max-width:400px;">
          <Toast />
          <div v-if="canUserWorkWithSystem || isUserAuthenticated" class="p-mb-3">
            <Button :label="`Продолжить как ${getUserFIO}`" @click="handleContinueLogin" />
          </div>
          <form @submit.prevent="handleSubmit(!v$.$invalid)" class="p-grid">
            <div class="p-field p-col-12 p-d-flex p-flex-column">
              <div class="p-input-icon-left">
                <i class="pi pi-user" />
                <InputText
                  id="userName"
                  autofocus
                  v-model="v$.userName.$model"
                  :class="{'p-invalid':v$.userName.$invalid && state.submitted}"
                  style="width:100%;"
                />
              </div>
              <small
                v-if="(v$.userName.$invalid && state.submitted) || v$.userName.$pending.$response"
                class="p-error p-text-bold"
              >
                {{ v$.userName.$errors.length ? v$.userName.$errors[0].$message : 'Неверно указано имя пользователя' }}
              </small>
            </div>
            <div class="p-field p-col-12 p-d-flex p-flex-column">
              <Password
                id="password"
                v-model="v$.password.$model"
                inputStyle="width:100%"
                :class="{'p-invalid':v$.password.$invalid && state.submitted}"
                :feedback="false"
                toggleMask
                style="width:100%;"
              />
              <small
                v-if="(v$.password.$invalid && state.submitted) || v$.password.$pending.$response"
                class="p-error p-text-bold"
              >
                {{ v$.password.$errors.length ? v$.password.$errors[0].$message : 'Неверно указан пароль' }}
              </small>
            </div>
            <div class="p-field p-col-12 p-d-flex p-flex-column">
              <div class="p-field-checkbox">
                <Checkbox id="take-duty" v-model="state.takeDuty" :binary="true" />
                <label for="take-duty" class="p-text-bold dy58-white-color-text">Принять дежурство</label>
              </div>
            </div>
            <div v-if="!state.waitingForServerResponse" class="p-col-12">
              <Button type="submit" label="Войти" class="p-button-rounded dy58-login-button" />
            </div>
            <div v-else class="p-col-12">
              <ProgressSpinner />
            </div>

            <div v-if="!state.waitingForServerResponse" class="p-col-12 p-d-flex p-flex-column">
              <Button
                label="Заявка на регистрацию"
                class="p-button-text dy58-white-color-text p-as-center p-text-bold"
                @click="handleRegisterUser"
              />
            </div>
            <!--<div class="p-col-12">
              <Button label="Контактные данные" @click="showContactDataDlg" style="width:210px" />
            </div>-->
          </form>
        </div>
      </div>

      <div class="p-d-flex p-flex-column p-as-end p-ml-3 p-mr-3 dy58-shadowed-block">
        <div v-if="!state.loadingUserManualsList" class="">
          <div v-if="state.userManualsListLoadError" class="dy58-white-color-text">
            {{ state.userManualsListLoadError }}
          </div>
          <div v-else>
            <div v-for="fileName of state.userManualsList" :key="fileName">
              <a href="#" @click.prevent="uploadFile(fileName)" class="dy58-load-file-link">{{ fileName }}</a>
            </div>
          </div>
        </div>
        <div v-else class="dy58-shadowed-block">
          Идет загрузка списка руководств...
        </div>
        <br />
        <Button
          class="p-button-rounded dy58-login-offline-button"
          label="Войти при отсутствии связи с сервером"
          @click="handleWorkWithSystemWithoutServerSession"
          style="width:380px"
        />
      </div>
    </div>

    <div class="p-d-flex p-jc-center p-ai-center dy58-white-color-text p-text-bold" style="height:50px;">
      <span>Журнал ДУ-58 ©2022 КТЦ БелЖД. Контактный телефон: 7-400-38-12/ городской 8-0232-95-38-12</span>
    </div>
  </div>
</template>


<script>
  import { computed, onMounted, reactive } from 'vue';
  import { useStore } from 'vuex';
  import { helpers, required } from '@vuelidate/validators';
  import { useVuelidate } from '@vuelidate/core';
  import { useRouter } from 'vue-router';
  import { authUser } from '@/serverRequests/auth.requests';
  import showMessage from '@/hooks/showMessage.hook';
  import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';
  import getUserWorkPoligonsArray from '@/additional/getUserWorkPoligonsArray';
  import RegisterNewUserDlg from '@/components/RegisterNewUserDlg';
  //import ContactDataDlg from '@/components/ContactDataDlg';
  import { LOGIN_ACTION, LOGIN_VIA_LOCAL_STORAGE_ACTION } from '@/store/action-types';
  import checkAuthString from '@/additional/checkAuthString';
  import { getUserManualsList, downloadDY58Manual } from '@/serverRequests/userManuals.requests';
  import getExtensionFromFullFileName from '@/additional/getExtensionFromFullFileName';

  export default {
    name: 'dy58-auth-page',

    components: {
      RegisterNewUserDlg,
      //ContactDataDlg,
    },

    setup() {
      const store = useStore();
      const router = useRouter();
      const { showErrMessage } = showMessage();

      const state = reactive({
        userName: '',
        password: '',
        takeDuty: false,
        submitted: false,
        waitingForServerResponse: false,
        showRegisterNewUserDlg: false,
        //showContactDataDlg: false,
        loadingUserManualsList: false,
        userManualsList: [],
        userManualsListLoadError: null,
      });

      const rules = {
        userName: {
          required: helpers.withMessage('Введите имя пользователя', required),
          checkAuthString: helpers.withMessage('Имя пользователя должно состоять из символов латинского алфавита, цифр и знака нижнего подчеркивания', checkAuthString),
        },
        password: {
          required: helpers.withMessage('Введите пароль', required),
          checkAuthString: helpers.withMessage('Пароль должен состоять из символов латинского алфавита, цифр и знака нижнего подчеркивания', checkAuthString),
        },
      };

      const v$ = useVuelidate(rules, state, { $scope: false });

      // Загружаем список руководств пользователей ДУ-58
      state.loadingUserManualsList = true;
      getUserManualsList()
        .then((data) => state.userManualsList = data.fileNamesList || [])
        .catch((error) => {
          state.userManualsListLoadError = formErrorMessageInCatchBlock(error, 'Ошибка загрузки списка руководств');
        })
        .finally(() => state.loadingUserManualsList = false);

      // Решает следующую проблему: если у пользователя несколько ролей и полигонов управления, то когда он
      // переходит после успешной авторизации на страницу выбора роли и полигона управления, а потом через
      // кнопку "Назад" (именно БРАУЗЕРНУЮ!) возвращается снова на страницу авторизации и входит под другой
      // учетной записью, оказываясь вновь на странице выбора роли и рабочего полигона, то система подгружает
      // данные, которые относились к предыдущей учетке. Все это происходит потому, что повторный вход реально
      // не осуществляется, т.к. не было выхода из системы.
      onMounted(() => {
        //store.dispatch('logout', { onlyLocally: false });

        const passwordIcon = document.createElement('i');
        passwordIcon.setAttribute('id', 'password-left-icon');
        passwordIcon.classList.add('pi', 'pi-lock');
        const passwordBlock = document.querySelector('.p-password');
        if (passwordBlock) {
          passwordBlock.insertBefore(passwordIcon, passwordBlock.children[0]);
          passwordBlock.classList.add('p-input-icon-left');
        }
      });


      const canUserWorkWithSystem = computed(() => store.getters.canUserWorkWithSystem);
      const isUserAuthenticated = computed(() => store.getters.isUserAuthenticated);

      const redirect = () => {
        if (canUserWorkWithSystem.value) {
          // Если в процессе входа в систему программе удалось явно определить полномочия пользователя и его
          // рабочий полигон, то осуществляем переход на главную страницу
          router.push({ name: 'MainPage' });
        } else if (isUserAuthenticated.value) {
          // Если в процессе входа в систему программе не удалось определить полномочия пользователя и его
          // рабочий полигон, но пользователь успешно прошел процедуру частичной аутентификации (имя + пароль),
          // то осуществляем переход на страницу выбора полномочия, с которым пользователь будет работать
          // с программой, а также соответствующего рабочего полигона
          router.push({ name: 'ConfirmAuthDataPage', params: { takeDuty: state.takeDuty } });
        } else {
          showErrMessage('Вы не прошли аутентификацию для работы с текущим приложением');
        }
      };

      /**
       * Этот вход в систему будет возможно осуществить, если пользователь ранее в текущую сессию
       * уже входил (об этом уведомил сервер), и система предлагает пользователю продолжить
       * работу в рамках этой сессии.
       */
      const handleContinueLogin = () => {
        redirect();
      };

      /**
       * Обрабатывает запрос на вход в систему.
       */
      const handleSubmit = async (isFormValid) => {
        state.submitted = true;
        if (!isFormValid) {
          showErrMessage('Не указаны либо неверно указаны данные для входа в систему');
          return;
        }
        state.waitingForServerResponse = true;
        let responseData;

        try {
          // Делаем запрос на сервер о входе пользователя в систему.
          // Если запрос завершится успешно, пользователь получит jwt-token, который позволит
          // ему продолжить работу с системой. Останется лишь определить рабочий полигон, на
          // котором пользователь будет работать в системе.
          responseData = await authUser({
            login: state.userName,
            password: state.password,
            redirectOnError: false,
          });
        } catch (error) {
          state.waitingForServerResponse = false;
          const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка входа пользователя в систему');
          showErrMessage(errMessage);
          return;
        }

        await store.dispatch(LOGIN_ACTION, {
          userId: responseData.userId,
          jtwToken: responseData.token,
          userInfo: responseData.userInfo,
          lastTakeDutyTime: null,
          lastPassDutyTime: null,
          credentials: responseData.credentials,
          workPoligons: getUserWorkPoligonsArray(responseData),
          takeDuty: state.takeDuty,
        });

        state.waitingForServerResponse = false;

        const loginResult = store.getters.getLoginResult;
        if (!loginResult || loginResult.error) {
          const errMessage = !loginResult ? 'Что-то пошло не так' : loginResult.message;
          showErrMessage(errMessage);
          return;
        }

        redirect();
      };

      const handleRegisterUser = () => {
        state.showRegisterNewUserDlg = true;
      };

      const hideRegisterNewUserDlg = () => {
        state.showRegisterNewUserDlg = false;
      };

      /*const showContactDataDlg = () => {
        state.showContactDataDlg = true;
      };

      const hideContactDataDlg = () => {
        state.showContactDataDlg = false;
      };*/

      /**
       * Если нет связи с сервером, то пользователь может войти в систему под именем последнего
       * работавшего с системой пользователя. При этом сессия на сервере не создается. Следовательно,
       * пользователь не сможет выполнять в системе никакие действия - только просматривать ранее
       * сохраненные распоряжения.
       */
      const handleWorkWithSystemWithoutServerSession = async () => {
        await store.dispatch(LOGIN_VIA_LOCAL_STORAGE_ACTION);
        redirect();
      };

      /**
       * Хотим подгрузить руководство пользователя в браузере (средствами браузера через папку загрузок).
       */
      const uploadFile = (fileName) => {
        // first, we make a request to the server to get the file response data
        downloadDY58Manual(fileName)
          .then((responseData) => {
            // then, we'll create a link from it (e.i. from response data) and click on it programmatically
            // to download the file
            const fileExtension = getExtensionFromFullFileName(fileName);
            // create a Blob instance with the responseData which has the file contents,
            // type is set to the MIME type of the file
            const blob = new Blob([responseData], { type: `application/${fileExtension}` });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
            // we call URL.revokeObjectURL to clear the URL resources
            URL.revokeObjectURL(link.href);
          })
          .catch(() => {
            showErrMessage('Ошибка загрузки руководства. Попробуйте снова');
          });
      };

      return {
        state,
        v$,
        canUserWorkWithSystem,
        isUserAuthenticated,
        handleContinueLogin,
        handleSubmit,
        handleRegisterUser,
        hideRegisterNewUserDlg,
        //showContactDataDlg,
        //hideContactDataDlg,
        handleWorkWithSystemWithoutServerSession,
        getUserFIO: computed(() => store.getters.getUserFIO),
        uploadFile,
      };
    },
  }
</script>


<style scoped>
  .dy58-auth-page-container {
    height:100vh;
    margin:0;
    background: url('~@/assets/img/LoginPageBackground.jpg') no-repeat;
    -moz-background-size: 100% 100%; /* Firefox 3.6+ */
    -webkit-background-size: 100% 100%; /* Safari 3.1+ и Chrome 4.0+ */
    -o-background-size: 100% 100%; /* Opera 9.6+ */
    background-size: cover; /* Современные браузеры */
  }
  .dy58-load-file-link {
    cursor: pointer;
    color: #ffffff;
    font-weight: 700;
    text-decoration: none;
  }
  .dy58-load-file-link:hover {
    background-color: var(--surface-400);
    color: var(--text-color);
  }
  .dy58-white-color-text {
    color: #ffffff !important;
  }
  .p-inputtext, :deep(.p-inputtext) {
    border-radius: 20px;
    padding-left: 2.5rem;
    box-shadow: 0 0 10px;
  }
  :deep(i:first-of-type) {
    left: 0.75rem;
    color: #495057;
  }
  .dy58-shadowed-block {
    background: rgba(0,0,0,.3);
    padding: 1.5rem;
    border-radius: 20px;
  }
  .dy58-login-button {
    width: 100%;
    background-color: #2C569B;
    border: 1px solid #ffffff;
    box-shadow: 0 0 10px;
  }
  .dy58-login-offline-button {
    background-color: #B55539;
    border: 1px solid #ffffff;
    box-shadow: 0 0 10px;
  }
</style>
