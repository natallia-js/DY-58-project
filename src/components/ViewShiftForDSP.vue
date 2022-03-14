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
          ${user.stationWorkPlaceId ? '(рабочее место с id=' + user.stationWorkPlaceId + ')' : ''}` }}
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
              ${user.stationWorkPlaceId ? '(рабочее место с id=' + user.stationWorkPlaceId + ')' : ''}` }}
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
  import { mapGetters } from 'vuex';

  export default {
    name: 'dy58-view-shift-for-dsp',

    computed: {
      ...mapGetters([
        'getSectorPersonal',
        'getUserWorkPoligonData',
      ]),

      currentStationShift() {
        if (!this.getUserWorkPoligonData) {
          return [];
        }
        const currStationPersonal = this.getSectorPersonal.sectorStationsShift.find((shift) =>
          shift.stationId === this.getUserWorkPoligonData.St_ID);
        return currStationPersonal && currStationPersonal.people ? currStationPersonal.people : [];
      },

      adjacentStationsShift() {
        if (!this.getSectorPersonal.sectorStationsShift) {
          return [];
        }
        return this.getSectorPersonal.sectorStationsShift.filter((shift) =>
          shift.stationId !== this.getUserWorkPoligonData.St_ID);
      },
    },
  };
</script>
