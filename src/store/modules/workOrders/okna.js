import { SET_SELECTED_OKNO } from '@/store/mutation-types';

/**
 * Данный модуль предназначен для работы с "окнами".
 */
export const okna = {
  getters: {
    getSelectedOkno(state) {
      return state.selectedOkno;
    },
  },

  mutations: {
    [SET_SELECTED_OKNO] (state, { okno }) {
      state.selectedOkno = okno;
    },
  },
};
