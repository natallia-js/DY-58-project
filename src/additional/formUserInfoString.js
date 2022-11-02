import { store } from '@/store';

const getWorkPlaceDisplayData = (stationId, workPlaceId) => {
  const workPlaceName = store.getters.getStationWorkPlaceNameById(stationId, workPlaceId);
  if (!workPlaceName) {
    return `(рабочее место с id=${workPlaceId})`;
  }
  return `(рабочее место "${workPlaceName}")`;
};

function formUserInfoString(user, isStationWorkPoligon = false) {
  if (!user)
    return '';
  const userInfoArray = [];
  if (user.post) userInfoArray.push(user.post);
  if (user.surname) userInfoArray.push(user.surname);
  if (user.name) userInfoArray.push(user.name);
  if (user.fatherName) userInfoArray.push(user.fatherName);
  if (isStationWorkPoligon && user.stationWorkPlaceId)
    userInfoArray.push(getWorkPlaceDisplayData(user.stationId, user.stationWorkPlaceId));
  userInfoArray.push(`(рол${(user.appsCredentials || []).length > 1 ? 'и' : 'ь'} ${(user.appsCredentials || []).join(', ')})`);
  return userInfoArray.join(' ');
}

export default formUserInfoString;
