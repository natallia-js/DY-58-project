function getStationWorkPlaceFullCode(stationId, stationWorkPlaceId) {
  return `${stationId}${stationWorkPlaceId || ''}`;
}

export default getStationWorkPlaceFullCode;
