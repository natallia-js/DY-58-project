import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';

/**
 * Возвращает массив рабочих полигонов пользователя из ответа сервера
 * на запрос о входе в систему либо на запрос о получении полномочий пользователя
 * в рамках текущей сессии.
 */
function getUserWorkPoligonsArray(responseData) {
  const workPoligons = [];
  if (!responseData) {
    return workPoligons;
  }
  if (responseData.stationWorkPoligons && responseData.stationWorkPoligons.length) {
    workPoligons.push({
      type: WORK_POLIGON_TYPES.STATION,
      workPoligons: responseData.stationWorkPoligons.map((poligon) => ({
        poligonId: poligon.SWP_StID,
        subPoligonId: poligon.SWP_StWP_ID,
        subPoligonType: poligon.SWP_Type,
      })),
    });
  }
  if (responseData.dncSectorsWorkPoligons && responseData.dncSectorsWorkPoligons.length) {
    workPoligons.push({
      type: WORK_POLIGON_TYPES.DNC_SECTOR,
      workPoligons: responseData.dncSectorsWorkPoligons.map((poligon) => ({
        poligonId: poligon.DNCSWP_DNCSID,
      })),
    });
  }
  if (responseData.ecdSectorsWorkPoligons && responseData.ecdSectorsWorkPoligons.length) {
    workPoligons.push({
      type: WORK_POLIGON_TYPES.ECD_SECTOR,
      workPoligons: responseData.ecdSectorsWorkPoligons.map((poligon) => ({
        poligonId: poligon.ECDSWP_ECDSID,
      })),
    });
  }
  return workPoligons;
}

export default getUserWorkPoligonsArray;
