export const checkIfOrderActionCanBePerformed = {
  getters: {
    /**
     * Проверка возможности выполнения любого действия над рабочим распоряжением с точки зрения
     * "свободности" данного распоряжения для выполнения над ним каких-либо действий.
     */
    canUserPerformAnyActionOnOrder(_state, getters) {
      return (orderId) => (
        !getters.getOrdersChainsBeingDeleted.includes(orderId) &&
        !getters.isOrderBeingConfirmedForOthers(orderId) &&
        !getters.isOrderBeingDeletedStationWorkPlaceReceiver(orderId)
      ) ? true : false;
    },

    /**
     * Возвращает true, если пользователь может подтвердить распоряжение за его адресатов
     * (т.е. за те полигоны, которые присутствовали в секции "Кому" при издании распоряжения).
     * Это возможно в том случае, если распоряжение было издано на том рабочем полигоне, на
     * котором работает пользователь (в случае ДСП и оператора ДСП одной станции: их рабочие
     * полигоны - разные: рабочий полигон = рабочее место).
     * Возвращает false, если текущий пользователь не имеет права подтверждать распоряжение
     * за других.
     */
    orderCanBeConfirmedFor(_state, getters) {
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
     * в рамках станции (т.е. подтвердить за конкретные рабочие места).
     * Это возможно в том случае, если распоряжение было издано на том рабочем полигоне, на
     * котором работает пользователь (в случае ДСП и оператора ДСП одной станции: их рабочие
     * полигоны - разные: рабочий полигон = рабочее место), либо если распоряжение адресовалось
     * текущей станции в момент его издания (в этом случае за других может подтвердить распоряжение
     * как ДСП, так и Оператор при ДСП).
     * Возвращает false, если текущий пользователь не имеет права подтверждать распоряжение
     * за других в рамках станции.
     */
    orderCanBeConfirmedForOnStation(_state, getters) {
      return (order) => {
        const userWorkPoligon = getters.getUserWorkPoligon;
        return (
          // проверка рабочего полигона (издано ли распоряжение на данном рабочем полигоне?)
          getters.orderCanBeConfirmedFor(order) ||
          // проверка глобального адресата (самой станции)
          (
            order && order.receivers && userWorkPoligon && order.receivers.find((el) =>
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
     * Возвращает true, если возможно удаление адресата распоряжения из списка адресатов на рабочих
     * местах станции, false - в противном случае.
     * Удаление возможно в том случае, если распоряжение было издано на том рабочем полигоне, на
     * котором работает пользователь (в случае ДСП и оператора ДСП одной станции: их рабочие
     * полигоны - разные: рабочий полигон = рабочее место), либо если копия распоряжения была
     * адресована конкретно этому рабочему месту на станции, либо если распоряжение адресовалось
     * текущей станции в момент его издания (в этом случае удалить информацию об адресате распоряжения
     * на рабочем месте станции может как ДСП, так и Оператор при ДСП).
     */
    orderStationWorkPlaceReceiverCanBeDeleted(_state, getters) {
      return (order, workPoligonType, workPoligonId, workPlaceId) => {
        const userWorkPoligon = getters.getUserWorkPoligon;
        return (
          // проверка рабочего полигона (издано ли распоряжение на данном рабочем полигоне?)
          getters.orderCanBeConfirmedFor(order) ||
          // проверка локального адресата (рабочего места на станции)
          (
            userWorkPoligon && (userWorkPoligon.type === workPoligonType) &&
            (String(userWorkPoligon.code) === String(workPoligonId)) &&
            (
              (!userWorkPoligon.subCode && !workPlaceId) ||
              (userWorkPoligon.subCode && workPlaceId && String(userWorkPoligon.subCode) === String(workPlaceId))
            )
          ) ||
          // проверка глобального адресата (самой станции)
          (
            order && order.receivers && userWorkPoligon && order.receivers.find((el) =>
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
      return ({ order, workPlaceType, workPlaceId, workPoligonId }) => (
        order &&
        getters.canUserPerformAnyActionOnOrder(order.id) &&
        getters.canUserDeleteOrderStationReceivers &&
        getters.orderStationWorkPlaceReceiverCanBeDeleted(order, workPlaceType, workPlaceId, workPoligonId)
      ) ? true : false;
    },

    /**
     * Проверка возможности удалить цепочку распоряжений текущим пользователем.
     */
    canOrdersChainBeDeleted(_state, getters) {
      return (order) => (
        order &&
        getters.canUserPerformAnyActionOnOrder(order.id) &&
        getters.canUserDelConfirmedOrdersChains
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
  },
};
