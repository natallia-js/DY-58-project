<template>
  <div v-if="!sectorObj">Структура участка не определена</div>
  <div v-else>
    <Fieldset :legend="`${sectorObj.type} ${sectorObj.ECDS_Title}`" :toggleable="true">
      <Fieldset legend="поездные участки" :toggleable="true">
        <div v-if="sectorObj.TECDTrainSectors && sectorObj.TECDTrainSectors.length">
          <Fieldset
            v-for="trainSector of sectorObj.TECDTrainSectors"
            :key="trainSector.ECDTS_ID"
            :legend="`поездной участок ${trainSector.ECDTS_Title}`"
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
                    {{ station.TECDTrainSectorStation ? station.TECDTrainSectorStation.ECDTSS_StationPositionInTrainSector : 'не определена' }}
                  </p>
                  <p class="p-mb-2">
                    <span class="p-text-bold">Принадлежность участку ДНЦ:</span>
                    {{
                      !station.TECDTrainSectorStation ?
                        'не определена' :
                        (station.TECDTrainSectorStation.ECDTSS_StationBelongsToECDSector === true) ?
                          'да' :
                          (station.TECDTrainSectorStation.ECDTSS_StationBelongsToECDSector === false) ?
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
                    {{ block.TECDTrainSectorBlock ? block.TECDTrainSectorBlock.ECDTSB_BlockPositionInTrainSector : 'не определена' }}
                  </p>
                  <p class="p-mb-2">
                    <span class="p-text-bold">Принадлежность участку ДНЦ:</span>
                    {{
                      !block.TECDTrainSectorBlock ?
                        'не определена' :
                        (block.TECDTrainSectorBlock.ECDTSB_BlockBelongsToECDSector === true) ?
                          'да' :
                          (block.TECDTrainSectorBlock.ECDTSB_BlockBelongsToECDSector === false) ?
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
      <Fieldset legend="смежные участки ЭЦД" :toggleable="true">
        <div v-if="sectorObj.TAdjacentECDSectors && sectorObj.TAdjacentECDSectors.length">
          <p v-for="adjSector of sectorObj.TAdjacentECDSectors" :key="adjSector.ECDS_ID" class="p-ml-4">
            {{ adjSector.ECDS_Title }}
          </p>
        </div>
        <div v-else>
          Не определены
        </div>
      </Fieldset>
      <Fieldset legend="ближайшие участки ДНЦ" :toggleable="true">
        <div v-if="sectorObj.TNearestDNCSectors && sectorObj.TNearestDNCSectors.length">
          <p v-for="nearSector of sectorObj.TNearestDNCSectors" :key="nearSector.DNCS_ID" class="p-ml-4">
            {{ nearSector.DNCS_Title }}
          </p>
        </div>
        <div v-else>
          Не определены
        </div>
      </Fieldset>
      <Fieldset legend="структурные подразделения" :toggleable="true">
        <div v-if="sectorObj.TECDStructuralDivisions && sectorObj.TECDStructuralDivisions.length">
          <p v-for="(division, index) of sortedStructuralDivisions(sectorObj.TECDStructuralDivisions)" :key="division.ECDSD_ID" class="p-ml-4">
            {{ `${index + 1}. &#160; ${division.ECDSD_Title} / ${division.ECDSD_Post} / ${division.ECDSD_FIO}` }}
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
  import compareStrings from '../additional/compareStrings';

  export default {
    name: 'dy58-view-ecd-sector-poligon-structure',

    props: {
      sectorObj: {
        type: Object,
      },
    },

    methods: {
      sortedStructuralDivisions(divisionsArray) {
        return divisionsArray.sort((a, b) => compareStrings(a.ECDSD_Title.toLowerCase(), b.ECDSD_Title.toLowerCase()));
      },
    },
  };
</script>
