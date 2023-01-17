/**
 * Обеспечивает проверку возможности выполнения действий над конкретным распоряжением.
 * Не учитывает полномочия пользователя на работу с данным распоряжением (должны быть
 * дополнительные проверки).
 */
export const checkIfOrderActionCanBePerformed = {
  getters: {
    /**
     * Проверка возможности выполнения любого действия над рабочим распоряжением с точки зрения
     * "свободности" данного распоряжения для выполнения над ним каких-либо действий:
     * 1) в настоящее время не должна удаляться цепочка распоряжения,
     * 2) распоряжение не должно проходить процедуру подтверждения за других,
     * 3) у распоряжения не должен удаляться его получатель на станции.
     * Все вышеуказанные операции - длительные: требуют обращения к серверу.
     */
    canUserPerformAnyActionOnOrder(_state, getters) {
      return (orderId) => (
        !getters.getOrdersChainsBeingDeleted.includes(orderId) &&
        !getters.isOrderBeingConfirmedForOthers(orderId) &&
        !getters.isOrderBeingDeletedStationWorkPlaceReceiver(orderId) &&
        !getters.isOrderBeingChangedItsInvalidMark(orderId)
      ) ? true : false;
    },

    /**
     * Возвращает true, если распоряжение было издано на текущем рабочем полигоне, false - в противном случае.
     * В случае ДСП и иного работника станции - в частности, Оператора при ДСП этой же станции - их рабочие
     * полигоны - разные: рабочий полигон = рабочее место.
     */
    orderDispatchedOnCurrentWorkPoligon(_state, getters) {
      return (order) => {
        const userWorkPoligon = getters.getUserWorkPoligon;
        return (
          order && order.senderWorkPoligon && userWorkPoligon &&
          (order.senderWorkPoligon.type === userWorkPoligon.type) &&
          (String(order.senderWorkPoligon.id) === String(userWorkPoligon.code)) &&
          (
            (!order.senderWorkPoligon.workPlaceId && !userWorkPoligon.subCode) ||
            (order.senderWorkPoligon.workPlaceId && userWorkPoligon.subCode && String(order.senderWorkPoligon.workPlaceId) === String(userWorkPoligon.subCode))
          )
        ) ? true : false;
      };
    },

    /**
     * Возвращает true, если пользователь может подтвердить распоряжение за его адресатов
     * (т.е. за те полигоны, которые присутствовали в секции "Кому" при издании распоряжения).
     * Это возможно в том случае, если распоряжение было издано на том рабочем полигоне, на
     * котором работает пользователь.
     * Возвращает false, если текущий пользователь не имеет права подтверждать распоряжение за других.
     */
    orderCanBeConfirmedFor(_state, getters) {
      return (order) => getters.orderDispatchedOnCurrentWorkPoligon(order);
    },

    /**
     * Проверка возможности подтвердить распоряжение за других лиц - адресатов данного распоряжения
     * в текущий момент времени текущим пользователем.
     */
    canOrderBeConfirmedFor(_state, getters) {
      return (order) => (
        order &&
        getters.canUserPerformAnyActionOnOrder(order.id) &&
        getters.canUserConfirmOrderForOthers &&
        getters.orderCanBeConfirmedFor(order)
      ) ? true : false;
    },

    /**
     * Возвращает true, если пользователь может подтвердить распоряжение за его адресатов
     * в рамках станции (т.е. подтвердить за конкретные рабочие места на станции).
     * Если распоряжение издается вне станции и станция - его адресат, то подтвердить за все
     * рабочие места на станции может лишь ДСП.
     * Если распоряжение издается на рабочем месте на станции, то подтвердить за все рабочие места
     * на станции можно лишь с того рабочего места, на котором распоряжение было издано.
     * Возвращает false, если текущий пользователь не имеет права подтверждать распоряжение
     * за других в рамках станции.
     */
    orderCanBeConfirmedForOnStation(_state, getters) {
      return (order) => {
        if (!getters.isStationWorkPoligonSpecialist) {
          return false;
        }
        const userWorkPoligon = getters.getUserWorkPoligon;
        return (
          // проверка рабочего полигона (издано ли распоряжение на данном рабочем полигоне?)
          getters.orderCanBeConfirmedFor(order) ||
          // если распоряжение не издано на текущем полигоне управления, то оно должно быть адресовано текущему
          // глобальному полигону (станции), а текущий пользователь должен быть именно ДСП (не Оператор!)
          (
            getters.isDSP && order && order.receivers && userWorkPoligon && order.receivers.find((el) =>
              (el.type === userWorkPoligon.type) &&
              (String(el.id) === String(userWorkPoligon.code))
            )
          )
        ) ? true : false;
      };
    },

    /**
     * Проверка возможности подтвердить распоряжение за других лиц - получателей копии данного распоряжения -
     * на станции в текущий момент времени текущим пользователем.
     */
    canOrderBeConfirmedForOnStation(_state, getters) {
      return (order) => (
        order &&
        getters.canUserPerformAnyActionOnOrder(order.id) &&
        getters.canUserConfirmOrdersForOthersOnStationWorkPlaces &&
        getters.orderCanBeConfirmedForOnStation(order)
      ) ? true : false;
    },

    /**
     * Проверка возможности определить дополнительных адресатов распоряжения
     * (лиц, которые дополнительно ознакомились с ним).
     * Делать это может только ДСП, находящийся на дежурстве (не оператор, а именно сам ДСП - главный на станции!).
     */
    canSetAdditionallyInformedPeopleForOrder(_state, getters) {
      return (order) => (
        order &&
        getters.canUserPerformAnyActionOnOrder(order.id) &&
        getters.isDSP &&
        getters.isUserOnDuty
      ) ? true : false;
    },

    /**
     * Возвращает true, если возможно удаление адресата распоряжения из списка адресатов на рабочих
     * местах станции, false - в противном случае.
     * Удаление адресата - лишь удаление его из списка адресатов (рабочих мест) станции, это удаление
     * не подразумевает удаления распоряжения из списка рабочих распоряжений на соответствующем рабочем
     * месте станции.
     * Если распоряжение издается вне станции и станция - его адресат, то удалить рабочее место из списка
     * адресатов на станции может только ДСП.
     * Если распоряжение издается на станции, то удалить рабочее место из списка адресатов на станции
     * может только его издатель (т.е. это возможно сделать только с того рабочего места, на котором
     * данное распоряжение было издано).
     */
    orderStationWorkPlaceReceiverCanBeDeleted(_state, getters) {
      return (order) => {
        if (!getters.isStationWorkPoligonSpecialist) {
          return false;
        }
        const userWorkPoligon = getters.getUserWorkPoligon;
        return (
          // проверка рабочего полигона (издано ли распоряжение на данном рабочем полигоне?)
          getters.orderCanBeConfirmedFor(order) ||
          // если распоряжение не издано на текущем полигоне управления, то оно должно быть адресовано текущему
          // глобальному полигону (станции), а текущий пользователь должен быть именно ДСП (не Оператор!)
          (
            getters.isDSP && order && order.receivers && userWorkPoligon && order.receivers.find((el) =>
              (el.type === userWorkPoligon.type) &&
              (String(el.id) === String(userWorkPoligon.code))
            )
          )
        ) ? true : false;
      };
    },

    /**
     * Проверка возможности удалить получателя распоряжения на станции в текущий момент времени
     * текущим пользователем.
     */
    canOrderBeDeletedStationWorkPlaceReceiver(_state, getters) {
      return (order) => (
        order &&
        getters.canUserPerformAnyActionOnOrder(order.id) &&
        getters.canUserDeleteOrderStationReceivers &&
        getters.orderStationWorkPlaceReceiverCanBeDeleted(order)
      ) ? true : false;
    },

    /**
     * Проверка возможности удалить цепочку распоряжений текущим пользователем.
     */
    canOrdersChainBeDeleted(_state, getters) {
      return ({ orderId, orderChainId, orderChainEndDateTime }) => (
        // над распоряжением можно в данный момент выполнять какие-либо действия
        getters.canUserPerformAnyActionOnOrder(orderId) &&
        // пользователь имеет право удалять цепочки распоряжений
        getters.canUserDelConfirmedOrdersChains &&
        // цепочка, которой принадлежит распоряжение, не является действующей
        getters.workOrderChainIsInactive({ orderChainId, orderChainEndDateTime, considerAllOrdersConfirmation: true })
      ) ? true : false;
    },

    /**
     * Проверка возможности издавать распоряжения на основании выбранного текущим пользователем распоряжения.
     */
    canDispatchOrdersConnectedToGivenOrder(_state, getters) {
      return (orderId) => (
        getters.canUserPerformAnyActionOnOrder(orderId) &&
        getters.canUserDispatchOrders &&
        getters.isOrderActive(orderId)
      ) ? true : false;
    },

    /**
     *
     */
    orderDispatchedByTheCurrentUser(_state, getters) {
      return (order) => order.creator.id === getters.getUserId;
    },

    /**
     * Проверка возможности отметить рабочий документ как недействительный.
     * Возвращает true, если пользователь может пометить распоряжение как недействительное.
     * Это возможно в том случае, если распоряжение было издано на том рабочем полигоне, на
     * котором работает пользователь, и именно этим пользователем, при этом это распоряжение не является
     * помеченным как недействительное. Пользователь должен быть на дежурстве.
     * Возвращает false, если текущий пользователь не имеет права пометить распоряжение как недействительное.
     */
    canMarkOrderAsInvalid(_state, getters) {
      return (order) => (
        getters.canUserPerformAnyActionOnOrder(order.id) &&
        getters.canUserToggleOrderInvalidMark &&
        getters.orderDispatchedOnCurrentWorkPoligon(order) &&
        getters.orderDispatchedByTheCurrentUser(order) &&
        !order.invalid
      ) ? true : false;
    },

    /**
     * Проверка возможности отметить рабочий документ как действительный.
     * Возвращает true, если пользователь может пометить распоряжение как действительное.
     * Это возможно в том случае, если распоряжение было издано на том рабочем полигоне, на
     * котором работает пользователь, и именно этим пользователем, при этом это распоряжение является
     * помеченным как недействительное. Пользователь должен быть на дежурстве.
     * Возвращает false, если текущий пользователь не имеет права пометить распоряжение как действительное.
     */
    canMarkOrderAsValid(_state, getters) {
      return (order) => (
        getters.canUserPerformAnyActionOnOrder(order.id) &&
        getters.canUserToggleOrderInvalidMark &&
        getters.orderDispatchedOnCurrentWorkPoligon(order) &&
        getters.orderDispatchedByTheCurrentUser(order) &&
        order.invalid
      ) ? true : false;
    },
  },
};
