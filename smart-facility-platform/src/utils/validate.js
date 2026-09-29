/**
 * @returns {Boolean}
 * @param path 路径
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path);
}
