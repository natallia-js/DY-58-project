<template>
  <div class="p-d-flex" style="height: 100vh;">
    <div class="p-mr-2 p-as-center p-col-4 p-offset-4 p-mb-6">
      <Toast />
      <div class="dy58-title-huge p-mb-4">Журнал ДУ-58</div>
      <div class="dy58-title-small p-mb-4">Авторизуйтесь в системе</div>
      <form @submit.prevent="handleSubmit(!v$.$invalid)" class="p-grid">
        <div class="p-field p-col-12 p-d-flex p-flex-column">
          <label for="userName" :class="{'p-error': v$.userName.$invalid && state.submitted}">
            <span style="color:red">*</span> Имя пользователя
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
            <span style="color:red">*</span> Пароль
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
            <Checkbox id="takeDuty" v-model="state.takeDuty" :binary="true" />
            <label for="takeDuty">Принять дежурство</label>
          </div>
        </div>
        <div v-if="!state.waitingForServerResponse" class="p-col-12">
          <Button type="submit" label="Войти" />
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
  import router from '@/router';
  import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';
  import { loginUser } from '@/serverRequests/auth.requests';
  import showMessage from '@/hooks/showMessage.hook';
  import { LOGIN } from '@/store/mutation-types';

  export default {
    name: 'dy58-auth-page',

    setup() {
      const store = useStore();
      const { showErrMessage } = showMessage();

      const state = reactive({
        userName: '',
        password: '',
        takeDuty: false,
        submitted: false,
        waitingForServerResponse: false,
      });

      const rules = {
        userName: {
          required,
        },
        password: {
          required,
        },
      };

      const v$ = useVuelidate(rules, state);

      const handleSubmit = async (isFormValid) => {
        state.submitted = true;

        if (!isFormValid) {
          return;
        }
        if (!state.userName.length || !state.password.length) {
          return;
        }

        state.waitingForServerResponse = true;

        try {
          const responseData = await loginUser({
            login: state.userName,
            password: state.password,
            takeDuty: state.takeDuty,
          });

          const workPoligons = [];
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

          store.commit(LOGIN, {
            userId: responseData.userId,
            jtwToken: responseData.token,
            userInfo: responseData.userInfo,
            lastTakeDutyTime: responseData.lastTakeDutyTime,
            lastPassDutyTime: responseData.lastPassDutyTime,
            credentials: responseData.credentials,
            workPoligons,
          });

        } catch (e) {
          showErrMessage((e && e.response && e.response.data && e.response.data.message) ?
              e.response.data.message : (e && e.message) ? e.message : 'Что-то пошло не так');
          return;

        } finally {
          state.waitingForServerResponse = false;
        }

        if (store.getters.isUserAuthenticated) {
          // Если в процессе входа в систему программе удалось явно определить полномочия пользователя и его
          // рабочий полигон, то осуществляем переход на главную страницу...
          if (store.getters.getUserCredential && store.getters.getUserWorkPoligon) {
            router.push({ name: 'MainPage' });
          // ...в противном случае переходим на страницу выбора полномочия, с которым пользователь будет
          // работать с программой, а также соответствующего рабочего полигона
          } else {
            router.push({ name: 'ConfirmAuthDataPage' });
          }
        } else {
          showErrMessage('Данный пользователь не прошел аутентификацию для работы с текущим приложением');
        }
      }

      return {
        state,
        v$,
        handleSubmit,
      };
    },
  }
</script>
