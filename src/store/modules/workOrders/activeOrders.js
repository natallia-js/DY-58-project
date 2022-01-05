import { getLocaleDateTimeString } from '@/additional/dateTimeConvertions';
import { ORDER_PATTERN_TYPES, SPECIAL_ORDER_DSP_TAKE_DUTY_SIGN } from '@/constants/orderPatterns';


/**
 * Данный модуль предназначен для работы с действующими рабочими распоряжениями.
 */
export const activeOrders = {
  getters: {
    /**
     * Возвращает true, если за распоряжением order в рамках его цепочки распоряжений следует
     * распоряжение типа followerOrderType, в противном случае возвращает false.
     */
    isOrderFollowedByOrderOfGivenType(state) {
      return ({ followerOrderType, order }) => {
        return state.data.find((item) =>
          item.orderChainId === order.orderChainId &&
          item.createDateTime > order.createDateTime &&
          item.type === followerOrderType
        ) ? true : false;
      };
    },

    /**
     * Возвращает true, если распоряжение order последнее в своей цепочке распоряжений,
     * в противном случае возвращает false.
     */
    isOrderLastInChain(state) {
      return (order) => {
        return state.data.find((item) =>
          item.orderChainId === order.orderChainId && item.createDateTime > order.createDateTime
        ) ? false : true;
      };
    },

    /**
     * Возвращает массив действующих распоряжений.
     * Действующим является такое рабочее распоряжение (должны выполняться все условия одновременно):
     * - у которого есть дата подтверждения его получения,
     * - которое действует до отмены либо дата окончания его действия еще не наступила,
     * - которое не обязательно последнее в цепочке распоряжений, которой оно принадлежит (см.
     *   пункты ниже),
     * - если речь идет о заявке, то в рамках цепочки распоряжений только 1 заявка (последняя) считается
     *   действующей при условии, что далее по цепочке (не обязательно сразу) за нею не следует уведомление,
     * - если речь идет об уведомлении, то оно является действующим только при условии, что оно
     *   в цепочке распоряжений последнее,
     * - если речь идет о распоряжении ДНЦ, то в рамках цепочки распоряжений только последнее
     *   распоряжение ДНЦ может рассматриваться как действующее / недействующее, все же предшествующие
     *   ему распоряжения ДНЦ автоматически становятся недействующими,
     * - приказы и запрещения ЭЦД, за которыми следует уведомление (отмена запрещения) считаются
     *   недействующими,
     * - уведомление (отмена запрещения) ЭЦД может рассматриваться как действующие при условии, что
     *   оно в цепочке распоряжений последнее.
     * ! В данный перечень войдут также те распоряжения, дата начала действия которых еще не наступила
     * (распоряжения, изданные заранее)
     */
    getActiveOrders(state, getters) {
      // Вернётся новый массив с элементами, которые прошли проверку.
      // Если ни один элемент не прошёл проверку, то будет возвращён пустой массив.
      return state.data.filter((item) =>
        item.confirmDateTime &&
        (item.timeSpan.tillCancellation || item.timeSpan.end >= new Date()) &&
        (
          (
            (item.type === ORDER_PATTERN_TYPES.REQUEST) &&
            !getters.isOrderFollowedByOrderOfGivenType({ followerOrderType: ORDER_PATTERN_TYPES.REQUEST, order: item }) &&
            !getters.isOrderFollowedByOrderOfGivenType({ followerOrderType: ORDER_PATTERN_TYPES.NOTIFICATION, order: item })
          ) ||
          ((item.type === ORDER_PATTERN_TYPES.NOTIFICATION) && getters.isOrderLastInChain(item)) ||
          (
            (item.type === ORDER_PATTERN_TYPES.ORDER) &&
            !getters.isOrderFollowedByOrderOfGivenType({ followerOrderType: ORDER_PATTERN_TYPES.ORDER, order: item })
          ) ||
          (
            (item.type === ORDER_PATTERN_TYPES.ECD_ORDER || item.type === ORDER_PATTERN_TYPES.ECD_PROHIBITION) &&
            !getters.isOrderFollowedByOrderOfGivenType({ followerOrderType: ORDER_PATTERN_TYPES.ECD_NOTIFICATION, order: item })
          ) ||
          ((item.type === ORDER_PATTERN_TYPES.ECD_NOTIFICATION) && getters.isOrderLastInChain(item))
        )
      );
    },

    /**
     * Возвращает действующие рабочие распоряжения в рамках своих цепочек распоряжений.
     * Результат метода предназначен для отображения в компоненте TreeSelect.
     */
    getActiveOrdersToDisplayInTreeSelect(_state, getters) {
      const orders = getters.getActiveOrders;
      const groupedOrders = [{
        key: null,
        label: '-',
        data: null,
      }];
      orders.forEach((order) => {
        const typeGroup = groupedOrders.find((group) => group.key === order.type);
        const childItem = {
          key: order._id,
          label: `№ ${order.number} от ${getLocaleDateTimeString(order.createDateTime, false)} - ${order.orderText.orderTitle}`,
          data: order,
        };
        if (!typeGroup) {
          groupedOrders.push({
            key: order.type,
            label: order.type,
            data: order.type,
            selectable: false,
            children: [childItem],
          });
        } else {
          typeGroup.children.push(childItem);
        }
      });
      return groupedOrders;
    },

    /**
     * Возвращает массив действующих распоряжений, каждое из которых - последнее в цепочке
     * распоряжений, которой оно принадлежит.
     * Действующим является такое рабочее распоряжение:
     * - у которого есть дата подтверждения его получения,
     * - которое действует до отмены либо дата окончания его действия еще не наступила
     * ! В данный перечень войдут также те распоряжения, дата начала действия которых еще не наступила
     * (распоряжения, изданные заранее)
     */
    getLastInChainActiveOrders(_state, getters) {
      const workingOrders = getters.getRawWorkingOrders.sort((a, b) => {
        if (a.createDateTime < b.createDateTime) {
          return -1;
        }
        if (a.createDateTime > b.createDateTime) {
          return 1;
        }
        return 0;
      });
      const ordersMap = new Map();
      workingOrders.forEach((order) => ordersMap.set(order.orderChainId, order));
      return [...ordersMap.values()].filter((item) =>
        item.confirmDateTime &&
        (item.timeSpan.tillCancellation || item.timeSpan.end >= new Date())
      );
    },

    /**
     * Возвращает действующее распоряжение заданного типа.
     */
    getActiveOrdersOfGivenType(_state, getters) {
      return (ordersType) => {
        return getters.getActiveOrders.filter((item) => item.type === ordersType);
      };
    },

    /**
     * Возвращает действующее распоряжение заданного типа с заданным номером.
     */
    getActiveOrderByNumber(_state, getters) {
      return (orderType, orderNumber) => {
        return getters.getActiveOrdersOfGivenType(orderType).find((item) => String(item.number) === String(orderNumber));
      };
    },

    /**
     * Функция проверяет, существует ли в списке рабочих распоряжений распоряжение о принятии
     * дежурства ДСП, изданное текущим пользователем не ранее момента его последнего принятия дежурства.
     * Если существует, функция возвращает true, в противном случае функция возвращает false.
     *
     * Функцию следует вызывать только в том случае, если текущий пользователь ДСП, находящийся на
     * дежурстве!
     */
    existsDSPTakeDutyOrder(_state, getters) {
      return getters.getRawWorkingOrders.find((order) => {
        if (!order.specialTrainCategories || !order.specialTrainCategories.length) {
          return false;
        }
        if (!order.specialTrainCategories.includes(SPECIAL_ORDER_DSP_TAKE_DUTY_SIGN)) {
          return false;
        }
        if (!order.creator.id === getters.getUserId) {
          return false;
        }
        return order.createDateTime >= getters.getLastTakeDutyTime;
      }) ? true : false;
    },
  },
};
