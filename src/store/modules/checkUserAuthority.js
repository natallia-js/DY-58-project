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
     * Подтвердить распоряжение за других может лишь находящийся на дежурстве пользователь.
     */
    canUserConfirmOrderForOthers(_state, getters) {
      return getters.isUserOnDuty;
    },

    /**
     * Издавать распоряжения может лишь пользователь, принявший дежурство.
     */
    canUserDispatchOrders(_state, getters) {
      return getters.isUserOnDuty;
    },

    /**
     * Возвращает true, если текущий пользователь на дежурстве и ДСП. В этом случае он
     * может издавать распоряжения о принятии дежурства.
     * Значение false возвращается в противном случае.
     */
    canUserDispatchDSPTakeDutyOrder(_state, getters) {
      return getters.isUserOnDuty && getters.isDSP;
    },
  },
};
