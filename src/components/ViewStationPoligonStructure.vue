<template>
  <div v-if="!stationObj">Структура участка не определена</div>
  <div v-else>
    <Fieldset :legend="`${stationObj.type} ${stationObj.St_Title} (${stationObj.St_UNMC})`" :toggleable="true">
      <p class="p-mb-2">
        <span class="p-text-bold">Пути:</span>
      </p>
      <div v-if="stationObj.TStationTracks && stationObj.TStationTracks.length">
        <p v-for="track of stationObj.TStationTracks" :key="track.ST_ID" class="p-ml-4">
          {{ track.ST_Name }}
        </p>
      </div>
      <div v-else>
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
