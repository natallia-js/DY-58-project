import { OrderPatternsNodeType } from '@/constants/orderPatterns';
import {
  DEL_CURR_ORDER_PATTERN_DATA,
  SET_NEW_ORDER_PATTERNS_ARRAY,
  SET_LOADING_ORDER_PATTERNS_STATUS,
  CLEAR_LOADING_ORDER_PATTERNS_RESULT,
  SET_LOADING_ORDER_PATTERNS_RESULT,
  CLEAR_MODIFY_ORDER_CATEGORY_TITLE_RESULT,
  SET_MODIFY_ORDER_CATEGORY_TITLE_RESULT,
  ADD_MODIFY_ORDER_CATEGORY_TITLE_RECS_BEING_PROCESSED,
  SUB_MODIFY_ORDER_CATEGORY_TITLE_RECS_BEING_PROCESSED,
  SET_ORDER_CATEGORY_TITLE,
  CLEAR_DEL_ORDER_PATTERN_RESULT,
  SET_DEL_ORDER_PATTERN_RESULT,
  ADD_DEL_ORDER_PATTERN_RECS_BEING_PROCESSED,
  SUB_DEL_ORDER_PATTERN_RECS_BEING_PROCESSED,
  DEL_ORDER_PATTERN,
  CLEAR_MOD_ORDER_PATTERN_RESULT,
  SET_MOD_ORDER_PATTERN_RESULT,
  ADD_MOD_ORDER_PATTERN_RECS_BEING_PROCESSED,
  SUB_MOD_ORDER_PATTERN_RECS_BEING_PROCESSED,
  MOD_ORDER_PATTERN,
  CLEAR_CREATE_ORDER_PATTERN_RESULT,
  SET_CREATE_ORDER_PATTERN_RESULT,
  ADD_CREATE_ORDER_PATTERN_RECS_BEING_PROCESSED,
  SUB_CREATE_ORDER_PATTERN_RECS_BEING_PROCESSED,
  ADD_NEW_ORDER_PATERN,
  SET_SYSTEM_MESSAGE,
} from '@/store/mutation-types';
import {
  getOrderPatterns,
  modOrderCategoryTitle,
  deleteOrderPattern,
  modifyOrderPattern,
  createNewOrderPattern,
} from '@/serverRequests/orderPatterns.requests';
import formErrorMessageInCatchBlock from '@/additional/formErrorMessageInCatchBlock';


