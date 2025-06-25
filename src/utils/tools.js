import { ElMessageBox } from 'element-plus'
import store from '@/store'
import dayjs from 'dayjs'

/**
 * @param {string} iconName - 图标名
 * @description 转换icon名称
 * @returns
 */
export function transElIconName(iconName) {
  return 'i' + iconName.replace(/[A-Z]/g, match => '-' + match.toLowerCase())
}

/**
 * @param {object} obj - 弹窗对象
 * @param {string} obj.title - 弹窗标题
 * @param {string} obj.content - 弹窗文字内容
 * @param {string} obj.confirmButtonText - 确认按钮文字
 * @param {string} obj.cancelButtonText - 取消按钮文字
 * @param {function} obj.success - 确认事件回调
 * @param {function} obj.cancel - 取消事件回调
 * @description 确认弹窗
 */
export function confirmAlert(obj) {
  ElMessageBox.confirm(obj.content, obj.title || '提示', {
    confirmButtonText: obj.confirmButtonText || '确认',
    cancelButtonText: obj.cancelButtonText || '取消',
    type: 'warning'
  })
    .then(() => {
      obj.success()
    })
    .catch(() => {
      obj.cancel && obj.cancel()
    })
}

/**
 * @param {string} name - 字段名
 * @description  获取地址栏参数
 * @returns 入参对应value
 */
export function getQueryVariable(name, isDecodeURI) {
  const reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
  const r = window.location.search.substr(1).match(reg)
  if (r != null) return isDecodeURI ? decodeURI(r[2]) : unescape(r[2])
  return null
}
/**
 *
 * @param {Date} date - Date 对象
 * @param {string} format - 要转换的格式
 * @description 日期格式转换
 * @returns 返回转化后的日期 string
 */
export function dateFormat(date, format = 'YYYY-MM-DD') {
  if (!(date instanceof Date)) throw new Error('dateFormat传入参数非Date类型')
  const o = {
    'M+': date.getMonth() + 1, // month
    'D+': date.getDate(), // day
    'h+': date.getHours(), // hour
    'm+': date.getMinutes(), // minute
    's+': date.getSeconds(), // second
    'q+': Math.floor((date.getMonth() + 3) / 3), // quarter
    S: date.getMilliseconds() // millisecond
  }
  if (/(Y+)/.test(format))
    format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
  for (const k in o)
    if (new RegExp('(' + k + ')').test(format))
      format = format.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      )
  return format
}

/**
 *
 * @param {function} func - 防抖触发函数
 * @param {number} wait - 保护倒计时(毫秒)
 * @description 防抖
 */
export function debounce(func, wait = 500) {
  let timeout
  return function () {
    const context = this
    const args = [...arguments]
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => {
      timeout = null
      func.apply(context, args)
    }, wait)
  }
}

/**
 *
 * @param {function} func - 节流触发函数
 * @param {number} wait - 触发间隔(毫秒)
 * @description 节流
 */
export function throttle(func, wait = 200) {
  let lastTime
  return function (...rest) {
    if (!lastTime || new Date().getTime() - lastTime > wait) {
      lastTime = +new Date()
      func.apply(this, rest)
    }
  }
}
/**
 *
 * @param {number} number - 数字
 * @param {Boolean} isRound - 是否四舍五入
 * @param {Boolean} noFormat - 是否不转化
 * @description 过万转化
 */
export function wanSliceFormat(number, isRound = true, noFormat = false) {
  number = number || 0
  if (parseFloat(number).toString() === 'NaN') {
    return number
  } else {
    if (parseFloat(Math.abs(number)) < 10000) {
      return number.toLocaleString()
    } else {
      if (noFormat) {
        return number.toLocaleString()
      }
      const calc = isRound ? Math.round : Math.floor
      return number ? Number(calc(parseFloat(number) / 100) / 100).toLocaleString() + 'w' : 0
    }
  }
}

/**
 *
 * @param {string} dateStr - 时间
 * @description 转换标准时间为时间戳
 */
export function getDateTimeStamp(dateStr) {
  return Date.parse(dateStr.replace(/-/gi, '/'))
}
/**
 *
 * @param {string} dateStr - 时间
 * @description 时间转化几天前、几周前等
 */
