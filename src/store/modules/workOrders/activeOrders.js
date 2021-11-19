import { getLocaleDateTimeString } from '../../../additional/dateTimeConvertions';

export const activeOrders = {
  getters: {
    /**
     *
     */
     getActiveOrders(state) {
      return state.data.filter((item) => item.confirmDateTime && !item.nextRelatedOrderId) || [];
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
