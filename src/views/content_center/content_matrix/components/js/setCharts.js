/**
 *
 * @param {string} time - 时间[秒]
 * @param {string} defaultUnit - 默认时间单位
 * @param {Boolean} unitType - 是使用时:分:秒还是h:m:s
 * @description 时间转化为x小时x分钟x秒
 */
// 秒转时分秒
export function timeSecond(time, defaultUnit = '分钟', unitType = true) {
  if (time != null && time !== '' && time >= 60) {
    const h = parseInt(time / 3600)
    const m = parseInt((time % 3600) / 60)
    // const s = (time % 3600) % 60
    return (
      (h || '') +
      (h > 0 ? (unitType ? '小时' : 'h') : '') +
      (m || '') +
      (m > 0 ? (unitType ? '分钟' : 'm') : '')
    )
  } else if (time >= 0) {
    return 0 + defaultUnit
  } else {
    return time + defaultUnit
  }
}
/* 计算两个日期之间的天数
 * @param d1  开始日期 yyyy-MM-dd
 * @param d2  结束日期 yyyy-MM-dd
 * @returns {number} 如果日期相同 返回一天 开始日期大于结束日期，返回0
 */
export function getDaysBetween(d1, d2) {
  const k1 = new Date(d1)
  const k2 = new Date(d2)
  const days = k2.getTime() - k1.getTime()
  const time = parseInt(days / (1000 * 60 * 60 * 24))
  return time
}
// 获取前n天的日期
export function getDays(n, endTime) {
  const days = []
  const nowTime = new Date(endTime)
  const times = parseInt(n) * 24

  for (let i = 0; i < times; i += 24) {
    const dateItem = new Date(nowTime.getTime() - i * 60 * 60 * 1000) // 使用当天时间戳减去以前的时间毫秒（小时*分*秒*毫秒）
    const y = dateItem.getFullYear() // 获取年份
    let m = dateItem.getMonth() + 1 // 获取月份js月份从0开始，需要+1
    let d = dateItem.getDate() // 获取日期

    m = addDate0(m) // 给为单数的月份补零

    d = addDate0(d) // 给为单数的日期补零

    const valueItem = y + '-' + m + '-' + d // 组合
    days.push(valueItem) // 添加至数组
  }

  return days
}
export function addDate0(time) {
  if (time.toString().length === 1) {
    time = '0' + time.toString()
  }
  return time
}