export function getDateDiff(dateStr) {
  const minute = 1000 * 60
  const hour = minute * 60
  const day = hour * 24
  const month = day * 30
  const year = month * 12
  const now = new Date().getTime()
  const diffValue = now - getDateTimeStamp(dateStr)
  if (diffValue < 0) {
    return
  }
  const yearC = diffValue / year
  const monthC = diffValue / month
  const weekC = diffValue / (7 * day)
  const dayC = diffValue / day
  const hourC = diffValue / hour
  const minC = diffValue / minute
  let result
  if (yearC >= 1) {
    result = '' + parseInt(yearC) + '年前'
  } else if (monthC >= 1) {
    result = '' + parseInt(monthC) + '月前'
  } else if (weekC >= 1) {
    result = '' + parseInt(weekC) + '周前'
  } else if (dayC >= 1) {
    result = '' + parseInt(dayC) + '天前'
  } else if (hourC >= 1) {
    result = '' + parseInt(hourC) + '小时前'
  } else if (minC >= 1) {
    result = '' + parseInt(minC) + '分钟前'
  } else result = '刚刚'
  return result
}

/**
 *
 * @param {string} time - 时间[秒]
 * @param {string} defaultUnit - 默认时间单位
 * @param {Boolean} unitType - 是使用时:分:秒还是h:m:s
 * @param {Boolean} isHm - 是否是毫秒
 * @param {Boolean} isHideSecond - 是否隐藏秒--暂用于直播排行榜
 *
 * @description 时间转化为x小时x分钟x秒
 */
// 秒转时分秒
export function secondToDate(
  time,
  defaultUnit = '分钟',
  unitType = true,
  isHm = false,
  isHideSecond = false
) {
  if (time != null && time !== '' && time !== 0) {
    if (isHm && time < 60) {
      return parseFloat(time).toFixed(2) + (unitType ? '秒' : 's')
    } else {
      const h = parseInt(time / 3600)
      const m = parseInt((time % 3600) / 60)
      const s = parseInt((time % 3600) % 60)
      if (isHideSecond) {
        if (h || m) {
          return (
            (h || '') +
            (h > 0 ? (unitType ? '小时' : 'h') : '') +
            (m || '') +
            (m > 0 ? (unitType ? '分钟' : 'm') : '')
          )
        } else {
          // return (s || '') + (s > 0 ? (unitType ? '秒' : 's') : '')
          return 0 + (unitType ? '分钟' : 'm')
        }
      } else {
        if (h === 0 && m === 0 && s === 0) {
          return '0' + (unitType ? '秒' : 's')
        } else {
          return (
            (h || '') +
            (h > 0 ? (unitType ? '小时' : 'h') : '') +
            (m || '') +
            (m > 0 ? (unitType ? '分钟' : 'm') : '') +
            (s || '') +
            (s > 0 ? (unitType ? '秒' : 's') : '')
          )
        }
      }
    }
  } else {
    return time + defaultUnit
  }
}

/**
 *
 * @param {Number} number - 金额(分)
 * @param {Boolean} stu - 是否过万转化
 * @description 金额分转元并四舍五入
 */
export function changeTwoDecimal(fen, stu = false) {
  let num = fen
  num = fen * 0.01
  num += ''
  const reg = num.indexOf('.') > -1 ? /(\d{1,3})(?=(?:\d{3})+\.)/g : /(\d{1,3})(?=(?:\d{3})+$)/g
  num = num.replace(reg, '$1')
  num = toDecimal2(num)
  return stu ? wanSliceFormat(num) : num
}
/**
 *
 * @param {Number} x - 数字
 * @description 强制保留2位小数，如：2，会在2后面补上00.即2.00
 */
export function toDecimal2(x) {
  const f1 = parseFloat(x)
  if (isNaN(f1)) {
    return false
  }
  const f = Math.round(x * 100) / 100
  let s = f.toString()
  let rs = s.indexOf('.')
  if (rs < 0) {
    rs = s.length
    s += '.'
  }
  while (s.length <= rs + 2) {
    s += '0'
  }
  return s
}
/**
 * @description: 过万数字转换 11000 => 1.1w
 * @param {Number} number 转换前数字
 * @param {Boolean} isRounding 是否四舍五入 false => 向下去整
 * @param {Number} decimal 保留几位小数
 * @return {Number | String} 转换后的数字
 */
