import axios from 'axios';
import { AUTH_SERVER_ACTIONS_PATHS } from '../../constants/servers';
import { OrderPatternsNodeType } from '../../constants/orderPatterns';


export const orderPatterns = {
  state: {
    patterns: [],
    loadingOrderPatterns: false,
    loadingOrderPatternsResult: null,
    modifyOrderCategoryTitleResult: null,
    modifyOrderCategoryTitleRecsBeingProcessed: 0,
    delOrderPatternResult: null,
    delOrderPatternRecsBeingProcessed: 0,
    modOrderPatternResult: null,
    modOrderPatternRecsBeingProcessed: 0,
    createOrderPatternResult: null,
    createOrderPatternRecsBeingProcessed: 0,
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
          const childItem = { key: order._id, label: order.title, data: order };
          if (!categoryGroup) {
            groupedOrders.push({
              key: order.category,
              label: order.category,
              data: order.category,
              selectable: false,
              children: [childItem],
            });
          } else {
            categoryGroup.children.push(childItem);
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

    setNewOrderPatternsArray(state, newPatternsArray) {
      state.patterns = newPatternsArray || [];
    },

    setLoadingOrderPatternsStatus(state, status) {
      state.loadingOrderPatterns = status;
    },

    clearLoadingOrderPatternsResult(state) {
      state.loadingOrderPatternsResult = null;
    },

    setLoadingOrderPatternsResult(state, { error, message }) {
      state.loadingOrderPatternsResult = {
        error,
        message,
      };
    },

    clearModifyOrderCategoryTitleResult(state) {
      state.modifyOrderCategoryTitleResult = null;
    },

    setModifyOrderCategoryTitleResult(state, { error, message, newTitle }) {
      state.modifyOrderCategoryTitleResult = {
        error,
        message,
        newTitle,
      };
    },

    addModifyOrderCategoryTitleRecsBeingProcessed(state) {
      state.modifyOrderCategoryTitleRecsBeingProcessed += 1;
    },

    subModifyOrderCategoryTitleRecsBeingProcessed(state) {
      state.modifyOrderCategoryTitleRecsBeingProcessed -= 1;
    },

    setOrderCategoryTitle(state, { service, orderType, title, newTitle}) {
      state.patterns = state.patterns.map((pattern) => {
        if (pattern.service === service && pattern.type === orderType && pattern.category === title) {
          return {
            ...pattern,
            category: newTitle,
          };
        }
        return pattern;
      });
    },

    clearDelOrderPatternResult(state) {
      state.delOrderPatternResult = null;
    },

    setDelOrderPatternResult(state, { error, message }) {
      state.delOrderPatternResult = {
        error,
        message,
      };
    },

    addDelOrderPatternRecsBeingProcessed(state) {
      state.delOrderPatternRecsBeingProcessed += 1;
    },

    subDelOrderPatternRecsBeingProcessed(state) {
      state.delOrderPatternRecsBeingProcessed -= 1;
    },

    delOrderPattern(state, orderPatternId) {
      state.patterns = state.patterns.filter((pattern) => pattern._id !== orderPatternId);
    },

    clearModOrderPatternResult(state) {
      state.modOrderPatternResult = null;
    },

    setModOrderPatternResult(state, { error, message, orderPattern }) {
      state.modOrderPatternResult = {
        error,
        message,
        orderPattern,
      };
    },

    addModOrderPatternRecsBeingProcessed(state) {
      state.modOrderPatternRecsBeingProcessed += 1;
    },

    subModOrderPatternRecsBeingProcessed(state) {
      state.modOrderPatternRecsBeingProcessed -= 1;
    },

    modOrderPattern(state, { orderPatternId, newOrderPattern }) {
      state.patterns = state.patterns.map((pattern) => {
        if (pattern._id !== orderPatternId) {
          return pattern;
        }
        return {
          ...pattern,
          ...newOrderPattern,
        };
      });
    },

    clearCreateOrderPatternResult(state) {
      state.createOrderPatternResult = null;
    },

    setCreateOrderPatternResult(state, { error, message }) {
      state.createOrderPatternResult = {
        error,
        message,
      };
    },

    addCreateOrderPatternRecsBeingProcessed(state) {
      state.createOrderPatternRecsBeingProcessed += 1;
    },

    subCreateOrderPatternRecsBeingProcessed(state) {
      state.createOrderPatternRecsBeingProcessed -= 1;
    },

    addNewOrderPattern(state, newPattern) {
      state.patterns = [
        ...state.patterns,
        newPattern,
      ];
    },
  },

  actions: {
    /**
     *
     */
    async loadOrderPatterns(context) {
      context.commit('setLoadingOrderPatternsStatus', true);
      context.commit('clearLoadingOrderPatternsResult');
      const workPoligon = context.getters.getUserWorkPoligon;
      if (!workPoligon) {
        context.commit('setLoadingOrderPatternsResult', { error: true, message: 'No user work poligon' });
        return;
      }
      try {
        const headers = {
          'Authorization': `Bearer ${context.getters.getCurrentUserToken}`,
        };
        const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.getOrderPatterns,
          {
            workPoligonType: workPoligon.type,
            workPoligonId: workPoligon.code,
          },
          { headers }
        );
        context.commit('setLoadingOrderPatternsResult', { error: false, message: null });
        context.commit('setNewOrderPatternsArray', response.data);
      } catch ({ response }) {
        context.commit('setLoadingOrderPatternsResult', { error: true, message: response.data.message });
      }
      context.commit('setLoadingOrderPatternsStatus', false);
    },

    /**
     *
     */
    async editOrderCategoryTitle(context, { service, orderType, title, newTitle }) {
      context.commit('addModifyOrderCategoryTitleRecsBeingProcessed');
      context.commit('clearModifyOrderCategoryTitleResult');
      try {
        const headers = {
          'Authorization': `Bearer ${context.getters.getCurrentUserToken}`,
        };
        const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.modOrderCategoryTitle,
          { service, orderType, title, newTitle },
          { headers }
        );
        context.commit('setModifyOrderCategoryTitleResult', {
          error: false,
          message: response.data.message,
          newTitle: response.data.newTitle,
        });
        context.commit('setOrderCategoryTitle', {
          service,
          orderType,
          title,
          newTitle: response.data.newTitle,
        });
      } catch ({ response }) {
        context.commit('setModifyOrderCategoryTitleResult', {
          error: true,
          message: response.data.message,
          newTitle: null,
        });
      }
      context.commit('subModifyOrderCategoryTitleRecsBeingProcessed');
    },

    /**
     *
     */
    async delOrderPattern(context, orderPatternId) {
      context.commit('addDelOrderPatternRecsBeingProcessed');
      context.commit('clearDelOrderPatternResult');
      try {
        const headers = {
          'Authorization': `Bearer ${context.getters.getCurrentUserToken}`,
        };
        const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.delOrderPattern,
          { id: orderPatternId },
          { headers }
        );
        context.commit('setDelOrderPatternResult', { error: false, message: response.data.message });
        context.commit('delOrderPattern', orderPatternId);
      } catch ({ response }) {
        context.commit('setDelOrderPatternResult', { error: true, message: response.data.message });
      }
      context.commit('subDelOrderPatternRecsBeingProcessed');
    },

    /**
     *
     */
    async modOrderPattern(context, { id, title, elements }) {
      context.commit('addModOrderPatternRecsBeingProcessed');
      context.commit('clearModOrderPatternResult');
      try {
        const headers = {
          'Authorization': `Bearer ${context.getters.getCurrentUserToken}`,
        };
        const response = await axios.post(AUTH_SERVER_ACTIONS_PATHS.modOrderPattern,
          { id, title, elements },
          { headers }
        );
        context.commit('setModOrderPatternResult', {
          error: false,
          message: response.data.message,
          orderPattern: response.data.orderPattern,
        });
        context.commit('modOrderPattern', {
          orderPatternId: response.data.orderPattern._id,
          newOrderPattern: response.data.orderPattern,
        });
      } catch ({ response }) {
        context.commit('setModOrderPatternResult', {
          error: true,
          message: response.data.message,
          orderPattern: null,
        });
      }
      context.commit('subModOrderPatternRecsBeingProcessed');
    },

    /**
     *
     */
    async createOrderPattern(context, { service, type, category, title, elements }) {
      context.commit('clearCreateOrderPatternResult');
      context.commit('addCreateOrderPatternRecsBeingProcessed');
      const workPoligon = context.getters.getUserWorkPoligon;
      if (!workPoligon) {
        context.commit('setCreateOrderPatternResult', { error: true, message: 'No user work poligon' });
        return;
      }
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
            workPoligonType: workPoligon.type,
            workPoligonId: workPoligon.code,
          },
          { headers }
        );
        context.commit('setCreateOrderPatternResult', { error: false, message: response.data.message });
        context.commit('addNewOrderPattern', response.data.orderPattern);
      } catch ({ response }) {
        context.commit('setCreateOrderPatternResult', { error: true, message: response.data.message });
      }
      context.commit('subCreateOrderPatternRecsBeingProcessed');
    },
  },
};