export const orderPatterns = {
  state: {
    patterns: [],
    loadingOrderPatterns: false,
    loadingOrderPatternsResult: { error: false, message: null },
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
    getAllOrderPatterns(state) {
      return state.patterns;
    },

    getLoadingOrderPatternsStatus(state) {
      return state.loadingOrderPatterns;
    },

    orderPatternsLoadedSuccessfully(state) {
      return !state.loadingOrderPatternsResult.error;
    },

    getErrorLoadingPatterns(state) {
      return state.loadingOrderPatternsResult.error ? state.loadingOrderPatternsResult.message : null;
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
          specialTrainCategories: orderPattern.specialTrainCategories,
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
          // наименование категории распоряжений; такое может быть лишь в том случае, если
          // автором всех распоряжений категории является текущий пользователь
          personalCategory: !state.patterns.find((item) =>
            item.service === orderPattern.service && item.type === orderPattern.type &&
            item.category === orderPattern.category && String(item.personalPattern) !== String(getters.getUserId)
          ),
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

    getOrderPatternIdBySpecialSign(state) {
      return (specialSign) => {
        if (!specialSign) {
          return null;
        }
        const orderPattern = state.patterns.find((pattern) =>
          pattern.specialTrainCategories && pattern.specialTrainCategories.includes(specialSign));
        return orderPattern ? orderPattern._id : null;
      };
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

    getCreateOrderPatternRecsBeingProcessed(state) {
      return state.createOrderPatternRecsBeingProcessed;
    },

    getCreateOrderPatternResult(state) {
      return state.createOrderPatternResult;
    },

    getOrderPatternSpecialTrainCategories(state) {
      return (patternId) => {
        if (!patternId) {
          return null;
        }
        const pattern = state.patterns.find((item) => item._id === patternId);
        if (!pattern) {
          return null;
        }
        return pattern.specialTrainCategories;
      };
    },
  },

  mutations: {
    [DEL_CURR_ORDER_PATTERN_DATA] (state) {
      state.patterns = [];
      state.loadingOrderPatterns = false;
      state.modifyOrderCategoryTitleResult = null;
      state.modifyOrderCategoryTitleRecsBeingProcessed = 0;
      state.delOrderPatternResult = null;
      state.delOrderPatternRecsBeingProcessed = 0;
      state.modOrderPatternRecsBeingProcessed = 0;
      state.modOrderPatternResult = null;
      state.createOrderPatternResult = null;
    },

    [SET_NEW_ORDER_PATTERNS_ARRAY] (state, newPatternsArray) {
      state.patterns = newPatternsArray || [];
    },

    [SET_LOADING_ORDER_PATTERNS_STATUS] (state, status) {
      state.loadingOrderPatterns = status;
    },

    [CLEAR_LOADING_ORDER_PATTERNS_RESULT] (state) {
      state.loadingOrderPatternsResult = { error: false, message: null };
    },

    [SET_LOADING_ORDER_PATTERNS_RESULT] (state, { error, message }) {
      state.loadingOrderPatternsResult = { error, message };
    },

    [CLEAR_MODIFY_ORDER_CATEGORY_TITLE_RESULT] (state) {
      state.modifyOrderCategoryTitleResult = null;
    },

    [SET_MODIFY_ORDER_CATEGORY_TITLE_RESULT] (state, { error, message, newTitle }) {
      state.modifyOrderCategoryTitleResult = { error, message, newTitle };
    },

    [ADD_MODIFY_ORDER_CATEGORY_TITLE_RECS_BEING_PROCESSED] (state) {
      state.modifyOrderCategoryTitleRecsBeingProcessed += 1;
    },

    [SUB_MODIFY_ORDER_CATEGORY_TITLE_RECS_BEING_PROCESSED] (state) {
      state.modifyOrderCategoryTitleRecsBeingProcessed -= 1;
    },

    [SET_ORDER_CATEGORY_TITLE] (state, { service, orderType, title, newTitle }) {
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

    [CLEAR_DEL_ORDER_PATTERN_RESULT] (state) {
      state.delOrderPatternResult = null;
    },

    [SET_DEL_ORDER_PATTERN_RESULT] (state, { error, message }) {
      state.delOrderPatternResult = {
        error,
        message,
      };
    },

    [ADD_DEL_ORDER_PATTERN_RECS_BEING_PROCESSED] (state) {
      state.delOrderPatternRecsBeingProcessed += 1;
    },

    [SUB_DEL_ORDER_PATTERN_RECS_BEING_PROCESSED] (state) {
      state.delOrderPatternRecsBeingProcessed -= 1;
    },

    [DEL_ORDER_PATTERN] (state, orderPatternId) {
      state.patterns = state.patterns.filter((pattern) => pattern._id !== orderPatternId);
    },

    [CLEAR_MOD_ORDER_PATTERN_RESULT] (state) {
      state.modOrderPatternResult = null;
    },

    [SET_MOD_ORDER_PATTERN_RESULT] (state, { error, message, orderPattern }) {
      state.modOrderPatternResult = {
        error,
        message,
        orderPattern,
      };
    },

    [ADD_MOD_ORDER_PATTERN_RECS_BEING_PROCESSED] (state) {
      state.modOrderPatternRecsBeingProcessed += 1;
    },

    [SUB_MOD_ORDER_PATTERN_RECS_BEING_PROCESSED] (state) {
      state.modOrderPatternRecsBeingProcessed -= 1;
    },

    [MOD_ORDER_PATTERN] (state, { orderPatternId, newOrderPattern }) {
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

    [CLEAR_CREATE_ORDER_PATTERN_RESULT] (state) {
      state.createOrderPatternResult = null;
    },

    [SET_CREATE_ORDER_PATTERN_RESULT] (state, { error, message }) {
      state.createOrderPatternResult = {
        error,
        message,
      };
    },

    [ADD_CREATE_ORDER_PATTERN_RECS_BEING_PROCESSED] (state) {
      state.createOrderPatternRecsBeingProcessed += 1;
    },

    [SUB_CREATE_ORDER_PATTERN_RECS_BEING_PROCESSED] (state) {
      state.createOrderPatternRecsBeingProcessed -= 1;
    },

    [ADD_NEW_ORDER_PATERN] (state, newPattern) {
      if (newPattern) {
        state.patterns.push(newPattern);
      }
    },
  },

  actions: {
    /**
     *
     */
    async loadOrderPatterns(context) {
      if (!context.getters.canUserGetOrderPatterns) {
        const errMessage = 'У вас нет права просматривать шаблоны распоряжений';
        context.commit(SET_LOADING_ORDER_PATTERNS_RESULT, { error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }
      context.commit(SET_LOADING_ORDER_PATTERNS_STATUS, true);
      context.commit(CLEAR_LOADING_ORDER_PATTERNS_RESULT);

      const workPoligon = context.getters.getUserWorkPoligon;
      if (!workPoligon) {
        const errMessage = 'Не определен рабочий полигон пользователя';
        context.commit(SET_LOADING_ORDER_PATTERNS_RESULT, { error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }
      try {
        const responseData = await getOrderPatterns({
          workPoligonType: workPoligon.type,
          workPoligonId: workPoligon.code,
          getChildPatterns: true,
        });
        context.commit(SET_LOADING_ORDER_PATTERNS_RESULT, { error: false, message: null });
        context.commit(SET_SYSTEM_MESSAGE, { error: false, datetime: new Date(), message: 'Загружены шаблоны распоряжений' });
        context.commit(SET_NEW_ORDER_PATTERNS_ARRAY, responseData);

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка подгрузки информации о шаблонах распоряжений');
        context.commit(SET_LOADING_ORDER_PATTERNS_RESULT, { error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });

      } finally {
        context.commit(SET_LOADING_ORDER_PATTERNS_STATUS, false);
      }
    },

    /**
     *
     */
    async editOrderCategoryTitle(context, { service, orderType, title, newTitle }) {
      if (!context.getters.canUserWorkWithOrderPatterns) {
        const errMessage = 'У вас нет права редактировать наименования категорий распоряжений';
        context.commit(SET_MODIFY_ORDER_CATEGORY_TITLE_RESULT, { error: true, message: errMessage, newTitle: null });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }
      context.commit(ADD_MODIFY_ORDER_CATEGORY_TITLE_RECS_BEING_PROCESSED);
      context.commit(CLEAR_MODIFY_ORDER_CATEGORY_TITLE_RESULT);
      try {
        const responseData = await modOrderCategoryTitle({ service, orderType, title, newTitle });
        context.commit(SET_MODIFY_ORDER_CATEGORY_TITLE_RESULT, {
          error: false,
          message: responseData.message,
          newTitle: responseData.newTitle,
        });
        context.commit(SET_SYSTEM_MESSAGE, { error: false, datetime: new Date(), message: responseData.message });
        context.commit(SET_ORDER_CATEGORY_TITLE, {
          service,
          orderType,
          title,
          newTitle: responseData.newTitle,
        });
      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка редактирования наименования категории распоряжений');
        context.commit(SET_MODIFY_ORDER_CATEGORY_TITLE_RESULT, { error: true, message: errMessage, newTitle: null });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });

      } finally {
        context.commit(SUB_MODIFY_ORDER_CATEGORY_TITLE_RECS_BEING_PROCESSED);
      }
    },

    /**
     *
     */
    async delOrderPattern(context, orderPatternId) {
      if (!context.getters.canUserWorkWithOrderPatterns) {
        const errMessage = 'У вас нет права удалять шаблоны распоряжений';
        context.commit(SET_DEL_ORDER_PATTERN_RESULT, { error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }
      context.commit(ADD_DEL_ORDER_PATTERN_RECS_BEING_PROCESSED);
      context.commit(CLEAR_DEL_ORDER_PATTERN_RESULT);
      try {
        const responseData = await deleteOrderPattern(orderPatternId);
        context.commit(SET_DEL_ORDER_PATTERN_RESULT, { error: false, message: responseData.message });
        context.commit(SET_SYSTEM_MESSAGE, { error: false, datetime: new Date(), message: responseData.message });
        context.commit(DEL_ORDER_PATTERN, orderPatternId);

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка удаления шаблона распоряжений');
        context.commit(SET_DEL_ORDER_PATTERN_RESULT, { error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });

      } finally {
        context.commit(SUB_DEL_ORDER_PATTERN_RECS_BEING_PROCESSED);
      }
    },

    /**
     *
     */
    async modOrderPattern(context, { id, title, specialTrainCategories, elements }) {
      if (!context.getters.canUserWorkWithOrderPatterns) {
        const errMessage = 'У вас нет права на редактирование шаблонов распоряжений';
        context.commit(SET_MOD_ORDER_PATTERN_RESULT, { error: true, message: errMessage, orderPattern: null });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }
      context.commit(ADD_MOD_ORDER_PATTERN_RECS_BEING_PROCESSED);
      context.commit(CLEAR_MOD_ORDER_PATTERN_RESULT);
      try {
        const responseData = await modifyOrderPattern({ id, title, specialTrainCategories, elements });
        context.commit(SET_MOD_ORDER_PATTERN_RESULT, {
          error: false,
          message: responseData.message,
          orderPattern: responseData.orderPattern,
        });
        context.commit(SET_SYSTEM_MESSAGE, { error: false, datetime: new Date(), message: responseData.message });
        context.commit(MOD_ORDER_PATTERN, {
          orderPatternId: responseData.orderPattern._id,
          newOrderPattern: responseData.orderPattern,
        });
      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка редактирования шаблона распоряжений');
        context.commit(SET_MOD_ORDER_PATTERN_RESULT, { error: true, message: errMessage, orderPattern: null });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });

      } finally {
        context.commit(SUB_MOD_ORDER_PATTERN_RECS_BEING_PROCESSED);
      }
    },

    /**
     *
     */
    async createOrderPattern(context, props) {
      if (!context.getters.canUserWorkWithOrderPatterns) {
        const errMessage = 'У вас нет права на создание шаблонов распоряжений';
        context.commit(SET_CREATE_ORDER_PATTERN_RESULT, { error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }
      const { service, type, category, title, specialTrainCategories, elements } = props;

      context.commit(CLEAR_CREATE_ORDER_PATTERN_RESULT);
      context.commit(ADD_CREATE_ORDER_PATTERN_RECS_BEING_PROCESSED);

      const workPoligon = context.getters.getUserWorkPoligon;
      if (!workPoligon) {
        const errMessage = 'Не определен рабочий полигон пользователя';
        context.commit(SET_CREATE_ORDER_PATTERN_RESULT, { error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });
        return;
      }
      try {
        const responseData = await createNewOrderPattern({
          service,
          type,
          category,
          title,
          specialTrainCategories,
          elements,
          isPersonalPattern: true,
          workPoligonType: workPoligon.type,
          workPoligonId: workPoligon.code,
        });
        context.commit(SET_CREATE_ORDER_PATTERN_RESULT, { error: false, message: responseData.message });
        context.commit(SET_SYSTEM_MESSAGE, { error: false, datetime: new Date(), message: responseData.message });
        context.commit(ADD_NEW_ORDER_PATERN, responseData.orderPattern);

      } catch (error) {
        const errMessage = formErrorMessageInCatchBlock(error, 'Ошибка создания шаблона распоряжений');
        context.commit(SET_CREATE_ORDER_PATTERN_RESULT, { error: true, message: errMessage });
        context.commit(SET_SYSTEM_MESSAGE, { error: true, datetime: new Date(), message: errMessage });

      } finally {
        context.commit(SUB_CREATE_ORDER_PATTERN_RECS_BEING_PROCESSED);
      }
    },
  },
};
