import { getLocaleDateTimeString } from '@/additional/dateTimeConvertions';
import {
  ORDER_PATTERN_TYPES,
  SPECIAL_CLOSE_BLOCK_ORDER_SIGN,
  SPECIAL_OPEN_BLOCK_ORDER_SIGN,
  SPECIAL_ORDER_DSP_TAKE_DUTY_SIGN,
  SPECIAL_CIRCULAR_ORDER_SIGN,
} from '@/constants/orderPatterns';
import { APP_CREDENTIALS, WORK_POLIGON_TYPES } from '@/constants/appCredentials';
import { DSP_TAKE_ORDER_TEXT_ELEMENTS_REFS, FILLED_ORDER_INPUT_ELEMENTS } from '@/constants/orders';
import { getUserFIOString } from '@/store/modules/personal/transformUserData';


/**
 * Определяет допустимые связи между документами (при их создании) для разных категорий пользователей системы.
 * initialDocType - тип документа (исходный документ), на основании которого можно создать новый документ
 * initialDocSpecialMarks - специальные отметки, которые должны быть у исходного документа
 * excludeInitialDocSpecialMarks - специальные отметки, которых не должно быть у исходного документа
 * userCredentials - полномочия текущего пользователя
 * possibleNewDocTypes - типы документов, которые текущий пользователь может создать на основании исходного документа
 * ! исходный документ должен быть действующим
 * Допустимые взаимосвязи документов:
 *   Издатель                  Исходный документ                        Связанный документ
 *     ДНЦ             Распоряжение на закрытие перегона        Распоряжение, Заявка, Уведомление
 *     ДСП             Распоряжение на закрытие перегона        Заявка, Уведомление
 *     ЭЦД             Распоряжение на закрытие перегона        Запрещение
 *     ДНЦ             Действующее распоряжение (действует      Распоряжение, Заявка, Уведомление
 *                     до отмены) - кроме распоряжения о
 *                     приеме-сдаче дежурства
 *     ДСП             Действующее распоряжение (действует      Заявка, Уведомление
 *                     до отмены) - кроме распоряжения о
 *                     приеме-сдаче дежурства
 *     ЭЦД             Действующее распоряжение (действует      Приказ, Запрещение, Уведомление / отмена запрещения ЭЦД
 *                     до отмены) - кроме распоряжения о
 *                     приеме-сдаче дежурства
 *     ДНЦ             Заявка (ДСП)                             Распоряжение, Заявка, Уведомление
 *     ДСП, руково-    Заявка (ДСП)                             Заявка, Уведомление
 *     дитель работ
 *     на станции
 *     ЭЦД             Заявка (ДСП)                             -
 *     ДНЦ             Уведомление (ДСП)                        Распоряжение
 *     ДСП             Уведомление (ДСП)                        -
 *     ДНЦ             Приказ ЭЦД                               -
 *     ДСП             Приказ ЭЦД                               -
 *     ЭЦД             Приказ ЭЦД                               Уведомление ЭЦД об отмене приказа ЭЦД
 *     ДНЦ             Запрещение ЭЦД                           -
 *     ДСП             Запрещение ЭЦД                           -
 *     ЭЦД             Запрещение ЭЦД                           Уведомление ЭЦД об отмене запрещения ЭЦД
 */
