import { watch } from 'vue';
import { useRouter } from 'vue-router';


export const useWatchOperationsResults = (inputVals) => {
  const { /*state,*/ store, props, showSuccessMessage, showErrMessage } = inputVals;

  const router = useRouter();

  /**
   * Для отображения результата операции издания распоряжения (отправки на сервер).
   */
  watch(() => store.getters.getDispatchOrderResult, (newVal) => {
    if (!newVal || newVal.orderType !== props.orderType) {
      return;
    }
    if (!newVal.error) {
      showSuccessMessage(newVal.message);
      // Закомментированный ниже код при переходе на главную страницу не нужен, но если вдруг понадобится
      // не переходить на главную страницу, а оставаться на странице издания распоряжения, то важно не забыть
      // его раскомментировать
      /*if (state.prevRelatedOrder) {
        state.prevRelatedOrder = null;
        state.cancelOrderDateTime = null;
      }*/
      // Даем пользователю просмотреть сообщение об успешном издании документа прежде чем переходить
      // на главную страницу
      setTimeout(() => router.push({ name: 'MainPage' }), 1000);
    } else {
      showErrMessage(newVal.message);
    }
  });

  /**
   * Для отображения результата операции сохранения черновика распоряжения (отправки на сервер) -
   * используется как при создании нового черновика, так и при редактировании существующего.
   */
  watch(() => store.getters.getSaveOrderDraftResult, (newVal) => {
    if (!newVal || newVal.orderType !== props.orderType) {
      return;
    }
    if (!newVal.error) {
      showSuccessMessage(newVal.message);
    } else {
      showErrMessage(newVal.message);
    }
  });
};
