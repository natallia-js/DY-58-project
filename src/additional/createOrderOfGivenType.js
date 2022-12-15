import router from '@/router';
import { ORDER_PATTERN_TYPES } from '@/constants/orderPatterns';

export function createOrderOfGivenType({ orderPatternId, orderSign }) {
  router.push({
    name: 'NewOrderPage',
    params: {
      orderType: ORDER_PATTERN_TYPES.ORDER,
      orderPatternId,
      orderPatternSpecialSign: orderSign,
      prevOrderId: null,
      orderDraftId: null,
    },
  });
}

export function createECDOrderOfGivenType({ orderPatternId, orderSign }) {
  router.push({
    name: 'NewOrderPage',
    params: {
      orderType: ORDER_PATTERN_TYPES.ECD_ORDER,
      orderPatternId,
      orderPatternSpecialSign: orderSign,
      prevOrderId: null,
      orderDraftId: null,
    },
  });
}
