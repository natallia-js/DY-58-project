<template>
  <div class="p-d-flex" style="height: 100vh;">
    <Toast />

    <div v-if="state.gettingData" class="p-mr-2 p-as-center p-col-4 p-offset-4 p-mb-6">
      <div class="p-col-12">
        Получаю информацию о рабочих полигонах...
      </div>
      <div class="p-col-12">
        <ProgressSpinner />
      </div>
      <div class="p-col-12">
        <Button type="button" label="Назад" class="p-button-secondary" @click="goToAuthPage" />
      </div>
    </div>

    <div v-else-if="state.getDataError" class="p-mr-2 p-as-center p-col-4 p-offset-4 p-mb-6">
      <div class="p-col-12">
        <InlineMessage severity="error">{{ state.getDataError }}</InlineMessage>
      </div>
      <div class="p-col-12">
        <Button type="button" label="Назад" class="p-button-secondary" @click="goToAuthPage" />
      </div>
    </div>

    <div v-else-if="!state.gettingData && !state.getDataError" class="p-mr-2 p-as-center p-col-4 p-offset-4 p-mb-6">
      <div class="dy58-title-small p-mb-4">Определите данные для входа в систему</div>
      <div v-if="getAllPossibleCredentialsWithPoligons && getAllPossibleCredentialsWithPoligons.length">
        <p class="p-text-bold p-mb-3">Полномочие</p>
        <div
          v-for="cred of getAllPossibleCredentialsWithPoligons"
          :key="cred.cred"
          class="p-field-radiobutton"
        >
          <RadioButton :id="cred.cred" name="cred" :value="cred" v-model="state.selectedCredential" />
          <label :for="cred.cred" class="p-mr-3">{{ APP_CREDENTIALS_TRANSLATIONS[cred.cred] }}</label>
        </div>
      </div>
      <div v-if="state.selectedCredential">
        <div v-if="state.selectedCredential.poligons && state.selectedCredential.poligons.length">
          <p class="p-text-bold p-mt-3 p-mb-3">Полигон</p>
          <div v-for="typedPoligon of state.selectedCredential.poligons" :key="typedPoligon.type">
            <p class="p-mb-3">Тип полигона: {{ typedPoligon.type }}</p>
            <div
              v-for="workPoligon of typedPoligon.workPoligons"
              :key="`${workPoligon.poligonId}${workPoligon.subPoligonId || ''}`"
              class="p-field-radiobutton"
            >
              <RadioButton
                :id="`${workPoligon.poligonId}${workPoligon.subPoligonId || ''}`"
                name="workPoligon"
                :value="{ type: typedPoligon.type, ...workPoligon }"
                v-model="state.selectedPoligon"
              />
              <label :for="`${workPoligon.poligonId}${workPoligon.subPoligonId || ''}`" class="p-mr-3">
                {{ getWorkPoligonTitle(typedPoligon.type, workPoligon.poligonId, workPoligon.subPoligonId) }}
              </label>
            </div>
          </div>
        </div>
      </div>
      <div class="p-col-12">
        <Button type="button" label="Назад" class="p-button-secondary p-mr-2" @click="goToAuthPage" />
        <Button
          v-if="state.selectedCredential && state.selectedPoligon"
          type="button"
          label="Продолжить"
          @click="goToMainPage"
        />
      </div>
    </div>
  </div>
</template>


