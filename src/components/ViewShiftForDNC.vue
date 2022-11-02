<template>
  <div v-if="!getSectorPersonal">Сменный персонал не определен</div>
  <div v-else>
    <Fieldset legend="Персонал текущего участка ДНЦ" :toggleable="true">
      <ViewSectorPeopleBlock
        :peopleArray="getCurrentDNCSectorShift ? (getCurrentDNCSectorShift.people || []) : []"
        :ifStationPeople="false"
      />
    </Fieldset>
    <Fieldset legend="Персонал станций участка ДНЦ" :toggleable="true">
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
    <Fieldset legend="Персонал смежных участков ДНЦ" :toggleable="true">
      <div v-if="!getAllDNCShiftExceptCurrent || !getAllDNCShiftExceptCurrent.length">
        -
      </div>
      <div v-else>
        <div v-for="adjSector of getAllDNCShiftExceptCurrent" :key="adjSector.sectorId" class="p-ml-4">
          <span class="p-text-bold">{{ adjSector.sectorTitle }}</span>
          <ViewSectorPeopleBlock
            :peopleArray="adjSector.people || []"
            :ifStationPeople="false"
          />
        </div>
      </div>
    </Fieldset>
    <Fieldset legend="Персонал ближайших участков ЭЦД" :toggleable="true">
      <div v-if="!getSectorPersonal.ECDSectorsShift || !getSectorPersonal.ECDSectorsShift.length">
        -
      </div>
      <div v-else>
        <div v-for="nearSector of getSectorPersonal.ECDSectorsShift" :key="nearSector.sectorId" class="p-ml-4">
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
    name: 'dy58-view-shift-for-dnc',

    components: {
      ViewSectorPeopleBlock,
    },

    computed: {
      ...mapGetters([
        'getSectorPersonal',
        'getCurrentDNCSectorShift',
        'getAllDNCShiftExceptCurrent',
      ]),
    },
  };
</script>
