import { watch } from 'vue';
import { useRouter } from 'vue-router';
import { ORDER_PATTERN_TYPES, SPECIAL_TELECONTROL_ORDER_SIGN } from '@/constants/orderPatterns';


export const useWatchOperationsResults = (inputVals) => {
  const { state, store, props, emit, isECD, showSuccessMessage, showErrMessage } = inputVals;

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
      // не переходить на главную страницу, а оставаться на странице издания распоряжения (на той же самой закладке),
      // то важно не забыть его раскомментировать
      /*if (state.prevRelatedOrder) {
        state.prevRelatedOrder = null;
        state.cancelOrderDateTime = null; // этого уже нет
      }*/

      // Если издано любое распоряжение, кроме приказа ЭЦД с особой отметкой "ТУ", то после успешного окончания
      // процесса издания распоряжения необходимо осуществить переход на главную страницу приложения.
      // В противном случае необходимо остаться на текущей странице и инициироваться издание связанного с изданным
      // приказом распоряжения/уведомления ЭЦД.
      if (isECD.value && state.specialTrainCategories && Object.values(state.specialTrainCategories).includes(SPECIAL_TELECONTROL_ORDER_SIGN)) {
        // Даем пользователю просмотреть сообщение об успешном издании документа прежде чем переходить
        // к изданию связанного документа
        setTimeout(() => {
          // id шаблона связанного документа (который нужно издать после успешного издания предыдущего документа)
          const patternId = store.getters.getConnectedOrderPatternId(ORDER_PATTERN_TYPES.ECD_NOTIFICATION, state.orderText?.patternId);
          // переходим на закладку создания нового документа
          emit('changeProps', {
            newRouteParams: {
              orderType: ORDER_PATTERN_TYPES.ECD_NOTIFICATION,
              prevOrderId: newVal.orderId,
              orderPatternId: patternId,
            },
            rerender: true,
          });
        }, 1000);
      } else {
        // Даем пользователю просмотреть сообщение об успешном издании документа прежде чем переходить
        // на главную страницу
        setTimeout(() => router.push({ name: 'MainPage' }), 1000);
      }
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

  /**
   * Для отображения ошибки получения информации об "окнах".
   */
  watch(() => state.getOknaDataError, (newVal) => {
    if (newVal) {
      showErrMessage(newVal);
    }
  });
};
