import { getLocaleDateString, getLocaleDateTimeString } from '../../additional/dateTimeConvertions';

export const currDateTime = {
  state: {
    dateTime: new Date(),
  },

  getters: {
    getCurrDateTime(state) {
      return state.dateTime;
    },

    getCurrDateTimeWithoutMilliseconds(state) {
      const returnValue = new Date(state.dateTime);
      returnValue.setMilliseconds(0);
      return returnValue;
    },

    getCurrDateString(state) {
      return getLocaleDateString(state.dateTime);
    },

    getCurrDateTimeString(state) {
      return getLocaleDateTimeString(state.dateTime, true);
    },
  },

  mutations: {
    setCurrDateTime(state, dt) {
      if (dt instanceof Date) {
        state.dateTime = dt;
      }
    },
  },
}
