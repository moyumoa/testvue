import { dateFormat } from '@/utils/tools.js'
// 比较这个时间点，例如：现在是11.30 00:20:00，数据更新时间为每天00:30:00,那么展示11.29 00:30:00
export function comparisonTime(incomingTime) {
  let showTime = ''
  const nowTime = new Date()
  const nowDay = dateFormat(new Date()) + ' ' + incomingTime
  const changeDay = nowDay.replace(/-/g, '/')

  if (nowTime.getTime() >= new Date(changeDay).getTime()) {
    showTime = nowDay
  } else {
    const timeLen = getDays(2, nowTime)
    showTime = timeLen[timeLen.length - 1] + ' ' + incomingTime
  }
  return showTime
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
