<template>
  <div v-if="!getSectorPersonal">Сменный персонал не определен</div>
  <div v-else>
    <Fieldset legend="Персонал текущего участка ЭЦД" :toggleable="true">
      <ViewSectorPeopleBlock
        :peopleArray="getFilteredPeople((getCurrentECDSectorShift || {}).people, APP_CREDENTIALS.ECD_FULL)"
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
            :peopleArray="getFilteredPeople(station.people, APP_CREDENTIALS.DSP_FULL)"
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
            :peopleArray="getFilteredPeople(adjSector.people, APP_CREDENTIALS.ECD_FULL)"
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
            :peopleArray="getFilteredPeople(nearSector.people, APP_CREDENTIALS.DNC_FULL)"
            :ifStationPeople="false"
          />
        </div>
      </div>
    </Fieldset>
  </div>
</template>


<script>
  import { computed } from 'vue';
  import { useStore } from 'vuex';
  import ViewSectorPeopleBlock from '@/components/ViewSectorPeopleBlock';
  import { APP_CREDENTIALS } from '@/constants/appCredentials';

  export default {
    name: 'dy58-view-shift-for-ecd',

    components: {
      ViewSectorPeopleBlock,
    },

    props: {
      showOnlyDNC_ECD_DSPUsers: {
        type: Boolean,
        required: false,
      },
      showOnlyOnlineUsers: {
        type: Boolean,
        required: false,
      },
    },

    setup(props) {
      const store = useStore();

      const getFilteredPeople = (people, neededCredential) => {
        if (!people?.length) return [];
        let filteredPeople = people;
        if (props.showOnlyOnlineUsers)
          filteredPeople = filteredPeople.filter((person) => person.online);
        if (props.showOnlyDNC_ECD_DSPUsers)
          filteredPeople = filteredPeople.filter((person) => person.appsCredentials.includes(neededCredential));
        return filteredPeople;
      };

      return {
        APP_CREDENTIALS,
        getSectorPersonal: computed(() => store.getters.getSectorPersonal),
        getCurrentECDSectorShift: computed(() => store.getters.getCurrentECDSectorShift),
        getAllECDShiftExceptCurrent: computed(() => store.getters.getAllECDShiftExceptCurrent),
        getFilteredPeople,
      };
    },
  };
</script>
