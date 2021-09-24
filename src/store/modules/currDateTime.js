export const currDateTime = {
  state: {
    dateTime: new Date(),
  },

  getters: {
    getCurrDateTime(state) {
      return state.dateTime;
    },

    getCurrDateString(state) {
      if (!state.dateTime) {
        return '';
      }
      const date = state.dateTime.getDate();
      const month = state.dateTime.getMonth() + 1;
      const year = state.dateTime.getFullYear();
      return `${date < 10 ? `0${date}` : date}.${month < 10 ? `0${month}` : month}.${year}`;
    },

    getCurrTimeString(state) {
      if (!state.dateTime) {
        return '';
      }
      const hours = state.dateTime.getHours();
      const minutes = state.dateTime.getMinutes();
      const seconds = state.dateTime.getSeconds();
      return `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
    },

    getCurrDateTimeString(state) {
      if (!state.dateTime) {
        return '';
      }
      const date = state.dateTime.getDate();
      const month = state.dateTime.getMonth() + 1;
      const year = state.dateTime.getFullYear();
      const hours = state.dateTime.getHours();
      const minutes = state.dateTime.getMinutes();
      const seconds = state.dateTime.getSeconds();
      const dateString = `${date < 10 ? `0${date}` : date}.${month < 10 ? `0${month}` : month}.${year}`;
      const timeString = `${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
      return `${dateString} ${timeString}`;
    },
  },

  mutations: {
    setCurrDateTime(state, dt) {
      state.dateTime = dt;
    },
  },
}
