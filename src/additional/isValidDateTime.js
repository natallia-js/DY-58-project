function isValidDateTime(value) {
  if (Object.prototype.toString.call(value) === "[object Date]") {
    if (isNaN(value.getTime())) {
      return false;
    }
    else {
      return true;
    }
  }
  return false;
}

export default isValidDateTime;