export function numberFormat(number, isRounding = true, decimal = 2) {
  if (parseFloat(number).toString() === 'NaN') return number
  const ratio = number / 10000
  if (ratio < 1 && ratio > -1) return parseFloat(Number(number).toFixed(decimal))
  if (isRounding) {
    return ratio.toFixed(decimal) + 'w'
  } else {
    return (Math.floor(number / 100) / 100).toFixed(decimal) + 'w'
  }
}

/**
 * @description: 数字转换 过万或过亿
 * @param {Number} number 转换前数字
 * @param {Number} decimal 保留几位小数
 * @return {Number | String} 转换后的数字
 */
export function numberFormat2(number, decimal = 2) {
  if (parseFloat(number).toString() === 'NaN') return number
  const ratio = number / 10000
  if (ratio < 1 && ratio > -1) return Number(parseFloat(Number(number).toFixed(decimal))).toLocaleString()
  const wan = ratio / 10000
  if (wan < 1 && wan > -1) return Number(ratio.toFixed(decimal)).toLocaleString() + '万'
  return Number(wan.toFixed(decimal)).toLocaleString() + '亿'
}

/**
 *
 * @param {Number} x - 数字
 * @description 强制保留2位小数，如：2，会在2后面补上00.即2.00
 */
export function toDecimal1(x) {
  const f1 = parseFloat(x)
  if (isNaN(f1)) {
    return false
  }
  const f = Math.round(x * 10) / 10
  let s = f.toString()
  let rs = s.indexOf('.')
  if (rs < 0) {
    rs = s.length
    s += '.'
  }
  while (s.length <= rs + 1) {
    s += '0'
  }
  return s
}
// 限制不允许换行
export function limitEnter() {
  const e = window.event || arguments[0]
  // console.log(e,e.keyCode)
  if (e.key === 'Enter' || e.code === 'Enter' || e.keyCode === 13) {
    e.returnValue = false
    return false
  }
}

// 获取最近一个月时间范围
export function getLastMonthDate() {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const days = new Date(year, month, 0).getDate()
  const LAST_MONTH_TIME = days * 24 * 60 * 60 * 1000
  const nowTime = date.getTime()
  const startTime = nowTime - LAST_MONTH_TIME
  const dateange = [new Date(startTime), new Date(nowTime)]
  return dateange
}

// 获取操作系统信息
export function getOsInfo() {
  const userAgent = navigator.userAgent.toLowerCase()
  let name = 'Unknown'
  let version = 'Unknown'
  if (userAgent.indexOf('win') > -1) {
    name = 'Windows'
    if (userAgent.indexOf('windows nt 5.0') > -1) {
      version = 'Windows 2000'
    } else if (
      userAgent.indexOf('windows nt 5.1') > -1 ||
      userAgent.indexOf('windows nt 5.2') > -1
    ) {
      version = 'Windows XP'
    } else if (userAgent.indexOf('windows nt 6.0') > -1) {
      version = 'Windows Vista'
    } else if (userAgent.indexOf('windows nt 6.1') > -1 || userAgent.indexOf('windows 7') > -1) {
      version = 'Windows 7'
    } else if (userAgent.indexOf('windows nt 6.2') > -1 || userAgent.indexOf('windows 8') > -1) {
      version = 'Windows 8'
    } else if (userAgent.indexOf('windows nt 6.3') > -1) {
      version = 'Windows 8.1'
    } else if (
      userAgent.indexOf('windows nt 6.2') > -1 ||
      userAgent.indexOf('windows nt 10.0') > -1
    ) {
      version = 'Windows 10'
    } else {
      version = 'Unknown'
    }
  } else if (userAgent.indexOf('iphone') > -1) {
    name = 'Iphone'
  } else if (userAgent.indexOf('mac') > -1) {
    name = 'Mac'
  } else if (
    userAgent.indexOf('x11') > -1 ||
    userAgent.indexOf('unix') > -1 ||
    userAgent.indexOf('sunname') > -1 ||
    userAgent.indexOf('bsd') > -1
  ) {
    name = 'Unix'
  } else if (userAgent.indexOf('linux') > -1) {
    if (userAgent.indexOf('android') > -1) {
      name = 'Android'
    } else {
      name = 'Linux'
    }
  } else {
    name = 'Unknown'
  }
  return { name, version }
}

