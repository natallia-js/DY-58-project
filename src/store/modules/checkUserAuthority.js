export const checkUserAuthority = {
  getters: {
    /**
     * Любой пользователь, принявший дежурство, может подтвержать приходящие ему распоряжения.
     */
    canUserConfirmOrder(_state, getters) {
      return getters.isUserOnDuty;
    },

    /**
     * Любой пользователь, принявший дежурство, может удалять цепочки подтвержденных распоряжений
     * из списка распоряжений, находящихся в работе.
     */
    canUserDelConfirmedOrdersChains(_state, getters) {
      return getters.isUserOnDuty;
    },

    /**
     * Подтвердить распоряжение за других может лишь находящийся на дежурстве пользователь, который
     * не является работником вложенного рабочего полигона (например, не является оператором при ДСП).
     */
    canUserConfirmOrderForOthers(_state, getters) {
      return getters.isUserOnDuty && getters.getUserWorkPoligon && !getters.getUserWorkPoligon.subCode;
    },

    /**
     * Издавать распоряжения может лишь пользователь, принявший дежурство, но не оператор при ДСП.
     */
     canUserDispatchOrders(_state, getters) {
      return getters.isUserOnDuty && !getters.isDSPoperator;
    },
  },
};
