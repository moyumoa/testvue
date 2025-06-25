// 拼接 depName
export function concatDep(item) {
  if (!item.childrenDep) return item.depName
  return item.depName + '/' + concatDep(item.childrenDep)
}
