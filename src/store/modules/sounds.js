export const sounds = {
  state: {
    soundsVolume: 1,
  },

  getters: {
    getSoundsVolume: (state) => {
      return state.soundsVolume;
    },
  },

  mutations: {
    setSoundsVolume(state, newVolume) {
      if (typeof newVolume !== 'number' || state.soundsVolume === newVolume) {
        return;
      }
      if (newVolume < 0) {
        if (state.soundsVolume !== 0) {
          state.soundsVolume = 0;
        }
      } else if (newVolume > 1) {
        if (state.soundsVolume !== 1) {
          state.soundsVolume = 1;
        }
      } else {
        if (state.soundsVolume !== newVolume) {
          state.soundsVolume = newVolume;
        }
      }
    },
  },
}
