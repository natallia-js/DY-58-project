import {
  getDNCSectorsWorkPoligonsUsers,
  getStationsWorkPoligonsUsers,
  getECDSectorsWorkPoligonsUsers,
} from '@/serverRequests/users.requests';
import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';
import { WORK_POLIGON_TYPES } from '@/constants/appCredentials';
import { CurrShiftGetOrderStatus } from '@/constants/orders';
import {
  SET_ERROR_LOADING_CURR_SHIFT,
  SET_LOADING_CURR_SECTOR_SHIFT_STATUS,
  SET_SECTOR_PERSONAL,
  SET_SYSTEM_MESSAGE,
} from '@/store/mutation-types';
import {
  LOAD_SHIFT_DATA_FOR_DSP_ACTION,
  LOAD_SHIFT_DATA_FOR_DNC_ACTION,
  LOAD_SHIFT_DATA_FOR_ECD_ACTION,
  LOAD_CURR_SECTORS_SHIFT_ACTION,
} from '@/store/action-types';


function initialECDSectorsPersonalData(ecdSectors) {
  return ecdSectors ? ecdSectors.map((sector) => ({
    sectorId: sector.ECDS_ID,
    sectorTitle: sector.ECDS_Title,
    people: [],
    sendOriginal: CurrShiftGetOrderStatus.doNotSend,
  })) : [];
}

function initialDNCSectorsPersonalData(dncSectors) {
  return dncSectors ? dncSectors.map((sector) => ({
    sectorId: sector.DNCS_ID,
    sectorTitle: sector.DNCS_Title,
    people: [],
    sendOriginal: CurrShiftGetOrderStatus.doNotSend,
  })) : [];
}

function initialSectorStationsPersonalData(sectorStations) {
  return sectorStations ? sectorStations.map((station) => ({
    stationId: station.St_ID,
    stationUNMC: station.St_UNMC,
    stationTitle: station.St_Title,
    people: [],
    sendOriginal: CurrShiftGetOrderStatus.doNotSend,
  })) : [];
}

function initialSectorStationsWithTrainSectorsPersonalData(sectorStationsWithTrainSectors) {
  return sectorStationsWithTrainSectors ? sectorStationsWithTrainSectors.map((station) => ({
    trainSectorId: station.trainSectorId,
    trainSectorTitle: station.trainSectorTitle,
    stationPosInTrainSector: station.posInTrainSector,
    stationId: station.St_ID,
    stationUNMC: station.St_UNMC,
    stationTitle: station.St_Title,
    people: [],
    sendOriginal: CurrShiftGetOrderStatus.doNotSend,
  })) : [];
}

function setDNCSectorsShift(responseData, shiftPersonal) {
  if (!responseData?.length)
    return;
  responseData.forEach((user) => {
    shiftPersonal.DNCSectorsShift.forEach((item) => {
      if (item.sectorId === user.dncSectorId) {
        item.people.push({
          ...user,
          appsCredentials: user.appsCredentials.length > 0 ? (user.appsCredentials[0].creds || []) : [],
        });
      }
    });
  });
}

function setECDSectorsShift(responseData, shiftPersonal) {
  if (!responseData?.length)
    return;
  responseData.forEach((user) => {
    shiftPersonal.ECDSectorsShift.forEach((item) => {
      if (item.sectorId === user.ecdSectorId) {
        item.people.push({
          ...user,
          appsCredentials: user.appsCredentials.length > 0 ? (user.appsCredentials[0].creds || []) : [],
        });
      }
    });
  });
}

function setStationsShift(responseData, shiftPersonal) {
  if (!responseData?.length)
    return;
  responseData.forEach((user) => {
    shiftPersonal.sectorStationsShift.forEach((item) => {
      if (item.stationId === user.stationId) {
        item.people.push({
          ...user,
          appsCredentials: user.appsCredentials.length > 0 ? (user.appsCredentials[0].creds || []) : [],
        });
      }
    });
  });
}


/**
 * Данный модуль предназначен для получения общей информации о персонале полигона управления.
 */
