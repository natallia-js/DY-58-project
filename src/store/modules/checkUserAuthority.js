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
     * Любой пользователь, принявший дежурство, может подтвержать приходящие ему распоряжения.
     */
    canUserConfirmOrder(_state, getters) {
      return getters.canUserWorkWithSystem && getters.isUserOnDuty;
    },

    /**
     * Любой пользователь, принявший дежурство, может удалять цепочки подтвержденных распоряжений
     * из списка распоряжений, находящихся в работе.
     */
    canUserDelConfirmedOrdersChains(_state, getters) {
      return getters.canUserWorkWithSystem && getters.isUserOnDuty;
    },

    /**
     * Подтвердить распоряжение за других может лишь находящийся на дежурстве пользователь.
     */
    canUserConfirmOrderForOthers(_state, getters) {
      return getters.canUserWorkWithSystem && getters.isUserOnDuty;
    },

    /**
     * Издавать распоряжения может лишь пользователь, принявший дежурство.
     */
    canUserDispatchOrders(_state, getters) {
      return getters.canUserWorkWithSystem && getters.isUserOnDuty;
    },

    /**
     * Возвращает true, если текущий пользователь на дежурстве и является ДСП либо Оператором при ДСП.
     * В этом случае он может издавать распоряжения о принятии дежурства.
     * Значение false возвращается в противном случае.
     */
    canUserDispatchDSPTakeDutyOrder(_state, getters) {
      return getters.canUserWorkWithSystem && getters.isUserOnDuty && getters.isDSP_or_DSPoperator;
    },

    /**
     * Возвращает true, если текущий пользователь имеет право подтверждать рабочие распоряжения за других
     * лиц на станции (такое право есть у ДСП и Операторов ДСП в отношении всех рабочих мест на их станции).
     */
    canUserConfirmOrdersForOthersOnStationWorkPlaces(_state, getters) {
      return getters.canUserWorkWithSystem && getters.isUserOnDuty && getters.isDSP_or_DSPoperator;
    },

    /**
     * Возвращает true, если текущий пользователь имеет право удалять
     */
    canUserDeleteOrderStationReceivers(_state, getters) {
      return getters.canUserWorkWithSystem && getters.isUserOnDuty && getters.isDSP_or_DSPoperator;
    },
  },
};
