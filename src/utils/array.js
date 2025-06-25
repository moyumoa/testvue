/**
 * 数组下移
 * @param arr 数组
 * @param index 被移动项的下标
 * @return {*}  移动后的数组
 */
import { isEmpty } from '@/utils/tools'

export function moveUp(arr, index) {
  if (isEmpty(arr)) return
  if (index !== 0) {
    arr[index] = arr.splice(index - 1, 1, arr[index])[0]
  } else {
    arr.push(arr.shift())
  }
  return arr
}

/**
 * 数组下移
 * @param arr 数组
 * @param index 被移动项的下标
 * @return {*}  移动后的数组
 */
export function moveDown(arr, index) {
  if (isEmpty(arr)) return
  if (index !== arr.length - 1) {
    arr[index] = arr.splice(index + 1, 1, arr[index])[0]
  } else {
    arr.unshift(arr.splice(index, 1)[0])
  }
  return arr
}

/**
 * 数组置顶
 * @param arr 数组
 * @param index 被移动项的下标
 * @return {*}  移动后的数组
 */
export function moveTop(arr, index) {
  if (isEmpty(arr)) return
  arr.unshift(arr.splice(index, 1)[0])
  return arr
}
