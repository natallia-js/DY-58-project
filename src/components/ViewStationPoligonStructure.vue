<template>
  <div v-if="!stationObj">Структура участка не определена</div>
  <div v-else>
    <Fieldset
      :legend="`${stationObj.type} ${stationObj.St_Title} (${stationObj.St_UNMC}/ГИД:${stationObj.St_GID_UNMC})`"
      :toggleable="true"
    >
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
        <span class="p-text-bold">Рабочие места:</span>
      </p>
      <div v-if="stationObj.TStationWorkPlaces && stationObj.TStationWorkPlaces.length" class="p-mb-4">
        <p v-for="workPlace of stationObj.TStationWorkPlaces" :key="workPlace.SWP_ID" class="p-ml-4">
          {{ workPlace.SWP_Name }}
        </p>
      </div>
      <div v-else class="p-mb-4">
        Не определены
      </div>
      <Fieldset legend="перегоны" :toggleable="true">
        <div v-if="stationObj.TBlocks && stationObj.TBlocks.length">
          <Fieldset
            v-for="block of stationObj.TBlocks"
            :key="block.Bl_ID"
            :legend="block.Bl_Title"
            :toggleable="true"
          >
            <p class="p-mb-2">
              <span class="p-text-bold">Пути перегона:</span>
            </p>
            <div v-if="block.TBlockTracks && block.TBlockTracks.length" class="p-mb-2">
              <p v-for="track of block.TBlockTracks" :key="track.BT_ID" class="p-ml-4">
                {{ track.BT_Name }}
              </p>
            </div>
            <div v-else class="p-mb-2">
              Не определены
            </div>
            <p class="p-mb-2">
              <span class="p-text-bold">Соседняя станция:</span>
              {{ block.station1.St_ID !== stationObj.St_ID ? block.station1.St_Title : block.station2.St_Title }}
            </p>
            <p class="p-mb-2">
              <span class="p-text-bold">Пути станции:</span>
            </p>
            <div v-if="block.station1.St_ID !== stationObj.St_ID">
              <div v-if="block.station1.TStationTracks && block.station1.TStationTracks.length">
                <p v-for="track of block.station1.TStationTracks" :key="track.ST_ID" class="p-ml-4">
                  {{ track.ST_Name }}
                </p>
              </div>
              <div v-else class="p-mb-2">
                Не определены
              </div>
            </div>
            <div v-else>
              <div v-if="block.station2.TStationTracks && block.station2.TStationTracks.length">
                <p v-for="track of block.station2.TStationTracks" :key="track.ST_ID" class="p-ml-4">
                  {{ track.ST_Name }}
                </p>
              </div>
              <div v-else class="p-mb-2">
                Не определены
              </div>
            </div>
          </Fieldset>
        </div>
        <div v-else>
          Не определены
        </div>
      </Fieldset>
      <Fieldset legend="участки ДНЦ" :toggleable="true">
        <div v-if="stationObj.TDNCSectors && stationObj.TDNCSectors.length">
          <Fieldset
            v-for="sector of stationObj.TDNCSectors"
            :key="sector.DNCS_ID"
            :legend="sector.DNCS_Title"
            :toggleable="true"
          >
            <div>
              Станция {{ stationObj.St_Title }}
              <span class="p-text-bold">входит в состав</span>
              следующих поездных участков:
            </div>
            <div v-if="sector.TTrainSectors && sector.TTrainSectors.length">
              <div v-for="trainSector of sector.TTrainSectors" :key="trainSector.DNCTS_ID">
                <span class="p-text-bold">
                  {{ trainSector.DNCTS_Title }}
                </span>
                (в составе данного поездного участка станция
                <span class="p-text-bold">
                  {{ trainSector.stationBelongsToDNCSector ? 'принадлежит' : 'не принадлежит' }}
                </span> участку ДНЦ)
              </div>
            </div>
            <div v-else>
              Не определены
            </div>
          </Fieldset>
        </div>
        <div v-else>
          Не определены
        </div>
      </Fieldset>
      <Fieldset legend="участки ЭЦД" :toggleable="true">
        <div v-if="stationObj.TECDSectors && stationObj.TECDSectors.length">
          <Fieldset
            v-for="sector of stationObj.TECDSectors"
            :key="sector.ECDS_ID"
            :legend="sector.ECDS_Title"
            :toggleable="true"
          >
            <div>
              Станция {{ stationObj.St_Title }}
              <span class="p-text-bold">входит в состав</span>
              следующих поездных участков:
            </div>
            <div v-if="sector.TTrainSectors && sector.TTrainSectors.length">
              <div v-for="trainSector of sector.TTrainSectors" :key="trainSector.ECDTS_ID">
                <span class="p-text-bold">
                  {{ trainSector.ECDTS_Title }}
                </span>
                (в составе данного поездного участка станция
                <span class="p-text-bold">
                  {{ trainSector.stationBelongsToECDSector ? 'принадлежит' : 'не принадлежит' }}
                </span> участку ЭЦД)
              </div>
            </div>
            <div v-else>
              Не определены
            </div>
          </Fieldset>
        </div>
        <div v-else>
          Не определены
        </div>
      </Fieldset>
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
