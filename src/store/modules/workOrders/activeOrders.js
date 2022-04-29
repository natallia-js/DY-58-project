import { getLocaleDateTimeString } from '@/additional/dateTimeConvertions';
import {
  ORDER_PATTERN_TYPES,
  SPECIAL_CLOSE_BLOCK_ORDER_SIGN,
  SPECIAL_ORDER_DSP_TAKE_DUTY_SIGN,
  SPECIAL_CIRCULAR_ORDER_SIGN,
} from '@/constants/orderPatterns';
import { APP_CREDENTIALS } from '@/constants/appCredentials';
import { DSP_TAKE_ORDER_TEXT_ELEMENTS_REFS } from '@/constants/orders';
import { getUserFIOString } from '@/store/modules/personal/transformUserData';


/**
 * Определяет допустимые связи между документами (при их создании) для разных категорий пользователей системы.
 * initialDocType - тип документа (исходный документ), на основании которого можно создать новый документ
 * initialDocSpecialMarks - специальные отметки, которые должны быть у исходного документа
 * userCredentials - полномочия текущего пользователя
 * possibleNewDocTypes - типы документов, которые текущий пользователь может создать на основании исходного документа
 * ! исходный документ должен быть действующим
 * Допустимые взаимосвязи документов:
 *   Издатель        Исходный документ             Связанный документ
 *     ДНЦ             Распоряжение        Распоряжение, Заявка, Уведомление
 *     ДСП             Распоряжение        Заявка, Уведомление
 *     ЭЦД             Распоряжение        Запрещение
 *     ДНЦ             Заявка (ДСП)        Распоряжение, Заявка, Уведомление
 *     ДСП             Заявка (ДСП)        Заявка, Уведомление
 *     ЭЦД             Заявка (ДСП)        -
 *     ДНЦ             Уведомление (ДСП)   Распоряжение
 *     ДСП             Уведомление (ДСП)   -
 *     ДНЦ             Приказ ЭЦД          -
 *     ДСП             Приказ ЭЦД          -
 *     ЭЦД             Приказ ЭЦД          Уведомление ЭЦД об отмене приказа ЭЦД
 *     ДНЦ             Запрещение ЭЦД      -
 *     ДСП             Запрещение ЭЦД      -
 *     ЭЦД             Запрещение ЭЦД      Уведомление ЭЦД об отмене запрещения ЭЦД
 */
