import router from '@/router';
import { store } from '@/store';
import { DEL_CONFIRMED_ORDERS_FROM_CHAIN_ACTION, FORCE_CLOSE_OR_OPEN_ORDERS_CHAIN } from '@/store/action-types';


/**
 * Данный модуль предназначен для работы с контекстными меню в зависимости от должности
 * человека, вошедшего в систему.
 */
export const contextMenus = {
  getters: {
    /**
     * Позволяет выполнить действие по удалению из таблицы рабочих распоряжений документа / цепочки документов.
     * Предварительно требует у пользователя подтверждения этого действия.
     */
    getDeleteOrdersChainAction(_state, getters) {
      return (chainId, confirmInstance) => {
        const ordersInChain = getters.getOrdersInChain(chainId);
        const confirmDlgMessage = ordersInChain.length === 1
          ? 'Удалить документ из таблицы рабочих документов без возможности восстановления?'
          : `Удалить цепочку документов (${ordersInChain.reduce((accumulator, currentValue, index) =>
            accumulator + currentValue.type + ' № ' + currentValue.number + `${index === ordersInChain.length - 1 ? '' : ', '}`, '')}) из таблицы рабочих документов без возможности восстановления?`;
        confirmInstance.require({
          header: 'Подтвердите удаление',
          message: confirmDlgMessage,
          icon: 'pi pi-exclamation-circle',
          defaultFocus: 'reject',
          accept: () => {
            store.dispatch(DEL_CONFIRMED_ORDERS_FROM_CHAIN_ACTION, chainId);
          },
        });
      };
    },

    /**
     * Позволяет выполнить действие по принудительному завершению указанной цепочки документов.
     * Предварительно требует у пользователя подтверждения этого действия.
     */
    getForcelyCloseOrdersChainAction(_state, getters) {
      return (chainId, confirmInstance) => {
        const ordersInChain = getters.getOrdersInChain(chainId);
        const confirmDlgMessage = ordersInChain.length === 1
          ? 'Завершить цепочку, которой принадлежит только текущий документ (операция необратима)?'
          : `Завершить цепочку документов (${ordersInChain.reduce((accumulator, currentValue, index) =>
            accumulator + currentValue.type + ' № ' + currentValue.number + `${index === ordersInChain.length - 1 ? '' : ', '}`, '')}) (операция необратима)?`;
        confirmInstance.require({
          header: 'Подтвердите принудительное завершение цепочки',
          message: confirmDlgMessage,
          icon: 'pi pi-exclamation-circle',
          defaultFocus: 'reject',
          accept: () => {
            store.dispatch(FORCE_CLOSE_OR_OPEN_ORDERS_CHAIN, { orderChainId: chainId, forceClose: true });
          },
        });
      };
    },

    /**
     * Для заданного распоряжения с id = orderId возвращает пункты контекстного меню для создания на
     * основании выбранного распоряжения другого распоряжения (принадлежащего той же цепочке распоряжений).
     */
    getCreateRelativeOrderContextMenu(_state, getters) {
      return (orderId) => {
        const items = [];

        // Проверяем, имеет ли право текущий пользователь издавать распоряжения
        if (!getters.canUserDispatchOrders) {
          return items;
        }

        // Пукты меню о создании на основании выбранного распоряжения другого распоряжения
        // создаются лишь в том случае, если выбранное распоряжение является в своей цепочке действующим
        const order = getters.getActiveOrders.find((order) => order._id === orderId);
        if (!order) {
          return items;
        }
        const childPatterns = order?.orderText?.patternId ? getters.getOrderPatternChildPatterns(order.orderText.patternId) : null;

        const possibleNewOrderTypes = getters.getPossibleNewOrderTypesForBaseOrder(order.type, order.specialTrainCategories);

        if (!possibleNewOrderTypes || !possibleNewOrderTypes.length) {
          return items;
        }
        possibleNewOrderTypes.forEach((newOrderType) => {
          items.push(
            {
              label: `Создать ${newOrderType.toUpperCase()}`,
              command: () => {
                router.push({
                  name: 'NewOrderPage',
                  params: {
                    orderType: newOrderType,
                    orderId: null,
                    orderPatternId: null,
                    orderPatternSpecialSign: null,
                    prevOrderId: orderId,
                    orderDraftId: null,
                  },
                });
              },
            }
          );
          if (childPatterns && childPatterns.length) {
            childPatterns.forEach((childPattern) => {
              if (childPattern.type === newOrderType) {
                items.push(
                  {
                    label: childPattern.title,
                    isChild: true,
                    command: () => {
                      router.push({
                        name: 'NewOrderPage',
                        params: {
                          orderType: childPattern.type,
                          orderId: null,
                          orderPatternId: childPattern.id,
                          orderPatternSpecialSign: null,
                          prevOrderId: orderId,
                          orderDraftId: null,
                        },
                      });
                    },
                  }
                );
              }
            });
          }
        });
        return items;
      };
    },
  },
};
