/**
 * Проверяет, содержатся ли в строке аутентификации только символы
 * латинского алфавита, цифры и знак нижнего подчеркивания.
 */
function checkAuthString(value) {
  return value && value.match(/^[A-Za-z0-9_]+$/);
}

export default checkAuthString;
