<template>
  <div v-if="!stationObj">Структура участка не определена</div>
  <div v-else>
    <Fieldset :legend="`${stationObj.type} ${stationObj.St_Title} (${stationObj.St_UNMC})`" :toggleable="true">
      <p class="p-mb-2">
        <span class="p-text-bold">Пути:</span>
      </p>
      <div v-if="stationObj.TStationTracks && stationObj.TStationTracks.length" class="p-mb-2">
        <p v-for="track of stationObj.TStationTracks" :key="track.ST_ID" class="p-ml-4">
          {{ track.ST_Name }}
        </p>
      </div>
      <div v-else class="p-mb-2">
        Не определены
      </div>
      <p class="p-mb-2">
        <span class="p-text-bold">Входит в поездные участки ДНЦ:</span>
      </p>
      <div v-if="stationObj.dncTrainSectors && stationObj.dncTrainSectors.length" class="p-mb-2">
        <p v-for="dncTrainSector of stationObj.dncTrainSectors" :key="dncTrainSector.trainSectorId" class="p-ml-4">
          - {{ dncTrainSector.trainSectorTitle }} (участок ДНЦ {{ dncTrainSector.dncSectorTitle }},
          принадлежность станции участку ДНЦ: {{ dncTrainSector.stationBelongsToTrainSector ? 'да' : 'нет' }})
        </p>
      </div>
      <div v-else class="p-mb-2">
        Не определены
      </div>
      <p class="p-mb-2">
        <span class="p-text-bold">Входит в поездные участки ЭЦД:</span>
      </p>
      <div v-if="stationObj.ecdTrainSectors && stationObj.ecdTrainSectors.length" class="p-mb-2">
        <p v-for="ecdTrainSector of stationObj.ecdTrainSectors" :key="ecdTrainSector.trainSectorId" class="p-ml-4">
          - {{ ecdTrainSector.trainSectorTitle }} (участок ЭЦД {{ ecdTrainSector.ecdSectorTitle }},
          принадлежность станции участку ЭЦД: {{ ecdTrainSector.stationBelongsToTrainSector ? 'да' : 'нет' }})
        </p>
      </div>
      <div v-else class="p-mb-2">
        Не определены
      </div>
    </Fieldset>
  </div>
</template>


<script>
  export default {
    name: 'dy58-view-station-poligon-structure',

    props: {
      stationObj: {
        type: Object,
      },
    },
  };
</script>
