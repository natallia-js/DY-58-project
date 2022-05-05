import { computed } from 'vue';


export const useStoreData = ({ store, relatedOrderObject }) => {
  /**
   * 
   */
  const getSectorStationOrBlockTitleById = computed(() => {
    if (relatedOrderObject.value && relatedOrderObject.value.place) {
      return store.getters.getSectorStationOrBlockTitleById({
        placeType: relatedOrderObject.value.place.place,
        id: relatedOrderObject.value.place.value,
      });
    }
    return null;
  });

  /**
   * 
   */
  const getSectorStations = computed(() =>
    store.getters.getSectorStations.map((station) => {
      return {
        id: station.St_ID,
        title: `${station.St_Title} (${station.St_UNMC})`,
      };
    })
  );

  /**
   * 
   */
  const getSectorBlocks = computed(() =>
    store.getters.getSectorBlocks.map((block) => {
      return {
        id: block.Bl_ID,
        title: block.Bl_Title,
      };
    })
  );

  return {
    getSectorStationOrBlockTitleById,
    getSectorStations,
    getSectorBlocks,
  };
};
