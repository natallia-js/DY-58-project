<template>
  <div v-if="!getSectorPersonal">Сменный персонал не определен</div>
  <div v-else>
    <Fieldset legend="Персонал станции" :toggleable="true">
      <ViewSectorPeopleBlock
        :peopleArray="getFilteredPeople(currentStationShift, APP_CREDENTIALS.DSP_FULL)"
        :ifStationPeople="true"
      />
    </Fieldset>
    <Fieldset legend="Персонал смежных станций" :toggleable="true">
      <div v-if="!adjacentStationsShift || !adjacentStationsShift.length">
        -
      </div>
      <div v-else>
        <div v-for="station of adjacentStationsShift" :key="station.stationId" class="p-ml-4">
          <span class="p-text-bold">{{ station.stationTitle }}</span>
          <ViewSectorPeopleBlock
            :peopleArray="getFilteredPeople(station.people, APP_CREDENTIALS.DSP_FULL)"
            :ifStationPeople="true"
          />
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
          <ViewSectorPeopleBlock
            :peopleArray="getFilteredPeople(adjSector.people, APP_CREDENTIALS.DNC_FULL)"
            :ifStationPeople="false"
          />
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
          <ViewSectorPeopleBlock
            :peopleArray="getFilteredPeople(nearSector.people, APP_CREDENTIALS.ECD_FULL)"
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
    name: 'dy58-view-shift-for-dsp',

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

      const getSectorPersonal = computed(() => store.getters.getSectorPersonal);
      const getUserWorkPoligonData = computed(() => store.getters.getUserWorkPoligonData);

      const currentStationShift = computed(() => {
        if (!getSectorPersonal.value?.sectorStationsShift || !getUserWorkPoligonData.value) {
          return [];
        }
        return getSectorPersonal.value.sectorStationsShift.find((shift) =>
          shift.stationId === getUserWorkPoligonData.value.St_ID)?.people;
      });

      const adjacentStationsShift = computed(() => {
        if (!getSectorPersonal.value?.sectorStationsShift || !getUserWorkPoligonData.value) {
          return [];
        }
        return getSectorPersonal.value.sectorStationsShift.filter((shift) =>
          shift.stationId !== getUserWorkPoligonData.value.St_ID);
      });

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
        getSectorPersonal,
        currentStationShift,
        adjacentStationsShift,
        getFilteredPeople,
      };
    },
  };
</script>