<script>
  import { computed, onMounted, reactive, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useStore } from 'vuex';
  import { APP_CREDENTIALS_TRANSLATIONS, WORK_POLIGON_TYPES } from '@/constants/appCredentials';
  import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';
  import { getStationsWorkPlacesData } from '@/serverRequests/stations.requests';
  import { getDNCSectorsShortData } from '@/serverRequests/dncSectors.requests';
  import { getECDSectorsShortData } from '@/serverRequests/ecdSectors.requests';
  import { startWorkWithoutTakingDuty, takeDutyUser } from '@/serverRequests/auth.requests';
  import {
    SET_USER_CREDENTIAL,
    SET_USER_WORK_POLIGON,
    SET_USER_TOKEN,
    SET_USER_TAKE_PASS_DUTY_TIMES,
  } from '@/store/mutation-types';
  import showMessage from '@/hooks/showMessage.hook';

  export default {
    name: 'dy58-confirm-auth-data-page',

    setup() {
      const store = useStore();
      const route = useRoute();
      const router = useRouter();
      const { showErrMessage } = showMessage();

      const state = reactive({
        selectedCredential: null,
        selectedPoligon: null,
        workPoligonTitles: [],
        gettingData: false,
        getDataError: null,
      });

      const getAllPossibleCredentialsWithPoligons = computed(() => store.getters.getAllPossibleCredentialsWithPoligons);
      const getUserCredential = computed(() => store.getters.getUserCredential);

      watch(() => state.selectedCredential, (val) => {
        if (val.poligons && val.poligons.length === 1 &&
          val.poligons[0].workPoligons && val.poligons[0].workPoligons.length === 1) {
          state.selectedPoligon = { type: val.poligons[0].type, ...val.poligons[0].workPoligons[0] };
        } else {
          state.selectedPoligon = null;
        }
      });

      onMounted(async () => {
        // если полномочие у пользователя одно, выделяем его
        if (getUserCredential.value) {
          state.selectedCredential = getAllPossibleCredentialsWithPoligons.value.find((cred) => cred.cred = getUserCredential.value);
        }

        state.gettingData = true;

        // делаем запрос к бэкенду для получения наименований рабочих полигонов
        try {
          for (let cred of getAllPossibleCredentialsWithPoligons.value) {
            if (!cred.poligons || !cred.poligons.length) {
              continue;
            }
            for (let typedPoligons of cred.poligons) {
              let data = [];
              switch (typedPoligons.type) {
                case WORK_POLIGON_TYPES.STATION:
                  data = await getStationsWorkPlacesDataLocal(typedPoligons.workPoligons.map((wp) => wp.poligonId));
                  break;
                case WORK_POLIGON_TYPES.DNC_SECTOR:
                  data = await getDNCSectorsShortDataLocal(typedPoligons.workPoligons.map((wp) => wp.poligonId));
                  break;
                case WORK_POLIGON_TYPES.ECD_SECTOR:
                  data = await getECDSectorsShortDataLocal(typedPoligons.workPoligons.map((wp) => wp.poligonId));
                  break;
              }
              data.forEach((poligon) => {
                state.workPoligonTitles.push({ type: typedPoligons.type, ...poligon });
              });
            }
          }
        } catch (err) {
          state.getDataError = `При попытке получить информацию о рабочих полигонах возникла ошибка: ${err}`;
        } finally {
          state.gettingData = false;
        }
      });

      const goToAuthPage = () => {
        // При переходе на главную страницу необходимо обнулить все данные, которые были загружены
        // до прихода на эту страницу, иначе они могут снова подгрузиться, даже если будет входить
        // в систему пользователь с совсем другого полигона
        store.dispatch('logout');
        router.push({ name: 'AuthPage' });
      }

      const goToMainPage = async () => {
        if (!state.selectedCredential || !state.selectedPoligon) {
          return;
        }
        const desiredWorkPoligon = {
          type: state.selectedPoligon.type,
          code: state.selectedPoligon.poligonId,
          subCode: state.selectedPoligon.subPoligonId || null,
        };
        // Делаем дополнительный запрос на сервер с указанием факта принятия дежурства либо входа в
        // систему без принятия дежурства
        try {
          let responseData;
          if (route.params.takeDuty === 'true') {
            responseData = await takeDutyUser({
              workPoligonType: desiredWorkPoligon.type,
              workPoligonId: desiredWorkPoligon.code,
              workSubPoligonId: desiredWorkPoligon.subCode,
              specialCredentials: [state.selectedCredential.cred],
            });
          } else {
            responseData = await startWorkWithoutTakingDuty({
              workPoligonType: desiredWorkPoligon.type,
              workPoligonId: desiredWorkPoligon.code,
              workSubPoligonId: desiredWorkPoligon.subCode,
              specialCredentials: [state.selectedCredential.cred],
            });
          }

          store.commit(SET_USER_TOKEN, { token: responseData.token, saveInLocalStorage: true });
          store.commit(SET_USER_TAKE_PASS_DUTY_TIMES, {
            lastTakeDutyTime: responseData.lastTakeDutyTime ? new Date(responseData.lastTakeDutyTime) : null,
            lastPassDutyTime: responseData.lastPassDutyTime ? new Date(responseData.lastPassDutyTime) : null,
          });
        } catch (error) {
          const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка входа пользователя в систему');
          showErrMessage(errMessage);
          return;
        }
        store.commit(SET_USER_CREDENTIAL, state.selectedCredential.cred);
        store.commit(SET_USER_WORK_POLIGON, desiredWorkPoligon);
        router.push({ name: 'MainPage' });
      };

      const getStationsWorkPlacesDataLocal = async (stationIds) => {
        const responseData = await getStationsWorkPlacesData({ stationIds });
        return !responseData ? [] :
          responseData.map((sector) => {
            return {
              code: sector.St_ID,
              title: `${sector.St_Title} (${sector.St_UNMC})`,
              workPlaces: !sector.TStationWorkPlaces ? [] :
                sector.TStationWorkPlaces.map((wp) => ({
                  code: wp.SWP_ID,
                  title: wp.SWP_Name,
                })),
            };
          });
      };

      const getDNCSectorsShortDataLocal = async (dncSectorIds) => {
        const responseData = await getDNCSectorsShortData({ dncSectorIds });
        return !responseData ? [] :
          responseData.map((sector) => {
            return {
              code: sector.DNCS_ID,
              title: sector.DNCS_Title,
            };
          });
      };

      const getECDSectorsShortDataLocal = async (ecdSectorIds) => {
        const responseData = await getECDSectorsShortData({ ecdSectorIds });
        return !responseData ? [] :
          responseData.map((sector) => {
            return {
              code: sector.ECDS_ID,
              title: sector.ECDS_Title,
            };
          });
      };

      const getWorkPoligonTitle = (workPoligonType, workPoligonId, workSubPoligonId) => {
        const workPoligonData = state.workPoligonTitles.find((poligon) =>
          poligon.type === workPoligonType && poligon.code === workPoligonId);
        const workPoligonTitle = workPoligonData ? workPoligonData.title : workPoligonId;
        if (!workSubPoligonId) {
          return workPoligonTitle;
        }
        if (!workPoligonData || !workPoligonData.workPlaces || !workPoligonData.workPlaces.length) {
          return `${workPoligonTitle}, ${workSubPoligonId}`;
        }
        const workSubPoligonData = workPoligonData.workPlaces.find((subPoligon) =>
          subPoligon.code === workSubPoligonId);
        return workSubPoligonData
          ? `${workPoligonTitle}, ${workSubPoligonData.title}`
          : `${workPoligonTitle}, ${workSubPoligonId}`;
      };

      return {
        state,
        APP_CREDENTIALS_TRANSLATIONS,
        getAllPossibleCredentialsWithPoligons,
        goToAuthPage,
        goToMainPage,
        getWorkPoligonTitle,
      };
    }
  };
</script>