const POSSIBLE_DOCS_CONNECTIONS = [
  {
    initialDocType: ORDER_PATTERN_TYPES.ORDER,
    initialDocSpecialMarks: [SPECIAL_CLOSE_BLOCK_ORDER_SIGN],
    excludeInitialDocSpecialMarks: [SPECIAL_CIRCULAR_ORDER_SIGN, SPECIAL_ORDER_DSP_TAKE_DUTY_SIGN],
    newDocsInfo: [
      {
        userCredentials: [APP_CREDENTIALS.DNC_FULL],
        possibleNewDocTypes: [ORDER_PATTERN_TYPES.ORDER, ORDER_PATTERN_TYPES.REQUEST, ORDER_PATTERN_TYPES.NOTIFICATION],
      },
      {
        userCredentials: [APP_CREDENTIALS.DSP_FULL, APP_CREDENTIALS.DSP_Operator],
        possibleNewDocTypes: [ORDER_PATTERN_TYPES.REQUEST, ORDER_PATTERN_TYPES.NOTIFICATION],
      },
      {
        userCredentials: [APP_CREDENTIALS.ECD_FULL],
        possibleNewDocTypes: [ORDER_PATTERN_TYPES.ECD_PROHIBITION],
      },
    ],
  },
  {
    initialDocType: ORDER_PATTERN_TYPES.ORDER,
    excludeInitialDocSpecialMarks: [SPECIAL_CIRCULAR_ORDER_SIGN, SPECIAL_ORDER_DSP_TAKE_DUTY_SIGN],
    newDocsInfo: [
      {
        userCredentials: [APP_CREDENTIALS.DNC_FULL],
        possibleNewDocTypes: [ORDER_PATTERN_TYPES.ORDER, ORDER_PATTERN_TYPES.REQUEST, ORDER_PATTERN_TYPES.NOTIFICATION],
      },
      {
        userCredentials: [APP_CREDENTIALS.DSP_FULL],
        possibleNewDocTypes: [ORDER_PATTERN_TYPES.REQUEST, ORDER_PATTERN_TYPES.NOTIFICATION],
      },
      {
        userCredentials: [APP_CREDENTIALS.ECD_FULL],
        possibleNewDocTypes: [ORDER_PATTERN_TYPES.ECD_ORDER, ORDER_PATTERN_TYPES.ECD_PROHIBITION, ORDER_PATTERN_TYPES.ECD_NOTIFICATION],
      },
    ],
  },
  {
    initialDocType: ORDER_PATTERN_TYPES.REQUEST,
    newDocsInfo: [
      {
        userCredentials: [APP_CREDENTIALS.DNC_FULL],
        possibleNewDocTypes: [ORDER_PATTERN_TYPES.ORDER, ORDER_PATTERN_TYPES.REQUEST, ORDER_PATTERN_TYPES.NOTIFICATION],
      },
      {
        userCredentials: [APP_CREDENTIALS.DSP_FULL, APP_CREDENTIALS.DSP_Operator, APP_CREDENTIALS.STATION_WORKS_MANAGER],
        possibleNewDocTypes: [ORDER_PATTERN_TYPES.REQUEST, ORDER_PATTERN_TYPES.NOTIFICATION],
      },
    ],
  },
  {
    initialDocType: ORDER_PATTERN_TYPES.NOTIFICATION,
    newDocsInfo: [
      {
        userCredentials: [APP_CREDENTIALS.DNC_FULL],
        possibleNewDocTypes: [ORDER_PATTERN_TYPES.ORDER],
      },
    ],
  },
  {
    initialDocType: ORDER_PATTERN_TYPES.ECD_ORDER,
    excludeInitialDocSpecialMarks: [SPECIAL_CIRCULAR_ORDER_SIGN],
    newDocsInfo: [
      {
        userCredentials: [APP_CREDENTIALS.ECD_FULL],
        possibleNewDocTypes: [ORDER_PATTERN_TYPES.ECD_NOTIFICATION],
      },
    ],
  },
  {
    initialDocType: ORDER_PATTERN_TYPES.ECD_PROHIBITION,
    newDocsInfo: [
      {
        userCredentials: [APP_CREDENTIALS.ECD_FULL],
        possibleNewDocTypes: [ORDER_PATTERN_TYPES.ECD_NOTIFICATION],
      },
    ],
  },
];


/**
 * Данный модуль предназначен для работы с действующими рабочими распоряжениями.
 */
