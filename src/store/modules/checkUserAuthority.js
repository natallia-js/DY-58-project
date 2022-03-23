export const checkUserAuthority = {
  getters: {
    /**
     * Работать с ДУ-58 может пользователь, прошедший процедуру аутентификации для работы с конкретным
     * рабочим полигоном и имеющий конкретные полномочия в системе.
     */
    canUserWorkWithSystem(_state, getters) {
      return getters.isUserAuthenticated && getters.getUserCredential && getters.getUserWorkPoligon;
    },

    /**
     * Пользователь, принявший дежурство, может получить количество входящих распоряжений с начала его
     * смены, если этот пользователь - ДНЦ, ЭЦД, ДСП либо Оператор при ДСП.
     */
    canUserGetIncomingOrdersPerShift(_state, getters) {
      return getters.canUserWorkWithSystem &&
        (getters.isDSP_or_DSPoperator || getters.isDNC || getters.isECD) &&
        getters.isUserOnDuty;
    },

    /**
     * Пользователь, принявший дежурство, может уведомлять о доставке распоряжений на его рабочий полигон
     * если этот пользователь - ДНЦ, ЭЦД, ДСП либо Оператор при ДСП.
     */
    canUserReportOnOrdersDelivery(_state, getters) {
      return getters.canUserWorkWithSystem &&
        (getters.isDSP_or_DSPoperator || getters.isDNC || getters.isECD) &&
        getters.isUserOnDuty;
    },

    /**
     * Пользователь, принявший дежурство, может подтвержать приходящие ему распоряжения,
     * если этот пользователь - ДНЦ, ЭЦД, ДСП либо Оператор при ДСП.
     */
    canUserConfirmOrder(_state, getters) {
      return getters.canUserWorkWithSystem &&
        (getters.isDSP_or_DSPoperator || getters.isDNC || getters.isECD) &&
        getters.isUserOnDuty;
    },

    /**
     * Пользователь, принявший дежурство, может удалять цепочки подтвержденных распоряжений
     * из списка распоряжений, находящихся в работе, если этот пользователь - ДНЦ, ЭЦД, ДСП либо
     * Оператор при ДСП.
     */
    canUserDelConfirmedOrdersChains(_state, getters) {
      return getters.canUserWorkWithSystem &&
        (getters.isDSP_or_DSPoperator || getters.isDNC || getters.isECD) &&
        getters.isUserOnDuty;
    },

    /**
     * Подтвердить распоряжение за других может лишь находящийся на дежурстве пользователь,
     * если он - ДНЦ, ЭЦД, ДСП либо Оператор при ДСП.
     */
    canUserConfirmOrderForOthers(_state, getters) {
      return getters.canUserWorkWithSystem &&
        (getters.isDSP_or_DSPoperator || getters.isDNC || getters.isECD) &&
        getters.isUserOnDuty;
    },

    /**
     * Издавать распоряжения может лишь пользователь, принявший дежурство,
     * если он - ДНЦ, ЭЦД, ДСП либо Оператор при ДСП.
     */
    canUserDispatchOrders(_state, getters) {
      return getters.canUserWorkWithSystem &&
        (getters.isDSP_or_DSPoperator || getters.isDNC || getters.isECD) &&
        getters.isUserOnDuty;
    },

    /**
     * Создавать записи о проверке распоряжений может лишь ревизор, принявший дежурство.
     */
    canUserDispatchControlRecords(_state, getters) {
      return getters.canUserWorkWithSystem && getters.isRevisor && getters.isUserOnDuty;
    },

    /**
     * Возвращает true, если текущий пользователь на дежурстве и является ДСП (не Оператором при ДСП!).
     * В этом случае он может издавать распоряжения о принятии дежурства.
     * Значение false возвращается в противном случае.
     */
    canUserDispatchDSPTakeDutyOrder(_state, getters) {
      return getters.canUserWorkWithSystem && getters.isUserOnDuty && getters.isDSP;
    },

    /**
     * Возвращает true, если текущий пользователь имеет право подтверждать рабочие распоряжения за других
     * лиц на станции (такое право есть у ДСП и Операторов ДСП в отношении всех рабочих мест на их станции).
     */
    canUserConfirmOrdersForOthersOnStationWorkPlaces(_state, getters) {
      return getters.canUserWorkWithSystem && getters.isUserOnDuty && getters.isDSP_or_DSPoperator;
    },

    /**
     * Возвращает true, если текущий пользователь имеет право удалять получателей распоряжения на станции.
     */
    canUserDeleteOrderStationReceivers(_state, getters) {
      return getters.canUserWorkWithSystem && getters.isUserOnDuty && getters.isDSP_or_DSPoperator;
    },

    /**
     * Получить параметры последних изданных распоряжений на полигоне управления может лишь
     * ДНЦ, ЭЦД, ДСП либо Оператор при ДСП.
     */
    canUserGetLastOrdersParams(_state, getters) {
      return getters.canUserWorkWithSystem &&
        (getters.isDSP_or_DSPoperator || getters.isDNC || getters.isECD);
    },

    /**
     * Получить черновики распоряжений, созданные на полигоне управления, может лишь
     * ДНЦ, ЭЦД, ДСП либо Оператор при ДСП.
     */
    canUserGetOrderDrafts(_state, getters) {
      return getters.canUserWorkWithSystem &&
        (getters.isDSP_or_DSPoperator || getters.isDNC || getters.isECD);
    },

    /**
     * Создавать, редактировать и удалять черновики распоряжений может лишь находящийся на дежурстве
     * ДНЦ, ЭЦД, ДСП либо Оператор при ДСП.
     */
    canUserWorkWithOrderDrafts(_state, getters) {
      return getters.canUserWorkWithSystem &&
        (getters.isDSP_or_DSPoperator || getters.isDNC || getters.isECD) &&
        getters.isUserOnDuty;
    },

    /**
     * Получить шаблоны распоряжений может лишь ДНЦ, ЭЦД, ДСП либо Оператор при ДСП.
     */
    canUserGetOrderPatterns(_state, getters) {
      return getters.canUserWorkWithSystem &&
        (getters.isDSP_or_DSPoperator || getters.isDNC || getters.isECD);
    },

    /**
     * Создавать, редактировать и удалять шаблоны распоряжений может лишь находящийся на дежурстве
     * ДНЦ, ЭЦД, ДСП либо Оператор при ДСП.
     */
    canUserWorkWithOrderPatterns(_state, getters) {
      return getters.canUserWorkWithSystem &&
        (getters.isDSP_or_DSPoperator || getters.isDNC || getters.isECD);
    },
  },
};
