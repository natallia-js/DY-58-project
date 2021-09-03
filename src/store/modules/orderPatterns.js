import axios from 'axios';
import { AUTH_SERVER_ACTIONS_PATHS } from '../../constants/servers';
import { OrderPatternsNodeType } from '../../constants/orderPatterns';


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
    createOrderPatternResult: null,
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

    getCurrentUserOrderCategories(state, getters) {
      const orderCategories = [];
      state.patterns
        .filter((pattern) => pattern.service === getters.getUserService)
        .forEach((pattern) => {
          if (!orderCategories.find((item) => item.orderType === pattern.type && item.category === pattern.category)) {
            orderCategories.push({ orderType: pattern.type, category: pattern.category });
          }
        });
      return orderCategories;
    },

    getOrderPatternsToDisplayInTreeSelect(state) {
      return (patternsType) => {
        // data is grouped by order category
        const orders = state.patterns.filter((pattern) => pattern.type === patternsType);
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
      };
    },

    getOrderPatternsTreeNodeKey() {
      return (treeNodeAttrsArray) => {
        if (!treeNodeAttrsArray || !treeNodeAttrsArray.length) {
          return null;
        }
        return treeNodeAttrsArray.reduce((accumulator, currentValue) => `${accumulator}${currentValue}`, '');
      };
    },

    getOrderPatternsToDisplayInTreeComponent(state, getters) {
      if (!state.patterns || !state.patterns.length) {
        return [];
      }
      const orderPatternNodeObject = (orderPattern) => {
        return {
          label: orderPattern.title,
          key: orderPattern._id,
          pattern: orderPattern.elements,
          type: OrderPatternsNodeType.ORDER_PATTERN,
          personalPattern:
            orderPattern.personalPattern &&
            String(orderPattern.personalPattern) === String(getters.getUserId),
          icon:
            // пользователь не может редактировать шаблон, созданный не им
            (orderPattern.personalPattern &&
            String(orderPattern.personalPattern) === String(getters.getUserId)) ?
            'pi pi-file' : 'pi pi-file-excel',
        };
      };
      const orderCategoryNodeObject = (orderPattern) => {
        return {
          label: orderPattern.category,
          key: `${orderPattern.service}${orderPattern.type}${orderPattern.category}`,
          type: OrderPatternsNodeType.ORDER_CATEGORY,
          additionalInfo: {
            service: orderPattern.service,
            orderType: orderPattern.type,
          },
          // если значение personalCategory = true, то пользователь сможет отредактировать
          // наименование категории распоряжений
          personalCategory: /*state.patterns.find((item) =>
            item.service === orderPattern.service && item.type === orderPattern.type &&
            item.category === orderPattern.category && String(item.personalPattern) !== String(getters.getUserId)
          ) ? false : */ true,
          children: [orderPatternNodeObject(orderPattern)],
        };
      };
      const serviceNodeObject = (orderPattern) => {
        return {
          label: orderPattern.type,
          key: `${orderPattern.service}${orderPattern.type}`,
          type: OrderPatternsNodeType.ORDER_TYPE,
          children: [orderCategoryNodeObject(orderPattern)],
        };
      };

      const treeData = [];
      state.patterns.forEach((orderPattern) => {
        const theSameServiceElement = treeData.find((service) => service.label === orderPattern.service);
        // Существует ли в дереве узел с наименованием службы?
        if (!theSameServiceElement) {
          treeData.push({
            label: orderPattern.service,
            key: orderPattern.service,
            type: OrderPatternsNodeType.SERVICE,
            children: [serviceNodeObject(orderPattern)],
          });
        } else {
          const theSameTypeElement = theSameServiceElement.children.find((type) => type.label === orderPattern.type);
          if (!theSameTypeElement) {
            theSameServiceElement.children.push(serviceNodeObject(orderPattern));
          } else {
            const theSameCategoryElement = theSameTypeElement.children.find((category) => category.label === orderPattern.category);
            if (!theSameCategoryElement) {
              theSameTypeElement.children.push(orderCategoryNodeObject(orderPattern));
            } else {
              theSameCategoryElement.children.push(orderPatternNodeObject(orderPattern));
            }
          }
        }
      });
      return treeData;
    },

    getOrderPatternById: (state) => (patternId) => {
      return state.patterns.find((pattern) => pattern._id === patternId);
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

    getCreateOrderPatternResult(state) {
      return state.createOrderPatternResult;
    },
  },

  mutations: {
    delCurrOrderPatternsData(state) {
      state.patterns = [];
      state.loadingOrderPatterns = false;
      state.errorLoadingPatterns = null;
      state.modifyOrderCategoryTitleResult = null;
      state.modifyOrderCategoryTitleRecsBeingProcessed = 0;
      state.delOrderPatternResult = null;
      state.delOrderPatternRecsBeingProcessed = 0;
      state.modOrderPatternRecsBeingProcessed = 0;
      state.modOrderPatternResult = null;
      state.createOrderPatternResult = null;
    },
  },

  actions: {
    /**
     *
     */
    async loadOrderPatterns(context) {
      context.state.errorLoadingPatterns = null;
      context.state.loadingOrderPatterns = true;
      try {
        const headers = {
          'Authorization': `Bearer ${context.getters.getCurrentUserToken}`,
        };
        const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getOrderPatterns,
          {
            workPoligonType: context.getters.getUserWorkPoligon.type,
            workPoligonId: context.getters.getUserWorkPoligon.code,
          },
          { headers }
        );
        context.state.patterns = response.data || [];
      } catch (err) {
        context.state.errorLoadingPatterns = err;
      }
      context.state.loadingOrderPatterns = false;
    },

    /**
     *
     */
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

    /**
     *
     */
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

    /**
     *
     */
    async createOrderPattern(context, { service, type, category, title, elements }) {
      try {
        const headers = {
          'Authorization': `Bearer ${context.getters.getCurrentUserToken}`,
        };
        const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.createOrderPattern,
          {
            service,
            type,
            category,
            title,
            elements,
            isPersonalPattern: true,
            workPoligonType: context.getters.getUserWorkPoligon.type,
            workPoligonId: context.getters.getUserWorkPoligon.code,
          },
          { headers }
        );
        context.state.createOrderPatternResult = {
          error: false,
          message: response.data.message,
          orderPattern: response.data.orderPattern,
        };
        context.state.patterns = [
          ...context.state.patterns,
          response.data.orderPattern,
        ];
      } catch ({ response }) {
        context.state.createOrderPatternResult = {
          error: true,
          message: response.data.message,
        };
      }
    },
  },
};
