import { getOknas } from '@/serverRequests/oknas.requests';
import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';
import { SET_SYSTEM_MESSAGE } from '@/store/mutation-types';

/**
 * Данный модуль предназначен для работы с "окнами".
 */
export const useOkna = ({ store, state }) => {
  const refreshOknas = async () => {
    state.getOknaDataError = null;
    state.gettingOknasData = true;
    try {
      const responseData = await getOknas();
      if (responseData && responseData.data) {
        if (responseData.data instanceof Array) {
          state.oknaData = responseData.data;
        } else if (responseData.data.error) {
          if (responseData.data.error === "Отсутствуют данные за указанный период") {
            state.oknaData = [];
            state.getOknaDataError = `Информация по окнам не получена: ${responseData.data.error}`;
          } else {
            state.getOknaDataError = `Информация по окнам не обновлена: ${responseData.data.error}`;
          }
          store.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: state.getOknaDataError });
        }
      }
    } catch (error) {
      state.getOknaDataError = formErrorMessageInCatchBlock(error, 'Ошибка получения информации об окнах');
      store.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: state.getOknaDataError });
    } finally {
      state.gettingOknasData = false;
    }
  };

  return {
    refreshOknas,
  };
}
