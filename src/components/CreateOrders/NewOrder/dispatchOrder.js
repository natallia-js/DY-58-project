import { computed, watch } from 'vue';
import { ORDER_PATTERN_TYPES } from '../../../constants/orderPatterns';

/**
 * Данный модуль предназначен для сбора данных о распоряжении и для его издания.
 */
export const useDispatchOrder = (inputVals) => {
  const {
    state,
    props,
    store,
    showSuccessMessage,
    showErrMessage,
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
  //   2. если п.1. не выполняется, то смотрим, указаны ли дата-время отмены действия
  // предшествующего распоряжения; если определены дата-время отмены действия предшествующего
  // распоряжения, то полагаем, что издаваемое распоряжение действует одномоментно и время его
  // действия равно указанной дате-времени отмены действия предшествующего распоряжения;
  //   3. если п.1 и п.2 не выполняются, то дату-время действия распоряжения определяем по следующему
  // алгоритму:
  //     3.1. если издается заявка либо уведомление, то время начала его действия равно дате-времени
  //          его издания, а время окончания действия - до отмены (это нужно для того, чтобы завка /
  //          уведомление не исчезло из списка рабочих распоряжений до тех пор, пока на основании его
  //          не будет издано распоряжение)
  //     3.2. в противном случае время начала и окончания действия распоряжения равны дате и времени
  //          его издания
  const getPreviewOrderTimeSpanObject = computed(() => {
    if (
      [ORDER_PATTERN_TYPES.ORDER, ORDER_PATTERN_TYPES.ECD_ORDER, ORDER_PATTERN_TYPES.ECD_PROHIBITION].includes(props.orderType)
      && state.defineOrderTimeSpan.value
    ) {
      return state.timeSpan;
    }
    if (state.cancelOrderDateTime) {
      return { start: state.cancelOrderDateTime, end: state.cancelOrderDateTime, tillCancellation: false };
    }
    if (props.orderType === ORDER_PATTERN_TYPES.REQUEST || props.orderType === ORDER_PATTERN_TYPES.NOTIFICATION) {
      return { start: state.createDateTime, end: null, tillCancellation: true };
    }
    return null; // этот момент нужен для отслеживания пункта 3.2 разными компонентами
  });

  /**
   * Возвращает объект времени действия издаваемого распоряжения
   */
  const getIssuedOrderTimeSpanObject = computed(() => {
    const tso = getPreviewOrderTimeSpanObject.value;
    return tso ? tso : { start: state.createDateTime, end: state.createDateTime, tillCancellation: false };
  });

  /**
   * Издание распоряжения (отправка и сервер и передача всем причастным).
   */
  const dispatchOrder = () => {
    state.waitingForServerResponse = true;

    store.dispatch('dispatchOrder', {
      type: props.orderType,
      number: state.number,
      createDateTime: state.createDateTime,
      place: getIssuedOrderPlaceObject.value,
      timeSpan: getIssuedOrderTimeSpanObject.value,
      orderText: state.orderText,
      dncToSend: dncSectorsToSendOrderNoDupl.value,
      dspToSend: dspSectorsToSendOrderNoDupl.value,
      ecdToSend: ecdSectorsToSendOrderNoDupl.value,
      otherToSend: state.otherSectorsToSendOrder,
      orderChainId: relatedOrderObject.value ? relatedOrderObject.value.orderChainId : null,
      createdOnBehalfOf: state.createdOnBehalfOf,
      showOnGID: state.showOnGID.value,
      specialTrainCategories: state.specialTrainCategories,
    });
  };

  /**
   * Количество распоряжений, для которых в настоящее время запущен процесс издания (сохранения на сервере)
   */
  const getDispatchOrdersBeingProcessed = computed(() => store.getters.getDispatchOrdersBeingProcessed);

  /**
   * Для отображения результата операции издания распоряжения (отправки на сервер).
   */
  watch(() => store.getters.getDispatchOrderResult, (newVal) => {
    if (!newVal || newVal.orderType !== props.orderType) {
      return;
    }
    if (!newVal.error) {
      showSuccessMessage(newVal.message);
    } else {
      showErrMessage(newVal.message);
    }
  });

  return {
    getIssuedOrderPlaceObject,
    getPreviewOrderTimeSpanObject,
    dispatchOrder,
    getDispatchOrdersBeingProcessed,
  };
};
