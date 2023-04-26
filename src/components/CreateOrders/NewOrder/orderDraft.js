import { computed } from 'vue';
import {
  SAVE_ORDER_DRAFT_ACTION,
  EDIT_ORDER_DRAFT_ACTION,
} from '@/store/action-types';
import {
  FILLED_ORDER_INPUT_ELEMENTS,
  FILLED_ORDER_DROPDOWN_ELEMENTS,
  FILLED_ORDER_SELECT_MULTIPLE_ELEMENTS,
  ORDER_PLACE_VALUES,
} from '@/constants/orders';
import {
  OrderPatternElementType,
  ORDER_PATTERN_TYPES,
} from '@/constants/orderPatterns';
import { formShortOrderInfo } from '@/additional/formShortOrderInfo';

/**
 * Данный модуль предназначен для работы с черновиком распоряжения.
 */
export const useOrderDraft = (inputVals) => {
  const { state, props, store, confirm, getOrderPatternElementValue, isECD } = inputVals;

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
    const orderPlaceFromText = getOrderPatternElementValue({ elTypesRefs: [
      [OrderPatternElementType.SELECT, FILLED_ORDER_DROPDOWN_ELEMENTS.BLOCK],
      [OrderPatternElementType.SELECT, FILLED_ORDER_DROPDOWN_ELEMENTS.BLOCK_ACTION_PLACE],
      [OrderPatternElementType.SELECT, FILLED_ORDER_DROPDOWN_ELEMENTS.STATION],
      [OrderPatternElementType.SELECT, FILLED_ORDER_DROPDOWN_ELEMENTS.STATION_ACTION_PLACE],
      [OrderPatternElementType.MULTIPLE_SELECT, FILLED_ORDER_SELECT_MULTIPLE_ELEMENTS.BLOCK],
      [OrderPatternElementType.MULTIPLE_SELECT, FILLED_ORDER_SELECT_MULTIPLE_ELEMENTS.STATION],
    ] });
    const orderTrackFromText = getOrderPatternElementValue({ elTypesRefs: [
      [OrderPatternElementType.INPUT, FILLED_ORDER_INPUT_ELEMENTS.TRACK],
    ] });
    const naryadDopuskOrRequestFromText = getOrderPatternElementValue({ elTypesRefs: [
      [OrderPatternElementType.SELECT, FILLED_ORDER_DROPDOWN_ELEMENTS.NARYAD_DOPUSK_REQUEST_REF],
    ] });
    const specialNumberFromText = getOrderPatternElementValue({ elTypesRefs: [
      [OrderPatternElementType.INPUT, FILLED_ORDER_INPUT_ELEMENTS.SPECIAL_NUMBER_REF],
    ] });

    // Название черновика документа (которое позволит этот черновик в последующем быстро найти)
    const fullOrderTitle =
      // для запрещений ЭЦД в начале строки идет информация по адресатам на станциях, для всех остальных типов документов -
      // информация об иных адресатах
      isECD
      ? (
          (props.orderType === ORDER_PATTERN_TYPES.ECD_PROHIBITION)
            ? `${state.dspSectorsToSendOrder?.length ? state.dspSectorsToSendOrder.map(val => 'ДСП ' + store.getters.getSectorStationOrBlockTitleById({ placeType: ORDER_PLACE_VALUES.station, id: val.id, addStationUNMC: false }) || '?').join(', ') + '. ' : ''}`
            : `${state.otherSectorsToSendOrder?.length ? state.otherSectorsToSendOrder.map(val => val.placeTitle).join(', ') + '. ' : ''}`
        ) +
        (orderPlaceFromText ? orderPlaceFromText + '. ' : '') +
        (orderTrackFromText ? 'Путь ' + orderTrackFromText + '. ' : '' ) +
        state.orderText.orderTitle + '.' +
        (naryadDopuskOrRequestFromText ? ' ' + naryadDopuskOrRequestFromText : '') +
        (specialNumberFromText ? ' ' + specialNumberFromText : '')
      :
      formShortOrderInfo(state.orderText.orderText, true, false, true, state.otherSectorsToSendOrder);

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
            orderText: { ...state.orderText, fullOrderTitle, },
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
            orderText: { ...state.orderText, fullOrderTitle, },
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
