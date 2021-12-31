function isNumber(value) {
  const val = (typeof value === 'number') ? value : +value;
  return isNaN(val) ? false : isFinite(value);
}

export default isNumber;
