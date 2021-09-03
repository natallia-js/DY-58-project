<template>
  <div v-if="!getShiftPersonal">Сменный персонал не определен</div>
  <div v-else>
    <Fieldset legend="Персонал станций участка ДНЦ" :toggleable="true">
      <div v-if="getShiftPersonal.sectorStationsShift && getShiftPersonal.sectorStationsShift.length">
        <div v-for="station of getShiftPersonal.sectorStationsShift" :key="station.stationId" class="p-ml-4">
          <span class="p-text-bold">{{ station.stationTitle }}</span>
          <div v-if="!station.people || !station.people.length">
            -
          </div>
          <div v-else>
            <p v-for="user of station.people" :key="user._id" class="p-ml-4">
              {{ `${user.post} ${user.surname} ${user.name} ${user.fatherName || ''}` }}
            </p>
          </div>
        </div>
      </div>
    </Fieldset>
    <Fieldset legend="Персонал смежных участков ДНЦ" :toggleable="true">
      <div v-if="getShiftPersonal.adjacentDNCSectorsShift && getShiftPersonal.adjacentDNCSectorsShift.length">
        <div v-for="adjSector of getShiftPersonal.adjacentDNCSectorsShift" :key="adjSector.sectorId" class="p-ml-4">
          <span class="p-text-bold">{{ adjSector.sectorTitle }}</span>
          <div v-if="!adjSector.people || !adjSector.people.length">
            -
          </div>
          <div v-else>
            <p v-for="user of adjSector.people" :key="user._id" class="p-ml-4">
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
    name: 'dy58-view-shift-for-dnc',

    computed: {
      ...mapGetters([
        'getShiftPersonal',
      ]),
    },
  };
</script>
