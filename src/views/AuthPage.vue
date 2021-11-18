<template>
  <div class="p-d-flex" style="height: 100vh;">
    <div class="p-mr-2 p-as-center p-col-4 p-offset-4 p-mb-6">
      <Toast />
      <div class="dy58-title-huge p-mb-4">Журнал ДУ-58</div>
      <div class="dy58-title-small p-mb-4">Авторизуйтесь в системе</div>
      <form @submit.prevent="handleSubmit(!v$.$invalid)" class="p-grid">
        <div class="p-field p-col-12 p-d-flex p-flex-column">
          <label for="userName" :class="{'p-error': v$.userName.$invalid && submitted}">
            <span style="color:red">*</span> Имя пользователя
          </label>
          <InputText
            id="userName"
            autofocus
            v-model="v$.userName.$model"
            :class="{'p-invalid':v$.userName.$invalid && submitted}"
          />
          <small
            v-if="(v$.userName.$invalid && submitted) || v$.userName.$pending.$response"
            class="p-error"
          >
            Введите имя пользователя
          </small>
        </div>
        <div class="p-field p-col-12 p-d-flex p-flex-column">
          <label for="password" :class="{'p-error':v$.password.$invalid && submitted}">
            <span style="color:red">*</span> Пароль
          </label>
          <InputText
            id="password"
            type="password"
            v-model="v$.password.$model"
            :class="{'p-invalid':v$.password.$invalid && submitted}"
          />
          <small
            v-if="(v$.password.$invalid && submitted) || v$.password.$pending.$response"
            class="p-error"
          >
            Введите пароль
          </small>
        </div>
        <div class="p-field p-col-12 p-d-flex p-flex-column">
          <div class="p-field-checkbox">
            <Checkbox id="takeDuty" v-model="takeDuty" :binary="true" />
            <label for="takeDuty">Принять дежурство</label>
          </div>
        </div>
        <div v-if="!waitingForServerResponse" class="p-col-12">
          <Button type="submit" label="Войти" />
        </div>
        <div v-if="waitingForServerResponse" class="p-col-12">
          <ProgressSpinner />
        </div>
      </form>
    </div>
  </div>
</template>


<script>
  import { APP_CODE_NAME } from '../constants/appCredentials';
  import { mapGetters, mapMutations } from 'vuex';
  import { AUTH_SERVER_ACTIONS_PATHS } from '../constants/servers';
  import { WORK_POLIGON_TYPES } from '../constants/appCredentials';
  import { required } from '@vuelidate/validators';
  import { useVuelidate } from '@vuelidate/core';

  export default {
    name: 'dy58-auth-page',

    data() {
      return {
        userName: '',
        password: '',
        takeDuty: false,
        submitted: false,
        waitingForServerResponse: false,
      };
    },

    computed: {
      ...mapGetters([
        'isUserAuthenticated',
        'getUserWorkPoligon',
        'getUserCredential',
      ]),

      getAppCodeName() {
        return APP_CODE_NAME;
      },
    },

    setup: () => ({ v$: useVuelidate() }),

    validations() {
      return {
        userName: {
          required,
        },
        password: {
          required,
        },
      }
    },

    methods: {
      ...mapMutations([
        'login',
      ]),

      async handleSubmit(isFormValid) {
        this.submitted = true;

        if (!isFormValid) {
          return;
        }

        const thisComponent = this;

        if (!thisComponent.userName.length || !thisComponent.password.length) {
          return;
        }

        this.waitingForServerResponse = true;

        try {
          const response = await thisComponent.$http.post(AUTH_SERVER_ACTIONS_PATHS.login, {
            login: thisComponent.userName,
            password: thisComponent.password,
            takeDuty: thisComponent.takeDuty,
          });

          const workPoligons = [];
          if (response.data.stationWorkPoligons && response.data.stationWorkPoligons.length) {
            workPoligons.push({
              type: WORK_POLIGON_TYPES.STATION,
              workPoligons: response.data.stationWorkPoligons.map((poligon) => poligon['SWP_StID']),
            });
          }
          if (response.data.dncSectorsWorkPoligons && response.data.dncSectorsWorkPoligons.length) {
            workPoligons.push({
              type: WORK_POLIGON_TYPES.DNC_SECTOR,
              workPoligons: response.data.dncSectorsWorkPoligons.map((poligon) => poligon['DNCSWP_DNCSID']),
            });
          }
          if (response.data.ecdSectorsWorkPoligons && response.data.ecdSectorsWorkPoligons.length) {
            workPoligons.push({
              type: WORK_POLIGON_TYPES.ECD_SECTOR,
              workPoligons: response.data.ecdSectorsWorkPoligons.map((poligon) => poligon['ECDSWP_ECDSID']),
            });
          }

          this.login({
            userId: response.data.userId,
            jtwToken: response.data.token,
            userInfo: response.data.userInfo,
            lastTakeDutyTime: response.data.lastTakeDutyTime,
            lastPassDutyTime: response.data.lastPassDutyTime,
            credentials: response.data.credentials,
            workPoligons,
          });
        }
        catch (e) {
          thisComponent.$toast.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: (e && e.response && e.response.data && e.response.data.message) ?
              e.response.data.message : (e && e.message) ? e.message : 'Что-то пошло не так',
            life: 3000,
          });
          return;

        } finally {
          this.waitingForServerResponse = false;
        }

        if (thisComponent.isUserAuthenticated) {
          // Если в процессе входа в систему программе удалось явно определить полномочия пользователя и его
          // рабочий полигон, то осуществляем переход на главную страницу...
          if (thisComponent.getUserCredential && thisComponent.getUserWorkPoligon) {
            thisComponent.$router.push({ name: 'MainPage' });
          // ...в противном случае переходим на страницу выбора полномочия, с которым пользователь будет
          // работать с программой, а также соответствующего рабочего полигона
          } else {
            thisComponent.$router.push({ name: 'ConfirmAuthDataPage' });
          }
        } else {
          thisComponent.$toast.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: 'Данный пользователь не прошел аутентификацию для работы с текущим приложением',
            life: 3000,
          });
        }
      }
    },
  }
</script>
