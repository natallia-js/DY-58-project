import { WorkMessStates, RECENTLY } from '../../../constants/orders';
import { getLocaleDateTimeString, getTimeSpanString } from '../../../additional/dateTimeConvertions';
import { formOrderText } from '../../../additional/formOrderText';


export const incomingOrders = {
  getters: {
    /**
     *
     */
     getIncomingOrders(state, getters) {
      const now = new Date();
      return state.data
        .filter((item) => !item.confirmDateTime)
        .map((item, index) => {
          return {
            id: item._id,
            sendOriginal: item.sendOriginal,
            type: item.type,
            state: (now - item.createDateTime) >= RECENTLY ? WorkMessStates.cameLongAgo : WorkMessStates.cameRecently,
            seqNum: index + 1,
            time: getLocaleDateTimeString(item.createDateTime, false),
            timeSpan: getTimeSpanString(item.timeSpan, getters.isECD),
            orderNum: item.number,
            orderTitle: item.orderText.orderTitle,
            shortOrderText: formOrderText({ orderTextArray: item.orderText.orderText }),
            orderText: formOrderText({
              orderTextArray: item.orderText.orderText,
              dncToSend: item.dncToSend,
              dspToSend: item.dspToSend,
              ecdToSend: item.ecdToSend,
              otherToSend: item.otherToSend,
            }),
            place: item.senderWorkPoligon.title,
            post: item.creator.post,
            fio: item.creator.fio + (item.createdOnBehalfOf ? ` (от имени ${item.createdOnBehalfOf})` : ''),
            nextRelatedOrderId: item.nextRelatedOrderId,
          };
        });
    },

    /**
     * Позволяет получить количество входящих уведомлений.
     */
    getIncomingOrdersNumber(state) {
      return state.data.filter((item) => !item.confirmDateTime).length;
    },


    /**
     * Позволяет получить информацию о входящем уведомлении по id этого уведомления.
     */
     getIncomingOrder(state) {
      return (id) => {
        return state.data.find((item) => item._id === id);
      };
    },
  },
};
