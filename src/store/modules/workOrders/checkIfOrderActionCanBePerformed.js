import { WORK_POLIGON_TYPES } from "@/constants/appCredentials";

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
     * 1) в настоящее время не должна удаляться цепочка, которой принадлежит это распоряжение,
     * 2) распоряжение не должно проходить процедуру подтверждения за других,
     * 3) у распоряжения не должен удаляться его получатель на станции,
     * 4) у распоряжения не должен меняться его флаг валидности,
     * 5) цепочка, которой принадлежит распоряжение, не должна находиться в процессе [отмены] принудительного завершения.
     * Все вышеуказанные операции - длительные: требуют обращения к серверу.
     */
    canUserPerformAnyActionOnOrder(_state, getters) {
      return (orderId) => (
        !getters.getOrdersChainsBeingDeleted.includes(orderId) &&
        !getters.isOrderBeingConfirmedForOthers(orderId) &&
        !getters.isOrderBeingDeletedStationWorkPlaceReceiver(orderId) &&
        !getters.isOrderBeingChangedItsInvalidMark(orderId) &&
        !getters.isOrderBelongsToChainBeingForcelyClosedOrOpened(orderId)
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
          order?.senderWorkPoligon && userWorkPoligon &&
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
     * Возвращает true, если распоряжение было издано на текущем ГЛОБАЛЬНОМ рабочем полигоне (участок ДНЦ/ЭЦД либо станция),
     * false - в противном случае.
     * В случае ДСП и иного работника станции - в частности, Оператора при ДСП этой же станции - их ГЛОБАЛЬНЫЙ рабочий полигон -
     * один и тот же: станция.
     */
    orderDispatchedOnCurrentGlobalWorkPoligon(_state, getters) {
      return (order) => {
        const userWorkPoligon = getters.getUserWorkPoligon;
        return (
          order?.senderWorkPoligon && userWorkPoligon &&
          (order.senderWorkPoligon.type === userWorkPoligon.type) &&
          (String(order.senderWorkPoligon.id) === String(userWorkPoligon.code))
        ) ? true : false;
      };
    },

    orderDispatchedOnCurrentStation(_state, getters) {
      return (order) => {
        const userWorkPoligon = getters.getUserWorkPoligon;
        if (userWorkPoligon?.type !== WORK_POLIGON_TYPES.STATION)
          return false;
        return (
          order?.senderWorkPoligon && (order.senderWorkPoligon.type === userWorkPoligon.type) &&
          (String(order.senderWorkPoligon.id) === String(userWorkPoligon.code))
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
     *
     * Не запрещается подтверждать недействительные документы.
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
     * Возвращает true, если пользователь может подтвердить документ (в целом) за его адресатов
     * в рамках станции (т.е. подтвердить за конкретные рабочие места на станции).
     * Если распоряжение издается вне станции и станция - его адресат, то подтвердить за все
     * рабочие места на станции может лишь ДСП.
     * Если распоряжение издается на рабочем месте станции, то подтвердить за все рабочие места
     * на станции можно лишь с того рабочего места, на котором распоряжение было издано - это справедливо
     * только в отношении рабочих мест Операторов при ДСП.
     * Если документ издается Руководителем работ на станции, то подтвердить за адресатов документа в рамках станции
     * может только ДСП.
     * Возвращает false, если текущий пользователь не имеет права подтверждать распоряжение
     * за других в рамках станции.
     */
    orderCanBeConfirmedForOnStation(_state, getters) {
      return (order) => {
        if (!getters.isStationWorkPoligonSpecialist) {
          return false;
        }
        const userWorkPoligon = getters.getUserWorkPoligon;
        if (userWorkPoligon.type !== WORK_POLIGON_TYPES.STATION) {
          return false;
        }
        const orderDispatchedOnCurrentWorkPoligon = getters.orderDispatchedOnCurrentWorkPoligon(order);
        const orderDispatchedOnCurrentStation = getters.orderDispatchedOnCurrentStation(order);
        return (
          // проверяем, издан ли документ на данном рабочем месте станции и является ли текущий пользователь
          // ДСП либо Оператором при ДСП
          (
            orderDispatchedOnCurrentWorkPoligon && getters.isDSP_or_DSPoperator
          ) ||
          // проверяем, издан ли документ на текущей станции и является ли текущий пользователь ДСП
          (
            orderDispatchedOnCurrentStation && getters.isDSP
          ) ||
          // если распоряжение не издано на текущем полигоне управления, то оно должно быть адресовано текущему
          // глобальному полигону (станции), а текущий пользователь должен быть именно ДСП (не Оператор!)
          (
            getters.isDSP && order?.receivers && userWorkPoligon && order.receivers.find((el) =>
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
     *
     * Не запрещается подтверждать недействительные документы.
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
     * Проверка возможности подтвердить документ за другое рабочее место в рамках того же самого рабочего
     * полигона "Станция", на котором работает текущий пользователь.
     * Это право имеет ДСП в отношении всех рабочих мест в случае документа, пришедшего на станцию с другого рабочего полигона.
     * Это право есть у ДСП / Оператора при ДСП в отношении всех рабочих мест в случае документа, изданного на рабочем месте
     * этого ДСП / Оператора при ДСП.
     * Это право есть у ДСП в отношении всех рабочих мест в случае документа, изданного на данном рабочем полигоне "Станция"
     * на рабочем месте Руководителя работ.
     * Это право есть у Руководителя работ в отношении только рабочего места ДСП в случае документа, изданного на данном
     * рабочем месте Руководителя работ.
     */
    canOrderBeConfirmedForOnStationWorkPlace(_state, getters) {
      return (order, stationWorkPlaceId) => {
        const userWorkPoligon = getters.getUserWorkPoligon;
        if (userWorkPoligon.type !== WORK_POLIGON_TYPES.STATION) {
          return false;
        }
        if (!order || !getters.canUserPerformAnyActionOnOrder(order.id) || !getters.canUserConfirmOrdersForOthersOnStationWorkPlaces)
          return false;
        // Документ издан на текущем рабочем месте рабочего полигона "Станция"
        if (getters.orderDispatchedOnCurrentWorkPoligon(order)) {
          if (getters.isDSP_or_DSPoperator)
            return true;
          if (getters.isStationWorksManager && !stationWorkPlaceId)
            return true;
        // Документ издан на текущем рабочем полигоне "Станция"
        } else if (getters.orderDispatchedOnCurrentStation(order)) {
          if (getters.isDSP && stationWorkPlaceId)
            return true;
        // Документ издан на рабочем полигоне, отличном от текущего
        } else {
          return (
            getters.isDSP && order?.receivers && userWorkPoligon && order.receivers.find((el) =>
              (el.type === userWorkPoligon.type) &&
              (String(el.id) === String(userWorkPoligon.code))
            )
          );
        }
        return false;
      };
    },

    /**
     * Проверка возможности определить дополнительных адресатов распоряжения
     * (лиц, которые дополнительно ознакомились с ним).
     * Делать это может только ДСП, находящийся на дежурстве (не оператор, а именно сам ДСП - главный на станции!).
     *
     * Не запрещается делать это в отношении недействительных документов.
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
     * данное распоряжение было издано) - это справедливо только в отношении рабочих мест Операторов при ДСП.
     * Если документ издается Руководителем работ на станции, то удалить адресатов документа в рамках станции
     * может только ДСП.
     */
    orderStationWorkPlaceReceiverCanBeDeleted(_state, getters) {
      return (order) => {
        if (!getters.isStationWorkPoligonSpecialist) {
          return false;
        }
        const userWorkPoligon = getters.getUserWorkPoligon;
        if (userWorkPoligon.type !== WORK_POLIGON_TYPES.STATION) {
          return false;
        }
        const orderDispatchedOnCurrentWorkPoligon = getters.orderDispatchedOnCurrentWorkPoligon(order);
        const orderDispatchedOnCurrentStation = getters.orderDispatchedOnCurrentStation(order);
        return (
          // проверяем, издан ли документ на данном рабочем месте станции и является ли текущий пользователь
          // ДСП либо Оператором при ДСП
          (
            orderDispatchedOnCurrentWorkPoligon && getters.isDSP_or_DSPoperator
          ) ||
          // проверяем, издан ли документ на текущей станции и является ли текущий пользователь ДСП
          (
            orderDispatchedOnCurrentStation && getters.isDSP
          ) ||
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
     *
     * Не запрещается делать это в отношении недействительных документов.
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
     * Цепочка распоряжений удаляется только из коллекции рабочих распоряжений.
     */
    canOrdersChainBeDeleted(_state, getters) {
      return ({ orderId, orderChainId, orderChainEndDateTime }) => (
        // над распоряжением можно в данный момент выполнять какие-либо действия
        getters.canUserPerformAnyActionOnOrder(orderId) &&
        // пользователь имеет право удалять цепочки распоряжений
        getters.canUserDelConfirmedOrdersChains &&
        // цепочка, которой принадлежит распоряжение, не является действующей - это очень важное условие,
        // т.к. если пользователь удалит действующую цепочку, то она так и останется действующей навсегда,
        // будет вечно висеть в основной коллекции распоряжений как действующая, поправить ситуацию сможет только
        // программист или системный администратор
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
        getters.isOrderActive(orderId) &&
        getters.isOrderValid(orderId)
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
     * Это возможно в том случае, если:
     *   - распоряжение было издано на том рабочем полигоне, на котором работает пользователь, и именно этим пользователем,
     *   - распоряжение не является помеченным как недействительное,
     *   - пользователь должен быть на дежурстве.
     * Возвращает false, если текущий пользователь не имеет права пометить распоряжение как недействительное.
     */
    canMarkOrderAsInvalid(_state, getters) {
      return (order) => (
        getters.canUserPerformAnyActionOnOrder(order.id) &&
        getters.canUserToggleOrderInvalidMark &&
        getters.orderDispatchedOnCurrentWorkPoligon(order) &&
        getters.orderDispatchedByTheCurrentUser(order) &&
        getters.isOrderValid(order.id)
      ) ? true : false;
    },

    /**
     * Проверка возможности запуска процесса принудительного завершения цепочки, которой принадлежит заданное распоряжение, в БД.
     * Возвращает true, если пользователь может это сделать.
     * Это возможно в том случае, если:
     *   - распоряжение было издано на том ГЛОБАЛЬНОМ рабочем полигоне, на котором работает пользователь (под ГЛОБАЛЬНЫМ рабочим
     *     полигоном понимается участок ДНЦ/ЭЦД либо станция; не является глобальным рабочим полигоном некоторое рабочее место
     *     со своим id в рамках глобального рабочего полигона, в частности, рабочее место руководителя работ либо оператора при
     *     ДСП - не глобальные рабочие места, соответствующее им глобальное рабочее место - станция),
     *   - это распоряжение не является помеченным как недействительное,
     *   - цепочка, которой принадлежит распоряжение, не должна иметь даты окончания действия,
     *   - пользователь должен быть на дежурстве и обладать соответствующими правами.
     * Возвращает false, если текущий пользователь не имеет права выполнить указанное действие.
     */
    canForcelyCloseOrderChain(_state, getters) {
      return (order) => (
        getters.canUserPerformAnyActionOnOrder(order.id) &&
        getters.canUserForcelyCloseOrOpenOrdersChain &&
        getters.orderDispatchedOnCurrentGlobalWorkPoligon(order) &&
        !order.orderChainEndDateTime &&
        getters.isOrderValid(order.id)
      ) ? true : false;
    },
  },
};
