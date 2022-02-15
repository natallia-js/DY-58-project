import { SET_PRINT_PREVIEW } from '@/store/mutation-types';

export const common = {
  state: {
    printPreview: false,
  },

  getters: {
    isPrintPreview(state) {
      return state.printPreview;
    },
  },

  mutations: {
    [SET_PRINT_PREVIEW] (state, value) {
      state.printPreview = value;
    },
  },
}
