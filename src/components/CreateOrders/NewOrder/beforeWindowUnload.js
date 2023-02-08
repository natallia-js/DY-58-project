import { onUnmounted } from 'vue';

/**
 * Данный модуль предназначен для выполнения действий перед выгрузкой окна, документа и его ресурсов.
 */
export const useBeforeWindowUnload = ({ store }) => {
  function beforeWindowUnloadActionsToDo(event) {
    if (!store.getters.ifAllowApplicationNavigation) {
      // Cancel the event
      event.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
      // Chrome requires returnValue to be set
      return event.returnValue = '';
    }
  }

  // Если пользователь пожелает покинуть страницу (любым способом — закрыть вкладку, весь браузер,
  // перезагрузить страницу, ввести новый адрес в адресную строку и т.д.),
  // он увидит запрос подтверждения, и уход со страницы можно будет отменить.
  window.addEventListener('beforeunload', beforeWindowUnloadActionsToDo);
  onUnmounted(() => {
    window.removeEventListener('beforeunload', beforeWindowUnloadActionsToDo);
  });
};
