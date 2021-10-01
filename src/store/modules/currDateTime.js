import {
  getLocaleDateString,
  getLocaleDateTimeString,
} from '../../additional/dateTimeConvertions';

export const currDateTime = {
  state: {
    dateTime: new Date(),
  },

  getters: {
    getCurrDateTime(state) {
      return state.dateTime;
    },

    getCurrDateString(state) {
      return getLocaleDateString(state.dateTime);
    },

    getCurrDateTimeString(state) {
      return getLocaleDateTimeString(state.dateTime, true, false);
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