export const getCurrSectorShift = {
  getters: {
    /**
     * Возвращает объект со списками всего персонала полигона управления (конкретный вид объекта
     * определяется типом полигона управления).
     */
    getSectorPersonal(state) {
      return state.sectorPersonal;
    },

    /**
     * Возвращает статус процесса получения информации о персонале (true - идет процесс загрузки данных
     * с сервера, false - процесс загрузки данных не идет).
     */
    getLoadingCurrSectorsShiftStatus: (state) => {
      return state.loadingCurrShift;
    },

    /**
     * Возвращает строку с информацией об ошибке, произошедшей при загрузке персонала текущего
     * полигона управления. Если ошибки загрузки не было, то возвращается null.
     */
    getErrorLoadingCurrSectorsShift: (state) => {
      return state.errorLoadingCurrShift;
    },

    /**
     * Возвращает идентификаторы всех лиц, входящих в состав полигона управления
     * (т.е. идентификаторы всего зарегистрированного в системе персонала, информация о котором
     * ранее была извлечена из БД).
     * Если одно и то же лицо входит в несколько участков (например, когда станция входит
     * в состав смежных поездных участков), то его id не дублируется.
     */
    getShiftPersonalIds: (state) => {
      const ids = [];
      function getUsersIds(sectorsArray) {
        if (sectorsArray && sectorsArray.length) {
          sectorsArray.forEach((sector) => {
            if (sector.people) {
              ids.push(...sector.people.map((user) => user._id));
            }
          });
        }
      }
      getUsersIds(state.sectorPersonal.DNCSectorsShift);
      getUsersIds(state.sectorPersonal.sectorStationsShift);
      getUsersIds(state.sectorPersonal.ECDSectorsShift);
      return [...new Set(ids)];
    },
  },

  mutations: {
    [SET_LOADING_CURR_SECTOR_SHIFT_STATUS] (state, status) {
      state.loadingCurrShift = status;
    },

    [SET_ERROR_LOADING_CURR_SHIFT] (state, errorMessage) {
      state.errorLoadingCurrShift = errorMessage;
    },

    [SET_SECTOR_PERSONAL] (state, shiftPersonal) {
      // Здесь не делаю "state.sectorPersonal = shiftPersonal || {}" потому, что при перегазрузке страницы
      // информация об иных адресатах может подгрузиться раньше из циркулярного распоряжения, нежели остальная
      // информация будет установлена здесь. И этот код просто сотрет все что было загружено из циркуляра.
      if (!state.sectorPersonal) {
        state.sectorPersonal = {};
      }
      state.sectorPersonal.DNCSectorsShift = shiftPersonal && shiftPersonal.DNCSectorsShift ? shiftPersonal.DNCSectorsShift : [];
      state.sectorPersonal.ECDSectorsShift = shiftPersonal && shiftPersonal.ECDSectorsShift ? shiftPersonal.ECDSectorsShift : [];
      state.sectorPersonal.sectorStationsShift = shiftPersonal && shiftPersonal.sectorStationsShift ? shiftPersonal.sectorStationsShift : [];
    },
  },

  actions: {
    /**
     * Подгружает информацию обо всем персонале участка ДСП.
     */
    async [LOAD_SHIFT_DATA_FOR_DSP_ACTION] (context) {
      // id участков ДНЦ
      const dncSectorsIds = context.getters.getStationDNCSectors.map((sector) => sector.DNCS_ID);
      // id участков ЭЦД
      const ecdSectorsIds = context.getters.getStationECDSectors.map((sector) => sector.ECDS_ID);
      // id всех станций: как текущего полигона управления, так и смежных к нему станций
      const stationsIds = context.getters.getSectorStations.map((station) => station.St_ID);
      // Сюда поместим информацию о персонале, необходимую ДСП. Предварительно (до обращения к БД)
      // сформируем структуру данных
      const shiftPersonal = {
        // Здесь будет информация о тех пользователях, которые работают на участках ДНЦ, в состав
        // которых входит станция (т.е. текущий полигон управления)
        DNCSectorsShift: initialDNCSectorsPersonalData(context.getters.getStationDNCSectors),
        // Здесь будет информация о тех пользователях, которые работают на участках ЭЦД, в состав
        // которых входит станция (т.е. текущий полигон управления)
        ECDSectorsShift: initialECDSectorsPersonalData(context.getters.getStationECDSectors),
        // Здесь будет информация о тех пользователях, которые работают как на текущей станции (полигоне
        // управления), так и на станциях, смежных с текущей
        sectorStationsShift: initialSectorStationsPersonalData(context.getters.getSectorStations),
      };
      // Извлекаем из БД информацию о тех пользователях, которые работают на участках ДНЦ
      // (для пользователей извлекаются только те полномочия, которые "известны" текущему приложению на участке ДНЦ)
      if (dncSectorsIds.length) {
        const responseData = await getDNCSectorsWorkPoligonsUsers({ sectorIds: dncSectorsIds, onlyOnline: false });
        setDNCSectorsShift(responseData, shiftPersonal);
      }
      // Извлекаем из БД информацию о тех пользователях, которые работают на участках ЭЦД
      // (для пользователей извлекаются только те полномочия, которые "известны" текущему приложению на участке ЭЦД)
      if (ecdSectorsIds.length) {
        const responseData = await getECDSectorsWorkPoligonsUsers({ sectorIds: ecdSectorsIds, onlyOnline: false });
        setECDSectorsShift(responseData, shiftPersonal);
      }
      // Извлекаем из БД информацию о тех пользователях, которые работают на смежных станциях
      // (для пользователей извлекаются только те полномочия, которые "известны" текущему приложению на станции)
      if (stationsIds.length) {
        const responseData = await getStationsWorkPoligonsUsers({ stationIds: stationsIds, onlyOnline: false, includeWorkPlaces: true });
        console.log(responseData)
        setStationsShift(responseData, shiftPersonal);
      }
      context.commit(SET_SECTOR_PERSONAL, shiftPersonal);
    },

    /**
     * Подгружает информацию обо всем персонале участка ДНЦ.
     */
    async [LOAD_SHIFT_DATA_FOR_DNC_ACTION] (context) {
      // id смежных участков ДНЦ
      const adjacentSectorsIds = context.getters.getAdjacentDNCSectors.map((sector) => sector.DNCS_ID);
      // id станций участка ДНЦ
      const stationsIds = context.getters.getSectorStations.map((station) => station.St_ID);
      // id ближайших участков ЭЦД
      const nearestSectorsIds = context.getters.getNearestECDSectors.map((sector) => sector.ECDS_ID);
      // Сюда поместим информацию о персонале, необходимую ДНЦ. Предварительно (до обращения к БД)
      // сформируем структуру данных
      const shiftPersonal = {
        // Здесь будет информация как о тех пользователях, которые работают на участках ДНЦ, смежных с
        // текущим участком ДНЦ, так и на самом текущем участке ДНЦ
        DNCSectorsShift: initialDNCSectorsPersonalData([
          ...context.getters.getAdjacentDNCSectors,
          {
            DNCS_ID: context.getters.getUserWorkPoligon.code,
            DNCS_Title: context.getters.getUserWorkPoligonName(),
          },
        ]),
        // Здесь будет информация о тех пользователях, которые работают на станциях текущего участка ДНЦ
        sectorStationsShift: initialSectorStationsWithTrainSectorsPersonalData(context.getters.getSectorStationsWithTrainSectors),
        // Здесь будет информация о тех пользователях, которые работают на участках ЭЦД, ближайших к
        // текущему участку ДНЦ
        ECDSectorsShift: initialECDSectorsPersonalData(context.getters.getNearestECDSectors),
      };
      // Извлекаем из БД информацию о тех пользователях, которые работают на участках ДНЦ, смежных с
      // текущим участком ДНЦ
      // (для пользователей извлекаются только те полномочия, которые "известны" текущему приложению на участке ДНЦ)
      const responseData = await getDNCSectorsWorkPoligonsUsers({
        sectorIds: [...adjacentSectorsIds, context.getters.getUserWorkPoligon.code],
        onlyOnline: false,
      });
      setDNCSectorsShift(responseData, shiftPersonal);
      // Извлекаем из БД информацию о тех пользователях, которые работают на станциях участка ДНЦ с id = sectorId
      // (для пользователей извлекаются только те полномочия, которые "известны" текущему приложению на станции)
      if (stationsIds.length) {
        const responseData = await getStationsWorkPoligonsUsers({ stationIds: stationsIds, onlyOnline: false, includeWorkPlaces: false });
        setStationsShift(responseData, shiftPersonal);
      }
      // Извлекаем из БД информацию о тех пользователях, которые работают на участках ЭЦД, ближайших к
      // участку ДНЦ с id = sectorId
      // (для пользователей извлекаются только те полномочия, которые "известны" текущему приложению на участке ЭЦД)
      if (nearestSectorsIds.length) {
        const responseData = await getECDSectorsWorkPoligonsUsers({ sectorIds: nearestSectorsIds, onlyOnline: false });
        setECDSectorsShift(responseData, shiftPersonal);
      }
      context.commit(SET_SECTOR_PERSONAL, shiftPersonal);
    },

    /**
     * Подгружает информацию обо всем персонале участка ЭЦД.
     */
    async [LOAD_SHIFT_DATA_FOR_ECD_ACTION] (context) {
      // id смежных участков ЭЦД
      const adjacentSectorsIds = context.getters.getAdjacentECDSectors.map((sector) => sector.ECDS_ID);
      // id станций участка ЭЦД
      const stationsIds = context.getters.getSectorStations.map((station) => station.St_ID);
      // id ближайших участков ДНЦ
      const nearestSectorsIds = context.getters.getNearestDNCSectors.map((sector) => sector.DNCS_ID);
      // Сюда поместим информацию о персонале, необходимую ЭЦД. Предварительно (до обращения к БД)
      // сформируем структуру данных
      const shiftPersonal = {
        // Здесь будет информация как о тех пользователях, которые работают на участках ЭЦД, смежных с
        // текущим участком ЭЦД, так и на самом текущем участке ЭЦД
        ECDSectorsShift: initialECDSectorsPersonalData([
          ...context.getters.getAdjacentECDSectors,
          {
            ECDS_ID: context.getters.getUserWorkPoligon.code,
            ECDS_Title: context.getters.getUserWorkPoligonName(),
          },
        ]),
        // Здесь будет информация о тех пользователях, которые работают на станциях участка ЭЦД с id = sectorId
        sectorStationsShift: initialSectorStationsWithTrainSectorsPersonalData(context.getters.getSectorStationsWithTrainSectors),
        // Здесь будет информация о тех пользователях, которые работают на участках ДНЦ, ближайших к
        // участку ЭЦД с id = sectorId
        DNCSectorsShift: initialDNCSectorsPersonalData(context.getters.getNearestDNCSectors),
      };
      // Извлекаем из БД информацию о тех пользователях, которые работают на участках ЭЦД, смежных с
      // текущим участком ЭЦД
      // (для пользователей извлекаются только те полномочия, которые "известны" текущему приложению на участке ЭЦД)
      const responseData = await getECDSectorsWorkPoligonsUsers({
        sectorIds: [...adjacentSectorsIds, context.getters.getUserWorkPoligon.code],
        onlyOnline: false,
      });
      setECDSectorsShift(responseData, shiftPersonal);
      // Извлекаем из БД информацию о тех пользователях, которые работают на станциях участка ЭЦД с id = sectorId
      // (для пользователей извлекаются только те полномочия, которые "известны" текущему приложению на станции)
      if (stationsIds.length) {
        const responseData = await getStationsWorkPoligonsUsers({ stationIds: stationsIds, onlyOnline: false, includeWorkPlaces: false });
        setStationsShift(responseData, shiftPersonal);
      }
      // Извлекаем из БД информацию о тех пользователях, которые работают на участках ДНЦ, ближайших к
      // участку ЭЦД с id = sectorId
      // (для пользователей извлекаются только те полномочия, которые "известны" текущему приложению на участке ДНЦ)
      if (nearestSectorsIds.length) {
        const responseData = await getDNCSectorsWorkPoligonsUsers({ sectorIds: nearestSectorsIds, onlyOnline: false });
        setDNCSectorsShift(responseData, shiftPersonal);
      }
      context.commit(SET_SECTOR_PERSONAL, shiftPersonal);
    },


    /**
     * Позволяет извлечь из БД информацию о всем персонале рабочего полигона.
     * Извлекает информацию в зависимости от типа текущего рабочего полигона пользователя.
     */
    async [LOAD_CURR_SECTORS_SHIFT_ACTION] (context) {
      if (context.getters.ifUserWorksOffline) {
        context.commit(SET_ERROR_LOADING_CURR_SHIFT, 'При автономной работе с системой не предусмотрена возможность просматривать персонал рабочего полигона');
        return;
      }
      if (!context.getters.canUserWorkWithSystem) {
        const errMessage = 'У вас нет права на получение информации о персонале рабочего полигона';
        context.commit(SET_ERROR_LOADING_CURR_SHIFT, errMessage);
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }
      const workPoligon = context.getters.getUserWorkPoligon;
      if (!workPoligon) {
        const errMessage = 'Ошибка загрузки персонала участка: неизвестен рабочий полигон';
        context.commit(SET_ERROR_LOADING_CURR_SHIFT, errMessage);
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }
      if (!context.getters.getUserWorkPoligonData) {
        const errMessage = 'Ошибка загрузки персонала участка: неизвестна структура рабочего полигона';
        context.commit(SET_ERROR_LOADING_CURR_SHIFT, errMessage);
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }
      context.commit(SET_ERROR_LOADING_CURR_SHIFT, null);
      context.commit(SET_LOADING_CURR_SECTOR_SHIFT_STATUS, true);
      try {
        switch (workPoligon.type) {
          case WORK_POLIGON_TYPES.STATION:
            await context.dispatch(LOAD_SHIFT_DATA_FOR_DSP_ACTION);
            break;
          case WORK_POLIGON_TYPES.DNC_SECTOR:
            await context.dispatch(LOAD_SHIFT_DATA_FOR_DNC_ACTION);
            break;
          case WORK_POLIGON_TYPES.ECD_SECTOR:
            await context.dispatch(LOAD_SHIFT_DATA_FOR_ECD_ACTION);
            break;
        }
        context.commit(SET_SYSTEM_MESSAGE, { error: false, datetime: new Date(), message: 'Загружен список персонала участка' });
      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка загрузки персонала участка');
        context.commit(SET_ERROR_LOADING_CURR_SHIFT, errMessage);
        context.commit(SET_SYSTEM_MESSAGE, { error: false, datetime: new Date(), message: errMessage });
      } finally {
        context.commit(SET_LOADING_CURR_SECTOR_SHIFT_STATUS, false);
      }
    },
  },
}
