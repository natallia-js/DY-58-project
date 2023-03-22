import { watch } from 'vue';
import { useRouter } from 'vue-router';
import { ORDER_PATTERN_TYPES, SPECIAL_TELECONTROL_ORDER_SIGN } from '@/constants/orderPatterns';
import { SET_ALLOW_APPLICATION_NAVIGATION } from '@/store/mutation-types';

/**
 * Данный модуль предназначен для обработки результатов и выполнения разного рода действий, связанных
 * с появлением результатов выполненных операций.
 */
export const useWatchOperationsResults = (inputVals) => {
  const { state, store, props, emit, isECD, showSuccessMessage, showErrMessage } = inputVals;

  const router = useRouter();

  const navigateToMainPage = () => {
    // Если не установить данный флаг, приложение будет полагать, что в документе есть изменения и
    // перед переходом на главную страницу спросит пользователя, действительно ли тот хочет покинуть страницу
    store.commit(SET_ALLOW_APPLICATION_NAVIGATION);
    // Даем пользователю просмотреть сообщение об успешном издании документа прежде чем переходить
    // на главную страницу
    setTimeout(() => router.push({ name: 'MainPage' }), 1000);
  };

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
      // В противном случае необходимо остаться на текущей странице и инициировать издание связанного с изданным
      // приказом распоряжения/уведомления ЭЦД.
      if (isECD.value && state.specialTrainCategories && Object.values(state.specialTrainCategories).includes(SPECIAL_TELECONTROL_ORDER_SIGN)) {
        // Если не установить данный флаг, приложение будет полагать, что в документе есть изменения и
        // перед переходом на главную страницу спросит пользователя, действительно ли тот хочет покинуть страницу
        store.commit(SET_ALLOW_APPLICATION_NAVIGATION);

        // Даем пользователю просмотреть сообщение об успешном издании документа прежде чем переходить
        // к изданию связанного документа
        setTimeout(() => {
          // id шаблона связанного документа (который нужно издать после успешного издания предыдущего документа)
          const patternId = store.getters.getConnectedOrderPatternId(ORDER_PATTERN_TYPES.ECD_NOTIFICATION, state.orderText?.patternId);

          // переходим на закладку создания нового документа
          emit('changeProps', {
            newRouteParams: {
              orderType: ORDER_PATTERN_TYPES.ECD_NOTIFICATION,
              orderId: null,
              prevOrderId: newVal.orderId,
              orderPatternId: patternId,
              orderDraftId: null,
              orderPatternSpecialSign: null,
            },
            rerender: true,
          });
        }, 1000);
      } else {
        navigateToMainPage();
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

  /**
   * Для отображения результата операции редактирования распоряжения (на сервере).
   */
  watch(() => store.getters.getEditDispatchedOrderResult, (newVal) => {
    if (!newVal || newVal.orderType !== props.orderType) {
      return;
    }
    if (!newVal.error) {
      showSuccessMessage(newVal.message);
      navigateToMainPage();
    } else {
      showErrMessage(newVal.message);
    }
  });
};
