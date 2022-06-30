import { computed } from 'vue';
import {
  SAVE_ORDER_DRAFT_ACTION,
  EDIT_ORDER_DRAFT_ACTION,
} from '@/store/action-types';

/**
 * Данный модуль предназначен для работы с черновиком распоряжения.
 */
 export const useOrderDraft = (inputVals) => {
  const { state, props, store, confirm } = inputVals;

  // Объект текущего черновика распоряжения (объект либо null)
  const currentOrderDraft = computed(() =>
    state.currentOrderDraftId ? store.getters.getOrderDraftById(state.currentOrderDraftId) : null);

  /**
   * Позволяет сохранить черновик распоряжения.
   * Если при сохранении черновика выясняется, что этот черновик был выбран пользователем и просто
   * отредактирован, то в БД просто происходит редактирование существующего черновика, в противном
   * случае в БД создается новая запись о черновике.
   *
   * При сохранении черновика не производится проверка корректности заполнения полей данных (на форме).
   */
  const handleSaveOrderDraft = (event) => {
    confirm.require({
      target: event.currentTarget,
      group: 'confirmSaveOrderDraft',
      message: 'Сохранить черновик распоряжения?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (!currentOrderDraft.value) {
          // Создание нового черновика
          store.dispatch(SAVE_ORDER_DRAFT_ACTION, {
            type: props.orderType,
            createDateTime: state.createDateTime,
            place: state.orderPlace,
            timeSpan: state.timeSpan,
            defineOrderTimeSpan: state.defineOrderTimeSpan,
            orderText: state.orderText,
            dncToSend: state.dncSectorsToSendOrder.map((el) => ({
              id: el.id,
              type: el.type,
              fioId: el.fioId,
              sendOriginal: el.sendOriginal,
            })) || [],
            dspToSend: state.dspSectorsToSendOrder.map((el) => ({
              id: el.id,
              type: el.type,
              fioId: el.fioId,
              sendOriginal: el.sendOriginal,
            })) || [],
            ecdToSend: state.ecdSectorsToSendOrder.map((el) => ({
              id: el.id,
              type: el.type,
              fioId: el.fioId,
              sendOriginal: el.sendOriginal,
            })) || [],
            otherToSend: state.otherSectorsToSendOrder || [],
            createdOnBehalfOf: state.createdOnBehalfOf,
            showOnGID: state.showOnGID,
          });
        } else {
          // Редактирование существующего черновика
          store.dispatch(EDIT_ORDER_DRAFT_ACTION, {
            id: currentOrderDraft.value._id,
            type: props.orderType,
            place: state.orderPlace,
            timeSpan: state.timeSpan,
            defineOrderTimeSpan: state.defineOrderTimeSpan,
            orderText: state.orderText,
            dncToSend: state.dncSectorsToSendOrder.map((el) => ({
              id: el.id,
              type: el.type,
              fioId: el.fioId,
              sendOriginal: el.sendOriginal,
            })) || [],
            dspToSend: state.dspSectorsToSendOrder.map((el) => ({
              id: el.id,
              type: el.type,
              fioId: el.fioId,
              sendOriginal: el.sendOriginal,
            })) || [],
            ecdToSend: state.ecdSectorsToSendOrder.map((el) => ({
              id: el.id,
              type: el.type,
              fioId: el.fioId,
              sendOriginal: el.sendOriginal,
            })) || [],
            otherToSend: state.otherSectorsToSendOrder || [],
            createdOnBehalfOf: state.createdOnBehalfOf,
            showOnGID: state.showOnGID,
          });
        }
      },
    });
  };

  return {
    currentOrderDraft,
    handleSaveOrderDraft,
  };
};
