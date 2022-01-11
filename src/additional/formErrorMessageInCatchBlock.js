/**
 * Возвращает строку с описание произошедшей ошибки.
 *
 * @param {Object} error - catched error object
 * @param {String} generalErrorMessage
 */
function formErrorMessageInCatchBlock(error, generalErrorMessage) {
  let errMessage = `${generalErrorMessage}: ` || '';
  if (!error) {
    return errMessage;
  }
  if (error.response) {
    // The request was made and server responded
    errMessage += error.response.data ? (error.response.data.message || '') : JSON.stringify(error);
  } else if (error.request) {
    // The request was made but no response was received
    errMessage += 'сервер не отвечает';
  } else {
    // Something happened in setting up the request that triggered an Error
    // Or an arror happened that does not depend on request to the server
    errMessage += error.message || JSON.stringify(error);
  }
  return errMessage;
}

export default formErrorMessageInCatchBlock;
