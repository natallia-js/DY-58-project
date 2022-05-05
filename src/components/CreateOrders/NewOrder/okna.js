import { watch } from 'vue';
import { getOknas } from '@/serverRequests/oknas.requests';
import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';
import { SET_SYSTEM_MESSAGE, SET_GET_ORDER_STATUS_TO_ALL_DSP, SET_SELECTED_OKNO } from '@/store/mutation-types';
import { CurrShiftGetOrderStatus } from '@/constants/orders';

/**
 * Данный модуль предназначен для работы с "окнами".
 */
export const useOkna = ({ store, state, setRequestOrderTextFields, selectedOkno }) => {
  /**
   * Обновляет информацию по "окнам".
   */
  const refreshOknas = async () => {
    state.getOknaDataError = null;
    state.gettingOknasData = true;
    try {
      const stationsCodes = store.getters.getSectorStations.map((el) => el.St_UNMC);
      const responseData = await getOknas(stationsCodes);
      if (responseData && responseData.data) {
        if (responseData.data instanceof Array) {
          state.oknaData = responseData.data.map((el) => ({
            ...el,
            id: `${el.idPlan}${el.nppPlan}${el.idSpan}`,
            datetime: `с ${el.beginStr.split(' ')[1]} по ${el.endStr.split(' ')[1]}`,
          }));
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

  /**
   * При выборе "окна" необходимо обновлять поля текущего шаблона заявки (если таковой есть)
   * и чистить список адресатов.
   */
  watch(selectedOkno, () => {
    setRequestOrderTextFields();
    store.commit(SET_GET_ORDER_STATUS_TO_ALL_DSP, { getOrderStatus: CurrShiftGetOrderStatus.doNotSend });
  });

  /**
   * Обновляю значение выбранного "окна" в глобальном хранилище.
   */
  watch(() => state.selectedOknoInDataTable, (newVal) => {
    store.commit(SET_SELECTED_OKNO, { okno: newVal });
  });

  return {
    refreshOknas,
  };
}
