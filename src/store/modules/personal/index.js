import { getCurrSectorShift } from './getCurrSectorShift';
import { dnc } from './dnc';
import { dsp } from './dsp';
import { ecd } from './ecd';
import { otherShift } from './otherShift';
import { onlinePersonal } from './onlinePersonal';
import { common } from './common';


/**
 * Для работы со сменным персоналом смежных, ближайших участков (ДНЦ, ЭЦД) и станций.
 * А также для работы с виртуальным персоналом (персоналом, не зарегистрированным в системе,
 * но который должен фигурировать в текстах распоряжений).
 */
export const personal = {
  state: {
    sectorPersonal: {},
    loadingCurrShift: false,
    errorLoadingCurrShift: null,
  },

  getters: {
    ...getCurrSectorShift.getters,
    ...dnc.getters,
    ...dsp.getters,
    ...ecd.getters,
    ...otherShift.getters,
  },

  mutations: {
    ...getCurrSectorShift.mutations,
    ...dnc.mutations,
    ...dsp.mutations,
    ...ecd.mutations,
    ...otherShift.mutations,
    ...onlinePersonal.mutations,
    ...common.mutations,
  },

  actions: {
    ...common.actions,
    ...getCurrSectorShift.actions,
  },
};
