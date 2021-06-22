import axios from 'axios';
import { AUTH_SERVER_ACTIONS_PATHS } from '../../constants/servers';
import { ORDER_PATTERN_TYPES, OrderPatternsNodeType } from '../../constants/orderPatterns';


export const orderPatterns = {
  state: {
    patterns: [],
    errorLoadingPatterns: null,
  },

  getters: {
    getCurrentUserId(_state, getters) {
      return getters.getUserId;
    },

    getCurrentUserToken(_state, getters) {
      return getters.getUserToken;
    },

    getErrorLoadingPatterns(state) {
      return state.errorLoadingPatterns;
    },

    getOrderPatternsToDisplayInTreeSelect(state) {
      // data is grouped by order category
      console.log(state.patterns)
      const orders = state.patterns.filter((pattern) => pattern.type === ORDER_PATTERN_TYPES.ORDER);
      const groupedOrders = [];
      orders.forEach((order) => {
        const categoryGroup = groupedOrders.find((group) => group.key === order.category);
        if (!categoryGroup) {
          groupedOrders.push({
            key: order.category,
            label: order.category,
            data: order.category,
            selectable: false,
            children: [{ key: order._id, label: order.title, data: order }],
          });
        } else {
          categoryGroup.children.push({ key: order._id, label: order.title, data: order });
        }
      });
      return groupedOrders;
    },

    getOrderPatternsToDisplayInTreeComponent(state) {
      if (!state.patterns || !state.patterns.length) {
        return [];
      }
      const treeData = [];
      state.patterns.forEach((orderPattern) => {
        const theSameServiceElement = treeData.find((service) => service.label === orderPattern.service);
        // Существует ли в дереве узел с наименованием службы?
        if (!theSameServiceElement) {
          treeData.push({
            label: orderPattern.service,
            key: orderPattern.service,
            type: OrderPatternsNodeType.SERVICE,
            //icon: 'pi pi-folder',
            children: [{
              label: orderPattern.type,
              key: `${orderPattern.service}${orderPattern.type}`,
              type: OrderPatternsNodeType.ORDER_TYPE,
              //icon: 'pi pi-folder',
              children: [{
                label: orderPattern.category,
                key: `${orderPattern.service}${orderPattern.type}${orderPattern.category}`,
                type: OrderPatternsNodeType.ORDER_CATEGORY,
                additionalInfo: {
                  service: orderPattern.service,
                  orderType: orderPattern.type,
                },
                //icon: 'pi pi-folder',
                children: [{
                  label: orderPattern.title,
                  key: orderPattern._id,
                  pattern: orderPattern.elements,
                  type: OrderPatternsNodeType.ORDER_PATTERN,
                  icon: 'pi pi-file',
                }],
              }],
            }],
          });
        } else {
          const theSameTypeElement = theSameServiceElement.children.find((type) => type.label === orderPattern.type);
          if (!theSameTypeElement) {
            theSameServiceElement.children.push({
              label: orderPattern.type,
              key: `${orderPattern.service}${orderPattern.type}`,
              type: OrderPatternsNodeType.ORDER_TYPE,
              //icon: 'pi pi-folder',
              children: [{
                label: orderPattern.category,
                key: `${orderPattern.service}${orderPattern.type}${orderPattern.category}`,
                type: OrderPatternsNodeType.ORDER_CATEGORY,
                additionalInfo: {
                  service: orderPattern.service,
                  orderType: orderPattern.type,
                },
                //icon: 'pi pi-folder',
                children: [{
                  label: orderPattern.title,
                  key: orderPattern._id,
                  pattern: orderPattern.elements,
                  type: OrderPatternsNodeType.ORDER_PATTERN,
                  icon: 'pi pi-file',
                }],
              }],
            });
          } else {
            const theSameCategoryElement = theSameTypeElement.children.find((category) => category.label === orderPattern.category);
            if (!theSameCategoryElement) {
              theSameTypeElement.children.push({
                label: orderPattern.category,
                key: `${orderPattern.service}${orderPattern.type}${orderPattern.category}`,
                type: OrderPatternsNodeType.ORDER_CATEGORY,
                additionalInfo: {
                  service: orderPattern.service,
                  orderType: orderPattern.type,
                },
                //icon: 'pi pi-folder',
                children: [{
                  label: orderPattern.title,
                  key: orderPattern._id,
                  pattern: orderPattern.elements,
                  type: OrderPatternsNodeType.ORDER_PATTERN,
                  icon: 'pi pi-file',
                }],
              });
            } else {
              theSameCategoryElement.children.push({
                label: orderPattern.title,
                key: orderPattern._id,
                pattern: orderPattern.elements,
                type: OrderPatternsNodeType.ORDER_PATTERN,
                icon: 'pi pi-file',
              });
            }
          }
        }
      });
      return treeData;
    },

    getRequestPatterns(state) {
      // data is grouped by order category
      return state.patterns.filter((pattern) => pattern.type === ORDER_PATTERN_TYPES.REQUEST);
    },

    getNotificationPatterns(state) {
      // data is grouped by order category
      return state.patterns.filter((pattern) => pattern.type === ORDER_PATTERN_TYPES.NOTIFICATION);
    },
  },

  actions: {
    async loadOrderPatterns(context) {
      try {
        const headers = {
          'Authorization': `Bearer ${context.getters.getCurrentUserToken}`,
        };
        const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getOrderPatterns,
          { userId: context.getters.getCurrentUserId },
          { headers }
        );
        context.state.patterns = response.data || [];
      } catch (err) {
        context.state.errorLoadingPatterns = err;
      }
    },
  },
};
