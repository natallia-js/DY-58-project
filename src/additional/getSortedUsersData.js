import formUserInfoString from '@/additional/formUserInfoString';
import compareStrings from '@/additional/compareStrings';

function getSortedUsersData(people, ifStationPeople) {
  if (!people?.length)
    return [];

  const comparePeople = (a, b) => {
    return compareStrings(a.userStringInfo.toLowerCase(), b.userStringInfo.toLowerCase());
  };

  // Персонал станции сортируем так: вначале главные (ДСП, ревизоры), у которых нет конкретного
  // рабочего места в рамках станции, затем - Операторы при ДСП (ну или те, для кого указано
  // конкретное рабочее место), причем группируем их по рабочим местам
  const compareStationPeople = (a, b) => {
    if (!a.stationWorkPlaceId && b.stationWorkPlaceId) return -1;
    if (a.stationWorkPlaceId && !b.stationWorkPlaceId) return 1;
    if (a.stationWorkPlaceId && b.stationWorkPlaceId && a.stationWorkPlaceId !== b.stationWorkPlaceId)
      return a.stationWorkPlaceId - b.stationWorkPlaceId;
    return compareStrings(a.userStringInfo.toLowerCase(), b.userStringInfo.toLowerCase());
  };

  return people
    .map((user) => ({ ...user, userStringInfo: formUserInfoString(user, ifStationPeople) }))
    .sort((a, b) => ifStationPeople ? compareStationPeople(a, b) : comparePeople(a, b));
}

export default getSortedUsersData;
