import router from '@/router';
import { store } from '@/store';


/**
 * Данный модуль предназначен для работы с контекстными меню в зависимости от должности
 * человека, вошедшего в систему.
 */
export const contextMenus = {
  getters: {
    /**
     *
     */
    getDeleteOrdersChainAction(_state, getters) {
      return (chainId, confirmInstance) => {
        const ordersInChain = getters.getOrdersInChain(chainId);
        const confirmDlgMessage = ordersInChain.length === 1
          ? 'Удалить распоряжение из таблицы рабочих распоряжений без возможности восстановления?'
          : `Удалить цепочку распоряжений (${ordersInChain.reduce((accumulator, currentValue, index) =>
            accumulator + currentValue.type + ' № ' + currentValue.number + `${index === ordersInChain.length - 1 ? '' : ', '}`, '')}) из таблицы рабочих распоряжений без возможности восстановления?`;
        confirmInstance.require({
          header: 'Подтвердите удаление',
          message: confirmDlgMessage,
          icon: 'pi pi-exclamation-circle',
          defaultFocus: 'reject',
          accept: () => {
            store.dispatch('delConfirmedOrdersFromChain', chainId);
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

        const possibleNewOrderTypes = getters.getPossibleNewOrderTypesForBaseOrder(order.type, order.specialTrainCategories);
        if (!possibleNewOrderTypes || !possibleNewOrderTypes.length) {
          return items;
        }
        possibleNewOrderTypes.forEach((newOrderType) => {
          items.push(
            {
              label: `Создать ${newOrderType.toUpperCase()}`,
              icon: 'pi pi-file',
              command: () => {
                router.push({
                  name: 'NewOrderPage',
                  params: {
                    orderType: newOrderType,
                    prevOrderId: orderId,
                  },
                });
              },
            }
          );
        });
        return items;
      };
    },
  },
};
