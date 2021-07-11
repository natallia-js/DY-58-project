import axios from 'axios';
import { AUTH_SERVER_ACTIONS_PATHS } from '../../constants/servers';
import { ORDER_PATTERN_TYPES, OrderPatternsNodeType } from '../../constants/orderPatterns';


export const orderPatterns = {
  state: {
    patterns: [],
    loadingOrderPatterns: false,
    errorLoadingPatterns: null,
    modifyOrderCategoryTitleResult: null,
    modifyOrderCategoryTitleRecsBeingProcessed: 0,
    delOrderPatternResult: null,
    delOrderPatternRecsBeingProcessed: 0,
    modOrderPatternRecsBeingProcessed: 0,
    modOrderPatternResult: null,
  },

  getters: {
    getCurrentUserId(_state, getters) {
      return getters.getUserId;
    },

    getCurrentUserToken(_state, getters) {
      return getters.getUserToken;
    },

    getLoadingOrderPatternsStatus(state) {
      return state.loadingOrderPatterns;
    },

    getErrorLoadingPatterns(state) {
      return state.errorLoadingPatterns;
    },

    getOrderPatternsToDisplayInTreeSelect(state) {
      // data is grouped by order category
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

    getOrderPatternsTreeNodeKey() {
      return (treeNodeAttrsArray) => {
        if (!treeNodeAttrsArray || !treeNodeAttrsArray.length) {
          return null;
        }
        return treeNodeAttrsArray.reduce((accumulator, currentValue) => `${accumulator}${currentValue}`, '');
      };
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
            children: [{
              label: orderPattern.type,
              key: `${orderPattern.service}${orderPattern.type}`,
              type: OrderPatternsNodeType.ORDER_TYPE,
              children: [{
                label: orderPattern.category,
                key: `${orderPattern.service}${orderPattern.type}${orderPattern.category}`,
                type: OrderPatternsNodeType.ORDER_CATEGORY,
                additionalInfo: {
                  service: orderPattern.service,
                  orderType: orderPattern.type,
                },
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
              children: [{
                label: orderPattern.category,
                key: `${orderPattern.service}${orderPattern.type}${orderPattern.category}`,
                type: OrderPatternsNodeType.ORDER_CATEGORY,
                additionalInfo: {
                  service: orderPattern.service,
                  orderType: orderPattern.type,
                },
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

    getOrderCategoryModifyResult(state) {
      return state.modifyOrderCategoryTitleResult;
    },

    getModifyOrderCategoryTitleRecsBeingProcessed(state) {
      return state.modifyOrderCategoryTitleRecsBeingProcessed;
    },

    getDelOrderPatternRecsBeingProcessed(state) {
      return state.delOrderPatternRecsBeingProcessed;
    },

    getDelOrderPatternResult(state) {
      return state.delOrderPatternResult;
    },

    getModOrderPatternRecsBeingProcessed(state) {
      return state.modOrderPatternRecsBeingProcessed;
    },

    getModOrderPatternResult(state) {
      return state.modOrderPatternResult;
    },
  },

  actions: {
    async loadOrderPatterns(context) {
      context.state.errorLoadingPatterns = null;
      context.state.loadingOrderPatterns = true;
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
      context.state.loadingOrderPatterns = false;
    },

    async editOrderCategoryTitle(context, { service, orderType, title, newTitle }) {
      context.state.modifyOrderCategoryTitleRecsBeingProcessed += 1;
      try {
        const headers = {
          'Authorization': `Bearer ${context.getters.getCurrentUserToken}`,
        };
        const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.modOrderCategoryTitle,
          { service, orderType, title, newTitle },
          { headers }
        );
        context.state.modifyOrderCategoryTitleResult = {
          error: false,
          message: response.data.message,
          newTitle: response.data.newTitle,
        };
        context.state.patterns = context.state.patterns.map((pattern) => {
          if (pattern.service === service && pattern.type === orderType && pattern.category === title) {
            return {
              ...pattern,
              category: response.data.newTitle,
            };
          }
          return pattern;
        });
      } catch ({ response }) {
        context.state.modifyOrderCategoryTitleResult = {
          error: true,
          message: response.data.message,
        };
      }
      context.state.modifyOrderCategoryTitleRecsBeingProcessed -= 1;
    },

    async delOrderPattern(context, orderPatternId) {
      context.state.delOrderPatternRecsBeingProcessed += 1;
      try {
        const headers = {
          'Authorization': `Bearer ${context.getters.getCurrentUserToken}`,
        };
        const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.delOrderPattern,
          { id: orderPatternId },
          { headers }
        );
        context.state.delOrderPatternResult = {
          error: false,
          message: response.data.message,
        };
        context.state.patterns = context.state.patterns.filter((pattern) => pattern._id !== orderPatternId);
      } catch ({ response }) {
        context.state.delOrderPatternResult = {
          error: true,
          message: response.data.message,
        };
      }
      context.state.delOrderPatternRecsBeingProcessed -= 1;
    },

    /**
     *
     */
    async modOrderPattern(context, { id, title, elements }) {
      context.state.modOrderPatternRecsBeingProcessed += 1;
      try {
        const headers = {
          'Authorization': `Bearer ${context.getters.getCurrentUserToken}`,
        };
        const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.modOrderPattern,
          { id, title, elements },
          { headers }
        );
        context.state.modOrderPatternResult = {
          error: false,
          message: response.data.message,
          orderPattern: response.data.orderPattern,
        };
        context.state.patterns = context.state.patterns.map((pattern) => {
          if (pattern._id !== response.data.orderPattern._id) {
            return pattern;
          }
          return {
            ...pattern,
            ...response.data.orderPattern,
          };
        });
      } catch ({ response }) {
        context.state.modOrderPatternResult = {
          error: true,
          message: response.data.message,
        };
      }
      context.state.modOrderPatternRecsBeingProcessed -= 1;
    },
  },
};
