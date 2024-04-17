export function arrayParser<K> (array: any[], key: string): K {
  const isArray = Array.isArray(array)
  if (!isArray || array?.length < 1) {
    return 0 as K
  }
  const hasKey = Object.keys(array[0]).some(_key => _key === key)
  if (!hasKey) {
    return 0 as K
  }
  return array[0][key]
}
