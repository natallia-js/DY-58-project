import router from '@/router';
import { ORDER_PATTERN_TYPES } from '@/constants/orderPatterns';

export function createOrderOfGivenType(orderSign) {
  router.push({
    name: 'NewOrderPage',
    params: {
      orderType: ORDER_PATTERN_TYPES.ORDER,
      orderPatternId: null,
      orderPatternSpecialSign: orderSign,
      prevOrderId: null,
      orderDraftId: null,
    },
  });
}

export function createECDOrderOfGivenType(orderSign) {
  router.push({
    name: 'NewOrderPage',
    params: {
      orderType: ORDER_PATTERN_TYPES.ECD_ORDER,
      orderPatternId: null,
      orderPatternSpecialSign: orderSign,
      prevOrderId: null,
      orderDraftId: null,
    },
  });
}
