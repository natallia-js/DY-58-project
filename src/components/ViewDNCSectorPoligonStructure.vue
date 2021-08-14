<template>
  <div v-if="!sectorObj">Структура участка не определена</div>
  <div v-else>
    <p class="p-mb-2">
      <span class="p-text-bold">Тип участка:</span>
      {{ sectorObj.type }}
    </p>
    <p class="p-mb-2">
      <span class="p-text-bold">Наименование:</span>
      {{ sectorObj.DNCS_Title }}
    </p>
    <p class="p-mb-2">
      <span class="p-text-bold">Поездные участки:</span>
    </p>
    <div v-if="sectorObj.TDNCTrainSectors">
      <div v-for="trainSector of sectorObj.TDNCTrainSectors" :key="trainSector.DNCTS_ID" class="p-ml-4">
        <p class="p-mb-2">
          <span class="p-text-italic p-text-bold">Наименование:</span>
          {{ trainSector.DNCTS_Title }}
        </p>
        <p class="p-mb-2">
          <span class="p-text-bold">Станции:</span>
        </p>
        <div v-if="trainSector.TStations">
          <div v-for="station of trainSector.TStations" :key="station.St_ID" class="p-ml-4">
            <p class="p-mb-2">
              <span class="p-text-bold">Наименование:</span>
              {{ station.St_Title }}
            </p>
            <p class="p-mb-2">
              <span class="p-text-bold">Код ЕСР:</span>
              {{ station.St_UNMC }}
            </p>
            <p class="p-mb-2">
              <span class="p-text-bold">Позиция на поездном участке:</span>
              {{ station.TDNCTrainSectorStation ? station.TDNCTrainSectorStation.DNCTSS_StationPositionInTrainSector : 'не определена' }}
            </p>
            <p class="p-mb-2">
              <span class="p-text-bold">Принадлежность участку ДНЦ:</span>
              {{
                !station.TDNCTrainSectorStation ?
                  'не определена' :
                  (station.TDNCTrainSectorStation.DNCTSS_StationBelongsToDNCSector === true) ?
                    'да' :
                    (station.TDNCTrainSectorStation.DNCTSS_StationBelongsToDNCSector === false) ?
                      'нет' :
                      'не определена'
              }}
            </p>
            <p class="p-mb-2">
              <span class="p-text-bold">Пути:</span>
            </p>
            <div v-if="station.TStationTracks">
              <p v-for="track of station.TStationTracks" :key="track.ST_ID" class="p-ml-4">
                {{ track.ST_Name }}
              </p>
            </div>
          </div>
        </div>
        <p class="p-mb-2">
          <span class="p-text-bold">Перегоны:</span>
        </p>
        <div v-if="trainSector.TBlocks">
          <div v-for="block of trainSector.TBlocks" :key="block.Bl_ID" class="p-ml-4">
            <p class="p-mb-2">
              <span class="p-text-bold">Наименование:</span>
              {{ block.Bl_Title }}
            </p>
            <p class="p-mb-2">
              <span class="p-text-bold">ID станции 1:</span>
              {{ block.Bl_StationID1 }}
            </p>
            <p class="p-mb-2">
              <span class="P-text-bold">ID станции 2:</span>
              {{ block.Bl_StationID2 }}
            </p>
            <p class="p-mb-2">
              <span class="p-text-bold">Позиция на поездном участке:</span>
              {{ block.TDNCTrainSectorBlock ? block.TDNCTrainSectorBlock.DNCTSB_BlockPositionInTrainSector : 'не определена' }}
            </p>
            <p class="p-mb-2">
              <span class="p-text-bold">Принадлежность участку ДНЦ:</span>
              {{
                !block.TDNCTrainSectorBlock ?
                  'не определена' :
                  (block.TDNCTrainSectorBlock.DNCTSB_BlockBelongsToDNCSector === true) ?
                    'да' :
                    (block.TDNCTrainSectorBlock.DNCTSB_BlockBelongsToDNCSector === false) ?
                      'нет' :
                      'не определена'
              }}
            </p>
            <p class="p-mb-2">
              <span class="p-text-bold">Пути:</span>
            </p>
            <div v-if="block.TBlockTracks">
              <p v-for="track of block.TBlockTracks" :key="track.BT_ID" class="p-ml-4">
                {{ track.BT_Name }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
  export default {
    name: 'dy58-view-dnc-sector-poligon-structure',

    props: {
      sectorObj: {
        type: Object,
      },
    },
  };
</script>
