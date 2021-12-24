<template>
  <div class="p-d-flex" style="height: 100vh;">

    <div v-if="gettingData" class="p-mr-2 p-as-center p-col-4 p-offset-4 p-mb-6">
      <div class="p-col-12">
        Получаю информацию о рабочих полигонах...
      </div>
      <div class="p-col-12">
        <ProgressSpinner />
      </div>
      <div class="p-col-12">
        <Button type="button" label="Назад" @click="goToAuthPage" class="p-mr-3" />
      </div>
    </div>

    <div v-else-if="getDataError" class="p-mr-2 p-as-center p-col-4 p-offset-4 p-mb-6">
      <div class="p-col-12">
        <InlineMessage severity="error">{{ getDataError }}</InlineMessage>
      </div>
      <div class="p-col-12">
        <Button type="button" label="Назад" @click="goToAuthPage" class="p-mr-3" />
      </div>
    </div>

    <div v-else-if="!gettingData && !getDataError" class="p-mr-2 p-as-center p-col-4 p-offset-4 p-mb-6">
      <div class="dy58-title-small p-mb-4">Определите данные для входа в систему</div>
      <div v-if="getAllPossibleCredentialsWithPoligons && getAllPossibleCredentialsWithPoligons.length">
        <p class="p-text-bold p-mb-3">Полномочие</p>
        <div
          v-for="cred of getAllPossibleCredentialsWithPoligons"
          :key="cred.cred"
          class="p-field-radiobutton"
        >
          <RadioButton :id="cred.cred" name="cred" :value="cred" v-model="selectedCredential" />
          <label :for="cred.cred" class="p-mr-3">{{ getAppCredentialsTranslations()[cred.cred] }}</label>
        </div>
      </div>
      <div v-if="selectedCredential">
        <div v-if="selectedCredential.poligons && selectedCredential.poligons.length">
          <p class="p-text-bold p-mt-3 p-mb-3">Полигон</p>
          <div v-for="typedPoligon of selectedCredential.poligons" :key="typedPoligon.type">
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
                v-model="selectedPoligon"
              />
              <label :for="`${workPoligon.poligonId}${workPoligon.subPoligonId || ''}`" class="p-mr-3">
                {{ getWorkPoligonTitle(typedPoligon.type, workPoligon.poligonId, workPoligon.subPoligonId) }}
              </label>
            </div>
          </div>
        </div>
      </div>
      <div class="p-col-12">
        <Button type="button" label="Назад" @click="goToAuthPage" class="p-mr-3" />
        <Button type="button" label="Продолжить" v-if="selectedCredential && selectedPoligon" @click="goToMainPage" />
      </div>
    </div>
  </div>
</template>


<script>
  import { mapGetters, mapMutations } from 'vuex';
  import { APP_CREDENTIALS_TRANSLATIONS, WORK_POLIGON_TYPES } from '../constants/appCredentials';
  import { AUTH_SERVER_ACTIONS_PATHS } from '../constants/servers';

  export default {
    name: 'dy58-confirm-auth-data-page',

    data() {
      return {
        selectedCredential: null,
        selectedPoligon: null,
        workPoligonTitles: [],
        gettingData: false,
        getDataError: null,
      };
    },

    watch: {
      selectedCredential: function (val) {
        if (val.poligons && val.poligons.length === 1 &&
            val.poligons[0].workPoligons && val.poligons[0].workPoligons.length === 1) {
          this.selectedPoligon = { type: val.poligons[0].type, ...val.poligons[0].workPoligons[0] };
        } else {
          this.selectedPoligon = null;
        }
      },
    },

    computed: {
      ...mapGetters([
        'getAllPossibleCredentialsWithPoligons',
        'getUserCredential',
        'getUserToken',
        'getUserName',
      ]),
    },

    async created() {
      // если полномочие у пользователя одно, выделяем его
      if (this.getUserCredential) {
        this.selectedCredential = this.getAllPossibleCredentialsWithPoligons.find((cred) => cred.cred = this.getUserCredential);
      }

      this.gettingData = true;

      // делаем запрос к бэкенду для получения наименований рабочих полигонов
      try {
        for (let cred of this.getAllPossibleCredentialsWithPoligons) {
          if (!cred.poligons || !cred.poligons.length) {
            continue;
          }
          for (let typedPoligons of cred.poligons) {
            let data = [];
            switch (typedPoligons.type) {
              case WORK_POLIGON_TYPES.STATION:
                data = await this.getStationsWorkPlacesData(typedPoligons.workPoligons.map((wp) => wp.poligonId));
                break;
              case WORK_POLIGON_TYPES.DNC_SECTOR:
                data = await this.getDNCSectorsShortData(typedPoligons.workPoligons.map((wp) => wp.poligonId));
                break;
              case WORK_POLIGON_TYPES.ECD_SECTOR:
                data = await this.getECDSectorsShortData(typedPoligons.workPoligons.map((wp) => wp.poligonId));
                break;
            }
            data.forEach((poligon) => {
              this.workPoligonTitles.push({ type: typedPoligons.type, ...poligon });
            });
          }
        }
      } catch (err) {
        this.getDataError = `При попытке получить информацию о рабочих полигонах возникла ошибка: ${err}`;
      }

      this.gettingData = false;
    },

    methods: {
      ...mapMutations([
        'setUserCredential',
        'setUserWorkPoligon',
      ]),

      getAppCredentialsTranslations() {
        return APP_CREDENTIALS_TRANSLATIONS;
      },

      goToAuthPage() {
        this.$router.push({ name: 'AuthPage' });
      },

      goToMainPage() {
        if (this.selectedCredential && this.selectedPoligon) {
          this.setUserCredential(this.selectedCredential.cred);
          this.setUserWorkPoligon({
            type: this.selectedPoligon.type,
            code: this.selectedPoligon.poligonId,
            subCode: this.selectedPoligon.subPoligonId || null,
          });
          this.$router.push({ name: 'MainPage' });
        }
      },

      async getStationsWorkPlacesData(stationIds) {
        const headers = {
          'Authorization': `Bearer ${this.getUserToken}`,
        };
        const response = await this.$http.post(AUTH_SERVER_ACTIONS_PATHS.getStationsWorkPlacesData,
          { stationIds },
          { headers }
        );
        return !response || !response.data ? [] :
          response.data.map((sector) => {
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
      },

      async getDNCSectorsShortData(dncSectorIds) {
        const headers = {
          'Authorization': `Bearer ${this.getUserToken}`,
        };
        const response = await this.$http.post(AUTH_SERVER_ACTIONS_PATHS.getDNCSectorsShortData,
          { dncSectorIds },
          { headers }
        );
        return !response || !response.data ? [] :
          response.data.map((sector) => {
            return {
              code: sector.DNCS_ID,
              title: sector.DNCS_Title,
            };
          });
      },

      async getECDSectorsShortData(ecdSectorIds) {
        const headers = {
          'Authorization': `Bearer ${this.getUserToken}`,
        };
        const response = await this.$http.post(AUTH_SERVER_ACTIONS_PATHS.getECDSectorsShortData,
          { ecdSectorIds },
          { headers }
        );
        return !response || !response.data ? [] :
          response.data.map((sector) => {
            return {
              code: sector.ECDS_ID,
              title: sector.ECDS_Title,
            };
          });
      },

      getWorkPoligonTitle(workPoligonType, workPoligonId, workSubPoligonId) {
        const workPoligonData = this.workPoligonTitles.find((poligon) =>
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
      },
    },
  };
</script>
