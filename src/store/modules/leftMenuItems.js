import { APP_CREDENTIALS } from '../../constants/appCredentials';

export const leftMenuItems = {
  state: {
    dspLeftMenuItems: [
      { label: 'Входящие за смену' },
      { label: 'Не прочитано', class: 'dy58-subitem dy58-important-item' },
      { label: 'Документы в работе' },
      { label: 'В доставке', class: 'dy58-subitem dy58-important-item' },
      { label: 'Не доставленные', class: 'dy58-subitem dy58-important-item' },
      { label: 'Действующие' },
      { label: 'Не отмененные', class: 'dy58-subitem' },
      { label: 'Черновики' },
    ],

    dncLeftMenuItems: [
      { label: 'Входящие за смену' },
      { label: 'Не прочитано', class: 'dy58-subitem dy58-important-item' },
      { label: 'Распоряжения в работе' },
      { label: 'В доставке', class: 'dy58-subitem dy58-important-item' },
      { label: 'Не доставленные', class: 'dy58-subitem dy58-important-item' },
      { label: 'Поезда ВМ' },
      { label: 'Поезда ПВ' },
      { label: 'Поезда ПД' },
      { label: 'Поезда Н' },
      { label: 'Поезда ДР' },
      { label: 'Действующие' },
      { label: 'Ограничения по V', class: 'dy58-subitem' },
      { label: 'Закрытие перегона', class: 'dy58-subitem' },
    ],

    ecdLeftMenuItems: [
      { label: 'Входящие за смену' },
      { label: 'Не прочитано', class: 'dy58-subitem dy58-important-item' },
      { label: 'Распоряжения в работе' },
      { label: 'В доставке', class: 'dy58-subitem dy58-important-item' },
      { label: 'Не доставленные', class: 'dy58-subitem dy58-important-item' },
      { label: 'Действующие' },
      { label: 'Разрешение', class: 'dy58-subitem' },
      { label: 'Запрещение на ЭПС', class: 'dy58-subitem' },
      { label: 'Подготовка рабочего места', class: 'dy58-subitem' },
      { label: 'Переключение', class: 'dy58-subitem' },
      { label: 'Черновики' },
      { label: 'Разрешение', class: 'dy58-subitem' },
      { label: 'Запрещение на ЭПС', class: 'dy58-subitem' },
    ],
  },

  getters: {
    getLeftMenuItems(state, getters) {
      if (getters.getUserCredential === APP_CREDENTIALS.DSP_FULL) {
        return state.dspLeftMenuItems;
      } else if (getters.getUserCredential === APP_CREDENTIALS.DNC_FULL) {
        return state.dncLeftMenuItems;
      } else if (getters.getUserCredential === APP_CREDENTIALS.ECD_FULL) {
        return state.ecdLeftMenuItems;
      }
      return [];
    },
  },
};
