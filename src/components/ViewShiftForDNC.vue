<template>
  <div v-if="!sectorObj">Структура участка не определена</div>
  <div v-else>
    <Fieldset :legend="`${sectorObj.type} ${sectorObj.DNCS_Title}`" :toggleable="true">
      <Fieldset legend="поездные участки" :toggleable="true">
        <div v-if="sectorObj.TDNCTrainSectors && sectorObj.TDNCTrainSectors.length">
          <Fieldset
            v-for="trainSector of sectorObj.TDNCTrainSectors"
            :key="trainSector.DNCTS_ID"
            :legend="`поездной участок ${trainSector.DNCTS_Title}`"
            :toggleable="true"
          >
            <Fieldset legend="станции" :toggleable="true">
              <div v-if="trainSector.TStations && trainSector.TStations.length">
                <Fieldset
                  v-for="station of trainSector.TStations"
                  :key="station.St_ID"
                  :legend="`станция ${station.St_Title} (${station.St_UNMC})`"
                  :toggleable="true"
                >
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
                  <div v-if="station.TStationTracks && station.TStationTracks.length">
                    <p v-for="track of station.TStationTracks" :key="track.ST_ID" class="p-ml-4">
                      {{ track.ST_Name }}
                    </p>
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
            <Fieldset legend="перегоны" :toggleable="true">
              <div v-if="trainSector.TBlocks && trainSector.TBlocks.length">
                <Fieldset
                  v-for="block of trainSector.TBlocks"
                  :key="block.Bl_ID"
                  :legend="`перегон ${block.Bl_Title}`"
                  :toggleable="true"
                >
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
                  <div v-if="block.TBlockTracks && block.TBlockTracks.length">
                    <p v-for="track of block.TBlockTracks" :key="track.BT_ID" class="p-ml-4">
                      {{ track.BT_Name }}
                    </p>
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
        <div v-else>
          Не определены
        </div>
      </Fieldset>
      <Fieldset legend="смежные участки ДНЦ" :toggleable="true">
        <div v-if="sectorObj.TAdjacentDNCSectors && sectorObj.TAdjacentDNCSectors.length">
          <p v-for="adjSector of sectorObj.TAdjacentDNCSectors" :key="adjSector.DNCS_ID" class="p-ml-4">
            {{ adjSector.DNCS_Title }}
          </p>
        </div>
        <div v-else>
          Не определены
        </div>
      </Fieldset>
      <Fieldset legend="ближайшие участки ЭЦД" :toggleable="true">
        <div v-if="sectorObj.TNearestECDSectors && sectorObj.TNearestECDSectors.length">
          <p v-for="nearSector of sectorObj.TNearestECDSectors" :key="nearSector.ECDS_ID" class="p-ml-4">
            {{ nearSector.ECDS_Title }}
          </p>
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
    name: 'dy58-view-shift-for-dnc',

    props: {
      shift: {
        type: Object,
      },
    },
  };
</script>
