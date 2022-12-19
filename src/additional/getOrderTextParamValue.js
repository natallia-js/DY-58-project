export const getOrderTextParamValue = (paramName, orderText) => {
  if (!paramName || !orderText || !orderText.length) {
    return null;
  }
  const textElement = orderText.find((el) => el.ref === paramName);
  return textElement ? textElement.value : null;
};

export const getOrderTextParamValueToEdit = (paramName, orderText) => {
  if (!paramName || !orderText || !orderText.length) {
    return null;
  }
  const textElement = orderText.find((el) => el.ref === paramName);
  return textElement ? textElement.editValue : null;
};
