<template>
  <div v-if="!getSectorPersonal">Сменный персонал не определен</div>
  <div v-else>
    <Fieldset legend="Персонал текущего участка ЭЦД" :toggleable="true">
      <ViewSectorPeopleBlock
        :peopleArray="getCurrentECDSectorShift ? (getCurrentECDSectorShift.people || []) : []"
        :ifStationPeople="false"
      />
    </Fieldset>
    <Fieldset legend="Персонал станций участка ЭЦД" :toggleable="true">
      <div v-if="!getSectorPersonal.sectorStationsShift || !getSectorPersonal.sectorStationsShift.length">
        -
      </div>
      <div v-else>
        <div v-for="station of getSectorPersonal.sectorStationsShift" :key="station.stationId" class="p-ml-4">
          <span class="p-text-bold">{{ station.stationTitle }}</span>
          <ViewSectorPeopleBlock
            :peopleArray="station.people || []"
            :ifStationPeople="true"
          />
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
          <ViewSectorPeopleBlock
            :peopleArray="adjSector.people || []"
            :ifStationPeople="false"
          />
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
          <ViewSectorPeopleBlock
            :peopleArray="nearSector.people || []"
            :ifStationPeople="false"
          />
        </div>
      </div>
    </Fieldset>
  </div>
</template>


<script>
  import { mapGetters } from 'vuex';
  import ViewSectorPeopleBlock from '@/components/ViewSectorPeopleBlock';

  export default {
    name: 'dy58-view-shift-for-ecd',

    components: {
      ViewSectorPeopleBlock,
    },

    computed: {
      ...mapGetters([
        'getSectorPersonal',
        'getCurrentECDSectorShift',
        'getAllECDShiftExceptCurrent',
      ]),
    },
  };
</script>
