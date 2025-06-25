// 获取视频时长
export function getTimeFun(time) {
  if (time !== null && time !== undefined && time !== '') {
    let second = parseInt(time / 1000)
    let min = 0
    let hour = 0
    if (second > 60) {
      min = parseInt(second / 60)
      second = parseInt(second % 60)
      if (min > 60) {
        hour = parseInt(min / 60)
        min = parseInt(min % 60)
      }
    }
    let data = '' + parseInt(second) + 's'
    if (min > 0) {
      data = '' + parseInt(min) + 'm' + data
    }
    if (hour > 0) {
      data = '' + parseInt(hour) + 'h' + data
    }
    return data
  } else {
    return '-'
  }
}
