import { CHECK_CLIPBOARD } from '@/store/action-types';
import {
  SET_DATA_FOR_DR_ORDER_GOT_FROM_CLIPBOARD,
  CLEAR_DATA_FOR_DR_ORDER_GOT_FROM_CLIPBOARD,
} from '@/store/mutation-types';


/**
 * Данный модуль предназначен для проверки буфера обмена на наличие в нем данных для
 * распоряжения о поезде ДР. Если данные есть, то они извлекаются из буфера и запоминаются
 * в системе, буфер чистится.
 */
export const checkClipboard = {
  getters: {
    getDataForDROrderFromClipboard(state) {
      return state.dataForDROrderFromClipboard;
    },
  },

  mutations: {
    [SET_DATA_FOR_DR_ORDER_GOT_FROM_CLIPBOARD] (state, data) {
      state.dataForDROrderFromClipboard = data;
    },

    [CLEAR_DATA_FOR_DR_ORDER_GOT_FROM_CLIPBOARD] (state) {
      state.dataForDROrderFromClipboard = null;
    },
  },

  actions: {
    async [CHECK_CLIPBOARD] (context) {
      try {
        const text = await navigator.clipboard.readText();
        const clipboardData = JSON.parse(text);
        if (
          clipboardData instanceof Array &&
          clipboardData.length > 0 &&
          clipboardData[0] instanceof Object &&
          clipboardData[0].Station
        ) {
          // Применяем данные, полученные из буфера обмена
          context.commit(SET_DATA_FOR_DR_ORDER_GOT_FROM_CLIPBOARD, clipboardData);
          // Чистим буфер обмена
          await navigator.clipboard.writeText('');
        }
      } catch (err) {
        context.commit(CLEAR_DATA_FOR_DR_ORDER_GOT_FROM_CLIPBOARD);
      }
    },
  },
};
