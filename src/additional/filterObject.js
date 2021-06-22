export function filterObj(obj, predicate) {
  let result = {}, key;
  for (key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && predicate(key, obj[key])) {
      result[key] = obj[key];
    }
  }
  return result;
}

