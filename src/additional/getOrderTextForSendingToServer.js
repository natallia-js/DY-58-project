function getOrderTextForSendingToServer(orderText) {
  if (!orderText) {
    return null;
  }
  return {
    ...orderText,
    orderText: !orderText.orderText
      ? null
      : orderText.orderText.map((el) => {
        return {
          ...el,
          value: !el.value
            ? null
            : ((el.value instanceof Object) && !(el.value instanceof Date))
              ? JSON.stringify(el.value)
              : el.value
        }
      }),
  }
}

export default getOrderTextForSendingToServer;