export const activeOrders = {
  getters: {
    /**
     * Возвращает true, если за распоряжением order в рамках его цепочки распоряжений следует
     * валидное распоряжение типа followerOrderType, в противном случае возвращает false.
     * Если дополнительно указан параметр considerOrderId, то при поиске следующего распоряжения
     * необходимо учитывать его непосредственную взаимосвязь с текущим распоряжением: у искомого
     * распоряжения должна быть ссылка (dispatchedOnOrder) на id текущего распоряжения.
     * Если дополнительно указан параметр specialTrainCategory (строка), то следующее распоряжение
     * должно иметь специальную отметку specialTrainCategory.
     */
    isOrderFollowedByOrderOfGivenType(state) {
      return ({ followerOrderType, order, considerOrderId = false, specialTrainCategory = null }) => {
        return state.data.find((item) =>
          !item.invalid &&
          item.orderChainId === order.orderChainId &&
          item.createDateTime > order.createDateTime &&
          item.type === followerOrderType &&
          (!considerOrderId || item.dispatchedOnOrder === order._id) &&
          (!specialTrainCategory || (item.specialTrainCategories && item.specialTrainCategories.includes(specialTrainCategory)))
        ) ? true : false;
      };
    },

    /**
     * Возвращает true, если распоряжение order последнее в своей цепочке распоряжений,
     * в противном случае возвращает false.
     */
    isOrderLastInChain(state) {
      return (order) => {
        return state.data.find((item) =>
          item.orderChainId === order.orderChainId && item.createDateTime > order.createDateTime
        ) ? false : true;
      };
    },

    /**
     * По заданному id цепочки позволяет получить первое распоряжение, принадлежащее ей.
     */
    getFirstOrderInChain(state) {
      return (chainId) => {
        const chainOrders = state.data
          .filter((order) => order.orderChainId === chainId)
          .sort((a, b) => {
            if (a.createDateTime < b.createDateTime) {
              return -1;
            }
            if (a.createDateTime > b.createDateTime) {
              return 1;
            }
            return 0;
          });
        return chainOrders.length ? chainOrders[0] : null;
      };
    },

    /**
     * Возвращает массив действующих распоряжений.
     * Действующим является такое рабочее распоряжение (должны выполняться все условия одновременно):
     * - которое валидно (действительно),
     * - у которого есть дата подтверждения его получения,
     * - которое принадлежит незакрытой цепочке документов (цепочке, у которой не определена дата окончания действия),
     * - которое действует до отмены либо дата окончания его действия еще не наступила,
     * - которое не обязательно последнее в цепочке распоряжений, которой оно принадлежит (см.
     *   пункты ниже),
     * - если речь идет о заявке, то в рамках цепочки распоряжений все заявки считаются
     *   действующими при условии, что далее по цепочке (не обязательно сразу) за ними не следует валидное уведомление,
     * - если речь идет об уведомлении, то оно является действующим только при условии, что оно
     *   в цепочке распоряжений последнее,
     * - если речь идет о распоряжении ДНЦ, то в рамках цепочки распоряжений только последнее
     *   распоряжение ДНЦ может рассматриваться как действующее / недействующее, все же предшествующие
     *   ему распоряжения ДНЦ автоматически становятся недействующими,
     * - если речь идет о распоряжении ДНЦ, то в рамках цепочки распоряжений только распоряжение на закрытие перегона
     *   считается действующим, если за ним в рамках этой же цепочки не следует ссылающееся на него распоряжение об открытии
     *   перегона, для всех остальных типов распоряжений ДНЦ действует правило: в рамках цепочки распоряжений только последнее
     *   распоряжение ДНЦ может рассматриваться как действующее / недействующее, все предшествующие ему распоряжения ДНЦ
     *   автоматически становятся недействующими,
     * - приказ ЭЦД / запрещение ЭЦД, за которым следует валидное уведомление, ссылающееся именно на этого приказ /
     *   запрещение, считается недействующим,
     * - уведомление (отмена запрещения) ЭЦД может рассматриваться как действующие при условии, что
     *   оно в цепочке распоряжений последнее.
     * ! В данный перечень войдут также те валидные распоряжения, дата начала действия которых еще не наступила
     * (распоряжения, изданные заранее)
     */
    getActiveOrders(state, getters) {
      // Вернётся новый массив с элементами, которые прошли проверку.
      // Если ни один элемент не прошёл проверку, то будет возвращён пустой массив.
      return state.data.filter((item) =>
        !item.invalid &&
        !item.orderChainEndDateTime &&
        item.confirmDateTime &&
        (item.timeSpan.tillCancellation || item.timeSpan.end >= new Date()) &&
        (
          (
            (item.type === ORDER_PATTERN_TYPES.REQUEST) &&
            !getters.isOrderFollowedByOrderOfGivenType({ followerOrderType: ORDER_PATTERN_TYPES.NOTIFICATION, order: item })
          ) ||
          ((item.type === ORDER_PATTERN_TYPES.NOTIFICATION) && getters.isOrderLastInChain(item)) ||
          (
            (item.type === ORDER_PATTERN_TYPES.ORDER) &&
            (
              (
                item.specialTrainCategories.includes(SPECIAL_CLOSE_BLOCK_ORDER_SIGN) &&
                !getters.isOrderFollowedByOrderOfGivenType({ followerOrderType: ORDER_PATTERN_TYPES.ORDER, order: item,
                  specialTrainCategory: SPECIAL_OPEN_BLOCK_ORDER_SIGN })
              ) ||
              !getters.isOrderFollowedByOrderOfGivenType({ followerOrderType: ORDER_PATTERN_TYPES.ORDER, order: item })
            )
          ) ||
          (
            (item.type === ORDER_PATTERN_TYPES.ECD_ORDER || item.type === ORDER_PATTERN_TYPES.ECD_PROHIBITION) &&
            !getters.isOrderFollowedByOrderOfGivenType({ followerOrderType: ORDER_PATTERN_TYPES.ECD_NOTIFICATION, order: item, considerOrderId: true })
          ) ||
          ((item.type === ORDER_PATTERN_TYPES.ECD_NOTIFICATION) && getters.isOrderLastInChain(item))
        )
      );
    },

    /**
     * Для данного типа базового документа с заданными особыми отметками (при наличии) возвращает
     * типы документов, которые текущий пользователь может издать на основании базового документа.
     * Ожидается, что базовый документ - действующий (никаких дополнительных проверок в этом отношении не делается).
     */
    getPossibleNewOrderTypesForBaseOrder(_state, getters) {
      return (baseOrderType, specialOrderMarks = null) => {
        // В массиве допустимых взаимосвязей между документами ищем информацию о документе типа baseOrderType.
        const allBaseDocumentPossibleConnectionsByType = POSSIBLE_DOCS_CONNECTIONS.filter((el) => el.initialDocType === baseOrderType);
        if (!allBaseDocumentPossibleConnectionsByType.length)
          return [];
        // Сюда поместим информацию о возможных взаимосвязях базового документа типа baseOrderType с отметками specialOrderMarks
        // с другими документами
        let possibleDocs;
        // Если у базового документа с baseOrderType нет особых отметок, то в allBaseDocumentPossibleConnectionsByType также
        // ищем элемент без требований к наличию особых отметок
        if (!specialOrderMarks?.length) {
          possibleDocs = allBaseDocumentPossibleConnectionsByType.find((el) => !el.initialDocSpecialMarks?.length);
        }
        // Если же у базового документа с baseOrderType есть особые отметки, то в этом случае необходимо в
        // allBaseDocumentPossibleConnectionsByType, в первую очередь, попытаться найти такой элемент, который содержит
        // требования к особым отметкам, и базовый документ им удовлетворяет; если такой элемент не будет найден, то
        // необходимо взять первый в allBaseDocumentPossibleConnectionsByType элемент, у которого нет требований к особым отметкам
        else {
          possibleDocs = allBaseDocumentPossibleConnectionsByType.find((el) =>
            (
              el.initialDocSpecialMarks?.length &&
              !el.initialDocSpecialMarks.find((mark) => !specialOrderMarks.includes(mark))
            ) &&
            (
              !el.excludeInitialDocSpecialMarks?.length ||
              !el.excludeInitialDocSpecialMarks.find((mark) => specialOrderMarks.includes(mark))
            )
          );
          if (!possibleDocs)
            possibleDocs = allBaseDocumentPossibleConnectionsByType.find((el) =>
              !el.initialDocSpecialMarks?.length &&
              (
                !el.excludeInitialDocSpecialMarks?.length ||
                !el.excludeInitialDocSpecialMarks.find((mark) => specialOrderMarks.includes(mark))
              )
            );
        }
        if (!possibleDocs)
          return [];
        // Осталось только определить те типы документов среди найденных, которые может издавать текущий пользователь
        const currentUserCredential = getters.getUserCredential;
        const userInfo = possibleDocs.newDocsInfo.find((el) => el.userCredentials.includes(currentUserCredential));
        if (!userInfo) {
          return [];
        }
        return userInfo.possibleNewDocTypes;
      };
    },

    /**
     * Для данного типа создаваемого документа (распоряжения) возвращает типы базовых документов (ранее
     * изданных) с их особыми отметками (при наличии), с которыми текущий пользователь может связать
     * создаваемый документ.
     */
    getPossibleBaseOrderTypesForNewOrder(_state, getters) {
      return (newOrderType) => {
        const currentUserCredential = getters.getUserCredential;
        return POSSIBLE_DOCS_CONNECTIONS.filter((el) =>
          el.newDocsInfo.find((dt) =>
            dt.userCredentials.includes(currentUserCredential) &&
            dt.possibleNewDocTypes.includes(newOrderType))
        ).map((el) => ({
          initialDocType: el.initialDocType,
          initialDocSpecialMarks: el.initialDocSpecialMarks,
          excludeInitialDocSpecialMarks: el.excludeInitialDocSpecialMarks,
        }));
      };
    },

    /**
     * Возвращает действующие рабочие распоряжения (в рамках своих цепочек распоряжений),
     * на базе которых можно создать новое распоряжение заданного типа.
     * Если указан параметр restrictToOrderType, то он определяет тот тип распоряжений, которые
     * нужно, чтобы метод возвратил.
     */
    getPossibleBaseActiveOrdersForNewOrder(_state, getters) {
      return (newOrderType, restrictToOrderType = null, restrictToOrderSpecialOrderSign = null) => {
        // Возможные типы базовых документов для создаваемого документа
        const possibleBaseOrderTypes = getters.getPossibleBaseOrderTypesForNewOrder(newOrderType);
        if (!possibleBaseOrderTypes.length) {
          return [];
        }
        // Выбираем среди действующих распоряжений подходящие
        const activeOrders = getters.getActiveOrders;
        const necessaryOrders = activeOrders.filter((order) => {
          // действующее распоряжение может рассматриваться как базовое для создаваемого документа?
          return possibleBaseOrderTypes.find((el) =>
            // совпадение по типу документа
            (el.initialDocType === order.type) &&
            // особые отметки, которые должны быть у базового документа
            (
              !el.initialDocSpecialMarks?.length ||
              (
                order.specialTrainCategories?.length &&
                !el.initialDocSpecialMarks.find((mark) => !order.specialTrainCategories.includes(mark))
              )
            ) &&
            // особые отметки, которых у базового документа быть не должно
            (
              !el.excludeInitialDocSpecialMarks?.length ||
              (
                !order.specialTrainCategories?.length ||
                !el.excludeInitialDocSpecialMarks.find((mark) => order.specialTrainCategories.includes(mark))
              )
            )
          ) ? true : false;
        });
        if (restrictToOrderType || restrictToOrderSpecialOrderSign)
          return necessaryOrders.filter((order) =>
            (
              !restrictToOrderType || order.type === restrictToOrderType
            ) &&
            (
              !restrictToOrderSpecialOrderSign ||
              order.specialTrainCategories?.includes(restrictToOrderSpecialOrderSign)
            )
          );
        return necessaryOrders;
      };
    },

    /**
     * Возвращает действующие рабочие распоряжения (в рамках своих цепочек распоряжений),
     * на базе которых можно создать новое распоряжение заданного типа.
     * Результат метода предназначен для отображения в компоненте TreeSelect.
     */
    getActiveOrdersToDisplayInTreeSelect(_state, getters) {
      return (newOrderType) => {
        // Сюда помещается информация, подлежащая возврату из метода: документы, сгруппированные по типам
        const groupedOrders = [{
          key: null,
          label: '-',
          data: null,
        }];
        getters.getPossibleBaseActiveOrdersForNewOrder(newOrderType).forEach((order) => {
          const typeGroup = groupedOrders.find((group) => group.key === order.type);
          const childItem = {
            key: order._id,
            label: `№ ${order.number} от ${getLocaleDateTimeString(order.createDateTime, false)} - ${order.orderText.orderTitle}`,
            data: order,
          };
          if (!typeGroup) {
            groupedOrders.push({
              key: order.type,
              label: order.type,
              data: order.type,
              selectable: false,
              children: [childItem],
            });
          } else {
            typeGroup.children.push(childItem);
          }
        });
        return groupedOrders;
      };
    },

    /**
     * Возвращает массив действующих распоряжений, каждое из которых - последнее в цепочке
     * распоряжений, которой оно принадлежит.
     * Действующим является такое рабочее распоряжение:
     * - у которого есть дата подтверждения его получения,
     * - которое действует до отмены либо дата окончания его действия еще не наступила
     * ! В данный перечень войдут также те распоряжения, дата начала действия которых еще не наступила
     * (распоряжения, изданные заранее)
     */
    getLastInChainActiveOrders(_state, getters) {
      const workingOrders = getters.getRawWorkingOrders.sort((a, b) => {
        if (a.createDateTime < b.createDateTime) {
          return -1;
        }
        if (a.createDateTime > b.createDateTime) {
          return 1;
        }
        return 0;
      });
      const ordersMap = new Map();
      workingOrders.forEach((order) => ordersMap.set(order.orderChainId, order));
      return [...ordersMap.values()].filter((item) =>
        item.confirmDateTime &&
        (item.timeSpan.tillCancellation || item.timeSpan.end >= new Date())
      );
    },

    /**
     * Возвращает действующие распоряжения заданного типа. Если указана специальная отметка, которую
     * должны иметь искомые распоряжения, то данная отметка учитывается при поиске. Если указана
     */
    getActiveOrdersOfGivenType(_state, getters) {
      return (ordersType, specialOrderSign = null) => {
        return getters.getActiveOrders.filter((item) =>
          (item.type === ordersType) &&
          (
            !specialOrderSign ||
            (item.specialTrainCategories && item.specialTrainCategories.includes(specialOrderSign))
          )
        );
      };
    },

    /**
     * Возвращает объект действующего распоряжения, id которого совпадает с заданным.
     */
    getActiveOrderById(_state, getters) {
      return (orderId) => {
        return getters.getActiveOrders.find((order) => order._id === orderId);
      };
    },

    /**
     * Возвращает действующее распоряжение заданного типа с заданным номером.
     * Если указана специальная отметка, которую должны иметь искомые распоряжения,
     * то данная отметка также учитывается при поиске.
     */
    getActiveOrderByNumber(_state, getters) {
      return (orderType, orderNumber, specialOrderSign = null) => {
        return getters.getActiveOrdersOfGivenType(orderType, specialOrderSign).find((item) =>
          String(item.number) === String(orderNumber));
      };
    },

    /**
     * Возвращает true, если распоряжение с заданным id является действующим, false - в противном случае.
     */
    isOrderActive(_state, getters) {
      return (orderId) =>
        Boolean(getters.getActiveOrders.find((order) => String(order._id) === String(orderId)));
    },

    /**
     * Функция проверяет, существует ли в списке рабочих распоряжений распоряжение о принятии
     * дежурства ДСП, изданное на ТЕКУЩЕМ РАБОЧЕМ МЕСТЕ.
     * Если существует, функция возвращает последнее такое найденное распоряжение (по времени издания),
     * в противном случае функция возвращает null.
     *
     * Функцию следует вызывать только в том случае, если текущий пользователь - ДСП либо оператор
     * при ДСП, находящийся на дежурстве!
     */
    getExistingDSPTakeDutyOrder(_state, getters) {
      const workPoligon = getters.getUserWorkPoligon;
      if (!workPoligon) {
        return null;
      }
      const orders = getters.getRawWorkingOrders.filter((order) => {
        if (!order.specialTrainCategories || !order.specialTrainCategories.length) {
          return false;
        }
        return (order.workPoligon.type === workPoligon.type) && (order.workPoligon.id === workPoligon.code) &&
          (
            (!order.workPoligon.workPlaceId && !workPoligon.subCode) ||
            (order.workPoligon.workPlaceId && workPoligon.subCode && order.workPoligon.workPlaceId === workPoligon.subCode)
          ) &&
          order.specialTrainCategories.includes(SPECIAL_ORDER_DSP_TAKE_DUTY_SIGN);
      });
      if (!orders.length) {
        return null;
      }
      // сортируем распоряжения в порядке убывания времени издания и возвращаем первое распоряжение
      // в отсортированном массиве
      return orders.sort((a, b) => {
        if (a.createDateTime < b.createDateTime) return 1;
        if (a.createDateTime > b.createDateTime) return -1;
        return 0;
      })[0];
    },

    /**
     * Функция проверяет, существует ли в списке рабочих распоряжений распоряжение о принятии
     * дежурства ДНЦ/ЭЦД, изданное на ТЕКУЩЕМ РАБОЧЕМ МЕСТЕ (т.е. для ДНЦ ищется циркулярное распоряжение ДНЦ,
     * для ЭЦД - циркулярное распоряжение ЭЦД).
     * Если существует, функция возвращает последнее такое найденное распоряжение (по времени издания),
     * в противном случае функция возвращает null.
     * Функция не обращает внимания на время издания циркулярного распоряжения и его время действия.
     * Функцию следует вызывать только в том случае, если текущий пользователь - ДНЦ/ЭЦД, находящийся на дежурстве!
     */
    getExistingDNC_ECDTakeDutyOrder(_state, getters) {
      if (!getters.isECD && !getters.isDNC) {
        return null;
      }
      const workPoligon = getters.getUserWorkPoligon;
      if (!workPoligon) {
        return null;
      }
      const orders = getters.getRawWorkingOrders.filter((order) => {
        if (!order.specialTrainCategories || !order.specialTrainCategories.length) {
          return false;
        }
        return (order.workPoligon.type === workPoligon.type) &&
          (order.workPoligon.id === workPoligon.code) &&
          (!order.workPoligon.workPlaceId) &&
          order.specialTrainCategories.includes(SPECIAL_CIRCULAR_ORDER_SIGN);
      });
      if (!orders.length) {
        return null;
      }
      // сортируем распоряжения в порядке убывания времени издания и возвращаем первое распоряжение
      // в отсортированном массиве
      return orders.sort((a, b) => {
        if (a.createDateTime < b.createDateTime) return 1;
        if (a.createDateTime > b.createDateTime) return -1;
        return 0;
      })[0];
    },

    /**
     * Функция проверяет, существуют ли в списке рабочих распоряжений ЭЦД распоряжения о принятии
     * дежурства ДНЦ ближайших участков (данные распоряжения - скрытые, их сам ЭЦД не видит в списке рабочих распоряжений).
     * Функция возвращает null, если ни одного такого распоряжения найти не удалось.
     * Если же найти распоряжения удалось, то для каждого ближайшего участка ДНЦ возвращается последнее по времени
     * издания циркулярное распоряжение.
     * Функция не обращает внимания на время издания циркулярных распоряжений ДНЦ и их время действия.
     * Функцию следует вызывать только в том случае, если текущий пользователь - ЭЦД, находящийся на дежурстве!
     */
    getExistingDNCTakeDutyOrders_ForECD(_state, getters) {
      if (!getters.isECD) {
        return null;
      }
      const orders = getters.getHiddenRawWorkingOrders.filter((order) => {
        if (!order?.specialTrainCategories?.length) {
          return false;
        }
        return (order.workPoligon.type === WORK_POLIGON_TYPES.DNC_SECTOR) &&
          (!order.workPoligon.workPlaceId) &&
          order.specialTrainCategories.includes(SPECIAL_CIRCULAR_ORDER_SIGN);
      });
      if (!orders.length) {
        return null;
      }
      // сортируем найденные распоряжения в порядке убывания времени издания и для каждого ближайшего участка ДНЦ
      // возвращаем первое циркулярное распоряжение в отсортированном массиве (это будет самое последнее
      // циркулярное распоряжение, изданное в рамках данного участка ДНЦ)
      orders.sort((a, b) => {
        if (a.createDateTime < b.createDateTime) return 1;
        if (a.createDateTime > b.createDateTime) return -1;
        return 0;
      });
      const arrayToReturn = [];
      orders.forEach((order) => {
        if (!arrayToReturn.find((el) => el.workPoligon.id === order.workPoligon.id)) {
          arrayToReturn.push(order);
        }
      });
      return arrayToReturn;
    },

    /**
     * Вызывать только в том случае, если текущий рабочий полигон - станция.
     * Для данного рабочего места на станции возвращает должность и ФИО лица из текста последнего изданного
     * распоряжения о приеме/сдаче дежурства (имеется в виду персонал рабочих мест на этой же станции, за
     * исключением текущего рабочего места).
     */
    getWorkPlacePostFIOFromExistingDSPTakeDutyOrder(_state, getters) {
      return (workPlaceId) => {
        const dspTakeDutyOrder = getters.getExistingDSPTakeDutyOrder;
        if (!dspTakeDutyOrder || !dspTakeDutyOrder.orderText || !dspTakeDutyOrder.orderText.orderText) {
          return { post: null, fio: null };
        }
        const neededTextElement = dspTakeDutyOrder.orderText.orderText.find((el) =>
          el.ref === DSP_TAKE_ORDER_TEXT_ELEMENTS_REFS.TAKE_DUTY_PERSONAL
        );
        if (!neededTextElement || !neededTextElement.value) {
          return { post: null, fio: null };
        }
        const neededTextElementValue = neededTextElement.value.find((el) => String(el.workPlaceId) === String(workPlaceId));
        if (!neededTextElementValue) {
          return { post: null, fio: null };
        }
        return {
          post: neededTextElementValue.post,
          fio: getUserFIOString({
            name: neededTextElementValue.name,
            fatherName: neededTextElementValue.fatherName,
            surname: neededTextElementValue.surname,
          }),
        };
      };
    },

    /**
     * Из последнего циркулярного распоряжения ДНЦ / ЭЦД извлекает значение поля "Дополнительные работники".
     * Полагается, что эти дополнительные работники - стажеры, которые вместе с ДНЦ / ЭЦД заступили на дежурство.
     * Их ФИО необходимо указывать при издании новых распоряжений наряду с ФИО ДНЦ / ЭЦД.
     */
    getLastDNC_ECDTakeDutyOrderAdditionalWorkers(_state, getters) {
      const lastTakeDutyOrder = getters.getExistingDNC_ECDTakeDutyOrder;
      if (!lastTakeDutyOrder) {
        return null;
      }
      const neededTextElement = lastTakeDutyOrder.orderText.orderText.find((el) =>
        el.ref === FILLED_ORDER_INPUT_ELEMENTS.ADDITIONAL_WORKERS
      );
      return neededTextElement?.value || null;
    },
  },
};
