import { ORDER_PATTERN_TYPES } from '../../../constants/orderPatterns';
import router from '../../../router';
import { store } from '../../../store';


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
          ? 'Удалить распоряжение из таблицы рабочих распоряжений?'
          : `Удалить цепочку распоряжений (${ordersInChain.reduce((accumulator, currentValue, index) =>
            accumulator + currentValue.type + ' № ' + currentValue.number + `${index === ordersInChain.length - 1 ? '' : ', '}`, '')}) из таблицы рабочих распоряжений?`;
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

        // Пукты меню о создании на основании выбранного распоряжения другого распоряжения
        // создаются лишь в том случае, если выбранное распоряжение является в своей цепочке действующим
        if (!getters.getActiveOrders.find((order) => order._id === orderId)) {
          return items;
        }

        // У ДНЦ и ДСП предыдущее распоряжение в цепочке может быть любого типа,
        // следующее за ним распоряжение - одного из типов распоряжений, которые может
        // издавать работник, имеющий данную должность
        if (getters.isDNC) {
          items.push(
            {
              label: `Создать ${ORDER_PATTERN_TYPES.ORDER.toUpperCase()}`,
              icon: 'pi pi-file',
              command: () => {
                router.push({
                  name: 'NewOrderPage',
                  params: {
                    orderType: ORDER_PATTERN_TYPES.ORDER,
                    prevOrderId: orderId,
                  },
                });
              },
            }
          );
        }
        if (getters.isDNC || getters.isDSP) {
          items.push(
            {
              label: `Создать ${ORDER_PATTERN_TYPES.REQUEST.toUpperCase()}`,
              icon: 'pi pi-file',
              command: () => {
                router.push({
                  name: 'NewOrderPage',
                  params: {
                    orderType: ORDER_PATTERN_TYPES.REQUEST,
                    prevOrderId: orderId,
                  },
                });
              },
            },
            {
              label: `Создать ${ORDER_PATTERN_TYPES.NOTIFICATION.toUpperCase()}`,
              icon: 'pi pi-file',
              command: () => {
                router.push({
                  name: 'NewOrderPage',
                  params: {
                    orderType: ORDER_PATTERN_TYPES.NOTIFICATION,
                    prevOrderId: orderId,
                  },
                });
              },
            }
          );
        }
        // У ЭЦД предыдущее распоряжение в цепочке может быть любого типа, но следующее за ним -
        // только уведомление / отмена запрещения. Приказ и запрещение могут лишь начинать цепочку.
        if (getters.isECD) {
          items.push(
            {
              label: `Создать ${ORDER_PATTERN_TYPES.ECD_NOTIFICATION.toUpperCase()}`,
              icon: 'pi pi-file',
              command: () => {
                router.push({
                  name: 'NewOrderPage',
                  params: {
                    orderType: ORDER_PATTERN_TYPES.ECD_NOTIFICATION,
                    prevOrderId: orderId,
                  },
                });
              },
            }
          );
        }
        return items;
      };
    },
  },
};
