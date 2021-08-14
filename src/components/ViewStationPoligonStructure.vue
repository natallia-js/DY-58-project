<template>
  <div v-if="!stationObj">Структура участка не определена</div>
  <div v-else>
    <p class="p-mb-2">
      <span class="p-text-bold">Тип участка:</span>
      {{ stationObj.type }}
    </p>
    <p class="p-mb-2">
      <span class="p-text-bold">Код ЕСР:</span>
      {{ stationObj.St_UNMC }}
    </p>
    <p class="p-mb-2">
      <span class="p-text-bold">Наименование:</span>
      {{ stationObj.St_Title }}
    </p>
    <p class="p-mb-2">
      <span class="p-text-bold">Пути:</span>
    </p>
    <div v-if="stationObj.TStationTracks">
      <p v-for="track of stationObj.TStationTracks" :key="track.ST_ID" class="p-ml-4">
        {{ track.ST_Name }}
      </p>
    </div>
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
