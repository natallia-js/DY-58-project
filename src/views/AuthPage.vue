<template>
  <div class="p-d-flex p-jc-center p-ai-center" style="height:100vh;">
    <RegisterNewUserDlg
      :showDlg="state.showRegisterNewUserDlg"
      @close="hideRegisterNewUserDlg"
    />
    <div style="max-width:600px;">
      <Toast />
      <div class="dy58-title-huge p-mb-4">Журнал ДУ-58</div>
      <div class="p-text-bold p-mb-4">Авторизуйтесь в системе</div>
      <div v-if="canUserWorkWithSystem || isUserAuthenticated" class="p-mb-3">
        <Button :label="`Продолжить как ${getUserFIO}`" @click="handleContinueLogin" />
      </div>
      <form @submit.prevent="handleSubmit(!v$.$invalid)" class="p-grid">
        <div class="p-field p-col-12 p-d-flex p-flex-column">
          <label for="userName" :class="{'p-error': v$.userName.$invalid && state.submitted}">
            <span class="dy58-required-field">*</span> Имя пользователя
          </label>
          <InputText
            id="userName"
            autofocus
            v-model="v$.userName.$model"
            :class="{'p-invalid':v$.userName.$invalid && state.submitted}"
          />
          <small
            v-if="(v$.userName.$invalid && state.submitted) || v$.userName.$pending.$response"
            class="p-error"
          >
            Введите имя пользователя
          </small>
        </div>
        <div class="p-field p-col-12 p-d-flex p-flex-column">
          <label for="password" :class="{'p-error':v$.password.$invalid && state.submitted}">
            <span class="dy58-required-field">*</span> Пароль
          </label>
          <InputText
            id="password"
            type="password"
            v-model="v$.password.$model"
            :class="{'p-invalid':v$.password.$invalid && state.submitted}"
          />
          <small
            v-if="(v$.password.$invalid && state.submitted) || v$.password.$pending.$response"
            class="p-error"
          >
            Введите пароль
          </small>
        </div>
        <div class="p-field p-col-12 p-d-flex p-flex-column">
          <div class="p-field-checkbox">
            <Checkbox id="take-duty" v-model="state.takeDuty" :binary="true" />
            <label for="take-duty">Принять дежурство</label>
          </div>
        </div>
        <div v-if="!state.waitingForServerResponse" class="p-col-12">
          <Button type="submit" label="Войти" class="p-mr-2" />
          <Button class="p-button-secondary" label="Отправить заявку на регистрацию" @click="handleRegisterUser" />
        </div>
        <div v-else class="p-col-12">
          <ProgressSpinner />
        </div>
      </form>
    </div>
  </div>
</template>


<script>
  import { computed, onMounted, reactive } from 'vue';
  import { useStore } from 'vuex';
  import { required } from '@vuelidate/validators';
  import { useVuelidate } from '@vuelidate/core';
  import { useRouter } from 'vue-router';
  import { authUser } from '@/serverRequests/auth.requests';
  import showMessage from '@/hooks/showMessage.hook';
  import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';
  import getUserWorkPoligonsArray from '@/additional/getUserWorkPoligonsArray';
  import RegisterNewUserDlg from '@/components/RegisterNewUserDlg';

  export default {
    name: 'dy58-auth-page',

    components: {
      RegisterNewUserDlg,
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
      });

      const rules = {
        userName: {
          required,
        },
        password: {
          required,
        },
      };

      const v$ = useVuelidate(rules, state, { $scope: false });

      // Решает следующую проблему: если у пользователя несколько ролей и полигонов управления, то когда он
      // переходит после успешной авторизации на страницу выбора роли и полигона управления, а потом через
      // кнопку "Назад" (именно БРАУЗЕРНУЮ!) возвращается снова на страницу авторизации и входит под другой
      // учетной записью, оказываясь вновь на странице выбора роли и рабочего полигона, то система подгружает
      // данные, которые относились к предыдущей учетке. Все это происходит потому, что повторный вход реально
      // не осуществляется, т.к. не было выхода из системы.
      onMounted(() => {
        //store.dispatch('logout');
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
       * Этот вход в систему будет возможно осуществить, если пользователь ранее в текущу сессию
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
          });
        } catch (error) {
          state.waitingForServerResponse = false;
          const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка входа пользователя в систему');
          showErrMessage(errMessage);
          return;
        }

        await store.dispatch('login', {
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

      return {
        state,
        v$,
        canUserWorkWithSystem,
        isUserAuthenticated,
        handleContinueLogin,
        handleSubmit,
        handleRegisterUser,
        hideRegisterNewUserDlg,
        getUserFIO: computed(() => store.getters.getUserFIO),
      };
    },
  }
</script>
