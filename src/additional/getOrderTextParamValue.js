const getOrderTextParamValue = (paramName, orderText) => {
  if (!paramName || !orderText || !orderText.length) {
    return null;
  } console.log('paramName',paramName,'orderText',orderText)
  const textElement = orderText.find((el) => el.ref === paramName);
  return textElement ? textElement.value : null;
};

export default getOrderTextParamValue;