// 字节转换
export function changeKB(limit) {
  let size = ''
  limit = parseInt(limit)
  if (limit < 1024) {
    // 小于0.1KB，则转化成B
    size = limit + 'B'
  } else if (limit < 1024 * 1024) {
    // 小于0.1MB，则转化成KB
    size = Math.floor((limit / 1024) * 100) / 100 + 'KB'
  } else if (limit < 1024 * 1024 * 1024) {
    // 小于0.1GB，则转化成MB
    size = Math.floor((limit / (1024 * 1024)) * 100) / 100 + 'MB'
  } else {
    // 其他转化成GB
    size = Math.floor((limit / (1024 * 1024 * 1024)) * 100) / 100 + 'GB'
  }

  const sizeStr = size + '' // 转成字符串
  const index = sizeStr.indexOf('.') // 获取小数点处的索引
  const dou = sizeStr.substring(index + 1, 2) // 获取小数点后两位的值
  if (dou === '00') {
    // 判断后两位是否为00，如果是则删除00
    return sizeStr.substring(0, index) + sizeStr.substring(index + 3, 2)
  }
  return size
}

// 获取版本更新
export function getUpgradeInfo() {
  store.dispatch('system/getUpgradeInfo')
}
// 获取业务主体类型
export function getBusinessEntity() {
  return new Promise(resolve => {
    store
      .dispatch('user/getBusinessEntityFun')
      .then(() => {
        resolve()
      })
      .catch(() => {
        resolve()
      })
  })
}
// 获取当前年份
export function getNowYear() {
  return new Date().getFullYear()
}
/**
 *
 * @param {date} date - Date 对象
 * @param {string} format - 要转换的格式
 * @description 日期格式转换
 * @returns 返回转化后的日期 string
 */
export function formatDate(date, str = 'YYYY-MM-DD HH:mm') {
  return dayjs(date).format(str)
}

/**
 * @param val 任意类型需要校验的值
 * @return {boolean} 空 true 非空 false
 */
export function isEmpty(val) {
  if (typeof val === 'boolean') {
    return false
  }
  if (typeof val === 'number') {
    return false
  }
  if (val instanceof Array) {
    if (val.length === 0) return true
  } else if (val instanceof Object) {
    if (JSON.stringify(val) === '{}') return true
  } else {
    if (val === 'null' || val == null || val === 'undefined' || val === undefined || val === '')
      return true
    return false
  }
  return false
}

/**
 *
 * @param {date} date - Date 对象
 * @description 倒计时 ，超过24h以天为单位，24h内以小时为单位。1h内以分钟为单位
 * @returns 返回剩余时间 string
 */
export function countDownForamt(date, str = 'YYYY-MM-DD HH:mm') {
  let data = ''
  if (date) {
    const endTime = date.indexOf('-') > -1 ? date.replace(/-/g, '/') : date
    const lastTimes = new Date(endTime).getTime() - new Date().getTime()
    const lastMinute = parseInt(lastTimes / 1000 / 60)
    if (lastMinute > 24 * 60) {
      data = parseInt(lastMinute / 24 / 60) + '天'
    } else if (lastMinute > 60) {
      data = parseInt(lastMinute / 60) + '小时'
    } else {
      data = lastMinute + '分钟'
    }
  }
  return data
}
/**
 * @param val 任意类型需要校验的值
 * @return {boolean} 非空 true 空 false
 */
export function isNotEmpty(val) {
  return !isEmpty(val)
}

/**
 * @description  根据类型返回对应的任务详情页
 * @param {Number|String} type - 任务类型
 * @return {String} url
 */
export function getCreateTaskPath(type) {
  const typeUrl = new Map([
    [1, '/content_market/video_task/create_task'],
    [2, '/content_market/live_task/create_task'],
    [3, '/content_market/collecting_task/create_task'],
    [5, '/content_market/study_task/create_task'],
    [6, '/content_market/imgText_task/create_task']
  ])
  return typeUrl.get(parseInt(type))
}

/**
 * @description  判断是否有抖音小程序这个菜单
 * @return {Boolean} data
 */
