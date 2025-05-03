/** 判断是否是对象 */
export function isObject(value: any): value is object {
  return typeof value === 'object' && value !== null;
}
