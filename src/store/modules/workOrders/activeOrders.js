import { getLocaleDateTimeString } from '../../../additional/dateTimeConvertions';

export const activeOrders = {
  getters: {
    /**
     * Возвращает массив действующих распоряжений.
     * Действующим является такое рабочее распоряжение:
     * - у которого есть дата подтверждения его получения,
     * - которое является последним в цепочке распоряжений, которой оно принадлежит,
     * - которое действует до отмены либо дата окончания его действия еще не наступила
     * ! В данный перечень войдут также те распоряжения, дата начала действия которых еще не наступила
     * (распоряжения, изданные заранее)
     */
    getActiveOrders(state) {
      return state.data.filter((item) =>
        item.confirmDateTime &&
        !item.nextRelatedOrderId &&
        (item.timeSpan.tillCancellation || item.timeSpan.end >= new Date())) || [];
    },

    /**
     *
     */
    getActiveOrdersOfGivenType(_state, getters) {
      return (ordersType) => {
        return getters.getActiveOrders.filter((item) => item.type === ordersType) || [];
      };
    },

    /**
     *
     */
    getActiveOrderByNumber(_state, getters) {
      return (orderType, orderNumber) => {
        return getters.getActiveOrdersOfGivenType(orderType).find((item) => String(item.number) === String(orderNumber));
      };
    },

    /**
     *
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
  },
};
