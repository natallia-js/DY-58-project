<template>
  <div v-if="!getSectorPersonal">Сменный персонал не определен</div>
  <div v-else>
    <Fieldset legend="Персонал текущего участка ЭЦД" :toggleable="true">
      <div v-if="!getCurrentECDSectorShift || !getCurrentECDSectorShift.people || !getCurrentECDSectorShift.people.length">
        -
      </div>
      <div v-else>
        <p
          v-for="user of getCurrentECDSectorShift.people"
          :key="user._id"
          :class="['p-ml-4', { 'dy58-info': user.online }, { 'dy58-error-message': !user.appsCredentials }]"
        >
          {{ `${user.post} ${user.surname} ${user.name} ${user.fatherName || ''}` }}
        </p>
      </div>
    </Fieldset>
    <Fieldset legend="Персонал станций участка ЭЦД" :toggleable="true">
      <div v-if="!getSectorPersonal.sectorStationsShift || !getSectorPersonal.sectorStationsShift.length">
        -
      </div>
      <div v-else>
        <div v-for="station of getSectorPersonal.sectorStationsShift" :key="station.stationId" class="p-ml-4">
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
    <Fieldset legend="Персонал смежных участков ЭЦД" :toggleable="true">
      <div v-if="!getAllECDShiftExceptCurrent || !getAllECDShiftExceptCurrent.length">
        -
      </div>
      <div v-else>
        <div v-for="adjSector of getAllECDShiftExceptCurrent" :key="adjSector.sectorId" class="p-ml-4">
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
    <Fieldset legend="Персонал ближайших участков ДНЦ" :toggleable="true">
      <div v-if="!getSectorPersonal.DNCSectorsShift || !getSectorPersonal.DNCSectorsShift.length">
        -
      </div>
      <div v-else>
        <div v-for="nearSector of getSectorPersonal.DNCSectorsShift" :key="nearSector.sectorId" class="p-ml-4">
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
    name: 'dy58-view-shift-for-ecd',

    computed: {
      ...mapGetters([
        'getSectorPersonal',
        'getCurrentECDSectorShift',
        'getAllECDShiftExceptCurrent',
      ]),
    },
  };
</script>