export function hasDyPro() {
  const brandId = localStorage.getItem('brandInfo')
    ? JSON.parse(localStorage.getItem('brandInfo')).brandId
    : null
  if (brandId === 38) {
    return true
  }
  const systemModule = store.getters.systemModule
  const marketList = systemModule.filter(x => x.scopeCode === 'marketingStrategy')

  if (
    marketList &&
    marketList.length > 0 &&
    marketList[0].childrenMenuList &&
    marketList[0].childrenMenuList.length > 0
  ) {
    const toolList = marketList[0].childrenMenuList.filter(x => x.scopeCode === 'market:tools')

    if (
      toolList &&
      toolList.length > 0 &&
      toolList[0].childrenMenuList &&
      toolList[0].childrenMenuList.length > 0
    ) {
      const dyPro = toolList[0].childrenMenuList.filter(
        x => x.scopeCode === 'market:tools:dyPrograme'
      )
      if (dyPro && dyPro.length > 0) {
        return true
      }
    }
  }
  return false
}

/**
 * @description  获取屏幕宽度
 * @param isServingAdaptivePages 是否用于页面自适应
 * @return {Number} cWidth
 */
export function getCWidth(isServingAdaptivePages = true) {
  let cWidth = document.documentElement.clientWidth || document.body.clientWidth
  const isHideLeftMenu = store.getters.isHideLeftMenu
  if (isHideLeftMenu) {
    cWidth = cWidth > 1200 ? cWidth : 1200
  } else {
    cWidth = cWidth > 1366 ? cWidth : 1366
  }
  if (isServingAdaptivePages) {
    return cWidth - (store.getters.isHideLeftMenu ? 0 : 210)
  } else {
    return cWidth
  }
}

/**
 * @description  获取屏幕高度
 * @param isServingAdaptivePages 是否用于页面自适应
 * @return {Number} cHeight
 */
export function getCHeight(isServingAdaptivePages = true) {
  const cHeight = document.documentElement.clientHeight || document.body.clientHeight
  if (isServingAdaptivePages) {
    return cHeight - (store.getters.ishideTopMenu ? 0 : 110)
  } else {
    return cHeight
  }
}

/**
 * 递归遍历树
 * @param list
 * @param func 每个节点回调函数
 * @param leafKey 子节点的key 默认 children
 */
export function traversalTree(list, func = () => {}, leafKey = 'children') {
  list.forEach(item => {
    func(item)
    if (item[leafKey] && item[leafKey].length > 0) {
      traversalTree(item[leafKey], func, leafKey)
    }
  })
}

/***
 * 获取权限信息
 * @param key 权限key
 * @return {{}} 查找的结果 没有返回 null
 */
export function getUserPermission(key) {
  const systemModule = store.getters.systemModule
  let result = null
  traversalTree(
    systemModule,
    item => {
      if (item.childrenPermissionList && item.childrenPermissionList.length > 0) {
        const temp = item.childrenPermissionList.find(i => i.scopeCode === key)
        if (typeof temp !== 'undefined') {
          result = temp
        }
      }
    },
    'childrenMenuList'
  )
  return result || null
}


/***
 * 获取菜单信息
 * @param key 菜单key
 * @return {{}} 查找的结果 没有返回 null
 */
export function getUserMenu(key) {
  const systemModule = isNotEmpty(store.getters.systemModule)
    ? store.getters.systemModule
    : sessionStorage.getItem('systemModule')
  let result = null
  traversalTree(
    systemModule,
    item => {
      if (item.childrenMenuList && item.childrenMenuList.length > 0) {
        const temp = item.childrenMenuList.find(i => i.scopeCode === key)
        if (typeof temp !== 'undefined') {
          result = temp
        }
      }
    },
    'childrenMenuList'
  )
  return result || null
}
/***
 * 获取父级菜单信息
 * @param key 菜单key
 * @return {{}} 查找的结果 没有返回 null
 */
export function getUserParentMenu(key) {
  const systemModule = store.getters.systemModule
  let result = null
  traversalTree(
    systemModule,
    item => {
      if (item.scopeId === key) {
        result = item
      } else {
        if (item.childrenMenuList && item.childrenMenuList.length > 0) {
          const temp = item.childrenMenuList.find(i => i.scopeId === key)
          if (typeof temp !== 'undefined') {
            result = temp
          }
        }
      }
    },
    'childrenMenuList'
  )
  return result || null
}

/**
 * @description  判断时间A是否在某个时间段内
 * @param {Date} curDateStr - 要判断的时间
 * @param {String} beginDateStr - 开始时间
 * @param {String} endDateStr - 结束时间
 * @return {Boolean}
 */
