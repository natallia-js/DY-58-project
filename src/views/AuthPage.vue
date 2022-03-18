<template>
  <div class="p-d-flex p-jc-center p-ai-center" style="height:100vh;">
    <RegisterNewUserDlg
      :showDlg="state.showRegisterNewUserDlg"
      @close="hideRegisterNewUserDlg"
    />
    <div style="max-width:600px;">
      <Toast />
      <div class="dy58-title-huge p-mb-4">Журнал ДУ-58</div>
      <div class="dy58-title-small p-mb-4">Авторизуйтесь в системе</div>
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
          <Button label="Отправить заявку на регистрацию" @click="handleRegisterUser" />
        </div>
        <div v-else class="p-col-12">
          <ProgressSpinner />
        </div>
      </form>
    </div>
  </div>
</template>


<script>
  import { reactive } from 'vue';
  import { useStore } from 'vuex';
  import { required } from '@vuelidate/validators';
  import { useVuelidate } from '@vuelidate/core';
  import { useRouter } from 'vue-router';
  import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';
  import { authUser } from '@/serverRequests/auth.requests';
  import showMessage from '@/hooks/showMessage.hook';
  import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';
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

      /**
       *
       */
      const handleSubmit = async (isFormValid) => {
        state.submitted = true;
        if (!isFormValid) {
          showErrMessage('Не указаны либо неверно указаны данные для входа в систему');
          return;
        }
        state.waitingForServerResponse = true;
        let responseData;
        const workPoligons = [];

        try {
          // Делаем запрос на сервер о входе пользователя в систему.
          // Если запрос завершится успешно, пользователь получит jwt-token, который позволит
          // ему продолжить работу с системой. Останется лишь определить рабочий полигон, на
          // котором пользователь будет работать в системе.
          responseData = await authUser({
            login: state.userName,
            password: state.password,
          });

          if (responseData.stationWorkPoligons && responseData.stationWorkPoligons.length) {
            workPoligons.push({
              type: WORK_POLIGON_TYPES.STATION,
              workPoligons: responseData.stationWorkPoligons.map((poligon) => ({
                poligonId: poligon.SWP_StID,
                subPoligonId: poligon.SWP_StWP_ID,
              })),
            });
          }
          if (responseData.dncSectorsWorkPoligons && responseData.dncSectorsWorkPoligons.length) {
            workPoligons.push({
              type: WORK_POLIGON_TYPES.DNC_SECTOR,
              workPoligons: responseData.dncSectorsWorkPoligons.map((poligon) => ({
                poligonId: poligon.DNCSWP_DNCSID,
              })),
            });
          }
          if (responseData.ecdSectorsWorkPoligons && responseData.ecdSectorsWorkPoligons.length) {
            workPoligons.push({
              type: WORK_POLIGON_TYPES.ECD_SECTOR,
              workPoligons: responseData.ecdSectorsWorkPoligons.map((poligon) => ({
                poligonId: poligon.ECDSWP_ECDSID,
              })),
            });
          }
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
          workPoligons,
          takeDuty: state.takeDuty,
        });

        state.waitingForServerResponse = false;

        const loginResult = store.getters.getLoginResult;
        if (!loginResult || loginResult.error) {
          const errMessage = !loginResult ? 'Что-то пошло не так' : loginResult.message;
          showErrMessage(errMessage);
          return;
        }

        if (store.getters.canUserWorkWithSystem === true) {
          // Если в процессе входа в систему программе удалось явно определить полномочия пользователя и его
          // рабочий полигон, то осуществляем переход на главную страницу
          router.push({ name: 'MainPage' });
        } else if (store.getters.isUserAuthenticated === true) {
          // Если в процессе входа в систему программе не удалось определить полномочия пользователя и его
          // рабочий полигон, но пользователь успешно прошел процедуру частичной аутентификации (имя + пароль),
          // то осуществляем переход на страницу выбора полномочия, с которым пользователь будет работать
          // с программой, а также соответствующего рабочего полигона
          router.push({ name: 'ConfirmAuthDataPage', params: { takeDuty: state.takeDuty } });
        } else {
          showErrMessage('Вы не прошли аутентификацию для работы с текущим приложением');
        }
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
        handleSubmit,
        handleRegisterUser,
        hideRegisterNewUserDlg,
      };
    },
  }
</script>