const possibleDocsConnections = [
  {
    initialDocType: ORDER_PATTERN_TYPES.ORDER,
    initialDocSpecialMarks: [SPECIAL_CLOSE_BLOCK_ORDER_SIGN],
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
    initialDocType: ORDER_PATTERN_TYPES.REQUEST,
    newDocsInfo: [
      {
        userCredentials: [APP_CREDENTIALS.DNC_FULL],
        possibleNewDocTypes: [ORDER_PATTERN_TYPES.ORDER, ORDER_PATTERN_TYPES.REQUEST, ORDER_PATTERN_TYPES.NOTIFICATION],
      },
      {
        userCredentials: [APP_CREDENTIALS.DSP_FULL, APP_CREDENTIALS.DSP_Operator],
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
     * распоряжение типа followerOrderType, в противном случае возвращает false.
     * Если дополнительно указан параметр considerOrderId, то при поиске следующего распоряжения
     * необходимо учитывать его непосредственную взаимосвязь с текущим распоряжением: у искомого
     * распоряжения должна быть ссылка (dispatchedOnOrder) на id текущего распоряжения.
     */
    isOrderFollowedByOrderOfGivenType(state) {
      return ({ followerOrderType, order, considerOrderId = false }) => {
        return state.data.find((item) =>
          item.orderChainId === order.orderChainId &&
          item.createDateTime > order.createDateTime &&
          item.type === followerOrderType &&
          (!considerOrderId || item.dispatchedOnOrder === order._id)
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
     * - у которого есть дата подтверждения его получения,
     * - которое действует до отмены либо дата окончания его действия еще не наступила,
     * - которое не обязательно последнее в цепочке распоряжений, которой оно принадлежит (см.
     *   пункты ниже),
     * - если речь идет о заявке, то в рамках цепочки распоряжений только 1 заявка (последняя) считается
     *   действующей при условии, что далее по цепочке (не обязательно сразу) за нею не следует уведомление,
     * - если речь идет об уведомлении, то оно является действующим только при условии, что оно
     *   в цепочке распоряжений последнее,
     * - если речь идет о распоряжении ДНЦ, то в рамках цепочки распоряжений только последнее
     *   распоряжение ДНЦ может рассматриваться как действующее / недействующее, все же предшествующие
     *   ему распоряжения ДНЦ автоматически становятся недействующими,
     * - приказ ЭЦД / запрещение ЭЦД, за которым следует уведомление, ссылающееся именно на этого приказ /
     *   запрещение, считается недействующим,
     * - уведомление (отмена запрещения) ЭЦД может рассматриваться как действующие при условии, что
     *   оно в цепочке распоряжений последнее.
     * ! В данный перечень войдут также те распоряжения, дата начала действия которых еще не наступила
     * (распоряжения, изданные заранее)
     */
    getActiveOrders(state, getters) {
      // Вернётся новый массив с элементами, которые прошли проверку.
      // Если ни один элемент не прошёл проверку, то будет возвращён пустой массив.
      return state.data.filter((item) =>
        item.confirmDateTime &&
        (item.timeSpan.tillCancellation || item.timeSpan.end >= new Date()) &&
        (
          (
            (item.type === ORDER_PATTERN_TYPES.REQUEST) &&
            !getters.isOrderFollowedByOrderOfGivenType({ followerOrderType: ORDER_PATTERN_TYPES.REQUEST, order: item }) &&
            !getters.isOrderFollowedByOrderOfGivenType({ followerOrderType: ORDER_PATTERN_TYPES.NOTIFICATION, order: item })
          ) ||
          ((item.type === ORDER_PATTERN_TYPES.NOTIFICATION) && getters.isOrderLastInChain(item)) ||
          (
            (item.type === ORDER_PATTERN_TYPES.ORDER) &&
            !getters.isOrderFollowedByOrderOfGivenType({ followerOrderType: ORDER_PATTERN_TYPES.ORDER, order: item })
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
     * Для данного типа базового документа (распоряжения) с заданными особыми отметками возвращает
     * типы документов, которые текущий пользователь может издать на основании базового документа.
     */
    getPossibleNewOrderTypesForBaseOrder(_state, getters) {
      return (baseOrderType, specialOrderMarks = null) => {
        const possibleDocs = possibleDocsConnections.find((el) => el.initialDocType === baseOrderType);
        if (!possibleDocs) {
          return [];
        }
        if (possibleDocs.initialDocSpecialMarks && possibleDocs.initialDocSpecialMarks.length) {
          if (!specialOrderMarks || !specialOrderMarks.length) {
            return [];
          }
          if (specialOrderMarks.find((mark) => !possibleDocs.initialDocSpecialMarks.includes(mark))) {
            return [];
          }
        }
        const currentUserCredentials = getters.getUserCredential;
        const userInfo = possibleDocs.newDocsInfo.find((el) => el.userCredentials.includes(currentUserCredentials));
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
        const currentUserCredentials = getters.getUserCredential;
        return possibleDocsConnections.filter((el) =>
          el.newDocsInfo.find((dt) =>
            dt.userCredentials.includes(currentUserCredentials) &&
            dt.possibleNewDocTypes.includes(newOrderType))
        ).map((el) => ({
          initialDocType: el.initialDocType,
          initialDocSpecialMarks: el.initialDocSpecialMarks,
        }));
      };
    },

    /**
     * Возвращает действующие рабочие распоряжения (в рамках своих цепочек распоряжений),
     * на базе которых можно создать новое распоряжение заданного типа.
     * Результат метода предназначен для отображения в компоненте TreeSelect.
     */
    getActiveOrdersToDisplayInTreeSelect(_state, getters) {
      return (newOrderType) => {
        // Возможные типы базовых документов для создаваемого документа
        const possibleBaseOrderTypes = getters.getPossibleBaseOrderTypesForNewOrder(newOrderType);
        const groupedOrders = [{
          key: null,
          label: '-',
          data: null,
        }];
        if (!possibleBaseOrderTypes.length) {
          return groupedOrders;
        }
        // Действующие распоряжения
        const orders = getters.getActiveOrders;
        orders.forEach((order) => {
          // действующее распоряжение может рассматриваться как базовое для создаваемого документа?
          const possibleBaseOrderInfo = possibleBaseOrderTypes.find((el) => el.initialDocType === order.type);
          if (!possibleBaseOrderInfo) {
            return;
          }
          // особые отметки действующего распоряжения позволяют его рассматривать как базовое для создаваемого документа?
          if (possibleBaseOrderInfo.initialDocSpecialMarks && possibleBaseOrderInfo.initialDocSpecialMarks.length) {
            if (!order.specialTrainCategories || !order.specialTrainCategories.length) {
              return;
            }
            if (possibleBaseOrderInfo.initialDocSpecialMarks.find((mark) => !order.specialTrainCategories.includes(mark))) {
              return;
            }
          }
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
     * должны иметь искомые распоряжения, то данная отметка также учитывается при поиске.
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
      // сортируем распоряжения в порядке убывания времени издания и возвращаем порвое распоряжение
      // в отсортированном массиве
      return orders.sort((a, b) => {
        if (a.createDateTime < b.createDateTime) return 1;
        if (a.createDateTime > b.createDateTime) return -1;
        return 0;
      })[0];
    },

    /**
     * Функция проверяет, существует ли в списке рабочих распоряжений распоряжение о принятии
     * дежурства ДНЦ, изданное на ТЕКУЩЕМ РАБОЧЕМ МЕСТЕ.
     * Если существует, функция возвращает последнее такое найденное распоряжение (по времени издания),
     * в противном случае функция возвращает null.
     *
     * Функцию следует вызывать только в том случае, если текущий пользователь - ДНЦ, находящийся на дежурстве!
     */
    getExistingDNCTakeDutyOrder(_state, getters) {
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
      // сортируем распоряжения в порядке убывания времени издания и возвращаем порвое распоряжение
      // в отсортированном массиве
      return orders.sort((a, b) => {
        if (a.createDateTime < b.createDateTime) return 1;
        if (a.createDateTime > b.createDateTime) return -1;
        return 0;
      })[0];
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
  },
};
