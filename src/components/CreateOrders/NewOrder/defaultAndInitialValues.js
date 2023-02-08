import { ORDER_TEXT_SOURCE } from '@/constants/orders';

/**
 * Данный модуль предназначен для хранения и предоставления информации о значениях по умолчанию
 * и начальных значениях состояния компонента.
 */
export const useDefaultAndInitialValues = ({ store, props}) => {
  const defaultOrderText = {
    orderTextSource: null,
    patternId: null,
    orderTitle: null,
    orderText: null,
  };

  const defaultOrderPlace = {
    place: null,
    value: null,
  };

  const defaultTimeSpan = {
    start: null,
    end: null,
    tillCancellation: null,
  };

  const initialOrderData = {
    orderPlace: defaultOrderPlace,
    timeSpan: defaultTimeSpan,
    orderText: defaultOrderText,
    dncSectorsToSendOrder: [],
    dspSectorsToSendOrder: [],
    ecdSectorsToSendOrder: [],
    otherSectorsToSendOrder: [],
  };

  const initialOrderText = () => {
    const orderPattern = store.getters.getOrderPatternById(props.orderPatternId);
    if (orderPattern) {
      return {
        orderTextSource: ORDER_TEXT_SOURCE.pattern,
        patternId: orderPattern._id,
        orderTitle: orderPattern.title,
        orderText: orderPattern.elements,
      };
    }
    return defaultOrderText;
  };

  return {
    defaultOrderText,
    defaultOrderPlace,
    defaultTimeSpan,
    initialOrderData,
    initialOrderText,
  };
};
