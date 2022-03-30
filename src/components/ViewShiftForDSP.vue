<template>
  <div v-if="!getSectorPersonal">Сменный персонал не определен</div>
  <div v-else>
    <Fieldset legend="Персонал станции" :toggleable="true">
      <div v-if="!currentStationShift || !currentStationShift.length">
        -
      </div>
      <div v-else>
        <p
          v-for="user of currentStationShift"
          :key="user._id"
          :class="['p-ml-4', { 'dy58-info': user.online }, { 'dy58-error-message': !user.appsCredentials }]"
        >
          {{ `${user.post} ${user.surname} ${user.name} ${user.fatherName || ''}
          ${user.stationWorkPlaceId ? `(${getWorkPlaceDisplayData(user.stationId, user.stationWorkPlaceId)})` : ''}` }}
        </p>
      </div>
    </Fieldset>
    <Fieldset legend="Персонал смежных станций" :toggleable="true">
      <div v-if="!adjacentStationsShift || !adjacentStationsShift.length">
        -
      </div>
      <div v-else>
        <div v-for="station of adjacentStationsShift" :key="station.stationId" class="p-ml-4">
          <span class="p-text-bold">{{ station.stationTitle }}</span>
          <div v-if="!station.people || !station.people.length">
            -
          </div>
          <div v-else>
            <p
              v-for="user of station.people"
              :key="user._id"
              :class="['p-ml-4', { 'dy58-info': user.online }, { 'dy58-error-message': !user.appsCredentials }]"
            >
              {{ `${user.post} ${user.surname} ${user.name} ${user.fatherName || ''}
              ${user.stationWorkPlaceId ? `(${getWorkPlaceDisplayData(user.stationId, user.stationWorkPlaceId)})` : ''}` }}
            </p>
          </div>
        </div>
      </div>
    </Fieldset>
    <Fieldset legend="Персонал участков ДНЦ" :toggleable="true">
      <div v-if="!getSectorPersonal.DNCSectorsShift || !getSectorPersonal.DNCSectorsShift.length">
        -
      </div>
      <div v-else>
        <div v-for="adjSector of getSectorPersonal.DNCSectorsShift" :key="adjSector.sectorId" class="p-ml-4">
          <span class="p-text-bold">{{ adjSector.sectorTitle }}</span>
          <div v-if="!adjSector.people || !adjSector.people.length">
            -
          </div>
          <div v-else>
            <p
              v-for="user of adjSector.people"
              :key="user._id"
              :class="['p-ml-4', { 'dy58-info': user.online }, { 'dy58-error-message': !user.appsCredentials }]"
            >
              {{ `${user.post} ${user.surname} ${user.name} ${user.fatherName || ''}` }}
            </p>
          </div>
        </div>
      </div>
    </Fieldset>
    <Fieldset legend="Персонал участков ЭЦД" :toggleable="true">
      <div v-if="!getSectorPersonal.ECDSectorsShift || !getSectorPersonal.ECDSectorsShift.length">
        -
      </div>
      <div v-else>
        <div v-for="nearSector of getSectorPersonal.ECDSectorsShift" :key="nearSector.sectorId" class="p-ml-4">
          <span class="p-text-bold">{{ nearSector.sectorTitle }}</span>
          <div v-if="!nearSector.people || !nearSector.people.length">
            -
          </div>
          <div v-else>
            <p
              v-for="user of nearSector.people"
              :key="user._id"
              :class="['p-ml-4', { 'dy58-info': user.online }, { 'dy58-error-message': !user.appsCredentials }]"
            >
              {{ `${user.post} ${user.surname} ${user.name} ${user.fatherName || ''}` }}
            </p>
          </div>
        </div>
      </div>
    </Fieldset>
  </div>
</template>


<script>
  import { computed } from 'vue';
  import { useStore } from 'vuex';

  export default {
    name: 'dy58-view-shift-for-dsp',

    setup() {
      const store = useStore();

      const getSectorPersonal = computed(() => store.getters.getSectorPersonal);
      const getUserWorkPoligonData = computed(() => store.getters.getUserWorkPoligonData);

      const currentStationShift = computed(() => {
        if (!getUserWorkPoligonData.value) {
          return [];
        }
        const currStationPersonal = getSectorPersonal.value.sectorStationsShift.find((shift) =>
          shift.stationId === getUserWorkPoligonData.value.St_ID);
        // Персонал станции сортируем так: вначале главные (ДСП, ревизоры), у которых нет конкретного
        // рабочего места в рамках станции, затем - Операторы при ДСП (ну или те, для кого указано
        // конкретное рабочее место), причем группируем их по рабочим местам
        return !(currStationPersonal && currStationPersonal.people) ? [] :
          currStationPersonal.people.sort((a, b) => {
            if (!a.stationWorkPlaceId && b.stationWorkPlaceId) return -1;
            if (a.stationWorkPlaceId && !b.stationWorkPlaceId) return 1;
            if (a.stationWorkPlaceId && b.stationWorkPlaceId)
              return a.stationWorkPlaceId - b.stationWorkPlaceId;
            return 0;
          });
      });

      const adjacentStationsShift = computed(() => {
        if (!getSectorPersonal.value || !getSectorPersonal.value.sectorStationsShift ||
          !getUserWorkPoligonData.value) {
          return [];
        }
        return getSectorPersonal.value.sectorStationsShift.filter((shift) =>
          shift.stationId !== getUserWorkPoligonData.value.St_ID);
      });

      const getWorkPlaceDisplayData = (stationId, workPlaceId) => {
        const workPlaceName = store.getters.getStationWorkPlaceNameById(stationId, workPlaceId);
        if (!workPlaceName) {
          return `рабочее место с id=${workPlaceId}`;
        }
        return `рабочее место "${workPlaceName}"`;
      };

      return {
        getSectorPersonal,
        currentStationShift,
        adjacentStationsShift,
        getWorkPlaceDisplayData,
      };
    },
  };
</script>
