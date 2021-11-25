import { WorkMessStates, RECENTLY } from '../../../constants/orders';
import { getLocaleDateTimeString, getTimeSpanString } from '../../../additional/dateTimeConvertions';
import { formOrderText } from '../../../additional/formOrderText';


export const incomingOrders = {
  getters: {
    /**
     *
     */
    getRawIncomingOrders(state) {
      return state.data.filter((item) => !item.confirmDateTime);
    },

    /**
     * Позволяет получить количество входящих уведомлений.
     */
    getIncomingOrdersNumber(_state, getters) {
      return getters.getRawIncomingOrders.length;
    },

    /**
     *
     */
    getIncomingOrders(_state, getters) {
      const now = new Date();
      return getters.getRawIncomingOrders
        .sort((a, b) => {
          if (a.createDateTime < b.createDateTime) {
            return -1;
          }
          if (a.createDateTime > b.createDateTime) {
            return 1;
          }
          return 0;
        })
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
            //nextRelatedOrderId: item.nextRelatedOrderId,
          };
        });
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
