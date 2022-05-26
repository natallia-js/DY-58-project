import { computed } from 'vue';
import { ORDER_PATTERN_TYPES, SPECIAL_CIRCULAR_ORDER_SIGN } from '@/constants/orderPatterns';
import { ORDERS_RECEIVERS_DEFAULT_POSTS } from '@/constants/orders';
import { DISPATCH_ORDER_ACTION } from '@/store/action-types';


/**
 * Данный модуль предназначен для сбора данных о распоряжении и для его издания.
 */
export const useDispatchOrder = (inputVals) => {
  const {
    state,
    props,
    store,
    submitted,
    dspSectorsToSendOrderNoDupl,
    dncSectorsToSendOrderNoDupl,
    ecdSectorsToSendOrderNoDupl,
    relatedOrderObject,
  } = inputVals;

  /**
   * Возвращает объект места действия издаваемого распоряжения
   */
  const getIssuedOrderPlaceObject = computed(() => {
    return (state.orderPlace.place && state.orderPlace.value) ? state.orderPlace : null;
  });

  // Возвращает объект со временем действия издаваемого распоряжения:
  //   1. если установлен флаг "Уточнить время действия распоряжения", то полагаем,
  // что пользователь определил временной интервал действия распоряжения;
  //   Ранее была такая постановка п.2:
  //   2. если п.1. не выполняется, то смотрим, указаны ли дата-время отмены действия
  // предшествующего распоряжения; если определены дата-время отмены действия предшествующего
  // распоряжения, то полагаем, что издаваемое распоряжение действует одномоментно и время его
  // действия равно указанной дате-времени отмены действия предшествующего распоряжения;
  // Теперь такая:
  //   2. пункт 2 использовался ранее для работы с уведомлениями ЭЦД, теперь работа с ними идет по другой
  // схеме: для определения времени действия уведомления ЭЦД идем на п.3.3;
  //   3. если п.1 не выполняются, то дату-время действия распоряжения определяем по следующему
  // алгоритму:
  //     3.1. если издается заявка/уведомление/приказ ЭЦД/запрещение ЭЦД, то время начала его действия
  //          равно дате-времени его издания, а время окончания действия - до отмены (это нужно для того,
  //          чтобы документ не исчез из списка рабочих распоряжений до тех пор, пока на основании его
  //          не будет издан другой документ)
  //     3.2 для циркулярного распоряжения о приеме-сдаче дежурства ДНЦ действует правило 3.1
  //     3.3. в противном случае время начала и окончания действия распоряжения равны дате и времени
  //          его издания
  const getPreviewOrderTimeSpanObject = computed(() => {
    if (props.orderType === ORDER_PATTERN_TYPES.ORDER && state.defineOrderTimeSpan.value) {
      return state.timeSpan;
    }
    if (
      [ORDER_PATTERN_TYPES.REQUEST,
       ORDER_PATTERN_TYPES.NOTIFICATION,
       ORDER_PATTERN_TYPES.ECD_ORDER,
       ORDER_PATTERN_TYPES.ECD_PROHIBITION].includes(props.orderType) ||
      (state.specialTrainCategories && state.specialTrainCategories.includes(SPECIAL_CIRCULAR_ORDER_SIGN))) {
      return {
        start: state.createDateTime,
        end: null,
        tillCancellation: true,
      };
    }
    return null; // этот момент нужен для отслеживания пункта 3.3 разными компонентами
  });

  /**
   * Возвращает объект времени действия издаваемого распоряжения
   */
  const getIssuedOrderTimeSpanObject = computed(() => {
    return getPreviewOrderTimeSpanObject.value ||
      {
        start: state.createDateTime,
        end: state.createDateTime,
        tillCancellation: false,
      };
  });

  /**
   * Издание распоряжения (отправка на сервер и передача всем причастным).
   */
  const dispatchOrder = ({ orderDraftIdToDelete }) => {
    store.dispatch(DISPATCH_ORDER_ACTION, {
      type: props.orderType,
      number: +state.number,
      createDateTime: state.createDateTime,
      place: getIssuedOrderPlaceObject.value,
      timeSpan: getIssuedOrderTimeSpanObject.value,
      orderText: state.orderText,
      dncToSend: dncSectorsToSendOrderNoDupl.value
        ? dncSectorsToSendOrderNoDupl.value.map((el) => {
            if (el.post) return el;
            return { ...el, post: ORDERS_RECEIVERS_DEFAULT_POSTS.DNC };
          })
        : [],
      dspToSend: dspSectorsToSendOrderNoDupl.value
        ? dspSectorsToSendOrderNoDupl.value.map((el) => {
            if (el.post) return el;
            return { ...el, post: ORDERS_RECEIVERS_DEFAULT_POSTS.DSP };
          })
        : [],
      ecdToSend: ecdSectorsToSendOrderNoDupl.value
        ? ecdSectorsToSendOrderNoDupl.value.map((el) => {
            if (el.post) return el;
            return { ...el, post: ORDERS_RECEIVERS_DEFAULT_POSTS.ECD };
          })
        : [],
      otherToSend: state.otherSectorsToSendOrder,
      orderChainId: relatedOrderObject.value ? relatedOrderObject.value.orderChainId : null,
      dispatchedOnOrder: relatedOrderObject.value ? relatedOrderObject.value._id : null,
      createdOnBehalfOf: state.createdOnBehalfOf,
      showOnGID: state.showOnGID.value,
      specialTrainCategories: state.specialTrainCategories,
      draftId: orderDraftIdToDelete,
      // При издании циркулярного распоряжения о приеме-сдаче дежурства ДНЦ отменяем предыдущее аналогичное
      // распоряжение, изданное на этом же рабочем полигоне
      idOfTheOrderToCancel: state.specialTrainCategories &&
        state.specialTrainCategories.includes(SPECIAL_CIRCULAR_ORDER_SIGN) ?
        (() => {
          const existingDNCTakeDutyOrder = store.getters.getExistingDNC_ECDTakeDutyOrder;
          return existingDNCTakeDutyOrder ? existingDNCTakeDutyOrder._id : null;
        })() : null,
    });
    // Отменяем проверку правильности введенных данных для всех полей (до следующего издания распоряжения)
    submitted.value = false;
  };

  return {
    getIssuedOrderPlaceObject,
    getPreviewOrderTimeSpanObject,
    dispatchOrder,
    // Количество распоряжений текущего типа, для которых в настоящее время запущен процесс издания (сохранения на сервере)
    getDispatchOrdersBeingProcessed: computed(() => store.getters.getDispatchOrdersBeingProcessed(props.orderType)),
  };
};