export function checkAuditTime(curTime, startTime, endTime) {
  // 获取当前时间
  const date = curTime
  // 获取当前时间的年月日
  const dataStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} `
  // 获取开始时间、结束时间、现在时间的时间戳
  let startDate = new Date(dataStr + startTime).getTime()
  let endDate = new Date(dataStr + endTime).getTime()
  const nowDate = date.getTime()
  const s = startDate > endDate // 判断开始时间否大于结束时间
  if (s) [startDate, endDate] = [endDate, startDate] // 若开始时间否大于结束时间则交换值
  // 判断现在的时间是否在开始时间和结束时间之间，若s为true则结果取反
  if (nowDate > startDate && nowDate < endDate) {
    return !s
  } else {
    return !!s
  }
}

/**
 * @description  判断抖音视频是否是公开状态
 * @param {Object} data - 要判断的抖音视频信息
 * @return {Boolean}
 */
export function judgeIsPublicVideo(data) {
  if (data) {
    // isDelete 0:视频存在 1: 视频已被删除
    // dyVideoStatus 1:细化为5、6、7三种状态;2:不适宜公开;4:审核中;5:公开视频;6:好友可见;7:私密视频
    return data.isDelete === 0 && !(data.dyVideoStatus === 7 || data.dyVideoStatus === 2)
  } else {
    return false
  }
}

/**
 *
 * @param {string} dateStr - 时间
 * @description 抖音评论时间转化
 * 刚刚：0-4分59秒
 * 具体到几分钟前：5分-59分59秒
 * 具体到几小时前：1h-23h59m
 * 显示具体月日：24h以上，1年以内
 * 显示具体年月日：1年以上
 */
export function getVideoCommentDateDiff(dateStr) {
  const minute = 1000 * 60
  const hour = minute * 60
  const day = hour * 24
  const month = day * 30
  const year = month * 12
  const now = new Date().getTime()
  const diffValue = now - getDateTimeStamp(dateStr)
  if (diffValue < 0) {
    return
  }
  const yearC = diffValue / year

  const dayC = diffValue / day
  const hourC = diffValue / hour
  const minC = diffValue / minute
  let result
  if (yearC >= 1) {
    result = dateFormat(new Date(getDateTimeStamp(dateStr)), 'YYYY年MM月DD日')
  } else if (dayC >= 1) {
    result = dateFormat(new Date(getDateTimeStamp(dateStr)), 'MM月DD日')
  } else if (hourC >= 1) {
    result = '' + parseInt(hourC) + '小时前'
  } else if (minC >= 5) {
    result = '' + parseInt(minC) + '分钟前'
  } else result = '刚刚'
  return result
}

/**
 * @description  当前时间的N天之后日期
 * @param {Date} date - 当前时间
 * @param {Number} addNum - N天
 * @return {String}
 */
export function addDateFun(date, addNum = 180) {
  if (date) {
    const curDate = new Date(getDateTimeStamp(date))
    curDate.setDate(curDate.getDate() + addNum)
    return dateFormat(curDate)
  } else {
    return ''
  }
}

// 秒数转分:秒
export function secToMin(sec) {
  const s = parseInt(sec)
  let t = ''
  if (s > -1) {
    const min = Math.floor(s / 60)
    const sec = s % 60

    if (min === 0) {
      t += '0'
    }
    t += min + ':'
    if (sec < 10) {
      t += '0'
    }
    t += sec
  }
  return t
}

/**
 * @description  图片比例转换 ，如果宽或者高大于画布比例。那就进行等比例缩放。
 * @param {Number} w - 图片原始宽度
 * @param {Number} h - 图片原始高度
 * @param {Number} canvasW- 画布的宽度
 * @param {Number} canvasH - 画布的高度
 * @param {Boolean} isGetCenteredPosition - 是否获取图片位于画布比例居中的位置
 * @param {Boolean} isCanvasHalf - 入参的画布宽高是否是画布的一样
 * @return {Object}
 */
export function imgScaleConversion(w, h, canvasW, canvasH, isGetCenteredPosition, isCanvasHalf) {
  let width = null
  let height = null
  let x = 0
  let y = 0
  if (w > 0 && h > 0) {
    if (w / h >= canvasW / canvasH) {
      if (w > canvasW) {
        width = canvasW
        height = (h * canvasW) / w
      } else {
        width = w
        height = h
      }
    } else {
      if (h > canvasH) {
        height = canvasH
        width = (w * canvasH) / h
      } else {
        width = w
        height = h
      }
    }
    // 是否需要计算居中的位置
    if (isGetCenteredPosition) {
      console.log('xx', canvasW, width)
      x = (canvasW * (isCanvasHalf ? 2 : 1) - width) / 2
      y = (canvasH * (isCanvasHalf ? 2 : 1) - height) / 2
    }
  }
  return {
    width,
    height,
    x,
    y
  }
}

// 加密后的手机号
// 手机号或者验证码加密
// 传参数据注意： 手机号前面要加 +86  验证码不需要
export function encryptionFun(e) {
  let t
  const n = []
  // eslint-disable-next-line no-void
  if (void 0 === e) return ''
  // eslint-disable-next-line prefer-const
  t = (function (e) {
    // eslint-disable-next-line no-var
    for (var t, n = e.toString(), r = [], o = 0; o < n.length; o++)
      // eslint-disable-next-line no-unused-expressions
      (t = n.charCodeAt(o)) >= 0 && t <= 127
        ? r.push(t)
        : t >= 128 && t <= 2047
        ? (r.push(192 | (31 & (t >> 6))), r.push(128 | (63 & t)))
        : ((t >= 2048 && t <= 55295) || (t >= 57344 && t <= 65535)) &&
          (r.push(224 | (15 & (t >> 12))), r.push(128 | (63 & (t >> 6))), r.push(128 | (63 & t)))
    for (let i = 0; i < r.length; i++) r[i] &= 255
    return r
  })(e)
  for (let r = 0, o = t.length; r < o; ++r) n.push((5 ^ t[r]).toString(16))
  return n.join('')
}

// 返回platform信息
// type: en: x->数字，例'抖音'或'dy'或'1'输出都是1；cn: x->中文；key：x->平台对应的拼音；icon: 返回对应平台icon（未做，icons是各种尺寸的icon，iconSize对应的就是尺寸）
// data: 具体平台
// 对应关系 抖音-1-dy 小红书-3-xhs 快手-4-ks 视频号-2-wx
export function platformMate(type, data, iconSize) {
  const platformMap = {
    dy: { id: 1, label: '抖音', key: 'dy', icons: {} },
    wx: { id: 2, label: '视频号', key: 'wx', icons: {} },
    xhs: { id: 3, label: '小红书', key: 'xhs', icons: {} },
    ks: { id: 4, label: '快手', key: 'ks', icons: {} }
  }

  let result
  switch (type) {
    case 'en':
      result = Object.values(platformMap).find(
        item => item.label === data || item.key === data || item.id === parseInt(data)
      ).id
      break
    case 'cn':
      result = Object.values(platformMap).find(
        item => item.label === data || item.key === data || item.id === parseInt(data)
      ).label
      break
    case 'key':
      result = Object.keys(platformMap).find(key => platformMap[key].id === parseInt(data))
      break
    default:
      result = null
  }
  return result
}

/**
 * @description 动态加载字体
 * @param {String} url - 字体地址
 * @param {String} family - 字体名称
 */
export function loadFontFun(url, family) {
  // const link = document.createElement('link')
  // link.rel = 'preload' // 预加载 保证字体文件第一次进入就缓存，后续可以直接使用
  // link.as = 'font'
  // link.href = url
  // link.crossOrigin = 'anonymous'
  // document.head.appendChild(link)
  // 同时添加@font-face规则
  const style = document.createElement('style')
  style.type = 'text/css'
  style.innerHTML = `
      @charset "UTF-8";
      @font-face {
        font-family: '${family}';
        src: url('${url}');
        font-weight: normal;
        font-style: normal;
      }
    `
  document.head.appendChild(style)
}

// 获取文档对应的ICON
export function getFileICON(url) {
  const suffix = url.split('.').at(-1).toLowerCase()
  const fileType = {
    doc: 'doc',
    docx: 'doc',
    // md: 'md',
    pdf: 'pdf',
    // csv: 'csv',
    xls: 'xls',
    xlsx: 'xls',
    txt: 'txt'
  }
  return `xm_file_${fileType[suffix] || 'other'}_ICON`
}