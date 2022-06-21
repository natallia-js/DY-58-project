/**
 * Из полного имени файла извлекает и возвращает его расширение.
 * Пояснения по регулярному выражению:
 * (?:         # begin non-capturing group
 *   \.        #   a dot
 *   (         #   begin capturing group (captures the actual extension)
 *     [^.]+   #     anything except a dot, multiple times
 *   )         #   end capturing group
 * )?          # end non-capturing group, make it optional
 * $           # anchor to the end of the string
 */
function getExtensionFromFullFileName(fullFileName) {
  const regularExpression = /(?:\.([^.]+))?$/;
  return regularExpression.exec(fullFileName)[1];
}

export default getExtensionFromFullFileName;
