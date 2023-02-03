/**
 * Сравнивает два объекта, wp1, wp2, содержащие информацию о полигонах управления, на равенство.
 */
function checkWorkPoligonsEquality(wp1, wp2) {
  if (!wp1?.type && !wp1?.id && !wp2?.type && !wp2?.id) return true;
  if (wp1?.type === wp2?.type && wp1?.id == wp2?.id) return true;
  return false;
}

export default checkWorkPoligonsEquality;
